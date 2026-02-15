
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
    async ask(text, choices = ['Yes', 'No']) {
        return new Promise(resolve => {
            this.queue.push({
                type: 'choice',
                text: text,
                choices: choices,
                resolve: resolve
            });
            this.processQueue();
        });
    },

    // --- Internals ---
    async processQueue() {
        if (this.isTyping || this.queue.length === 0) return;

        const task = this.queue[0];

        if (task.type === 'text') {
            this.isTyping = true;
            await UI.typeText(task.text, () => {
                // Determine wait behavior. 
                // Default: Helper wait (user presses A), or auto-advance?
                // Current UI.typeText handles typing. 
                // We need to wait for user confirmation if it's a dialog box.

                // For now, auto-resolve to keep existing fast flow, 
                // OR implement a "wait for key" state.

                // Let's stick to existing behavior for now:
                this.isTyping = false;
                this.queue.shift();
                if (task.resolve) task.resolve();
                this.processQueue();
            }, task.options.fast);

        } else if (task.type === 'choice') {
            this.isTyping = true;
            // 1. Show Text
            await UI.typeText(task.text);

            // 2. Render Choices
            this.renderChoices(task.choices);

            // 3. Wait for Input (Delegated to Input System via 'DIALOG' mode)
            Input.setMode('DIALOG_CHOICE');
            this.isTyping = false; // Ready for input
            this.activeResolver = (choice) => {
                this.hideChoices();
                this.queue.shift();
                if (task.resolve) task.resolve(choice);
                this.activeResolver = null;
                this.processQueue();
            };
        }
    },

    // --- UI Rendering ---
    renderChoices(choices) {
        const menu = document.getElementById('action-menu'); // Reuse or new?
        // Using a dedicated choice box is better, but let's reuse action-menu for specific cases or create a generic one.
        // For simplicity/compatibility, let's assume we repurposed the 'action-menu' or created a simple overlay.

        // Actually, let's use a temporary overlay in the dialog box
        let el = document.getElementById('dialog-choice-box');
        if (!el) {
            el = document.createElement('div');
            el.id = 'dialog-choice-box';
            el.className = 'choice-box';
            document.getElementById('dialog-box').appendChild(el);
        }

        el.innerHTML = '';
        choices.forEach((c, i) => {
            const div = document.createElement('div');
            div.innerText = c;
            div.className = 'choice-item';
            if (i === 0) div.classList.add('focused');
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
            const choice = choices[Input.focus].innerText;
            this.activeResolver(choice);
            AudioEngine.playSfx('select');
            return true;
        }

        return true; // Block other inputs
    },

    updateFocus(choices) {
        choices.forEach(c => c.classList.remove('focused'));
        if (choices[Input.focus]) choices[Input.focus].classList.add('focused');
        else if (choices.length > 0) choices[0].classList.add('focused');
    }
};
