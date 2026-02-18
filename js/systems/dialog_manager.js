
const DialogManager = {
    queue: [],
    isTyping: false,
    activeResolver: null, // For choices

    // --- Core API ---

    // Show simple text
    async show(text, options = {}) {
        return new Promise(resolve => {
            this.queue.push({
                type: 'text',
                text: text,
                resolve: resolve,
                options: options
            });
            this.processQueue();
        });
    },

    // Ask a question (returns choice string)
    async ask(text, choices = ['Yes', 'No'], options = {}) {
        return new Promise(resolve => {
            this.queue.push({
                type: 'choice',
                text: text,
                choices: choices,
                resolve: resolve,
                options: options
            });
            this.processQueue();
        });
    },

    // --- Internals ---
    async processQueue() {
        if (this.isTyping || this.queue.length === 0) return;

        const task = this.queue[0];
        const prevLockState = (typeof Battle !== 'undefined') ? Battle.uiLocked : false;

        // Custom IDs from options
        const targetId = task.options.targetId || 'text-content';
        const arrowId = task.options.arrowId || 'advance-arrow';
        const parentId = task.options.parentId || 'dialog-box';

        if (task.type === 'text') {
            this.isTyping = true;

            if (task.options.lock && typeof Battle !== 'undefined') {
                Battle.uiLocked = true;
            }

            await UI.typeText(task.text, async () => {
                // Wait behavior: auto-advance OR wait-for-input
                if (task.options.delay) {
                    if (task.options.noSkip) {
                        await new Promise(r => setTimeout(r, task.options.delay));
                    } else {
                        await Promise.race([
                            new Promise(r => setTimeout(r, task.options.delay)),
                            this.waitForInput(arrowId)
                        ]);
                    }
                } else {
                    await this.waitForInput(arrowId);
                }

                this._cleanupInputHandler(arrowId);

                if (task.options.lock && typeof Battle !== 'undefined' && !prevLockState) {
                    Battle.uiLocked = false;
                }

                this.isTyping = false;
                this.queue.shift();
                if (task.resolve) task.resolve();
                this.processQueue();
            }, task.options.fast, targetId, 0);

        } else if (task.type === 'choice') {
            this.isTyping = true;

            if (task.options.lock && typeof Battle !== 'undefined') {
                Battle.uiLocked = true;
            }

            // 1. Show Text
            await UI.typeText(task.text, () => {
                // 2. Render Choices ONLY after typing finishes
                this.renderChoices(task.choices, parentId);

                // 3. Wait for Input
                Input.setMode('DIALOG_CHOICE');
                this.isTyping = false;

                this.activeResolver = (choice) => {
                    this.hideChoices();

                    if (task.options.lock && typeof Battle !== 'undefined' && !prevLockState) {
                        Battle.uiLocked = false;
                    }

                    this.queue.shift();
                    if (task.resolve) task.resolve(choice);
                    this.activeResolver = null;
                    this.processQueue();
                };
            }, task.options.fast, targetId, 0);
        }
    },

    // --- UI Rendering ---
    renderChoices(choices, parentId = 'dialog-box') {
        const parent = document.getElementById(parentId) || document.getElementById('dialog-box');

        let el = document.getElementById('dialog-choice-box');
        if (!el) {
            el = document.createElement('div');
            el.id = 'dialog-choice-box';
            el.className = 'choice-box';
            parent.appendChild(el);
        } else if (el.parentElement !== parent) {
            parent.appendChild(el);
        }

        el.innerHTML = '';
        choices.forEach((c, i) => {
            const div = document.createElement('div');
            div.innerText = c;
            div.className = 'choice-item';
            if (i === 0) div.classList.add('focused');

            // Mouse interaction
            div.onmouseover = () => {
                Input.focus = i;
                if (typeof Input !== 'undefined') Input.updateVisuals();
                else this.updateFocus(document.querySelectorAll('#dialog-choice-box .choice-item'));
            };
            div.onclick = () => {
                if (this.activeResolver) {
                    this.activeResolver(c);
                    AudioEngine.playSfx('select');
                }
            };

            el.appendChild(div);
        });

        el.classList.remove('hidden');
        Input.focus = 0;
    },

    hideChoices() {
        const el = document.getElementById('dialog-choice-box');
        if (el) el.classList.add('hidden');
    },

    // --- Input Handling for Choices ---
    handleInput(key) {
        if (!this.activeResolver) return false;

        const choices = document.querySelectorAll('#dialog-choice-box .choice-item');

        if (key === 'ArrowDown') {
            Input.focus = (Input.focus + 1) % choices.length;
            this.updateFocus(choices);
            AudioEngine.playSfx('select');
            return true;
        }
        if (key === 'ArrowUp') {
            Input.focus = (Input.focus - 1 + choices.length) % choices.length;
            this.updateFocus(choices);
            AudioEngine.playSfx('select');
            return true;
        }
        if (['z', 'Z', 'Enter'].includes(key)) {
            const choice = choices[Input.focus].textContent;
            this.activeResolver(choice);
            AudioEngine.playSfx('select');
            return true;
        }
        if (['x', 'X', 'Escape'].includes(key)) {
            // Find "No" or use last option
            let noIdx = -1;
            choices.forEach((c, i) => { if (c.textContent.toLowerCase() === 'no') noIdx = i; });
            const finalIdx = noIdx !== -1 ? noIdx : choices.length - 1;
            this.activeResolver(choices[finalIdx].textContent);
            AudioEngine.playSfx('select');
            return true;
        }

        return true; // Block other inputs
    },

    updateFocus(choices) {
        choices.forEach(c => c.classList.remove('focused'));
        if (choices[Input.focus]) choices[Input.focus].classList.add('focused');
        else if (choices.length > 0) choices[0].classList.add('focused');
    },

    waitForInput(arrowId = 'advance-arrow') {
        const arrow = document.getElementById(arrowId);
        if (arrow) arrow.classList.remove('hidden');

        return new Promise(resolve => {
            const handler = (e) => {
                let trigger = false;
                if (e.type === 'keydown') {
                    const k = e.key.toLowerCase();
                    if (k === 'z' || k === 'enter' || k === 'x') trigger = true;
                } else if (e.type === 'click') {
                    trigger = true;
                }

                if (trigger) {
                    this._cleanupInputHandler(arrowId);
                    AudioEngine.playSfx('select');
                    resolve();
                }
            };
            this._currentHandler = handler;
            this._currentResolver = resolve;
            window.addEventListener('keydown', handler);
            window.addEventListener('click', handler);
        });
    },

    _cleanupInputHandler(arrowId = 'advance-arrow') {
        if (this._currentHandler) {
            window.removeEventListener('keydown', this._currentHandler);
            window.removeEventListener('click', this._currentHandler);
            this._currentHandler = null;
        }
        const arrow = document.getElementById(arrowId);
        if (arrow) arrow.classList.add('hidden');
        this._currentResolver = null;
    }
};
