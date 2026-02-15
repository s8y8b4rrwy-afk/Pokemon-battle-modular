const MoveLearnScreen = {
    id: 'MOVE_LEARN',
    resolve: null,
    pokemon: null,
    newMoveName: null,
    newMoveData: null,
    state: 'CHOOSE',
    hoverIndex: 0,

    // --- Static Helper for Classic Flow ---
    async tryLearn(pokemon, moveName) {
        // 1. Fetch Move Data
        const mData = await API.getMove(moveName);
        if (!mData) return false;

        // Hide Battle Menus immediately
        if (typeof UI !== 'undefined') {
            UI.hide('action-menu');
            UI.hide('move-menu');
        }

        // 2. Check Capacity
        if (pokemon.moves.length < 4) {
            pokemon.moves.push(mData);
            // Wait for input for simple learn
            await DialogManager.show(`${pokemon.name} learned\n${mData.name}!`, { lock: true });
            this._cleanup();
            return true;
        }

        // 3. No Room - Interaction (Wait for Input)
        await DialogManager.show(`${pokemon.name} wants to\nlearn ${mData.name}!`, { lock: true });
        await DialogManager.show(`But ${pokemon.name} already\nknows 4 moves!`, { lock: true });

        while (true) {
            // Updated to use options with lock:true
            const choice = await DialogManager.ask(`Replace a move with\n${mData.name}?`, ['Yes', 'No'], { lock: true });

            if (choice === 'Yes') {
                // Returns index of move to forget, or -1 if canceled
                const forgetIndex = await ScreenManager.pushAndWait('MOVE_LEARN', { pokemon, moveName });

                // IMPORTANT: Check for -1 specifically (canceled in screen)
                if (forgetIndex !== -1 && forgetIndex !== null && forgetIndex !== undefined) {
                    const oldMove = pokemon.moves[forgetIndex];

                    // The "1, 2, 3 Poof!" sequence in BATTLE DIALOG (Locked/Timed/Non-Skippable)
                    AudioEngine.playSfx('select');
                    await DialogManager.show(`1, 2, and...`, { lock: true, delay: 800, noSkip: true });
                    AudioEngine.playSfx('select');
                    await DialogManager.show(`... ... ...`, { lock: true, delay: 800, noSkip: true });
                    AudioEngine.playSfx('swoosh');
                    await DialogManager.show(`Poof!`, { lock: true, delay: 800, noSkip: true });

                    await wait(400); // Brief pause for impact
                    await DialogManager.show(`${pokemon.name} forgot\n${oldMove.name}.`, { lock: true });

                    AudioEngine.playSfx('select');
                    await DialogManager.show(`And...`, { lock: true, delay: 800, noSkip: true });

                    // Actually swap
                    pokemon.moves[forgetIndex] = mData;

                    await DialogManager.show(`${pokemon.name} learned\n${mData.name}!`, { lock: true });
                    this._cleanup();
                    return true;
                }
            }

            const giveUp = await DialogManager.ask(`Give up on learning\n${mData.name}?`, ['Yes', 'No'], { lock: true });
            if (giveUp === 'Yes') {
                await DialogManager.show(`${pokemon.name} did not\nlearn ${mData.name}.`, { lock: true });
                this._cleanup();
                return false;
            }
        }
    },

    _cleanup() {
        // Only restore menus if the battle is active AND not currently in a win/faint sequence
        if (typeof Game !== 'undefined' && Game.state === 'BATTLE') {
            // If the battle is already in 'CLEANUP/WIN' mode, Battle.uiLocked will be true.
            // We only restore menus if it wasn't locked by the win sequence.
            if (typeof Battle !== 'undefined' && !Battle.uiLocked) {
                UI.show('action-menu');
            }
        }
    },

    // --- ScreenManager Interface ---
    onEnter(params = {}) {
        this.pokemon = params.pokemon;
        this.newMoveName = params.moveName;
        this.resolve = params.resolve; // Legacy support
        this.hoverIndex = 0;
        this.init();
    },

    onExit() {
        UI.hide('move-learn-screen');
    },

    async init() {
        this.newMoveData = await API.getMove(this.newMoveName);
        this.setupUI();
        UI.show('move-learn-screen');
        this.render();
    },

    setupUI() {
        const title = document.getElementById('ml-title-text');
        if (title) title.innerText = "SELECT MOVE TO REPLACE";

        // Check if icon exists, fallback to frontSprite if needed
        const sprite = /** @type {HTMLImageElement} */ (document.getElementById('ml-poke-sprite'));
        sprite.src = this.pokemon.icon || this.pokemon.frontSprite;

        // Populate Types
        const typeContainer = document.getElementById('ml-types');
        if (typeContainer) {
            typeContainer.innerHTML = '';
            if (this.pokemon.types) {
                this.pokemon.types.forEach(type => {
                    const pill = document.createElement('div');
                    pill.className = `ml-type-pill ${type.toLowerCase()}`;
                    pill.innerText = type.substring(0, 3).toUpperCase();
                    typeContainer.appendChild(pill);
                });
            }
        }

        // Populate stats - Fixing keys to match p.stats structure
        if (this.pokemon.stats) {
            document.getElementById('ml-stat-atk').innerText = this.pokemon.stats.atk || '-';
            document.getElementById('ml-stat-def').innerText = this.pokemon.stats.def || '-';
            document.getElementById('ml-stat-spa').innerText = this.pokemon.stats.spa || '-';
            document.getElementById('ml-stat-spd').innerText = this.pokemon.stats.spd || '-';
            document.getElementById('ml-stat-spe').innerText = this.pokemon.stats.spe || '-';
        }
    },

    render() {
        const list = document.getElementById('ml-move-list');
        list.innerHTML = "";

        const allMoves = [...this.pokemon.moves, this.newMoveData];

        allMoves.forEach((m, i) => {
            const row = document.createElement('div');
            const isNew = i === 4;
            row.className = `ml-move-row ${i === this.hoverIndex ? 'selected' : ''} ${isNew ? 'new-move' : ''}`;

            row.innerHTML = `
                <div class="ml-move-meta">
                    <span class="ml-type-pill ${m.type.toLowerCase()}">${m.type.substring(0, 3).toUpperCase()}</span>
                    <span class="ml-move-name">${m.name}${isNew ? ' (NEW)' : ''}</span>
                </div>
            `;

            row.onclick = () => {
                this.hoverIndex = i;
                this.handleInput('z');
            };
            row.onmouseenter = () => {
                if (this.hoverIndex !== i) {
                    this.hoverIndex = i;
                    AudioEngine.playSfx('select');
                    this.render();
                }
            };
            list.appendChild(row);
        });

        const selectedMove = allMoves[this.hoverIndex];
        const title = (this.hoverIndex === 4) ? "NEW MOVE INFO" : "OLD MOVE INFO";
        this.renderInfo(selectedMove, title);
    },

    renderInfo(move, title) {
        document.getElementById('ml-info-title').innerText = title;
        if (!move) return;
        document.getElementById('ml-info-power').innerText = `PWR: ${move.power || '-'}`;
        document.getElementById('ml-info-acc').innerText = `ACC: ${move.accuracy || '-'}%`;
        document.getElementById('ml-info-type').innerText = `TYPE/${move.type.toUpperCase()}`;

        document.getElementById('ml-info-desc').innerText = move.desc ? move.desc.replace(/\n/g, ' ') : "No description.";
    },

    async handleInput(key) {
        if (key === 'ArrowDown') {
            this.hoverIndex = (this.hoverIndex + 1) % 5;
            AudioEngine.playSfx('select');
            this.render();
            return true;
        }
        if (key === 'ArrowUp') {
            this.hoverIndex = (this.hoverIndex - 1 + 5) % 5;
            AudioEngine.playSfx('select');
            this.render();
            return true;
        }
        if (['z', 'Z', 'Enter'].includes(key)) {
            AudioEngine.playSfx('select');
            // Return selected index directly.
            // Index 0-3: Move to forget.
            // Index 4: Give up (Cancel).
            this.close(this.hoverIndex === 4 ? -1 : this.hoverIndex);
            return true;
        }
        if (['x', 'X', 'Escape'].includes(key)) {
            // Cancel implies giving up
            AudioEngine.playSfx('select');
            this.close(-1);
            return true;
        }
        return true;
    },

    close(result) {
        ScreenManager.pop(result);
        if (this.resolve) this.resolve(result);
    }
};
