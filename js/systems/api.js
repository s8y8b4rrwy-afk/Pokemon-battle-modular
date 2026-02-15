const API = {
    base: 'https://pokeapi.co/api/v2',

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

    async getPokemon(id, level, overrides = {}) {
        try {
            // 1. Fetch Core Data
            const res = await fetch(`${this.base}/pokemon/${id}`);
            const data = await res.json();

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

            // 4. Fetch Moves (Optimized: Parallel Fetching)
            let selectedMoveNames = [];
            if (overrides.moves && Array.isArray(overrides.moves)) {
                selectedMoveNames = overrides.moves;
            } else {
                // Pick 4 random moves from the pool
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
                max_hits: mData.meta ? mData.meta.max_hits : null
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
    }
};
