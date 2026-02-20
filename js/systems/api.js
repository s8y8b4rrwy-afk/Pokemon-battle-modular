const API = {
    base: 'https://pokeapi.co/api/v2',

    // Fallback in-memory cache for speed during session
    cache: {
        species: {},
        evolution: {},
        pokemon: {},
        moves: {},
        forms: {}
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
            const data = await this.getSpeciesData(id);
            if (!data) return true;
            return data.evolves_from_species === null;
        } catch (e) {
            return true;
        }
    },

    async getPokemonData(id) {
        const cacheKey = id.toString();
        if (this.cache.pokemon[cacheKey]) return this.cache.pokemon[cacheKey];

        // Try Persistent Cache
        const pCache = await APICache.get('pokemon', cacheKey);
        if (pCache) {
            this.cache.pokemon[cacheKey] = pCache;
            return pCache;
        }

        try {
            const res = await fetch(`${this.base}/pokemon/${id}`);
            if (!res.ok) return null;
            const data = await res.json();

            // Save to both caches
            this.cache.pokemon[cacheKey] = data;
            await APICache.set('pokemon', cacheKey, data);

            return data;
        } catch (e) { return null; }
    },

    async getSpeciesData(idOrUrl) {
        const id = idOrUrl.toString().split('/').filter(Boolean).pop();
        if (this.cache.species[id]) return this.cache.species[id];

        const pCache = await APICache.get('species', id);
        if (pCache) {
            this.cache.species[id] = pCache;
            return pCache;
        }

        try {
            const url = idOrUrl.toString().startsWith('http') ? idOrUrl : `${this.base}/pokemon-species/${id}`;
            const res = await fetch(url);
            if (!res.ok) return null;
            const data = await res.json();

            this.cache.species[id] = data;
            await APICache.set('species', id, data);

            return data;
        } catch (e) { return null; }
    },

    async getFormData(formIdOrName) {
        const cacheKey = formIdOrName.toString();
        if (this.cache.forms[cacheKey]) return this.cache.forms[cacheKey];

        const pCache = await APICache.get('forms', cacheKey);
        if (pCache) {
            this.cache.forms[cacheKey] = pCache;
            return pCache;
        }

        try {
            const res = await fetch(`${this.base}/pokemon-form/${formIdOrName}`);
            if (!res.ok) return null;
            const data = await res.json();

            this.cache.forms[cacheKey] = data;
            await APICache.set('forms', cacheKey, data);

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
            let chosen = [];
            if (typeof GAME_BALANCE !== 'undefined' && GAME_BALANCE.MOVE_GEN_SMART) {
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
            } else {
                // Fallback: Pick 4 random moves from the pool
                const pool = data.moves.map(m => m.move.name).sort(() => 0.5 - Math.random());
                chosen = pool.slice(0, 4);
            }

            // --- APPLY SPARSE DEBUG OVERRIDES ---
            if (overrides.moves && Array.isArray(overrides.moves)) {
                overrides.moves.forEach((moveKey, index) => {
                    if (moveKey !== null && moveKey !== undefined) {
                        chosen[index] = moveKey;
                    }
                });
            }

            let selectedMoveNames = chosen;

            // Fire all requests at once
            const movePromises = selectedMoveNames.map(name => this.getMove(name));
            const fetchedMoves = await Promise.all(movePromises);
            // Filter out any failed fetches (nulls)
            const validMoves = fetchedMoves.filter(m => m !== null);

            // 5. Determine Sprites
            let spriteRef = data.sprites;
            let nameSuffix = "";
            if (overrides.form) {
                const formData = await this.getFormData(overrides.form);
                if (formData) {
                    spriteRef = formData.sprites;
                    if (overrides.appendFormName && formData.form_name) {
                        nameSuffix = " " + formData.form_name.toUpperCase();
                    }
                }
            }

            const vCrystal = (spriteRef.versions && spriteRef.versions['generation-ii'])
                ? spriteRef.versions['generation-ii']['crystal']
                : null;

            let front = vCrystal ? (isShiny ? vCrystal.front_shiny_transparent : vCrystal.front_transparent) : null;
            let back = vCrystal ? (isShiny ? vCrystal.back_shiny_transparent : vCrystal.back_transparent) : null;

            // Fallback
            if (!front) front = isShiny ? spriteRef.front_shiny : spriteRef.front_default;
            if (!back) back = isShiny ? spriteRef.back_shiny : spriteRef.back_default;

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
                name: data.name.toUpperCase() + nameSuffix,
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
                isHighTier: bst > 480,
                form: overrides.form || null,
                pokeball: overrides.pokeball || 'pokeball'
            };
        } catch (e) {
            console.error("Pokemon Fetch Error:", e);
            return null;
        }
    },

    // Helper to fetch single move (used by getPokemon and Metronome)
    async getMove(idOrName) {
        const cacheKey = idOrName.toString();
        if (this.cache.moves[cacheKey]) return this.cache.moves[cacheKey];

        const pCache = await APICache.get('moves', cacheKey);
        if (pCache) {
            this.cache.moves[cacheKey] = pCache;
            return pCache;
        }

        try {
            const res = await fetch(`${this.base}/move/${idOrName}`);
            if (!res.ok) return null;
            const mData = await res.json();

            const moveData = {
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

            this.cache.moves[cacheKey] = moveData;
            await APICache.set('moves', cacheKey, moveData);

            return moveData;
        } catch (e) { return null; }
    },

    async getEvolutionChain(speciesUrl) {
        try {
            // 1. Get Species Data
            const sData = await this.getSpeciesData(speciesUrl);
            if (!sData) return null;

            // 2. Get Evolution Chain
            const chainId = sData.evolution_chain.url.split('/').filter(Boolean).pop();
            if (this.cache.evolution[chainId]) return this.cache.evolution[chainId].chain;

            const pCache = await APICache.get('evolution', chainId);
            if (pCache) {
                this.cache.evolution[chainId] = pCache;
                return pCache.chain;
            }

            const cRes = await fetch(sData.evolution_chain.url);
            const cData = await cRes.json();

            this.cache.evolution[chainId] = cData;
            await APICache.set('evolution', chainId, cData);

            return cData.chain;
        } catch (e) {
            console.error("Evo Chain Error", e);
            return null;
        }
    },

    // Check for moves learned at a specific level (strictly prioritized by version)
    async getLearnableMoves(pokemonIdOrName, level) {
        try {
            const data = await this.getPokemonData(pokemonIdOrName);
            if (!data) return [];

            const learnable = [];
            for (const m of data.moves) {
                // Priority list of versions to check
                const versions = ['crystal', 'gold-silver', 'red-blue-yellow'];

                // Find if THIS specific move is learned at THIS level in ANY of the versions
                // But we only want ONE version of the facts.
                // If a pokemon exists in Crystal, we use Crystal's facts.

                // 1. First, check if the Pokemon HAS ANY level-up data in Crystal/Gold/Silver
                const hasGen2Data = m.version_group_details.some(d =>
                    ['crystal', 'gold-silver'].includes(d.version_group.name) && d.move_learn_method.name === 'level-up'
                );

                let levelUpEntry;
                if (hasGen2Data) {
                    // Strictly use Gen 2 level
                    levelUpEntry = m.version_group_details.find(d =>
                        ['crystal', 'gold-silver'].includes(d.version_group.name) &&
                        d.move_learn_method.name === 'level-up' &&
                        d.level_learned_at === level
                    );
                } else {
                    // Fallback: This is a newer Pokemon, find the earliest version it appeared in
                    // or just find the first level-up entry that matches the level.
                    // To avoid the "shotgun" effect, we filter to only ONE version group.
                    const allLevelUpEntries = m.version_group_details.filter(d => d.move_learn_method.name === 'level-up');
                    if (allLevelUpEntries.length > 0) {
                        // Pick the version used by the first entry we find in the moves list
                        const firstVersion = allLevelUpEntries[0].version_group.name;
                        levelUpEntry = allLevelUpEntries.find(d =>
                            d.version_group.name === firstVersion &&
                            d.level_learned_at === level
                        );
                    }
                }

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

    async getRandomSpecialMove(pokemonIdOrName) {
        try {
            const data = await this.getPokemonData(pokemonIdOrName);
            if (!data) return null;

            // Find all moves that are learned via machine or tutor
            const specialMoves = data.moves.filter(m =>
                m.version_group_details.some(d => ['machine', 'tutor'].includes(d.move_learn_method.name))
            );

            if (specialMoves.length === 0) return null;

            // Pick one randomly
            const randomMove = specialMoves[Math.floor(Math.random() * specialMoves.length)];
            return randomMove.move.name;
        } catch (e) {
            console.error("Special Move Fetch Error", e);
            return null;
        }
    },

    async getMinLevel(id) {
        try {
            let sData = await this.getSpeciesData(id);
            if (!sData) return 1;

            if (!sData.evolution_chain) return 1;
            const chainId = sData.evolution_chain.url.split('/').filter(Boolean).pop();

            let cData = this.cache.evolution[chainId];
            if (!cData) {
                const pCache = await APICache.get('evolution', chainId);
                if (pCache) {
                    cData = pCache;
                    this.cache.evolution[chainId] = cData;
                } else {
                    const cRes = await fetch(sData.evolution_chain.url);
                    if (!cRes.ok) return 1;
                    cData = await cRes.json();
                    this.cache.evolution[chainId] = cData;
                    await APICache.set('evolution', chainId, cData);
                }
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
