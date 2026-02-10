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

        // 3. Determine Level Range
        let min, max;
        if (isBoss) {
            min = refLevel + ENCOUNTER_CONFIG.BOSS_LEVEL_MIN;
            max = refLevel + ENCOUNTER_CONFIG.BOSS_LEVEL_MAX;
        } else {
            min = Math.max(1, refLevel + ENCOUNTER_CONFIG.WILD_LEVEL_MIN);
            max = Math.max(1, refLevel + ENCOUNTER_CONFIG.WILD_LEVEL_MAX);
        }

        // 4. Build Specs
        let specs = {
            id: RNG.int(1, 251),
            level: RNG.int(min, max),
            isBoss: isBoss,
            overrides: {}
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
        if (!specs.overrides.hasOwnProperty('shiny') && RNG.roll(ENCOUNTER_CONFIG.SHINY_CHANCE)) {
            specs.overrides.shiny = true;
        }

        return specs;
    },

    async generate(party, wins) {
        const specs = this.determineSpecs(party, wins);

        // Fetch
        let enemy = await API.getPokemon(specs.id, specs.level, specs.overrides);

        // Fallback
        if (!enemy) enemy = await API.getPokemon(25, 5, {});

        // Apply Boss Attributes
        if (specs.isBoss) {
            enemy.isBoss = true;
            enemy.name = "BOSS " + enemy.name;
            enemy.isHighTier = true;
            enemy.rageLevel = 3;
            enemy.maxHp = Math.floor(enemy.maxHp * 1.5);
            enemy.currentHp = enemy.maxHp;
        }

        // Apply Debug Rage/Volatiles post-creation
        if (typeof DEBUG !== 'undefined' && DEBUG.ENABLED) {
            if (DEBUG.ENEMY.RAGE !== null) enemy.rageLevel = DEBUG.ENEMY.RAGE;
            if (DEBUG.ENEMY.VOLATILES) Object.assign(enemy.volatiles, DEBUG.ENEMY.VOLATILES);
        }

        return enemy;
    }
};
