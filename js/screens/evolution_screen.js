const EvolutionScreen = {
    id: 'EVOLUTION',
    resolve: null,
    pokemon: null,
    targetData: null,
    newData: null,
    state: 'IDLE', // IDLE, ANIMATING, TEXT, LEARN_MOVE

    // --- ScreenManager Interface ---

    onEnter(params = {}) {
        this.pokemon = params.pokemon;
        this.targetData = params.targetData;
        this.resolve = params.resolve;
        this.learnSpecialMove = params.learnSpecialMove || false;

        if (!this.pokemon || !this.targetData) {
            console.error("EvolutionScreen missing params");
            ScreenManager.pop();
            return;
        }

        this.setupUI();
        this.startSequence();
    },

    onExit() {
        const sprite = document.getElementById('evo-sprite');
        if (sprite) {
            sprite.className = '';
            sprite.style.filter = '';
        }
        UI.hide('evolution-screen');
    },

    handleInput(key) {
        if (this.state === 'ANIMATING') return true;
        if (this.state === 'TEXT') return true;
        return false;
    },

    // --- Core Logic ---

    setupUI() {
        const sprite = /** @type {HTMLImageElement} */ (document.getElementById('evo-sprite'));
        const text = document.getElementById('evo-text');

        sprite.src = this.pokemon.frontSprite;
        sprite.className = '';
        sprite.style.filter = '';
        text.innerText = "";

        UI.show('evolution-screen');
    },

    async startSequence() {
        this.state = 'ANIMATING';
        const evoOptions = { targetId: 'evo-text', arrowId: 'evo-advance-arrow', parentId: 'evo-dialog' };

        // 1. Initial message
        if (this.pokemon.cry) AudioEngine.playCry(this.pokemon.cry);
        await DialogManager.show(`What?\n${this.pokemon.name} is evolving!`, evoOptions);
        AudioEngine.playSfx('fanfair');

        // 2. Fetch data
        try {
            this.newData = await API.getPokemon(this.targetData.speciesName, this.pokemon.level, {
                shiny: this.pokemon.isShiny,
                moves: this.pokemon.moves.map(m => m.id),
                stages: this.pokemon.stages,
                status: this.pokemon.status
            });
        } catch (e) {
            console.error("Evolution Fetch Failed", e);
            this.newData = null;
        }

        if (!this.newData) {
            await DialogManager.show(`...But it failed!`, evoOptions);
            this.close();
            return;
        }

        await this.wait(2000);

        // 3. Flicker Animation Sequence
        const sprite = document.getElementById('evo-sprite');
        const flickerDuration = 3000;
        const startTime = Date.now();

        await new Promise(resolve => {
            const flickerInterval = setInterval(() => {
                const elapsed = Date.now() - startTime;
                if (elapsed >= flickerDuration) {
                    clearInterval(flickerInterval);
                    resolve();
                    return;
                }

                const phaseRate = 100 - (elapsed / flickerDuration * 60);
                const phase = Math.floor(elapsed / phaseRate);

                const state = phase % 3;
                if (state === 0) {
                    /** @type {HTMLImageElement} */ (sprite).src = this.pokemon.frontSprite;
                    sprite.classList.remove('evo-white');
                } else if (state === 1) {
                    /** @type {HTMLImageElement} */ (sprite).src = this.newData.frontSprite;
                    sprite.classList.remove('evo-white');
                } else {
                    sprite.classList.add('evo-white');
                }

                if (phase % 4 === 0) AudioEngine.playSfx('swoosh');
            }, 50);
        });

        // 4. Final Reveal
        /** @type {HTMLImageElement} */ (sprite).src = this.newData.frontSprite;
        sprite.className = 'anim-reveal';
        sprite.classList.remove('evo-white');
        AudioEngine.playSfx('fanfair');
        await this.wait(800);

        // 5. Apply Evolution Logic
        const oldName = this.pokemon.name;
        Evolution.applyEvolution(this.pokemon, this.newData, true);

        // Refresh UI
        if (Game.state === 'BATTLE') {
            if (Game.activeSlot === Game.party.indexOf(this.pokemon)) {
                UI.updateHUD(this.pokemon, 'player');
                const pSprite = /** @type {HTMLImageElement} */ (document.getElementById('player-sprite'));
                if (pSprite) pSprite.src = this.pokemon.backSprite;
                const pName = document.getElementById('player-name');
                if (pName) pName.innerText = this.pokemon.name;

                // Update the Battle Menu text ("What will ... do?")
                if (typeof BattleMenus !== 'undefined' && UI.textEl) {
                    UI.textEl.innerHTML = `What will<br>${this.pokemon.name} do?`;
                }
            }
        }

        // 6. Final success message
        if (this.pokemon.cry) AudioEngine.playCry(this.pokemon.cry);
        await DialogManager.show(`Congratulations! ${oldName}\nevolved into ${this.newData.name}!`, evoOptions);

        // 7. Check for new moves
        await this.checkLearnMoves();

        this.close();
    },

    async checkLearnMoves() {
        if (typeof MoveLearnScreen === 'undefined') return;

        const evoOptions = { targetId: 'evo-text', arrowId: 'evo-advance-arrow', parentId: 'evo-dialog' };

        // 1. Natural Level-up Moves for the NEW species at current level
        await MoveLearnScreen.checkAndLearn(this.pokemon, this.pokemon.level, evoOptions);

        // 2. Special/Debug Move (if requested in params)
        if (this.learnSpecialMove && typeof API.getRandomSpecialMove === 'function') {
            const specialMoveName = await API.getRandomSpecialMove(this.pokemon.id);
            if (specialMoveName) {
                await DialogManager.show(`${this.pokemon.name} is feeling\ninspired!`, { lock: true, ...evoOptions });
                await MoveLearnScreen.tryLearn(this.pokemon, specialMoveName, evoOptions);
            }
        }
    },

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },



    close() {
        ScreenManager.pop();
        if (this.resolve) this.resolve();
    }
};
