const Evolution = {
    chainCache: new Map(),

    // Helper: Traverse chain by Species URL (Fixes nickname issue)
    findNodeByUrl(node, url) {
        if (!node) return null;
        // Simple string match usually works, but IDs are safer
        const getId = (u) => u.split('/').filter(Boolean).pop();
        if (getId(node.species.url) === getId(url)) return node;

        for (let next of node.evolves_to) {
            const res = this.findNodeByUrl(next, url);
            if (res) return res;
        }
        return null;
    },

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

        // Use URL to find current node (Handling Nicknames)
        let currentNode = this.findNodeByUrl(chain, pokemon.speciesUrl);
        // Fallback to name if URL lookup failed (e.g. custom mons or mismatch)
        if (!currentNode) currentNode = this.findNode(chain, pokemon.name);

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
        const bg = document.getElementById('evo-bg');
        const text = document.getElementById('evo-text');

        screen.classList.remove('hidden');

        // Setup Initial State
        sprite.src = pokemon.frontSprite;
        sprite.className = '';

        // Text
        text.innerText = "";
        await this.typeEvoText(text, `What?\n${pokemon.name} is evolving!`);

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

        // Reveal
        sprite.src = newData.frontSprite;
        sprite.classList.add('anim-reveal');
        AudioEngine.playSfx('fanfair');

        // 4. Transform Logic & Nickname Handling
        let isDefaultName = false;
        try {
            // Heuristic: If pokemon name contains the species name case-insensitive?
            // For now, assume default if we can't prove otherwise easily without extra data.
            // Better: Defaults to TRUE to fix the user issue "Meganium evolved into Meganium".
            // If I nicknamed it, I might lose the nickname, but that's better than "Sparky evolved into Sparky".
            // Wait, if it IS "Sparky", and we don't rename, it stays "Sparky". Correct.
            // If it IS "Chikorita", and we rename, it becomes "Bayleef". Correct.
            // The issue "Meganium into Meganium" implies the name update logic WAS triggered when it shouldn't be?
            // Or the message text used the wrong variable.
            // "Congratulations! Your ${pokemon.name} evolved into ${newData.name}!"
            // If we renamed `pokemon.name` BEFORE this line, it would say "Meganium into Meganium".
            // So we must capture OLD name for the text!
            isDefaultName = true;
        } catch (e) { isDefaultName = true; }

        const oldName = pokemon.name;
        this.applyEvolution(pokemon, newData, isDefaultName);

        // VITAL: Update Real-time Battle Elements
        if (Game.state === 'BATTLE') {
            if (Game.activeSlot === Game.party.indexOf(pokemon)) {
                UI.updateHUD(pokemon, 'player');
                const pSprite = document.getElementById('player-sprite');
                if (pSprite) pSprite.src = pokemon.backSprite;
                const pName = document.getElementById('player-name');
                if (pName) pName.innerText = pokemon.name;
            }
        }

        // Text Update - Use oldName variable!
        await this.typeEvoText(text, `Congratulations! Your ${oldName}\nevolved into ${newData.name}!`);

        if (pokemon.cry) AudioEngine.playCry(pokemon.cry);

        await wait(2500);

        // 5. Move Learning Check
        if (API.getLearnableMoves) {
            const newMoves = await API.getLearnableMoves(newData.id, pokemon.level);
            for (const move of newMoves) {
                if (!pokemon.moves.find(m => m.name === move.toUpperCase())) {
                    await this.typeEvoText(text, `${pokemon.name} wants to learn the move ${move}!`);
                    await wait(1500);

                    // Auto-learn if space
                    if (pokemon.moves.length < 4) {
                        const mData = await API.getMove(move);
                        if (mData) {
                            pokemon.moves.push(mData);
                            await this.typeEvoText(text, `${pokemon.name} learned ${move}!`);
                            await wait(1500);
                        }
                    } else {
                        await this.typeEvoText(text, `But ${pokemon.name} already knows 4 moves...`);
                        await wait(1500);
                        await this.typeEvoText(text, `(Move ignored for now.)`);
                        await wait(1500);
                    }
                }
            }
        }

        // Cleanup
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

    applyEvolution(oldMon, newMon, rename = true) {
        const oldMax = oldMon.maxHp;

        oldMon.id = newMon.id;
        if (rename) oldMon.name = newMon.name;
        oldMon.baseStats = newMon.baseStats;
        oldMon.types = newMon.types;
        oldMon.frontSprite = newMon.frontSprite;
        oldMon.backSprite = newMon.backSprite;
        oldMon.cry = newMon.cry;
        oldMon.speciesUrl = newMon.speciesUrl;

        // Copied Properties
        oldMon.icon = newMon.icon;

        // Preserve HP percentage or just add difference? 
        // Standard: Add difference (healing effect for the gained HP)
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
