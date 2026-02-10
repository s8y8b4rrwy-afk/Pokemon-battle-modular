const Mechanics = {
    // --- TYPE EFFECTIVENESS ---
    getTypeEffectiveness(moveType, targetTypes) {
        let mod = 1;
        targetTypes.forEach(t => {
            if (TYPE_CHART[moveType] && TYPE_CHART[moveType][t] !== undefined) {
                mod *= TYPE_CHART[moveType][t];
            }
        });
        return mod;
    },

    // --- DAMAGE CALCULATION ---
    calculateDamage(attacker, defender, move) {
        if (!move.power) return { damage: 0, eff: 1, isCrit: false, desc: null };

        // 1. Accuracy Check (Optional: caller might want to handle this)
        // 2. Type Effectiveness
        const eff = this.getTypeEffectiveness(move.type, defender.types);
        if (eff === 0) return { damage: 0, eff: 0, isCrit: false, desc: "It had no effect!" };

        // 3. Crit Check
        let critChance = GAME_BALANCE.CRIT_CHANCE;
        if (attacker.volatiles.focusEnergy) critChance *= 2;
        const isCrit = Math.random() < critChance;

        // 4. Base Damage (Gen 2 Formula)
        const level = attacker.level;
        const A = (move.category === 'physical') ? attacker.stats.atk : attacker.stats.spa;
        const D = (move.category === 'physical') ? defender.stats.def : defender.stats.spd;
        const P = move.power;

        // Stat Stages
        let aStage = (move.category === 'physical') ? attacker.stages.atk : attacker.stages.spa;
        let dStage = (move.category === 'physical') ? defender.stages.def : defender.stages.spd;

        const aMod = STAGE_MULT[aStage] || 1;
        const dMod = STAGE_MULT[dStage] || 1;

        let base = Math.floor(Math.floor(Math.floor(2 * level / 5 + 2) * P * (A * aMod) / (D * dMod)) / 50) + 2;

        if (isCrit) base *= 1.5;

        // 5. Modifiers
        let mod = eff;
        if (attacker.types.includes(move.type)) mod *= 1.5; // STAB
        mod *= (0.85 + Math.random() * 0.15); // Random Variance

        const final = Math.max(1, Math.floor(base * mod));

        let desc = null;
        if (eff > 1) desc = "It's super effective!";
        if (eff < 1) desc = "It's not very effective...";

        return { damage: final, eff, isCrit, desc };
    },

    // --- EXP CALCULATION ---
    calculateExpGain(enemy, activeMon, participantCount, wasCaught) {
        const b = enemy.baseExp;
        const L = enemy.level;
        const Lp = activeMon.level;

        let gain = Math.floor(((b * L) / 5) * Math.pow((2 * L + 10) / (L + Lp + 10), 2.5)) + 1;

        if (enemy.isBoss) gain = Math.floor(gain * 1.5);
        if (wasCaught) gain = Math.floor(gain * 0.8);

        return Math.floor(gain / Math.max(1, participantCount));
    },

    // --- CATCH RATE ---
    calculateCatchProbability(enemy, ballKey) {
        const ballData = ITEMS[ballKey];
        const catchRate = ballData.rate * GAME_BALANCE.CATCH_RATE_MODIFIER;
        let prob = ((3 * enemy.maxHp - 2 * enemy.currentHp) / (3 * enemy.maxHp)) * catchRate;
        if (ballKey === 'pokeball') prob *= 0.5;
        return prob;
    },

    // --- LOOT SELECTION ---
    selectLoot(enemy, playerWins, levelDiff = 0) {
        if (DEBUG.ENABLED && DEBUG.LOOT.FORCE_ITEM) return DEBUG.LOOT.FORCE_ITEM;

        const bst = Object.values(enemy.baseStats).reduce((a, b) => a + b, 0);
        const score = (enemy.level * 1.5) + (bst / 10) + (playerWins * 1.5) + (Math.max(0, levelDiff) * 25);

        let totalWeight = 0;
        const pool = LOOT_SYSTEM.TABLE.map(item => {
            let weight = Math.max(0, item.base + (score * item.scaling));
            totalWeight += weight;
            return { key: item.key, weight: weight };
        });

        let random = Math.random() * totalWeight;
        for (let item of pool) {
            if (random < item.weight) return item.key;
            random -= item.weight;
        }
        return 'potion';
    }
};
