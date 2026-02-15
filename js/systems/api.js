const API = {
    base: 'https://pokeapi.co/api/v2',
    cache: {
        species: {},
        evolution: {},
        pokemon: {}
    },

    // Helper: Convert PokeAPI ailment names to short codes
    normalizeAilment(ailment) {
        if (!ailment) return null;
        const ailmentMap = {
            'paralysis': 'par',
            'burn': 'brn',
            'poison': 'psn',
            'freeze': 'frz',
            'sleep': 'slp',
            'confusion': 'confusion'
        };
        return ailmentMap[ailment] || ailment;
    },

    async checkFirstStage(id) {
        try {
            if (this.cache.species[id]) return this.cache.species[id].evolves_from_species === null;
            const res = await fetch(`${this.base}/pokemon-species/${id}`);
            if (!res.ok) return true;
            const data = await res.json();
            this.cache.species[id] = data;
            return data.evolves_from_species === null;
        } catch (e) {
            return true;
        }
    },

    // Fast check for level-appropriateness before full fetch
    async getPokemonData(id) {
        if (this.cache.pokemon[id]) return this.cache.pokemon[id];
        try {
            const res = await fetch(`${this.base}/pokemon/${id}`);
            if (!res.ok) return null;
            const data = await res.json();
            this.cache.pokemon[id] = data;
            return data;
        } catch (e) { return null; }
    },

    async getBST(id) {
        const data = await this.getPokemonData(id);
        if (!data) return 0;
        return data.stats.reduce((acc, s) => acc + s.base_stat, 0);
    },

    async getPokemon(id, level, overrides = {}) {
        try {
            // 1. Fetch Core Data (Try Cache first)
            const data = await this.getPokemonData(id);
            if (!data) return null;

            const getStat = (n) => data.stats.find(s => s.stat.name === n).base_stat;

            // 2. Calculate Stats (Using StatCalc)
            const stats = {
                hp: StatCalc.hp(getStat('hp'), level),
                atk: StatCalc.other(getStat('attack'), level),
                def: StatCalc.other(getStat('defense'), level),
                spa: StatCalc.other(getStat('special-attack'), level),
                spd: StatCalc.other(getStat('special-defense'), level),
                spe: StatCalc.other(getStat('speed'), level)
            };

            // 3. Determine Shiny
            const isShiny = (overrides.shiny !== undefined && overrides.shiny !== null)
                ? overrides.shiny
                : (Math.random() < 0.05); // 5% natural chance

            // 4. Fetch Moves (Smart Selection)
            let selectedMoveNames = [];
            if (overrides.moves && Array.isArray(overrides.moves)) {
                selectedMoveNames = overrides.moves;
            } else if (typeof GAME_BALANCE !== 'undefined' && GAME_BALANCE.MOVE_GEN_SMART) {
                const allMoves = data.moves.map(m => {
                    // Find a relevant level-up entry (prefer G/S/C)
                    const levelEntry = m.version_group_details.find(d =>
                        ['gold-silver', 'crystal'].includes(d.version_group.name) &&
                        d.move_learn_method.name === 'level-up'
                    ) || m.version_group_details.find(d => d.move_learn_method.name === 'level-up');

                    const isEgg = m.version_group_details.some(d => d.move_learn_method.name === 'egg');

                    return {
                        name: m.move.name,
                        level: levelEntry ? levelEntry.level_learned_at : null,
                        isEgg: isEgg
                    };
                });

                // 1. Filter level-up moves learned at or below current level
                const levelUpPool = allMoves.filter(m => m.level !== null && m.level <= level)
                    .sort((a, b) => b.level - a.level); // Descending (latest first)

                // 2. Identify potential "special" moves (Egg moves or slightly higher level moves)
                const specialPool = [
                    ...allMoves.filter(m => m.isEgg),
                    ...allMoves.filter(m => m.level !== null && m.level > level && m.level <= level + (GAME_BALANCE.MOVE_GEN_HIGHER_LEVEL_REACH || 10))
                ].filter((v, i, a) => a.findIndex(t => t.name === v.name) === i); // Unique

                let chosen = [];

                // 3. Rare chance to include special moves (GUARANTEED FOR BOSSES)
                const isBoss = overrides.isBoss || false;
                const specialChance = isBoss ? 1.0 : (GAME_BALANCE.MOVE_GEN_SPECIAL_CHANCE || 0.10);

                if (Math.random() < specialChance && specialPool.length > 0) {
                    const twoChance = isBoss ? 1.0 : (GAME_BALANCE.MOVE_GEN_SPECIAL_COUNT_2_CHANCE || 0.30);
                    const count = Math.random() < twoChance ? 2 : 1;

                    for (let i = 0; i < count; i++) {
                        if (specialPool.length === 0) break;
                        const idx = Math.floor(Math.random() * specialPool.length);
                        const move = specialPool.splice(idx, 1)[0];
                        chosen.push(move.name);
                    }
                }

                // 4. Fill remaining slots with level-up moves, favoring higher level ones
                while (chosen.length < 4 && levelUpPool.length > 0) {
                    // Use a weighted random to prefer moves at the start of the sorted list (higher level)
                    const weightedIdx = Math.floor(Math.pow(Math.random(), 1.5) * levelUpPool.length);
                    const move = levelUpPool.splice(weightedIdx, 1)[0];
                    if (!chosen.includes(move.name)) {
                        chosen.push(move.name);
                    }
                }

                // Fallback: Ensure at least ONE move exists (Safety)
                if (chosen.length === 0) {
                    const fallbackPool = data.moves.map(m => m.move.name);
                    if (fallbackPool.length > 0) {
                        const idx = Math.floor(Math.random() * fallbackPool.length);
                        chosen.push(fallbackPool[idx]);
                    }
                }

                selectedMoveNames = chosen;
            } else {
                // Fallback: Pick 4 random moves from the pool
                const pool = data.moves.map(m => m.move.name).sort(() => 0.5 - Math.random());
                selectedMoveNames = pool.slice(0, 4);
            }

            // Fire all requests at once
            const movePromises = selectedMoveNames.map(name => this.getMove(name));
            const fetchedMoves = await Promise.all(movePromises);
            // Filter out any failed fetches (nulls)
            const validMoves = fetchedMoves.filter(m => m !== null);

            // 5. Determine Sprites
            const vCrystal = data.sprites.versions['generation-ii']['crystal'];
            let front = isShiny ? vCrystal.front_shiny_transparent : vCrystal.front_transparent;
            let back = isShiny ? vCrystal.back_shiny_transparent : vCrystal.back_transparent;

            // Fallback
            if (!front) front = isShiny ? data.sprites.front_shiny : data.sprites.front_default;
            if (!back) back = isShiny ? data.sprites.back_shiny : data.sprites.back_default;

            const nextLvlExp = Math.pow(level + 1, 3) - Math.pow(level, 3);
            const bst = getStat('hp') + getStat('attack') + getStat('defense') + getStat('special-attack') + getStat('special-defense') + getStat('speed');

            // 6. Normalize Status Override
            let normalizedStatus = null;
            let initialVolatiles = {};

            if (overrides.status) {
                const normalized = this.normalizeAilment(overrides.status);
                // Confusion should be a volatile, not a major status
                if (normalized === 'confusion') {
                    initialVolatiles.confused = Math.floor(Math.random() * 4) + 2;
                } else {
                    normalizedStatus = normalized;
                }
            }

            // 7. Assemble Object
            return {
                id: data.id,
                name: data.name.toUpperCase(),
                level: level,
                maxHp: stats.hp,
                currentHp: stats.hp,
                stats: stats,
                baseStats: { hp: getStat('hp'), atk: getStat('attack'), def: getStat('defense'), spa: getStat('special-attack'), spd: getStat('special-defense'), spe: getStat('speed') },
                exp: 0,
                nextLvlExp: nextLvlExp,
                baseExp: data.base_experience || 64,
                status: normalizedStatus,
                volatiles: initialVolatiles,
                stages: Object.assign({ atk: 0, def: 0, spa: 0, spd: 0, spe: 0, acc: 0, eva: 0 }, overrides.stages || {}),
                types: data.types.map(t => t.type.name),
                moves: validMoves,
                isShiny: isShiny,
                frontSprite: front,
                backSprite: back,
                icon: data.sprites.versions['generation-vii']['icons'].front_default,
                cry: data.cries ? data.cries.latest : null,
                isBoss: false,
                speciesUrl: data.species ? data.species.url : null,
                failedCatches: 0,
                rageLevel: 0,
                isHighTier: bst > 480
            };
        } catch (e) {
            console.error("Pokemon Fetch Error:", e);
            return null;
        }
    },

    // Helper to fetch single move (used by getPokemon and Metronome)
    async getMove(idOrName) {
        try {
            const res = await fetch(`${this.base}/move/${idOrName}`);
            if (!res.ok) return null;
            const mData = await res.json();

            return {
                name: mData.name.replace(/-/g, ' ').toUpperCase(),
                id: mData.name,
                type: mData.type.name,
                power: mData.power || 0,
                accuracy: mData.accuracy || 100,
                category: mData.damage_class.name,
                priority: mData.priority,
                meta: mData.meta || {},
                stat_changes: mData.stat_changes || [],
                target: mData.target.name,
                stat_chance: mData.meta ? mData.meta.stat_chance : 0,
                min_hits: mData.meta ? mData.meta.min_hits : null,
                max_hits: mData.meta ? mData.meta.max_hits : null,
                desc: mData.flavor_text_entries ? (mData.flavor_text_entries.find(f => f.language.name === 'en') || {}).flavor_text : "No description available."
            };
        } catch (e) { return null; }
    },

    async getEvolutionChain(speciesUrl) {
        try {
            // 1. Get Species Data
            const sRes = await fetch(speciesUrl);
            const sData = await sRes.json();

            // 2. Get Evolution Chain
            const cRes = await fetch(sData.evolution_chain.url);
            const cData = await cRes.json();

            return cData.chain;
        } catch (e) {
            console.error("Evo Chain Error", e);
            return null;
        }
    },

    // Check for moves learned at a specific level (for evolution)
    async getLearnableMoves(pokemonIdOrName, level) {
        try {
            const res = await fetch(`${this.base}/pokemon/${pokemonIdOrName}`);
            const data = await res.json();

            const learnable = [];
            for (const m of data.moves) {
                // Check version details (using 'red-blue' or 'gold-silver' or generic 'level-up')
                // For simplified logic, we check any version that has level-up at this level
                const levelUpEntry = m.version_group_details.find(d =>
                    d.move_learn_method.name === 'level-up' &&
                    d.level_learned_at === level
                );

                if (levelUpEntry) {
                    learnable.push(m.move.name);
                }
            }
            return learnable;
        } catch (e) {
            console.error("Move Learn Check Error", e);
            return [];
        }
    },

    async getMinLevel(id) {
        try {
            let sData = this.cache.species[id];
            if (!sData) {
                const sRes = await fetch(`${this.base}/pokemon-species/${id}`);
                if (!sRes.ok) return 1;
                sData = await sRes.json();
                this.cache.species[id] = sData;
            }

            if (!sData.evolution_chain) return 1;
            const chainId = sData.evolution_chain.url.split('/').filter(Boolean).pop();

            let cData = this.cache.evolution[chainId];
            if (!cData) {
                const cRes = await fetch(sData.evolution_chain.url);
                if (!cRes.ok) return 1;
                cData = await cRes.json();
                this.cache.evolution[chainId] = cData;
            }

            // DFS to find the species in the chain and its min level
            const findLevel = (node, targetId) => {
                const nodeUrlParts = node.species.url.split('/');
                const nodeId = parseInt(nodeUrlParts[nodeUrlParts.length - 2]);

                if (nodeId === parseInt(targetId)) {
                    if (node.evolution_details && node.evolution_details.length > 0) {
                        return node.evolution_details[0].min_level || 1;
                    }
                    return 1;
                }

                for (const branch of node.evolves_to) {
                    const result = findLevel(branch, targetId);
                    if (result !== null) return result;
                }
                return null;
            };

            return findLevel(cData.chain, id) || 1;
        } catch (e) {
            return 1;
        }
    }
};
