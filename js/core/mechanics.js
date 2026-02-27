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
        const special = MOVE_DEX[move.name.replace(/-/g, ' ').toUpperCase()];
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

        // 5. CRITICAL HIT DETERMINATION (Moved up to handle stage ignoring)
        let isCrit = false;
        let critChance = 0.0625;
        if (attacker.volatiles && attacker.volatiles.focusEnergy) critChance = 0.50;
        if (move.meta && move.meta.crit_rate >= 1) {
            if (critChance === 0.0625) critChance = 0.125;
            else if (critChance === 0.125) critChance = 0.50;
            else critChance = 0.50;
        }
        if (move.meta && move.meta.crit_rate >= 2) critChance = 0.50;
        if (attacker.isBoss) critChance = Math.max(critChance, GAME_BALANCE.CRIT_CHANCE_BOSS);

        if (typeof Game !== 'undefined' && Game.inventory && Game.party && Game.party.includes(attacker)) {
            const boost = (typeof ROGUE_CONFIG !== 'undefined') ? ROGUE_CONFIG.CRIT_BOOST_PER_STACK : 0.05;
            critChance += (Game.inventory.rogue_crit || 0) * boost;
        }

        if (Math.random() < critChance) isCrit = true;

        // 6. APPLY STAGES (Ignoring detrimental ones on crit)
        let finalAtkStage = atkStage;
        let finalDefStage = defStage;
        if (isCrit) {
            if (finalAtkStage < 0) finalAtkStage = 0;
            if (finalDefStage > 0) finalDefStage = 0;
        }

        A = Math.floor(A * STAGE_MULT[finalAtkStage]);
        D = Math.floor(D * STAGE_MULT[finalDefStage]);

        if (attacker.status === 'brn' && !isSpecial) A = Math.floor(A * 0.5);

        // 6. BARRIER MODIFIERS (Reflect, Light Screen, Aurora Veil)
        // Defenses double to halve damage, ignored on crits
        if (typeof EnvironmentManager !== 'undefined' && typeof Battle !== 'undefined' && Battle && EnvironmentManager.sideConditions) {
            const defenderSide = (defender === Battle.p) ? 'player' : 'enemy';
            const conds = EnvironmentManager.sideConditions[defenderSide];
            if (conds && !isCrit) {
                if (!isSpecial && (conds.reflect > 0 || conds.auroraVeil > 0)) {
                    D = D * 2;
                }
                if (isSpecial && (conds.lightScreen > 0 || conds.auroraVeil > 0)) {
                    D = D * 2;
                }
            }
        }

        // 7. THE DAMAGE FORMULA (Refined for better Not-Effective scaling)
        // Variable part: ((2L/5 + 2) * Power * A/D) / 50
        let baseDmg = ((2 * attacker.level / 5 + 2) * move.power * A / D) / 50;

        // 6. APPLY MODIFIERS to the variable part
        if (attacker.types.includes(move.type)) baseDmg *= 1.5; // STAB
        baseDmg *= typeMod;

        // Weather Modifiers
        if (Battle.weather.type === 'sun') {
            if (move.type === 'fire') baseDmg *= 1.5;
            if (move.type === 'water') baseDmg *= 0.5;
        } else if (Battle.weather.type === 'rain') {
            if (move.type === 'water') baseDmg *= 1.5;
            if (move.type === 'fire') baseDmg *= 0.5;
        }

        if (isCrit) baseDmg *= 1.5;

        // Apply Variance before adding the flat +2
        const variance = GAME_BALANCE.DAMAGE_VARIANCE_MIN + Math.random() * (GAME_BALANCE.DAMAGE_VARIANCE_MAX - GAME_BALANCE.DAMAGE_VARIANCE_MIN);
        baseDmg *= variance;

        // Final Damage = floor(base) + 2 (Ensures moves always deal a tiny bit of damage unless immune)
        let dmg = Math.floor(baseDmg) + 2;

        if (typeMod > 0 && dmg < 1) dmg = 1;

        let msg = null;
        if (typeMod > 1) msg = "It's super\neffective!";
        else if (typeMod > 0 && typeMod < 1) msg = "It's not very\neffective...";

        return { damage: dmg, desc: msg, eff: typeMod, isCrit: isCrit };
    },

    // --- EXP CALCULATION ---
    calcExpGain(enemy, attacker, wasCaught) {
        const b = enemy.baseExp;
        const L = enemy.level;
        const Lp = attacker.level;
        // Boosted base from 5 to 4 for easier scaling
        let gain = Math.floor(((b * L) / 4) * Math.pow((2 * L + 10) / (L + Lp + 10), 2.5)) + 1;

        const bossMult = (typeof GAME_BALANCE !== 'undefined') ? GAME_BALANCE.EXP_BOSS_MULT : 1.5;
        const luckyMult = (typeof GAME_BALANCE !== 'undefined') ? GAME_BALANCE.EXP_LUCKY_MULT : 3.0;
        const catchMult = (typeof GAME_BALANCE !== 'undefined') ? GAME_BALANCE.EXP_CATCH_MULT : 0.8;

        if (enemy.isBoss) gain = Math.floor(gain * bossMult);
        if (enemy.isLucky) gain = Math.floor(gain * luckyMult);
        if (wasCaught) gain = Math.floor(gain * catchMult);

        // Rogue Boost (XP)
        if (typeof Game !== 'undefined' && Game.inventory) {
            const boost = (typeof ROGUE_CONFIG !== 'undefined') ? ROGUE_CONFIG.XP_BOOST_PER_STACK : 0.10;
            const xpMult = 1 + (Game.inventory.rogue_xp || 0) * boost;
            gain = Math.floor(gain * xpMult);
        }

        return gain;
    },

    getEffectiveSpeed(mon) {
        let spe = mon.stats.spe;
        if (mon.stages && mon.stages.spe) spe = Math.floor(spe * STAGE_MULT[mon.stages.spe]);
        if (mon.status === 'par') spe = Math.floor(spe * 0.25); // Gen 3+ style is 25%, Gen 2-6 was 25%, Gen 7+ is 50%. Let's go with 25% for "impact".
        return spe;
    },

    getHiddenPowerType(user) {
        const types = ['fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel'];
        const val = user.stats.hp + user.stats.atk + user.stats.def + user.stats.spa + user.stats.spd + user.stats.spe + user.level;
        return types[val % types.length];
    }
};
