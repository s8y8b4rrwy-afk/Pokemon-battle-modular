const Mechanics = {
    // --- DAMAGE CALCULATION ---
    getTypeEffectiveness(moveType, targetTypes) {
        let mod = 1;
        targetTypes.forEach(t => {
            if (TYPE_CHART[moveType] && TYPE_CHART[moveType][t] !== undefined) {
                mod *= TYPE_CHART[moveType][t];
            }
        });
        return mod;
    },

    calcDamage(attacker, defender, move) {
        // 1. TYPE EFFECTIVENESS
        const typeMod = this.getTypeEffectiveness(move.type, defender.types);
        if (typeMod === 0) return { damage: 0, desc: null, eff: 0 };

        // 2. SPECIAL MOVE LOGIC (Fixed Damage, OHKO, etc from MOVE_DEX)
        const special = MOVE_DEX[move.name];
        if (special) {
            if (special.fixedDamage) return { damage: special.fixedDamage, desc: null, eff: 1, isCrit: false };
            if (special.damageCallback) return { damage: special.damageCallback(attacker, defender), desc: null, eff: 1, isCrit: false };
            if (special.ohko) {
                if (defender.level > attacker.level) return { damage: 0, desc: "failed", eff: 0 };
                return { damage: defender.currentHp, desc: "It's a One-Hit KO!", eff: 1, isCrit: false };
            }
        }

        // 3. BASE POWER CHECK
        if (!move.power) return { damage: 0, desc: "failed", eff: typeMod };

        // 4. STAT CALCULATION
        const isSpecial = move.category === 'special';
        let A = isSpecial ? attacker.stats.spa : attacker.stats.atk;
        let D = isSpecial ? defender.stats.spd : defender.stats.def;

        const atkStage = isSpecial ? attacker.stages.spa : attacker.stages.atk;
        const defStage = isSpecial ? defender.stages.spd : defender.stages.def;

        A = Math.floor(A * STAGE_MULT[atkStage]);
        D = Math.floor(D * STAGE_MULT[defStage]);

        if (attacker.status === 'brn' && !isSpecial) A = Math.floor(A * 0.5);

        // 5. THE DAMAGE FORMULA
        let dmg = Math.floor(Math.floor(Math.floor(2 * attacker.level / 5 + 2) * move.power * A / D) / 50) + 2;

        // 6. MODIFIERS
        if (attacker.types.includes(move.type)) dmg = Math.floor(dmg * 1.5);
        dmg = Math.floor(dmg * typeMod);

        let isCrit = false;
        let critChance = 0.0625;
        if (move.meta && move.meta.crit_rate >= 1) critChance = 0.125;
        if (move.meta && move.meta.crit_rate >= 2) critChance = 0.50;
        if (attacker.isBoss) critChance = Math.max(critChance, GAME_BALANCE.CRIT_CHANCE_BOSS);

        if (Math.random() < critChance) { isCrit = true; dmg *= 2; }

        const variance = GAME_BALANCE.DAMAGE_VARIANCE_MIN + Math.random() * (GAME_BALANCE.DAMAGE_VARIANCE_MAX - GAME_BALANCE.DAMAGE_VARIANCE_MIN);
        dmg = Math.floor(dmg * variance);

        if (typeMod > 0 && dmg < 1) dmg = 1;

        let msg = null;
        if (typeMod > 1) msg = "It's super\neffective!";
        else if (typeMod < 1) msg = "It's not very\neffective...";

        return { damage: dmg, desc: msg, eff: typeMod, isCrit: isCrit };
    },

    // --- EXP CALCULATION ---
    calcExpGain(enemy, attacker, wasCaught) {
        const b = enemy.baseExp;
        const L = enemy.level;
        const Lp = attacker.level;
        let gain = Math.floor(((b * L) / 5) * Math.pow((2 * L + 10) / (L + Lp + 10), 2.5)) + 1;
        if (enemy.isBoss) gain = Math.floor(gain * 1.5);
        if (wasCaught) gain = Math.floor(gain * 0.8);
        return gain;
    },

    // --- LOOT SYSTEM ---
    getLoot(enemy, wins, levelDiff = 0) {
        if (DEBUG.ENABLED && DEBUG.LOOT.FORCE_ITEM) return DEBUG.LOOT.FORCE_ITEM;
        const bst = Object.values(enemy.baseStats).reduce((a, b) => a + b, 0);
        const score = (enemy.level * 1.5) + (bst / 10) + (wins * 1.5) + (Math.max(0, levelDiff) * 25);

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
