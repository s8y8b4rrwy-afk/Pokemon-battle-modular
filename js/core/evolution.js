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
        // Use the new ScreenManager system
        if (typeof ScreenManager !== 'undefined') {
            await ScreenManager.pushAndWait('EVOLUTION', { pokemon, targetData });
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
