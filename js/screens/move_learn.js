const MoveLearnScreen = {
    id: 'MOVE_LEARN',
    resolve: null,
    pokemon: null,
    newMoveName: null,
    newMoveData: null,
    state: 'CHOOSE',
    hoverIndex: 0,

    // --- Static Helper for Classic Flow ---
    async tryLearn(pokemon, moveName, options = {}) {
        // 1. Fetch Move Data
        const mData = await API.getMove(moveName);
        if (!mData) return false;

        // 2. Already Known check (Normalization for safety)
        const isKnown = pokemon.moves.some(m =>
            m.id === moveName ||
            m.name === moveName.replace(/-/g, ' ').toUpperCase()
        );
        if (isKnown) return false;

        // Hide Battle Menus immediately (only if in battle)
        if (typeof UI !== 'undefined' && options.targetId !== 'evo-text') {
            UI.hide('action-menu');
            UI.hide('move-menu');
        }

        // 3. Check Capacity
        if (pokemon.moves.length < 4) {
            pokemon.moves.push(mData);
            AudioEngine.playSfx('funfair');
            await DialogManager.show(`${pokemon.name} learned\n${mData.name}!`, { lock: true, ...options });
            return true;
        }

        // 4. No Room - Interaction (Wait for Input)
        await DialogManager.show(`${pokemon.name} wants to\nlearn ${mData.name}!`, { lock: true, ...options });
        await DialogManager.show(`But ${pokemon.name} already\nknows 4 moves!`, { lock: true, ...options });

        while (true) {
            const choice = await DialogManager.ask(`Replace a move with\n${mData.name}?`, ['Yes', 'No'], { lock: true, ...options });

            if (choice === 'Yes') {
                const forgetIndex = await ScreenManager.pushAndWait('MOVE_LEARN', { pokemon, moveName });

                if (forgetIndex !== -1 && forgetIndex !== null && forgetIndex !== undefined) {
                    const oldMove = pokemon.moves[forgetIndex];

                    AudioEngine.playSfx('select');
                    await DialogManager.show(`1, 2, and...`, { lock: true, delay: 800, noSkip: true, ...options });
                    AudioEngine.playSfx('select');
                    await DialogManager.show(`... ... ...`, { lock: true, delay: 800, noSkip: true, ...options });
                    AudioEngine.playSfx('swoosh');
                    await DialogManager.show(`Poof!`, { lock: true, delay: 800, noSkip: true, ...options });

                    await wait(400);
                    await DialogManager.show(`${pokemon.name} forgot\n${oldMove.name}.`, { lock: true, ...options });

                    AudioEngine.playSfx('select');
                    await DialogManager.show(`And...`, { lock: true, delay: 800, noSkip: true, ...options });

                    pokemon.moves[forgetIndex] = mData;

                    AudioEngine.playSfx('funfair');
                    await DialogManager.show(`${pokemon.name} learned\n${mData.name}!`, { lock: true, ...options });
                    return true;
                }
            }

            const giveUp = await DialogManager.ask(`Give up on learning\n${mData.name}?`, ['Yes', 'No'], { lock: true, ...options });
            if (giveUp === 'Yes') {
                await DialogManager.show(`${pokemon.name} did not\nlearn ${mData.name}.`, { lock: true, ...options });
                return false;
            }
        }
    },

    // Consolidate the "Check level for moves" logic
    async checkAndLearn(pokemon, level, options = {}) {
        if (!API.getLearnableMoves) return;
        const newMoves = await API.getLearnableMoves(pokemon.id, level);
        for (const move of newMoves) {
            await this.tryLearn(pokemon, move, options);
        }
    },

    _cleanup() {
        // No-op: The battle flow (e.g., TurnManager or handleWin) handles menu restoration.
        // Showing it here can cause it to pop up prematurely during win sequences.
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
