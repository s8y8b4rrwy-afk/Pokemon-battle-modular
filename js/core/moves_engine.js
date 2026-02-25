const MovesEngine = {
    async executeDamagePhase(battle, attacker, defender, move, isPlayer) {
        let didSomething = false;
        let moveImmune = false;
        let explicitlyFailed = false;

        // Setup Weather Modifier
        let weatherMod = 1;
        if (battle.weather.type === 'sun' && (move.type === 'fire' || move.type === 'water')) weatherMod = (move.type === 'fire' ? 1.5 : 0.5);
        if (battle.weather.type === 'rain' && (move.type === 'water' || move.type === 'fire')) weatherMod = (move.type === 'water' ? 1.5 : 0.5);

        // Comprehensive Logging
        if (typeof BattleLogger !== 'undefined' && BattleLogger.enabled) {
            BattleLogger.logMove(attacker, move, isPlayer);
        }

        // 1. CHECK MOVE_DEX CONDITIONS
        const special = MOVE_DEX[move.name.replace(/-/g, ' ').toUpperCase()];
        if (special && special.condition) {
            if (!special.condition(defender)) {
                await UI.typeText("But it failed!");
                return;
            }
        }

        // 2. EXECUTE MAIN LOGIC
        let allowSideEffects = false;

        // Check for Unique Move Logic FIRST (Covers U-turn, Counter, Rest, etc)
        if (special && special.isUnique) {
            const result = await special.onHit(battle, attacker, defender, weatherMod);
            if (result === 'IMMUNE') { moveImmune = true; didSomething = false; }
            else if (result === 'FAIL' || result === false) { explicitlyFailed = true; didSomething = false; }
            else { didSomething = !!result; }
        }
        else if (move.category !== 'status') {
            // --- DAMAGING MOVES ---
            const result = await this.handleDamageSequence(battle, attacker, defender, move, isPlayer, weatherMod);
            didSomething = result.success;
            moveImmune = result.immune;
            // Only run side effects (e.g. Ancient Power stats) if damage landed
            allowSideEffects = didSomething && !moveImmune;
        } else {
            // --- STATUS MOVES ---
            const result = await this.handleStatusMove(battle, attacker, defender, move);

            if (result === 'IMMUNE') {
                moveImmune = true;
                didSomething = false;
            } else if (result === 'FAIL') {
                explicitlyFailed = true;
                didSomething = false;
            } else {
                allowSideEffects = true;
            }
        }

        // 3. SIDE EFFECTS (The actual Status Application)
        // Note: For standard Damaging moves, this is now handled after each hit in handleDamageSequence
        if (move.category === 'status' || (special && special.isUnique)) {
            const sideEffectsHappened = await this.handleMoveSideEffects(battle, attacker, defender, move, isPlayer, allowSideEffects);
            if (sideEffectsHappened) didSomething = true;
        }

        // 4. FAILURE MESSAGE
        if (!didSomething && !moveImmune && !explicitlyFailed) {
            await UI.typeText("But it failed!");
        }
    },

    async handleDamageSequence(battle, attacker, defender, move, isPlayer, weatherMod) {
        let didSomething = false;
        let hitCount = 1;

        if (move.min_hits && move.max_hits) {
            hitCount = Math.floor(Math.random() * (move.max_hits - move.min_hits + 1)) + move.min_hits;
        } else if (move.min_hits) hitCount = move.min_hits;

        let hitsLanded = 0;
        let lastHitDamage = 0;
        let lastResult = null;
        let storedText = null;

        for (let i = 0; i < hitCount; i++) {
            if (defender.currentHp <= 0 || (i > 0 && attacker.currentHp <= 0)) break;

            const result = Mechanics.calcDamage(attacker, defender, move);
            lastResult = result;
            result.damage = Math.floor(result.damage * weatherMod);
            if (result.damage > 0) lastHitDamage = result.damage;

            // Comprehensive Logging
            if (typeof BattleLogger !== 'undefined' && BattleLogger.enabled) {
                BattleLogger.logDamage(defender, result.damage, !isPlayer, `(Eff: ${result.eff}${result.isCrit ? ', CRIT' : ''})`);
            }

            if (i === 0) {
                if (result.desc === 'failed') return { success: false, immune: false };
                if (result.eff === 0) {
                    await UI.typeText("It had no effect!");
                    return { success: false, immune: true };
                }
                if (result.isCrit) storedText = "A critical hit!";
                else if (result.desc) storedText = result.desc;
            }

            if (result.damage > 0) {
                didSomething = true;
                defender.volatiles.turnDamage = (defender.volatiles.turnDamage || 0) + result.damage;
                defender.volatiles.turnDamageCategory = move.category;

                await this.resolveSingleHit(battle, attacker, defender, move, result.damage, isPlayer, i === 0, result);
                hitsLanded++;

                // Trigger Side Effects & Mid-Battle Drops after EACH damage calculation/hit
                // This ensures multi-hit moves (like Double Kick) check per hit as requested.
                await this.handleMoveSideEffects(battle, attacker, defender, move, isPlayer, true);
                if (isPlayer && defender.currentHp > 0) {
                    await Game.tryMidBattleDrop(defender, { isCrit: result.isCrit, eff: result.eff });
                }
            }
        }


        if (hitsLanded > 1) { await UI.typeText(`Hit ${hitsLanded} time(s)!`); await wait(500); }
        if (storedText) await UI.typeText(storedText);

        // Check Attacker Rage (Multi-hit fury)
        if (didSomething) await this.handleAttackerRage(battle, attacker, defender, move, lastHitDamage, isPlayer, lastResult);

        return { success: didSomething, immune: false };
    },

    async resolveSingleHit(battle, attacker, defender, move, damage, isPlayer, isFirstHit, result) {
        // Effectiveness data is passed INTO applyDamage so SFX plays at impact, not before
        const effData = { eff: result.eff, isCrit: result.isCrit };

        await battle.applyDamage(defender, damage, move.type, move.skipAnim ? false : move.name, effData, attacker);

        // Rage Building flags
        if (defender.currentHp > 0 && defender.rageLevel !== undefined) {
            defender.volatiles.rageTriggered = true;
            if (result.isCrit) defender.volatiles.rageCrit = true;
            if (result.eff > 1) defender.volatiles.rageSuperEff = true;
        }

        // Draining / Recoil
        if (move.meta && move.meta.drain) {
            await wait(500);
            const amount = Math.max(1, Math.floor(damage * (Math.abs(move.meta.drain) / 100)));
            if (move.meta.drain < 0) {
                await UI.typeText(`${attacker.name} is hit\nwith recoil!`);
                await battle.applyDamage(attacker, amount, 'recoil');
            } else {
                await battle.applyHeal(attacker, amount, `${defender.name} had its\nenergy drained!`);
            }
        }
    },

    async handleAttackerRage(battle, attacker, defender, move, baseDmg, isPlayer, result) {
        const rage = attacker.rageLevel || 0;
        if (attacker.currentHp <= 0 || rage === 0) return;

        let extraHits = 0;
        if (Math.random() < (rage * GAME_BALANCE.RAGE_MULTIHIT_BASE)) {
            extraHits = (rage === GAME_BALANCE.RAGE_MAX_LEVEL && Math.random() < 0.5) ? 2 : 1;
        }

        if (extraHits > 0) {
            for (let j = 0; j < extraHits; j++) {
                if (defender.currentHp <= 0 || attacker.currentHp <= 0) break;

                await battle.triggerRageAnim(attacker.cry);
                let msg = j === 1 ? "ULTRA ANGRY!" : "FULL OF RAGE!";
                await UI.typeText(`${attacker.name} is\n${msg}`);
                await UI.typeText(`${attacker.name} used\n${move.name} again!`);

                let currentDmg;

                // --- CUSTOM: ROLLOUT RAGE SCALING ---
                // If the move is ROLLOUT, each rage hit increments the rolloutCount and doubles the damage.
                if (move.name === 'ROLLOUT' && attacker.volatiles.rolloutCount) {
                    attacker.volatiles.rolloutCount++;
                    if (attacker.volatiles.rolloutCount > 5) attacker.volatiles.rolloutCount = 1;

                    // Power doubles, so damage roughly doubles.
                    currentDmg = baseDmg * 2;
                } else {
                    const dmgMod = (j === 0) ? 0.8 : 0.5;
                    currentDmg = Math.floor(baseDmg * dmgMod);
                }

                const extraDmg = Math.max(1, currentDmg);
                // Update baseDmg for the next repetition (if any)
                baseDmg = extraDmg;

                const effData = { eff: result.eff, isCrit: result.isCrit };
                await battle.applyDamage(defender, extraDmg, move.type, move.name, effData);

                // Trigger Side Effects & Mid-Battle Drops for extra rage hits ("Raids")
                await this.handleMoveSideEffects(battle, attacker, defender, move, isPlayer, true);
                if (isPlayer && defender.currentHp > 0) {
                    await Game.tryMidBattleDrop(defender, { isCrit: result.isCrit, eff: result.eff });
                }

                if (Math.random() < GAME_BALANCE.RAGE_RECOIL_CHANCE) {
                    await wait(500);
                    await UI.typeText(`${attacker.name} is hit\nwith recoil!`);
                    const recoil = Math.max(1, Math.floor(baseDmg * GAME_BALANCE.RAGE_RECOIL_DMG));
                    await battle.applyDamage(attacker, recoil, 'recoil');
                }
            }
        }
    },

    async handleStatusMove(battle, attacker, defender, move) {
        const typeMod = Mechanics.getTypeEffectiveness(move.type, defender.types);

        // Target Determination
        const isSelfTarget = (move.target === 'user' || move.target === 'users-field');
        const target = isSelfTarget ? attacker : defender;

        // If it's an offensive move targeting the enemy, check immunity first
        if (!isSelfTarget && typeMod === 0) {
            await UI.typeText("It had no effect!"); // Immune
            return 'IMMUNE';
        }

        // --- PRE-ANIMATION CHECKS ---
        if (move.category === 'status') {
            // A. Status Ailment Moves (Sleep, Poison, etc)
            if (!isSelfTarget && move.meta && move.meta.ailment) {
                const ailmentRaw = move.meta.ailment.name;

                // 1. Substitute Check
                if (defender.volatiles.substituteHP > 0 && ailmentRaw !== 'confusion') {
                    await UI.typeText("But it failed!");
                    return 'FAIL';
                }

                if (ailmentRaw !== 'none') {
                    const ailment = EffectsManager.normalizeAilment(ailmentRaw);

                    // 2. Existing Status Check
                    if (ailment === 'confusion') {
                        if (defender.volatiles.confused) {
                            await UI.typeText(`${defender.name} is\nalready confused!`);
                            return 'FAIL';
                        }
                    } else {
                        // Major Status (Sleep, Poison, etc) - target cannot have ANY major status
                        if (defender.status) {
                            await UI.typeText("But it failed!");
                            return 'FAIL';
                        }
                    }

                    // 3. Type-Specific Immunities check (Poison vs Steel, etc)
                    const isImmune = ((ailment === 'psn' || ailment === 'tox') && (defender.types.includes('poison') || defender.types.includes('steel'))) ||
                        (ailment === 'brn' && defender.types.includes('fire')) ||
                        (ailment === 'par' && defender.types.includes('electric')) ||
                        (ailment === 'frz' && defender.types.includes('ice'));

                    if (isImmune) {
                        await UI.typeText("It doesn't affect\n" + defender.name + "...");
                        return 'IMMUNE';
                    }
                }
            }

            // B. Stat Change Moves (Growl, Tail Whip, Swords Dance)
            if (move.stat_changes && move.stat_changes.length > 0) {
                // 1. Substitute Check (only for debuffs on enemy)
                if (!isSelfTarget && defender.volatiles.substituteHP > 0) {
                    const hasDebuff = move.stat_changes.some(s => s.change < 0);
                    if (hasDebuff) {
                        await UI.typeText(`${defender.name} is protected\nby the SUBSTITUTE!`);
                        return 'FAIL';
                    }
                }

                // 2. Limit Check (Don't play anim if nothing will happen)
                let canChange = false;
                for (const sc of move.stat_changes) {
                    const statName = sc.stat.name.replace('special-attack', 'spa').replace('special-defense', 'spd').replace('attack', 'atk').replace('defense', 'def').replace('speed', 'spe');
                    const currentStage = target.stages[statName];

                    // If trying to lower, must be > -6
                    if (sc.change < 0 && currentStage > -6) canChange = true;
                    // If trying to raise, must be < 6
                    if (sc.change > 0 && currentStage < 6) canChange = true;
                }

                if (!canChange) {
                    await UI.typeText("It had no effect!"); // Or "Nothing happened!"
                    return 'FAIL';
                }
            }
        }

        // --- PLAY ANIMATION ---
        await battle.triggerHitAnim(target, move.type, move.name, attacker);

        return false;
    },

    async handleMoveSideEffects(battle, attacker, defender, move, isPlayer, prevActionSuccess) {
        if (!prevActionSuccess) return false;

        let didSomething = false;

        // Stat Changes (delayed)
        if (move.stat_changes && move.stat_changes.length > 0) {
            let chance = move.stat_chance === 0 ? 100 : move.stat_chance;
            if (Math.random() * 100 < chance) {
                let target = (move.target === 'user' || move.target === 'users-field') ? attacker : defender;
                if (move.category !== 'status') {
                    const first = move.stat_changes[0];
                    if (first && first.change > 0) target = attacker; else target = defender;
                }
                if (target.currentHp > 0) {
                    await wait(300); // Delay before stat change
                    await battle.applyStatChanges(target, move.stat_changes, target === battle.p);
                    didSomething = true;
                    if (target.rageLevel !== undefined) target.volatiles.rageStatusInflicted = true;
                }
            }
        }

        // Status & Flinch (delayed)
        if (move.meta) {
            if (defender.currentHp > 0 && move.meta.flinch_chance > 0) {
                if (Math.random() * 100 < move.meta.flinch_chance) {
                    defender.volatiles.flinch = true;
                    if (defender.rageLevel !== undefined) defender.volatiles.rageStatusInflicted = true;
                }
            }
            if (defender.currentHp > 0 && move.meta.ailment && move.meta.ailment.name !== 'none') {
                let chance = move.meta.ailment_chance === 0 ? 100 : move.meta.ailment_chance;
                if (Math.random() * 100 < chance) {
                    await wait(400); // Delay before status infliction
                    const success = await battle.applyStatus(defender, move.meta.ailment.name, !isPlayer);
                    if (success) {
                        didSomething = true;
                        if (defender.rageLevel !== undefined) defender.volatiles.rageStatusInflicted = true;
                    }
                }
            }

            // --- AUTO-FOCUS ENERGY ---
            // If it's a status move targeting self that boosts crit (like Focus Energy)
            if (move.category === 'status' && (move.target === 'user' || move.target === 'users-field') && move.meta.crit_rate > 0) {
                if (!attacker.volatiles.focusEnergy) {
                    attacker.volatiles.focusEnergy = true;
                    await UI.typeText(`${attacker.name} is\ngetting pumped!`);
                    didSomething = true;
                }
            }
        }

        return didSomething;
    },

    // --- HELPERS ---

    // Helper for Roar/Whirlwind/Dragon Tail
    async forceSwitchOrRun(battle, user, target) {
        if (target.isBoss) {
            await UI.typeText("But it failed!");
            return false;
        }

        // CASE 1: Player used Roar -> End Battle, Find New Enemy
        if (user === battle.p) {
            await UI.typeText(`${target.name} fled\nin fear!`);
            AudioEngine.playSfx('run');

            const eSprite = document.getElementById('enemy-sprite');
            eSprite.style.transition = "opacity 0.5s";
            eSprite.style.opacity = '0';
            await wait(500);

            Game.skipBattle();
            return true;
        }

        // CASE 2: Enemy used Roar -> Force Player Switch
        else {
            const validIndices = Game.party
                .map((p, index) => ({ p, index }))
                .filter(item => item.p.currentHp > 0 && item.index !== Game.activeSlot)
                .map(item => item.index);

            if (validIndices.length === 0) {
                await UI.typeText("But it failed!");
                return false;
            }

            const rndIndex = validIndices[Math.floor(Math.random() * validIndices.length)];
            const newMon = Game.party[rndIndex];

            await UI.typeText(`${target.name} was\ndragged out!`);
            Game.activeSlot = rndIndex;
            await battle.processSwitch(newMon, false);
            return true;
        }
    }
};
