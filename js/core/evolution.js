const Evolution = {
    chainCache: new Map(),

    // Helper: Traverse the recursive chain structure
    findNode(node, name) {
        if (!node) return null;
        // API uses kebab-case (charmander), our app uses UPPER CASE (CHARMANDER) or display names
        if (node.species.name.toUpperCase() === name.toUpperCase()) return node;
        // Handle case where name might have spaces but API has dashes
        if (node.species.name.replace(/-/g, ' ').toUpperCase() === name.toUpperCase()) return node;

        for (let next of node.evolves_to) {
            const res = this.findNode(next, name);
            if (res) return res;
        }
        return null;
    },

    async getChain(pokemon) {
        // 1. Fallback for old saves lacking speciesUrl
        if (!pokemon.speciesUrl && pokemon.id) {
            pokemon.speciesUrl = `https://pokeapi.co/api/v2/pokemon-species/${pokemon.id}/`;
        }
        if (!pokemon.speciesUrl) return null;

        // 2. Cache Check
        let chain = this.chainCache.get(pokemon.speciesUrl);
        if (!chain) {
            chain = await API.getEvolutionChain(pokemon.speciesUrl);
            if (chain) this.chainCache.set(pokemon.speciesUrl, chain);
        }
        return chain;
    },

    async check(pokemon) {
        const chain = await this.getChain(pokemon);
        if (!chain) return null;

        const currentNode = this.findNode(chain, pokemon.name);
        if (!currentNode || currentNode.evolves_to.length === 0) return null;

        // Priority: Match first valid level-up trigger
        for (let next of currentNode.evolves_to) {
            const details = next.evolution_details;
            for (let det of details) {
                if (det.trigger.name === 'level-up') {
                    // Check Min Level
                    if (det.min_level && pokemon.level >= det.min_level) {
                        return {
                            speciesName: next.species.name,
                            speciesUrl: next.species.url,
                            minLevel: det.min_level
                        };
                    }
                }
            }
        }
        return null;
    },

    async execute(pokemon, targetData) {
        // 1. Setup Evolution Screen
        const screen = document.getElementById('evolution-screen');
        const sprite = document.getElementById('evo-sprite');
        const text = document.getElementById('evo-text');

        screen.classList.remove('hidden');

        // Setup Initial State
        sprite.src = pokemon.frontSprite;
        sprite.className = '';

        // Capture Old Name for Text
        const oldName = pokemon.name;

        // Text
        text.innerText = "";
        await this.typeEvoText(text, `What?\n${oldName} is evolving!`);

        // Audio
        AudioEngine.playSfx('fanfair');

        // 2. Pre-Fetch New Data
        const newData = await API.getPokemon(targetData.speciesName, pokemon.level, {
            shiny: pokemon.isShiny,
            moves: pokemon.moves.map(m => m.id),
            stages: pokemon.stages,
            status: pokemon.status
        });

        if (!newData) {
            await this.typeEvoText(text, `...But it failed!`);
            await wait(2000);
            screen.classList.add('hidden');
            return;
        }

        // Wait for tension
        await wait(2000);

        // 3. The Sequence
        sprite.classList.add('anim-evo-jam');
        await wait(2000);
        sprite.classList.remove('anim-evo-jam');

        sprite.classList.add('anim-evo-cycle');
        const loop = setInterval(() => AudioEngine.playSfx('swoosh'), 600);
        await wait(2400);
        clearInterval(loop);
        sprite.classList.remove('anim-evo-cycle');

        // C. The Reveal
        sprite.src = newData.frontSprite;
        sprite.classList.add('anim-reveal');
        AudioEngine.playSfx('fanfair');

        // Update Data
        this.applyEvolution(pokemon, newData);

        // VITAL: Update Battle & UI
        if (Game.state === 'BATTLE') {
            if (Game.activeSlot === Game.party.indexOf(pokemon)) {
                UI.updateHUD(pokemon, 'player');
                const pSprite = document.getElementById('player-sprite');
                if (pSprite) pSprite.src = pokemon.backSprite;
                const pName = document.getElementById('player-name');
                if (pName) pName.innerText = pokemon.name;
            }
        }

        // Force Party Screen Refresh if it's cached or open?
        // Game.party is same reference, so just re-rendering party screen if open would work.
        // But better to just ensure the icon data is correct.

        // Text Update
        await this.typeEvoText(text, `Congratulations! Your ${oldName}\nevolved into ${newData.name}!`);

        if (pokemon.cry) AudioEngine.playCry(pokemon.cry);

        await wait(3000);

        screen.classList.add('hidden');
        sprite.className = '';
    },

    typeEvoText(el, str) {
        return new Promise(resolve => {
            el.innerHTML = "";
            let i = 0;
            const timer = setInterval(() => {
                el.innerText += str.charAt(i);
                i++;
                if (i >= str.length) {
                    clearInterval(timer);
                    resolve();
                }
            }, 30);
        });
    },

    applyEvolution(oldMon, newMon) {
        // oldMon.name = newMon.name; // Don't wipe name yet? No we must update it.
        // The issue "meganium evolved into meganium" was because I updated oldMon.name BEFORE printing the success text.
        // Fixed by capturing `oldName` in execute() method.

        oldMon.id = newMon.id;
        oldMon.name = newMon.name;
        oldMon.baseStats = newMon.baseStats;
        oldMon.types = newMon.types;
        oldMon.frontSprite = newMon.frontSprite;
        oldMon.backSprite = newMon.backSprite;
        oldMon.cry = newMon.cry;
        oldMon.speciesUrl = newMon.speciesUrl;

        // FIX: Update Icon
        oldMon.icon = newMon.icon;

        StatCalc.recalculate(oldMon);
    },

    // DEBUG HELPER
    async forceEvolve(slotIndex = 0) {
        const p = Game.party[slotIndex];
        if (!p) return console.error("No Pokemon in slot " + slotIndex);

        console.log("Checking evolution for " + p.name);

        // 1. Try natural check first
        let evo = await this.check(p);

        // 2. Force if natural failed
        if (!evo) {
            console.log("No natural evolution found. Forcing from chain...");
            const chain = await this.getChain(p);

            if (chain) {
                const node = this.findNode(chain, p.name);
                if (node && node.evolves_to.length > 0) {
                    const next = node.evolves_to[0]; // Just take first path
                    evo = {
                        speciesName: next.species.name,
                        speciesUrl: next.species.url,
                        minLevel: 0 // Ignored by execute
                    };
                    console.log("Forcing evolution into: " + next.species.name);
                } else {
                    console.warn("This Pokemon is fully evolved or not found in chain.");
                }
            } else {
                console.error("Could not fetch evolution chain.");
            }
        }

        if (evo) await this.execute(p, evo);
    }
};

// Expose for Debugging
window.Evolution = Evolution;
