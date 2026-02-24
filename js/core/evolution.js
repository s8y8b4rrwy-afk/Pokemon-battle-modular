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

        const speciesName = node.species.name.toUpperCase();
        const inputName = name.toUpperCase();

        // Direct match (kebab-case Charmander vs CHARMANDER)
        if (speciesName === inputName) return node;

        // Space/Dash normalization
        if (speciesName.replace(/-/g, ' ') === inputName.replace(/-/g, ' ')) return node;

        // Special Mapping for normalized symbols
        if (speciesName === 'NIDORAN-F' && inputName === 'NIDORAN♀') return node;
        if (speciesName === 'NIDORAN-M' && inputName === 'NIDORAN♂') return node;
        if (speciesName === 'MR-MIME' && inputName === 'MR. MIME') return node;
        if (speciesName === 'FARFETCHD' && inputName === "FARFETCH'D") return node;

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

        // Helper to extract species ID from PokeAPI URL
        const getSpeciesId = url => parseInt(url.split('/').filter(Boolean).pop());

        // Priority: Match first valid level-up trigger (Gen 2 only, species ID <= 251)
        for (let next of currentNode.evolves_to) {
            // Skip Gen 3+ evolutions — game is capped at #251
            if (getSpeciesId(next.species.url) > 251) continue;

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

    async execute(pokemon, targetData, learnSpecialMove = false) {
        // Use the new ScreenManager system
        if (typeof ScreenManager !== 'undefined') {
            await ScreenManager.pushAndWait('EVOLUTION', { pokemon, targetData, learnSpecialMove });
        } else {
            console.error("ScreenManager not found! Evolution cannot screen.");
        }
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

        // Register in Pokedex
        if (typeof PokedexData !== 'undefined') PokedexData.registerCaught(oldMon.id, oldMon.isShiny, oldMon.isBoss);

        // Copied Properties
        oldMon.icon = newMon.icon;

        // Preserve HP percentage or just add difference? 
        // Standard: Add difference (healing effect for the gained HP)
        StatCalc.recalculate(oldMon);
    },

    // DEBUG FORCED EVOLUTION
    async forceEvolveByItem(pokemon, learnRandomMove = false) {
        if (!pokemon) return console.error("No Pokemon provided to forceEvolveByItem");

        console.log("Forcing debug evolution for " + pokemon.name);

        // 1. Try to find the evolution in the chain
        const chain = await this.getChain(pokemon);
        let targetData = null;

        if (chain) {
            let currentNode = this.findNodeByUrl(chain, pokemon.speciesUrl);
            if (!currentNode) currentNode = this.findNode(chain, pokemon.name);

            if (currentNode && currentNode.evolves_to.length > 0) {
                const next = currentNode.evolves_to[0]; // Take first path
                targetData = {
                    speciesName: next.species.name,
                    speciesUrl: next.species.url,
                    minLevel: 0
                };
            }
        }

        if (targetData) {
            await this.execute(pokemon, targetData, learnRandomMove);
        } else {
            console.warn("This Pokemon has no further evolutions.");
            await UI.typeText(`${pokemon.name} has no\nfurther evolutions!`);
        }
    }
};

// Expose for Debugging
window['Evolution'] = Evolution;
