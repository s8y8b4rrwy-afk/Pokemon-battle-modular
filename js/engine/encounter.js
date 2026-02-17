const EncounterManager = {
    // Returns a configuration object to pass to API.getPokemon
    determineSpecs(party, wins) {
        // 1. Calculate Scaling Level
        const levels = party.map(p => p.level);
        const avgLvl = levels.reduce((a, b) => a + b, 0) / levels.length;
        const maxLvl = Math.max(...levels);
        const refLevel = Math.ceil((avgLvl + maxLvl) / 2);

        // 2. Determine Boss Status
        const isStreak = (wins > 0 && wins % ENCOUNTER_CONFIG.BOSS_STREAK_TRIGGER === 0);
        const bossRate = isStreak ? ENCOUNTER_CONFIG.BOSS_STREAK_CHANCE : ENCOUNTER_CONFIG.BOSS_CHANCE;

        let isBoss = RNG.roll(bossRate);
        let isLucky = !isBoss && RNG.roll(ENCOUNTER_CONFIG.LUCKY_CHANCE);

        // Pity System
        if (!isBoss && !isLucky && typeof Game !== 'undefined') {
            if (Game.battlesSinceLucky >= ENCOUNTER_CONFIG.LUCKY_PITY_THRESHOLD) {
                if (RNG.roll(ENCOUNTER_CONFIG.LUCKY_PITY_CHANCE)) isLucky = true;
            }
        }

        // Debug Override
        if (typeof DEBUG !== 'undefined' && DEBUG.ENABLED && DEBUG.ENEMY.IS_LUCKY !== null) {
            isLucky = DEBUG.ENEMY.IS_LUCKY;
        }

        // Update Counter
        if (typeof Game !== 'undefined') {
            if (isLucky) Game.battlesSinceLucky = 0;
            else if (!isBoss) Game.battlesSinceLucky++;
        }

        // 3. Determine Level Range
        let min, max;
        if (isBoss) {
            // UPDATED: Bosses now scale based on AVG party level (median-ish)
            const baseLevel = Math.ceil(avgLvl);
            min = baseLevel + ENCOUNTER_CONFIG.BOSS_LEVEL_MIN;
            max = baseLevel + ENCOUNTER_CONFIG.BOSS_LEVEL_MAX;
        } else if (isLucky) {
            // UPDATED: Lucky Pokemon are always slightly weaker than the party average
            const baseLevel = Math.max(1, Math.floor(avgLvl) - 2);
            min = baseLevel;
            max = baseLevel;
        } else {
            // Wild Pokemon still use the weighted refLevel to keep some challenge
            min = Math.max(1, refLevel + ENCOUNTER_CONFIG.WILD_LEVEL_MIN);
            max = Math.max(1, refLevel + ENCOUNTER_CONFIG.WILD_LEVEL_MAX);
        }

        // 4. Build Specs
        let specs = {
            id: RNG.int(1, 251),
            level: RNG.int(min, max),
            isBoss: isBoss,
            isLucky: isLucky,
            overrides: { isBoss: isBoss }
        };

        // 5. Apply DEBUG Overrides (Cleanly separated)
        if (typeof DEBUG !== 'undefined' && DEBUG.ENABLED) {
            if (DEBUG.ENEMY.ID) specs.id = DEBUG.ENEMY.ID;
            if (DEBUG.ENEMY.LEVEL) specs.level = DEBUG.ENEMY.LEVEL;
            if (DEBUG.ENEMY.IS_BOSS !== null) specs.isBoss = DEBUG.ENEMY.IS_BOSS;

            // Pass specific overrides to API
            if (DEBUG.ENEMY.SHINY !== null) specs.overrides.shiny = DEBUG.ENEMY.SHINY;
            if (DEBUG.ENEMY.STATUS) specs.overrides.status = DEBUG.ENEMY.STATUS;
            if (DEBUG.ENEMY.STAGES) specs.overrides.stages = DEBUG.ENEMY.STAGES;
        }

        // Natural Shiny Chance (if not forced)
        let shinyChance = ENCOUNTER_CONFIG.SHINY_CHANCE;

        // Rogue Boost (Shiny Charm)
        if (typeof Game !== 'undefined' && Game.inventory) {
            // Base chance is likely low (e.g. 1/100 or 1/4096). 
            const boost = (typeof ROGUE_CONFIG !== 'undefined') ? ROGUE_CONFIG.SHINY_BOOST_PER_STACK : 0.005;
            shinyChance += (Game.inventory.rogue_shiny || 0) * boost;
        }

        if (!specs.overrides.hasOwnProperty('shiny') && RNG.roll(shinyChance)) {
            specs.overrides.shiny = true;
        }

        return specs;
    },

    async generate(party, wins) {
        let specs = this.determineSpecs(party, wins);
        let enemy = null;
        let attempts = 0;

        while (attempts < 15) {
            attempts++;

            // 1. Level-Up/Evolution Integrity Check
            if (!specs.isBoss) {
                const minLvl = await API.getMinLevel(specs.id);
                if (specs.level < minLvl) {
                    specs.id = RNG.int(1, 251);
                    continue;
                }
            }

            // 2. Base Stat Total (BST) Scaling & Boss Weighting
            const bst = await API.getBST(specs.id);
            const isHighTier = bst >= ENCOUNTER_CONFIG.HI_TIER_BST_THRESHOLD;

            if (specs.isBoss) {
                // If this is a boss but we rolled a "weak" pokemon, try to find a stronger one
                if (!isHighTier && Math.random() < ENCOUNTER_CONFIG.HI_TIER_BOSS_PROBABILITY) {
                    specs.id = RNG.int(1, 251);
                    continue;
                }
            } else {
                // For wild encounters, legendaries/high-tier are restricted
                if (isHighTier) {
                    const earlyGame = (wins < ENCOUNTER_CONFIG.HI_TIER_MIN_WINS && specs.level < ENCOUNTER_CONFIG.HI_TIER_MIN_LEVEL);

                    // Too early for legendaries or just failed the rarity roll (Wild high-tiers are 10% rare)
                    if (earlyGame || Math.random() < 0.90) {
                        specs.id = RNG.int(1, 251);
                        continue;
                    }
                }
            }

            // Respect forced debug IDs (safety exit)
            if (typeof DEBUG !== 'undefined' && DEBUG.ENABLED && DEBUG.ENEMY.ID) {
                specs.id = DEBUG.ENEMY.ID;
                enemy = await API.getPokemon(specs.id, specs.level, specs.overrides);
                break;
            }

            enemy = await API.getPokemon(specs.id, specs.level, specs.overrides);
            if (enemy) break;
        }

        // Fallback
        if (!enemy) enemy = await API.getPokemon(25, 5, {});

        // Apply Boss Attributes
        if (specs.isBoss) {
            enemy.isBoss = true;
            enemy.name = "BOSS " + enemy.name;
            enemy.isHighTier = true;
            enemy.rageLevel = 1;
            enemy.maxHp = Math.floor(enemy.maxHp * 1.2);
            enemy.currentHp = enemy.maxHp;
        }

        // Apply Lucky Attributes
        if (specs.isLucky) {
            enemy.isLucky = true;
            enemy.name = "LUCKY " + enemy.name;
            enemy.catchRate = 0; // Uncatchable via standard means

            // WEAKENED: 1/8th of Max HP
            enemy.maxHp = Math.max(1, Math.floor(enemy.maxHp / 8));
            enemy.currentHp = enemy.maxHp;

            // Force Safe/Healing Moves
            const luckyMoves = ['SPLASH', 'RECOVER', 'SOFT BOILED', 'MILK DRINK', 'REST', 'AMNESIA', 'BARRIER', 'LIGHT SCREEN'];
            enemy.moves = [];
            for (let i = 0; i < 4; i++) {
                const rndMove = luckyMoves[Math.floor(Math.random() * luckyMoves.length)];
                const moveData = await API.getMove(rndMove);
                if (moveData) enemy.moves.push(moveData);
            }

            // Ensure at least Splash
            if (!enemy.moves.find(m => m.name === 'SPLASH')) {
                const splash = await API.getMove('SPLASH');
                if (splash) enemy.moves[0] = splash;
            }
        }

        // Apply Debug Rage/Volatiles post-creation
        if (typeof DEBUG !== 'undefined' && DEBUG.ENABLED) {
            if (DEBUG.ENEMY.RAGE !== null) enemy.rageLevel = DEBUG.ENEMY.RAGE;
            if (DEBUG.ENEMY.VOLATILES) Object.assign(enemy.volatiles, DEBUG.ENEMY.VOLATILES);
        }

        return enemy;
    }
};
