const TurnManager = {
    async performTurn(battle, playerMove) {
        if (battle.uiLocked) return;

        // Safety: If charging, force the queued move
        if (battle.p.volatiles.charging && battle.p.volatiles.queuedMove) {
            playerMove = battle.p.volatiles.queuedMove;
        }

        // 1. INSTANT UI FEEDBACK
        battle.uiLocked = true;
        document.getElementById('action-menu').classList.add('hidden');
        document.getElementById('move-menu').classList.add('hidden');
        Input.setMode('NONE');

        try {
            const pAction = {
                type: 'ATTACK', user: battle.p, target: battle.e, move: playerMove,
                speed: battle.p.stats.spe, priority: playerMove.priority || 0, isPlayer: true
            };

            const enemyMove = BattleAI.chooseMove(battle.e, battle.p);
            const eAction = {
                type: 'ATTACK', user: battle.e, target: battle.p, move: enemyMove,
                speed: battle.e.stats.spe, priority: enemyMove.priority || 0, isPlayer: false
            };

            const queue = [pAction, eAction].sort((a, b) => {
                if (a.priority !== b.priority) return b.priority - a.priority;
                if (a.speed !== b.speed) return b.speed - a.speed;
                return Math.random() - 0.5;
            });

            // Comprehensive Logging
            if (typeof BattleLogger !== 'undefined' && BattleLogger.enabled) {
                BattleLogger.system(`Turn Actions: ${pAction.user.name} (Pri: ${pAction.priority}, Spe: ${pAction.speed}) vs ${eAction.user.name} (Pri: ${eAction.priority}, Spe: ${eAction.speed})`);
            }

            const result = await this.runQueue(battle, queue);
            if (result === 'STOP_BATTLE') return;

            if (Game.state === 'BATTLE' && battle.p.currentHp > 0 && battle.e.currentHp > 0) {
                battle.uiLocked = false;
                BattleMenus.uiToMenu();
            }
        } catch (err) {
            console.error("Battle Error:", err);
            battle.cleanup();
            battle.uiLocked = false;
            BattleMenus.uiToMenu();
        }
    },

    async performSwitch(battle, newMon) {
        if (battle.uiLocked) return;

        try {
            battle.uiLocked = true;
            document.getElementById('action-menu').classList.add('hidden');

            const swapAction = { type: 'SWITCH', user: battle.p, newMon: newMon, priority: 6, isPlayer: true };
            const eMove = BattleAI.chooseMove(battle.e, battle.p);
            const eAction = {
                type: 'ATTACK', user: battle.e, target: battle.p, move: eMove,
                speed: battle.e.stats.spe, priority: 0, isPlayer: false
            };

            const result = await this.runQueue(battle, [swapAction, eAction]);
            if (result === 'STOP_BATTLE') return;

            if (Game.state === 'BATTLE' && battle.p.currentHp > 0 && battle.e.currentHp > 0) {
                battle.uiLocked = false;
                BattleMenus.uiToMenu();
            }
        } catch (err) {
            console.error("Switch Error:", err);
            battle.uiLocked = false;
            BattleMenus.uiToMenu();
        }
    },

    async runQueue(battle, queue) {
        // Comprehensive Logging
        if (typeof BattleLogger !== 'undefined' && BattleLogger.enabled) {
            BattleLogger.system(`--- PROCESSING QUEUE (${queue.length} actions) ---`);
        }
        // 0. RESET TURN DATA
        [battle.p, battle.e].forEach(m => {
            m.volatiles.turnDamage = 0;
            m.volatiles.turnDamageCategory = null;
        });

        // 1. PROCESS ACTIONS
        for (const action of queue) {
            if (Game.state !== 'BATTLE') return 'STOP_BATTLE';
            if (action.type !== 'SWITCH' && action.user.currentHp <= 0) continue;
            if (action.type === 'ATTACK') action.target = action.isPlayer ? battle.e : battle.p;

            const result = await this.executeAction(battle, action);
            if (result === 'STOP_BATTLE') return 'STOP_BATTLE';

            // Check for faints after action (Speed-based priority for faints)
            const sideFainted = await FaintManager.checkFaints(battle, ['enemy', 'player']);
            if (sideFainted) return 'STOP_BATTLE';
        }

        // 2. END OF TURN SEQUENCE
        if (Game.state === 'BATTLE') {
            await this.processDelayedMoves(battle);
            if (await FaintManager.checkFaints(battle, ['player', 'enemy'])) return 'STOP_BATTLE';

            await battle.processEndTurnEffects(battle.p, true);
            if (await FaintManager.checkFaints(battle, ['player', 'enemy'])) return 'STOP_BATTLE';

            await battle.processEndTurnEffects(battle.e, false);
            if (await FaintManager.checkFaints(battle, ['enemy', 'player'])) return 'STOP_BATTLE';

            // 3. RAGE PROCESSING (End of Turn)
            await RageManager.processRage(battle);

            await EnvironmentManager.tickWeather();
        }
    },

    async executeAction(battle, action) {
        switch (action.type) {
            case 'ATTACK': await this.processAttack(battle, action.user, action.target, action.move); break;
            case 'SWITCH': await this.processSwitch(battle, action.newMon); break;
            case 'ITEM': return await battle.processItem(action.item);
        }
    },

    async processAttack(battle, attacker, defender, move) {
        const isPlayer = (attacker === battle.p);
        const logic = MOVE_LOGIC[move.id] || {};
        const sprite = isPlayer ? document.getElementById('player-sprite') : document.getElementById('enemy-sprite');

        attacker.volatiles.destinyBond = false;

        if (attacker.volatiles.recharging) {
            attacker.volatiles.recharging = false;
            await UI.typeText(`${attacker.name} must\nrecharge!`);
            return;
        }

        // Check if move is disabled
        if (attacker.volatiles.disabled && attacker.volatiles.disabled.moveName === move.name) {
            await UI.typeText(`${attacker.name}'s ${move.name}\nis disabled!`);
            return;
        }

        const canMove = await EffectsManager.checkCanMove(battle, attacker, isPlayer);
        if (!canMove) {
            if (attacker.volatiles.charging) {
                attacker.volatiles.charging = false;
                attacker.volatiles.queuedMove = null;
                attacker.volatiles.invulnerable = null;
                sprite.style.opacity = 1;
                if (logic.invuln) await UI.typeText(`${attacker.name} crashed\ndown!`);
            }
            return;
        }

        if (logic.type !== 'protect') attacker.volatiles.protected = false;

        const hasSub = attacker.volatiles.substituteHP > 0;
        if (hasSub && move.target !== 'user') {
            const realSrc = isPlayer ? attacker.backSprite : attacker.frontSprite;
            await battle.performVisualSwap(attacker, realSrc, false, isPlayer);
        }

        await UI.typeText(`${attacker.name} used\n${move.name}!`);

        // Track last move used (for Disable, Encore, etc.)
        attacker.lastMoveUsed = move;

        const checkInvulnHit = async () => {
            if (move.target === 'user' || move.target === 'users-field') return true;
            if (defender.volatiles.invulnerable) {
                const inv = defender.volatiles.invulnerable;
                let hits = false;
                if (inv === 'digging' && ['EARTHQUAKE', 'MAGNITUDE', 'FISSURE'].includes(move.name)) hits = true;
                if (inv === 'flying' && ['THUNDER', 'GUST', 'TWISTER', 'SKY UPPERCUT', 'HURRICANE', 'SMACK DOWN'].includes(move.name)) hits = true;
                if (inv === 'bouncing' && ['THUNDER', 'GUST', 'TWISTER', 'SKY UPPERCUT', 'HURRICANE', 'SMACK DOWN'].includes(move.name)) hits = true;
                if (inv === 'diving' && ['SURF', 'WHIRLPOOL'].includes(move.name)) hits = true;
                if (inv === 'shadow' && ['FEINT', 'PHANTOM FORCE'].includes(move.name)) hits = true;
                if (!hits) {
                    await UI.typeText(`${defender.name} avoided\nthe attack!`);
                    return false;
                }
            }
            return true;
        };

        const restoreSub = async () => {
            const currentMon = isPlayer ? battle.p : battle.e;
            if (currentMon.volatiles.substituteHP > 0) {
                const dollSrc = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/substitute.png";
                if (sprite.src === dollSrc) return;
                await battle.performVisualSwap(currentMon, dollSrc, true, isPlayer);
            }
        };

        if (attacker.volatiles.charging) {
            attacker.volatiles.charging = false;
            attacker.volatiles.invulnerable = null;
            // sprite.style.opacity = 1; // DEFER UNTIL AFTER ANIMATION OR FAIL

            if (await checkInvulnHit() === false) {
                sprite.style.opacity = '1';
                await restoreSub();
                return;
            }
            if (defender.volatiles.protected && move.target !== 'user') {
                sprite.style.opacity = '1';
                await UI.typeText(`${defender.name} protected\nitself!`);
                await restoreSub();
                return;
            }

            await MovesEngine.executeDamagePhase(battle, attacker, defender, move, isPlayer);
            sprite.style.opacity = '1'; // Restore now if animation didn't
            await restoreSub();
            return;
        }

        if (logic.type === 'protect') {
            if (attacker.volatiles.protected) {
                await UI.typeText("But it failed!");
                attacker.volatiles.protected = false;
            } else {
                attacker.volatiles.protected = true;
                await UI.typeText(`${attacker.name} protected\nitself!`);
                AudioEngine.playSfx('clank');
            }
            await restoreSub();
            return;
        }

        if (logic.type === 'charge') {
            if (logic.weatherSkip && battle.weather.type === logic.weatherSkip) {
                // Skip charge
            } else {
                attacker.volatiles.charging = true;
                attacker.volatiles.queuedMove = move;
                if (logic.invuln) attacker.volatiles.invulnerable = logic.invuln;

                await wait(400);
                await wait(400);
                if (logic.hide) {
                    const sfx = logic.sound || 'swoosh';
                    AudioEngine.playSfx(sfx);
                    sprite.style.opacity = 0;
                    await wait(250);
                }

                await UI.typeText(`${attacker.name}\n${logic.msg}`);
                if (logic.buff) await battle.applyStatChanges(attacker, [{ stat: { name: logic.buff.stat }, change: logic.buff.val }], isPlayer);
                await restoreSub();
                return;
            }
        }

        if (defender.volatiles.protected && move.target !== 'user') {
            await UI.typeText(`${defender.name} protected\nitself!`);

            // Allow Suicide Moves to Execute Side-Effects (Self-Faint) even if blocked
            if (['EXPLOSION', 'SELF DESTRUCT', 'SELF-DESTRUCT'].includes(move.name)) {
                attacker.currentHp = 0;
                UI.updateHUD(attacker, isPlayer ? 'player' : 'enemy');
                await BattleAnims.triggerExplosionAnim();
            }

            await restoreSub();
            return;
        }

        if (await checkInvulnHit() === false) {
            if (['EXPLOSION', 'SELF DESTRUCT', 'SELF-DESTRUCT'].includes(move.name)) {
                attacker.currentHp = 0;
                UI.updateHUD(attacker, isPlayer ? 'player' : 'enemy');
                await BattleAnims.triggerExplosionAnim();
            }
            await restoreSub();
            return;
        }

        let acc = move.accuracy;
        if (attacker.stages.acc) acc *= STAGE_MULT[attacker.stages.acc];
        if (defender.stages.eva) acc /= STAGE_MULT[defender.stages.eva];

        if (move.target !== 'user' && acc !== null && move.accuracy !== 0 && Math.random() * 100 > acc) {
            AudioEngine.playSfx('miss');
            await UI.typeText(`${attacker.name}'s attack\nmissed!`);

            if (attacker.rageLevel !== undefined) {
                attacker.volatiles.rageTriggered = true;
                attacker.volatiles.rageMiss = true;
            }
            if (move.name === 'SELF-DESTRUCT' || move.name === 'EXPLOSION') await MovesEngine.handleMoveSideEffects(battle, attacker, defender, move, isPlayer, false);

            await restoreSub();
            return;
        }

        await MovesEngine.executeDamagePhase(battle, attacker, defender, move, isPlayer);
        if (logic.type === 'recharge') attacker.volatiles.recharging = true;
        await restoreSub();
    },

    async processSwitch(battle, newMon, isFaintSwap = false) {
        document.getElementById('action-menu').classList.add('hidden');
        const eSprite = document.getElementById('enemy-sprite');
        if (battle.e.currentHp > 0) eSprite.style.opacity = 1;

        await wait(ANIM.SWITCH_STABILIZE);
        const sprite = document.getElementById('player-sprite');

        const isBP = battle.batonPassActive;
        battle.batonPassActive = false;

        if (battle.p.transformBackup && !isBP) {
            battle.revertTransform(battle.p);
        }

        if (!isFaintSwap) {
            let msg = `Come back,\n${battle.p.name}!`;
            if (isBP) msg = `${battle.p.name} passed\nthe baton!`;

            await UI.typeText(msg);

            AudioEngine.playSfx('swoosh');
            document.getElementById('player-hud').classList.remove('hud-active');

            AudioEngine.playSfx('ball');
            sprite.classList.add('anim-return');
            UI.spawnSmoke(60, 150);
            await wait(ANIM.SWITCH_RETURN_ANIM);
        } else {
            sprite.style.transition = 'none';
            sprite.style.opacity = 0;
            sprite.classList.remove('anim-faint');
            UI.forceReflow(sprite);
        }

        // 1. Prepare Hidden State for New Mon
        sprite.style.transition = 'none';
        sprite.style.opacity = 0;
        sprite.classList.remove('transformed-sprite');
        sprite.classList.remove('sub-back');
        sprite.src = newMon.backSprite;
        UI.forceReflow(sprite);
        sprite.style.transition = 'opacity 0.2s, transform 0.4s, filter 0.4s';

        if (isBP) {
            newMon.stages = { ...battle.p.stages };
            if (battle.p.volatiles.substituteHP > 0) {
                newMon.volatiles.substituteHP = battle.p.volatiles.substituteHP;
                newMon.volatiles.originalSprite = newMon.backSprite;
            }
            newMon.volatiles.focusEnergy = battle.p.volatiles.focusEnergy;
        } else {
            newMon.volatiles = {};
            newMon.stages = { atk: 0, def: 0, spa: 0, spd: 0, spe: 0, acc: 0, eva: 0 };
        }

        battle.p = newMon;
        battle.participants.add(Game.activeSlot);

        // 2. Text First
        await UI.typeText(`Go! ${newMon.name}!`);

        // 3. Pokeball Poof & Start Animation (Mirroring Battle.js logic exactly)
        AudioEngine.playSfx('ball');

        UI.resetSprite(sprite);
        sprite.style.opacity = 0;
        UI.forceReflow(sprite);

        sprite.classList.add('anim-enter');
        UI.spawnSmoke(60, 150);

        // Update HUD data silently
        UI.updateHUD(newMon, 'player');

        // Animation duration is 0.6s. Wait 300ms so it's partially grown/visible before cry.
        await wait(300);
        sprite.style.opacity = 1; // Permanently set to visible

        if (newMon.cry) AudioEngine.playCry(newMon.cry);

        await wait(1000); // Allow full animation and cry to finish
        sprite.classList.remove('anim-enter');

        // 4. HP Bar Slide In
        AudioEngine.playSfx('swoosh');
        document.getElementById('player-hud').classList.add('hud-active');
        await wait(400);

        await EnvironmentManager.processEntryHazards(battle, newMon, 'player');

        return 'CONTINUE';
    },

    async processDelayedMoves(battle) {
        if (battle.delayedMoves.length === 0) return;
        const activeMoves = [];

        for (const item of battle.delayedMoves) {
            item.turns--;
            if (item.turns > 0) {
                activeMoves.push(item);
            } else {
                await UI.typeText(`${item.user.name} foresaw\nan attack!`);
                await MovesEngine.executeDamagePhase(battle, item.user, item.target, item.moveData, item.isPlayer);
            }
        }
        battle.delayedMoves = activeMoves;
    }
};
