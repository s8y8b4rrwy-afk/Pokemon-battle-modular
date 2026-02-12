const RageManager = {
    async processRage(battle) {
        const mons = [
            { mon: battle.p, side: 'player' },
            { mon: battle.e, side: 'enemy' }
        ];

        for (const item of mons) {
            const m = item.mon;
            if (m.currentHp <= 0 || m.rageLevel === undefined || m.rageLevel >= GAME_BALANCE.RAGE_MAX_LEVEL) {
                this.resetRageFlags(m);
                continue;
            }

            if (m.volatiles.rageTriggered) {
                const damagePct = (m.volatiles.turnDamage || 0) / m.maxHp;
                const hitThresholdMet = damagePct > GAME_BALANCE.RAGE_MIN_DAMAGE_PCT;

                // Rage "begins" if threshold met, OR they missed, OR they got a status
                if (hitThresholdMet || m.volatiles.rageMiss || m.volatiles.rageStatusInflicted) {
                    let chance = GAME_BALANCE.RAGE_BASE_CHANCE;

                    // Low HP Bonus
                    if ((m.currentHp / m.maxHp) < 0.5) chance += GAME_BALANCE.RAGE_LOW_HP_BONUS;

                    // Crit Bonus
                    if (m.volatiles.rageCrit) chance += GAME_BALANCE.RAGE_CRIT_BONUS;

                    // Super Effective Bonus
                    if (m.volatiles.rageSuperEff) chance += GAME_BALANCE.RAGE_SUPER_EFF_BONUS;

                    // Status/Volatile Bonus
                    if (m.volatiles.rageStatusInflicted) chance += GAME_BALANCE.RAGE_STATUS_BONUS;

                    if (Math.random() < chance) {
                        m.rageLevel++;
                        UI.updateHUD(m, item.side);
                        await battle.triggerRageAnim(m.cry);

                        let msg = "";
                        if (m.rageLevel === 1) msg = `${m.name} is\ngetting angry!`;
                        else if (m.rageLevel === 2) msg = `${m.name}'s RAGE\nis building!`;
                        else msg = `${m.name} is\nULTRA ANGRY!`;

                        await UI.typeText(msg);
                        await wait(500);
                    }
                }

                this.resetRageFlags(m);
            }
        }
    },

    resetRageFlags(m) {
        m.volatiles.rageTriggered = false;
        m.volatiles.rageMiss = false;
        m.volatiles.rageCrit = false;
        m.volatiles.rageSuperEff = false;
        m.volatiles.rageStatusInflicted = false;
    }
};
