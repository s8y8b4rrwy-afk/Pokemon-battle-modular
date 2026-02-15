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
        const sprite = document.getElementById('evo-sprite');
        const text = document.getElementById('evo-text');

        sprite.src = this.pokemon.frontSprite;
        sprite.className = '';
        sprite.style.filter = '';
        text.innerText = "";

        UI.show('evolution-screen');
    },

    async startSequence() {
        this.state = 'ANIMATING';

        // 1. Initial message
        if (this.pokemon.cry) AudioEngine.playCry(this.pokemon.cry);
        await this.typeText(`What?\n${this.pokemon.name} is evolving!`);
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
            await this.typeText(`...But it failed!`);
            await this.wait(2000);
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
                    sprite.src = this.pokemon.frontSprite;
                    sprite.classList.remove('evo-white');
                } else if (state === 1) {
                    sprite.src = this.newData.frontSprite;
                    sprite.classList.remove('evo-white');
                } else {
                    sprite.classList.add('evo-white');
                }

                if (phase % 4 === 0) AudioEngine.playSfx('swoosh');
            }, 50);
        });

        // 4. Final Reveal
        sprite.src = this.newData.frontSprite;
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
                const pSprite = document.getElementById('player-sprite');
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
        await this.typeText(`Congratulations! Your ${oldName}\nevolved into ${this.newData.name}!`);
        if (this.pokemon.cry) AudioEngine.playCry(this.pokemon.cry);
        await this.wait(2500);

        // 7. Check for new moves
        await this.checkLearnMoves();

        this.close();
    },

    async checkLearnMoves() {
        if (!API.getLearnableMoves) return;

        const newMoves = await API.getLearnableMoves(this.newData.id, this.pokemon.level);
        for (const move of newMoves) {
            if (this.pokemon.moves.find(m => m.name === move.toUpperCase())) continue;

            await this.typeText(`${this.pokemon.name} wants to learn the move ${move}!`);
            await this.wait(1500);

            if (this.pokemon.moves.length < 4) {
                const mData = await API.getMove(move);
                if (mData) {
                    this.pokemon.moves.push(mData);
                    await this.typeText(`${this.pokemon.name} learned ${move}!`);
                    await this.wait(1500);
                }
            } else {
                await this.typeText(`But ${this.pokemon.name} already knows 4 moves...`);
                await this.wait(1500);
                await this.typeText(`(Move ignored for now.)`);
                await this.wait(1500);
            }
        }
    },

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    typeText(str) {
        return new Promise(resolve => {
            const el = document.getElementById('evo-text');
            if (!el) { resolve(); return; }
            el.innerHTML = "";
            let i = 0;
            const timer = setInterval(() => {
                el.innerText += str.charAt(i);
                i++;
                if (i >= str.length) {
                    clearInterval(timer);
                    setTimeout(resolve, 500);
                }
            }, 30);
        });
    },

    close() {
        ScreenManager.pop();
        if (this.resolve) this.resolve();
    }
};
