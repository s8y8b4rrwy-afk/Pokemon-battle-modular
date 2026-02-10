const MovesEngine = {
    async executeDamagePhase(battle, attacker, defender, move, isPlayer) {
        let didSomething = false;
        let moveImmune = false;
        let explicitlyFailed = false;

        // Setup Weather Modifier
        let weatherMod = 1;
        if (battle.weather.type === 'sun' && (move.type === 'fire' || move.type === 'water')) weatherMod = (move.type === 'fire' ? 1.5 : 0.5);
        if (battle.weather.type === 'rain' && (move.type === 'water' || move.type === 'fire')) weatherMod = (move.type === 'water' ? 1.5 : 0.5);

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
            else if (result === 'FAIL') { explicitlyFailed = true; didSomething = false; }
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
            } else if (result === true) {
                didSomething = true;
            } else {
                allowSideEffects = true;
            }
        }

        // 3. SIDE EFFECTS (The actual Status Application)
        const sideEffectsHappened = await this.handleMoveSideEffects(battle, attacker, defender, move, isPlayer, allowSideEffects);
        if (sideEffectsHappened) didSomething = true;

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
        let storedText = null;

        for (let i = 0; i < hitCount; i++) {
            if (defender.currentHp <= 0 || attacker.currentHp <= 0) break;

            const result = Mechanics.calcDamage(attacker, defender, move);
            result.damage = Math.floor(result.damage * weatherMod);
            if (result.damage > 0) lastHitDamage = result.damage;

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
            }
        }

        if (hitsLanded > 1) { await UI.typeText(`Hit ${hitsLanded} time(s)!`); await wait(500); }
        if (storedText) await UI.typeText(storedText);

        if (hitsLanded > 0 && isPlayer && defender.currentHp > 0) await Game.tryMidBattleDrop(defender);

        // Check Defender Rage
        if (hitsLanded > 0 && defender.currentHp > 0 && defender.rageLevel !== undefined && defender.rageLevel < 3) {
            let chance = GAME_BALANCE.RAGE_TRIGGER_CHANCE;
            if ((defender.currentHp / defender.maxHp) < 0.5) chance += 0.25;

            if (Math.random() < chance) {
                defender.rageLevel++;
                UI.updateHUD(defender, isPlayer ? 'enemy' : 'player');
                await battle.triggerRageAnim(defender.cry);
                await UI.typeText(`${defender.name}'s RAGE\nis building!`);
            }
        }

        // Check Attacker Rage (Multi-hit fury)
        if (didSomething) await this.handleAttackerRage(battle, attacker, defender, move, lastHitDamage, isPlayer);

        return { success: didSomething, immune: false };
    },

    async resolveSingleHit(battle, attacker, defender, move, damage, isPlayer, isFirstHit, result) {
        if (isFirstHit) {
            if (result.isCrit) AudioEngine.playSfx('crit');
            else if (result.eff > 1) AudioEngine.playSfx('super_effective');
            else if (result.eff < 1 && result.eff > 0) AudioEngine.playSfx('not_very_effective');
        }

        await battle.applyDamage(defender, damage, move.type);

        // Rage Building (during hit)
        if (defender.currentHp > 0 && defender.rageLevel !== undefined && defender.rageLevel < 3) {
            let chance = GAME_BALANCE.RAGE_TRIGGER_CHANCE;
            if ((defender.currentHp / defender.maxHp) < 0.5) chance += 0.25;

            if (Math.random() < chance) {
                defender.rageLevel++;
                UI.updateHUD(defender, isPlayer ? 'enemy' : 'player');
                await battle.triggerRageAnim(defender.cry);
                await UI.typeText(`${defender.name}'s RAGE\nis building!`);
            }
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

    async handleAttackerRage(battle, attacker, defender, move, baseDmg, isPlayer) {
        const rage = attacker.rageLevel || 0;
        if (attacker.currentHp <= 0 || rage === 0) return;

        let extraHits = 0;
        if (Math.random() < (rage * GAME_BALANCE.RAGE_MULTIHIT_BASE)) {
            extraHits = (rage === 3 && Math.random() < 0.5) ? 2 : 1;
        }

        if (extraHits > 0) {
            for (let j = 0; j < extraHits; j++) {
                if (defender.currentHp <= 0 || attacker.currentHp <= 0) break;

                await battle.triggerRageAnim(attacker.cry);
                let msg = j === 1 ? "ULTRA ANGRY!" : "FULL OF RAGE!";
                await UI.typeText(`${attacker.name} is\n${msg}`);
                await UI.typeText(`${attacker.name} used\n${move.name} again!`);

                const dmgMod = (j === 0) ? 0.8 : 0.5;
                const extraDmg = Math.max(1, Math.floor(baseDmg * dmgMod));

                await battle.applyDamage(defender, extraDmg, move.type);

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
        if (typeMod === 0) {
            await UI.typeText("It had no effect!");
            return 'IMMUNE';
        }
        return false;
    },

    async handleMoveSideEffects(battle, attacker, defender, move, isPlayer, prevActionSuccess) {
        if (move.id === 'self-destruct' || move.id === 'explosion') {
            attacker.currentHp = 0;
            UI.updateHUD(attacker, isPlayer ? 'player' : 'enemy');
            const sprite = isPlayer ? document.getElementById('player-sprite') : document.getElementById('enemy-sprite');
            sprite.classList.add('anim-faint');
            return true;
        }

        if (!prevActionSuccess) return false;

        let didSomething = false;

        // Stat Changes
        if (move.stat_changes && move.stat_changes.length > 0) {
            let chance = move.stat_chance === 0 ? 100 : move.stat_chance;
            if (Math.random() * 100 < chance) {
                let target = (move.target === 'user' || move.target === 'users-field') ? attacker : defender;
                if (move.category !== 'status') {
                    const first = move.stat_changes[0];
                    if (first && first.change > 0) target = attacker; else target = defender;
                }
                if (target.currentHp > 0) {
                    await battle.applyStatChanges(target, move.stat_changes, target === battle.p);
                    didSomething = true;
                }
            }
        }

        // Status & Flinch
        if (move.meta) {
            if (defender.currentHp > 0 && move.meta.flinch_chance > 0) {
                if (Math.random() * 100 < move.meta.flinch_chance) {
                    defender.volatiles.flinch = true;
                }
            }
            if (defender.currentHp > 0 && move.meta.ailment && move.meta.ailment.name !== 'none') {
                let chance = move.meta.ailment_chance === 0 ? 100 : move.meta.ailment_chance;
                if (Math.random() * 100 < chance) {
                    const success = await battle.applyStatus(defender, move.meta.ailment.name, !isPlayer);
                    if (success) didSomething = true;
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
            eSprite.style.opacity = 0;
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
