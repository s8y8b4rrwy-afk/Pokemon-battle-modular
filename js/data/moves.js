/// <reference path="../types.d.ts" />

/** 
 * @type {Object.<string, MoveEntry>} 
 */
const MOVE_DEX = {
    // --- RNG GODS ---
    'METRONOME': {
        isUnique: true,
        /** @param {Battle} battle @param {Pokemon} user @param {Pokemon} target */
        onHit: async (battle, user, target) => {
            const ctx = { attacker: user, defender: target, isPlayerAttacker: user === battle.p };
            await BattleAnims.playRegistered('metronome', ctx);
            await UI.typeText("Waggling a finger...");
            let rndId = Math.floor(Math.random() * 700) + 1;
            const moveData = await API.getMove(rndId);

            if (!moveData || moveData.name === 'METRONOME' || moveData.name === 'STRUGGLE') {
                await UI.typeText("But it failed!");
                return 'FAIL';
            }

            await UI.typeText(`${user.name} used\n${moveData.name}!`);

            // --- FIX: APPLY LOGIC FLAGS (Recharge, etc) ---
            // This ensures Hyper Beam via Metronome still triggers recharge.
            const subLogic = MOVE_LOGIC[moveData.id];
            if (subLogic && subLogic.type === 'recharge') {
                user.volatiles.recharging = true;
            }

            await battle.executeDamagePhase(user, target, moveData, user === battle.p);
            return true;
        }
    },

    // --- SWITCH OUT MOVES ---
    'U TURN': {
        isUnique: true,
        onHit: async (battle, user, target, weatherMod) => {
            // 1. Damage Phase
            const moveData = { name: 'U TURN', type: 'bug', power: 70, category: 'physical' };
            await battle.handleDamageSequence(user, target, moveData, user === battle.p, weatherMod);

            // 2. Switch Out
            if (user.currentHp > 0) {
                await _manualSwitch(battle, user);
            }
            return true;
        }
    },
    'VOLT SWITCH': {
        isUnique: true,
        onHit: async (battle, user, target, weatherMod) => {
            const moveData = { name: 'VOLT SWITCH', type: 'electric', power: 70, category: 'special' };
            await battle.handleDamageSequence(user, target, moveData, user === battle.p, weatherMod);
            if (user.currentHp > 0) {
                await _manualSwitch(battle, user);
            }
            return true;
        }
    },
    'FLIP TURN': {
        isUnique: true,
        onHit: async (battle, user, target, weatherMod) => {
            const moveData = { name: 'FLIP TURN', type: 'water', power: 60, category: 'physical' };
            await battle.handleDamageSequence(user, target, moveData, user === battle.p, weatherMod);
            if (user.currentHp > 0) {
                await _manualSwitch(battle, user);
            }
            return true;
        }
    },

    // --- COUNTER MOVES ---
    'COUNTER': {
        isUnique: true,
        onHit: async (battle, user, target) => {
            const dmg = user.volatiles.turnDamage || 0;
            const cat = user.volatiles.turnDamageCategory;
            if (dmg > 0 && cat === 'physical') {
                await battle.applyDamage(target, dmg * 2, 'fighting', 'COUNTER');
                return true;
            }
            await UI.typeText("But it failed!");
            return 'FAIL';
        }
    },
    'MIRROR COAT': {
        isUnique: true,
        onHit: async (battle, user, target) => {
            const dmg = user.volatiles.turnDamage || 0;
            const cat = user.volatiles.turnDamageCategory;
            if (dmg > 0 && cat === 'special') {
                await battle.applyDamage(target, dmg * 2, 'psychic', 'MIRROR COAT');
                return true;
            }
            await UI.typeText("But it failed!");
            return 'FAIL';
        }
    },

    // --- PERISH SONG ---
    'PERISH SONG': {
        isUnique: true,
        onHit: async (battle, user, target) => {
            const ctx = { attacker: user, defender: target, isPlayerAttacker: user === battle.p };
            await BattleAnims.playRegistered('perish-song', ctx);
            await UI.typeText("All Pokemon hearing\nthe song will faint!");
            [battle.p, battle.e].forEach(m => {
                if (m.volatiles.perishCount === undefined) {
                    m.volatiles.perishCount = 3;
                }
            });
            return true;
        }
    },

    // --- DESTINY BOND ---
    'DESTINY BOND': {
        isUnique: true,
        onHit: async (battle, user, target) => {
            await UI.typeText(`${user.name} is trying\nto take its foe with it!`);
            user.volatiles.destinyBond = true;
            return true;
        }
    },

    // --- DISABLE ---
    'DISABLE': {
        isUnique: true,
        onHit: async (battle, user, target) => {
            const ctx = { attacker: user, defender: target, isPlayerAttacker: user === battle.p };
            await BattleAnims.playRegistered('disable', ctx);
            // Check if target has used a move
            if (!target.lastMoveUsed || !target.lastMoveUsed.name) {
                await UI.typeText("But it failed!");
                return 'FAIL';
            }

            // Check if already disabled
            if (target.volatiles.disabled) {
                await UI.typeText("But it failed!");
                return 'FAIL';
            }

            // Apply disable
            target.volatiles.disabled = {
                moveName: target.lastMoveUsed.name,
                turns: Math.floor(Math.random() * 4) + 4 // 4-7 turns
            };

            await UI.typeText(`${target.name}'s ${target.lastMoveUsed.name}\nwas disabled!`);
            return true;
        }
    },

    // --- HAZARDS ---
    'SPIKES': {
        isUnique: true,
        onHit: async (battle, user, target) => {
            const ctx = { attacker: user, defender: target, isPlayerAttacker: user === battle.p };
            await BattleAnims.playRegistered('spikes', ctx);
            const side = user === battle.p ? 'enemy' : 'player';
            const current = battle.sideConditions[side].spikes || 0;
            if (current >= 3) {
                await UI.typeText("Spikes can't be\nadded anymore!");
                return false;
            }
            battle.sideConditions[side].spikes = current + 1;
            AudioEngine.playSfx('clank');
            await UI.typeText(`Spikes were scattered\naround ${side === 'enemy' ? 'the foe' : 'the player'}'s feet!`);
            return true;
        }
    },

    // --- SUICIDE MOVES ---
    'EXPLOSION': {
        isUnique: true,
        onHit: async (battle, user, target, weatherMod) => {
            const isPlayer = (user === battle.p);
            // 1. User HP drains to 0 first (The "Sacrifice")
            user.currentHp = 0;
            UI.updateHUD(user, isPlayer ? 'player' : 'enemy');

            // 2. Play New Explosion Anim
            await BattleAnims.triggerExplosionAnim();

            // 2. Damage Phase (handleDamageSequence now allows hits from 0hp attackers on hit 1)
            const moveData = { name: 'EXPLOSION', type: 'normal', power: 250, category: 'physical', skipAnim: true };
            await battle.handleDamageSequence(user, target, moveData, isPlayer, weatherMod);

            // Note: FaintManager will handle the actual 'fainted!' message and animation after this move ends
            return true;
        }
    },
    'SELF DESTRUCT': {
        isUnique: true,
        onHit: async (battle, user, target, weatherMod) => {
            const isPlayer = (user === battle.p);
            // 1. User HP drains to 0 first
            user.currentHp = 0;
            UI.updateHUD(user, isPlayer ? 'player' : 'enemy');

            // 2. Play New Explosion Anim
            await BattleAnims.triggerExplosionAnim();

            // 2. Damage Phase
            const moveData = { name: 'SELF DESTRUCT', type: 'normal', power: 200, category: 'physical', skipAnim: true };
            await battle.handleDamageSequence(user, target, moveData, isPlayer, weatherMod);

            return true;
        }
    },

    // --- SUBSTITUTE MECHANIC ---
    'SUBSTITUTE': {
        isUnique: true,
        onHit: async (battle, user, target) => {
            if (user.volatiles.substituteHP > 0) {
                await UI.typeText("But it failed!");
                return 'FAIL';
            }
            if (user.currentHp <= Math.floor(user.maxHp / 4)) {
                await UI.typeText("Not enough HP!");
                return 'FAIL';
            }

            // 1. Pay Cost
            const cost = Math.floor(user.maxHp / 4);
            user.currentHp -= cost;
            user.volatiles.substituteHP = cost + 1;

            UI.updateHUD(user, user === battle.p ? 'player' : 'enemy');

            // 2. Save Original Sprite
            if (!user.volatiles.originalSprite) user.volatiles.originalSprite = user === battle.p ? user.backSprite : user.frontSprite;

            const isPlayer = (user === battle.p);
            const dollSrc = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/substitute.png";

            // 3. ANIMATION + TEXT SYNC
            // We run them together so the doll appears WHILE the text types
            const animPromise = battle.performVisualSwap(user, dollSrc, true, isPlayer);
            const textPromise = UI.typeText(`${user.name} made\na SUBSTITUTE!`);

            await Promise.all([animPromise, textPromise]);

            return true;
        }
    },


    // --- BATON PASS ---
    'BATON PASS': {
        isUnique: true,
        onHit: async (battle, user, target) => {
            battle.batonPassActive = true;
            const success = await _manualSwitch(battle, user);
            // Redundant: _manualSwitch calls processSwitch which resets it, but good for safety
            if (!success) battle.batonPassActive = false;
            return success;
        }
    },

    // --- HEALING & RESTORATION ---
    'REST': {
        isUnique: true,
        onHit: async (battle, user, target) => {
            if (user.currentHp === user.maxHp) { await UI.typeText("It's already\nfully healthy!"); return 'FAIL'; }

            AudioEngine.playSfx('heal');

            // 1. Heal & Status Clear
            user.status = 'slp';
            user.volatiles = {}; // Clears confusion, bad poison, etc
            user.volatiles.sleepTurns = 2; // Gen 2 style: 2 turns guaranteed sleep
            user.currentHp = user.maxHp;

            UI.updateHUD(user, user === battle.p ? 'player' : 'enemy');

            // 2. Animation
            const sprite = user === battle.p ? document.getElementById('player-sprite') : document.getElementById('enemy-sprite');
            sprite.classList.add('status-anim-slp');
            await wait(600);
            sprite.classList.remove('status-anim-slp');

            await UI.typeText(`${user.name} slept and\nbecame healthy!`);
            return true;
        }
    },
    'RECOVER': { isUnique: true, onHit: async (b, u, t) => _heal(b, u, 0.5, 'recover') },
    'SOFT BOILED': { isUnique: true, onHit: async (b, u, t) => _heal(b, u, 0.5, 'soft-boiled') },
    'MILK DRINK': { isUnique: true, onHit: async (b, u, t) => _heal(b, u, 0.5, 'soft-boiled') },
    'SLACK OFF': { isUnique: true, onHit: async (b, u, t) => _heal(b, u, 0.5, 'recover') },
    'ROOST': { isUnique: true, onHit: async (b, u, t) => _heal(b, u, 0.5, 'recover') },
    'SYNTHESIS': { isUnique: true, onHit: async (b, u, t) => _weatherHeal(b, u, 'synthesis') },
    'MORNING SUN': { isUnique: true, onHit: async (b, u, t) => _weatherHeal(b, u, 'synthesis') },
    'MOONLIGHT': { isUnique: true, onHit: async (b, u, t) => _weatherHeal(b, u, 'moonlight') },

    // --- DELAYED ATTACKS ---
    'FUTURE SIGHT': {
        isUnique: true,
        onHit: async (battle, user, target) => {
            const exists = battle.delayedMoves.find(m => m.moveData.name === 'FUTURE SIGHT' && m.target === target);
            if (exists) { await UI.typeText("But it failed!"); return 'FAIL'; }

            await UI.typeText(`${user.name} foresaw\nan attack!`);
            battle.delayedMoves.push({
                turns: 2, user: user, target: target, isPlayer: (user === battle.p),
                moveData: { name: 'FUTURE SIGHT', type: 'psychic', power: 120, category: 'special' }
            });
            return true;
        }
    },
    'DOOM DESIRE': {
        isUnique: true,
        onHit: async (battle, user, target) => {
            const exists = battle.delayedMoves.find(m => m.moveData.name === 'DOOM DESIRE' && m.target === target);
            if (exists) { await UI.typeText("But it failed!"); return 'FAIL'; }
            await UI.typeText(`${user.name} chose\nDoom Desire!`);
            battle.delayedMoves.push({
                turns: 2, user: user, target: target, isPlayer: (user === battle.p),
                moveData: { name: 'DOOM DESIRE', type: 'steel', power: 140, category: 'special' }
            });
            return true;
        }
    },

    // --- FIXED / UNIQUE DAMAGE ---
    'DRAGON RAGE': { fixedDamage: 40 },
    'SONIC BOOM': { fixedDamage: 20 },
    'SEISMIC TOSS': { damageCallback: (u, t) => u.level },
    'NIGHT SHADE': { damageCallback: (u, t) => u.level },
    'PSYWAVE': { damageCallback: (u, t) => Math.floor(u.level * (0.5 + Math.random())) },
    'SUPER FANG': { damageCallback: (u, t) => Math.max(1, Math.floor(t.currentHp / 2)) },
    'ENDEAVOR': { damageCallback: (u, t) => Math.max(0, t.currentHp - u.currentHp) },

    // --- OHKO ---
    'FISSURE': { ohko: true },
    'GUILLOTINE': { ohko: true },
    'HORN DRILL': { ohko: true },
    'SHEER COLD': { ohko: true },

    'ROAR': {
        isUnique: true,
        onHit: async (battle, user, target) => {
            if (target.isBoss) { await UI.typeText("But it failed!"); return 'FAIL'; }
            await battle.triggerHitAnim(target, 'normal', 'ROAR', user);
            return await MovesEngine.forceSwitchOrRun(battle, user, target);
        }
    },
    'WHIRLWIND': {
        isUnique: true,
        onHit: async (battle, user, target) => {
            if (target.isBoss) { await UI.typeText("But it failed!"); return 'FAIL'; }
            await battle.triggerHitAnim(target, 'normal', 'WHIRLWIND', user);
            return await MovesEngine.forceSwitchOrRun(battle, user, target);
        }
    },

    'TRANSFORM': {
        isUnique: true,
        onHit: async (battle, user, target) => {
            if (user.transformBackup) {
                await UI.typeText("But it failed!");
                return false;
            }

            const ctx = { attacker: user, defender: target, isPlayerAttacker: user === battle.p };
            await BattleAnims.playRegistered('transform', ctx);

            // Create Backup
            user.transformBackup = {
                name: user.name, moves: [...user.moves], stats: { ...user.stats },
                types: [...user.types], stages: { ...user.stages },
                frontSprite: user.frontSprite, backSprite: user.backSprite
            };

            // Copy Data (Keep own HP)
            user.moves = target.moves.map(m => ({ ...m, max_pp: 5, pp: 5 }));
            user.stats = { ...target.stats, hp: user.stats.hp };
            user.types = [...target.types];
            user.stages = { ...target.stages };
            user.frontSprite = target.frontSprite;
            user.backSprite = target.backSprite;

            const isPlayer = (user === battle.p);
            const sprite = isPlayer ? document.getElementById('player-sprite') : document.getElementById('enemy-sprite');

            sprite.src = isPlayer ? user.backSprite : user.frontSprite;
            sprite.classList.add('transformed-sprite');

            await UI.typeText(`${user.transformBackup.name} transformed\ninto ${target.name}!`);
            return true;
        }
    },
    'HAZE': {
        isUnique: true,
        onHit: async (battle, user, target) => {
            const ctx = { attacker: user, defender: target, isPlayerAttacker: user === battle.p };
            await BattleAnims.playRegistered('haze', ctx);
            user.stages = { atk: 0, def: 0, spa: 0, spd: 0, spe: 0, acc: 0, eva: 0 };
            target.stages = { atk: 0, def: 0, spa: 0, spd: 0, spe: 0, acc: 0, eva: 0 };
            await UI.typeText("All stat changes\nwere eliminated!");
            return true;
        }
    },
    'TOXIC': {
        isUnique: true,
        onHit: async (battle, user, target) => {
            const mod = Mechanics.getTypeEffectiveness('poison', target.types);
            if (mod === 0) { await UI.typeText(`It doesn't affect\n${target.name}...`); return 'IMMUNE'; }
            if (target.status) { await UI.typeText("But it failed!"); return 'FAIL'; }

            const ctx = { attacker: user, defender: target, isPlayerAttacker: user === battle.p };
            await BattleAnims.playRegistered('toxic', ctx);
            const success = await battle.applyStatus(target, 'tox', target === battle.p);
            return success;
        }
    },
    'YAWN': {
        isUnique: true,
        onHit: async (battle, user, target) => {
            if (target.status || target.volatiles.drowsy) {
                await UI.typeText("But it failed!");
                return 'FAIL';
            }
            const ctx = { attacker: user, defender: target, isPlayerAttacker: user === battle.p };
            await BattleAnims.playRegistered('yawn', ctx);
            target.volatiles.drowsy = 2;
            await UI.typeText(`${user.name} made\n${target.name} drowsy!`);
            return true;
        }
    },
    'SNORE': {
        isUnique: true,
        onHit: async (battle, user, target, weatherMod) => {
            if (user.status !== 'slp') { await UI.typeText("But it failed!"); return 'FAIL'; }
            const moveData = { name: 'SNORE', type: 'normal', power: 50, category: 'special' };
            await battle.handleDamageSequence(user, target, moveData, user === battle.p, weatherMod);
            return true;
        }
    },
    'SLEEP TALK': {
        isUnique: true,
        onHit: async (battle, user, target) => {
            if (user.status !== 'slp') { await UI.typeText("But it failed!"); return 'FAIL'; }
            const validMoves = user.moves.filter(m => m.name !== 'SLEEP TALK' && m.name !== 'REST' && m.name !== 'CHATOT'); // Chatot is a placeholder for noise moves if needed
            if (validMoves.length === 0) { await UI.typeText("But it failed!"); return 'FAIL'; }
            const move = validMoves[Math.floor(Math.random() * validMoves.length)];
            await UI.typeText(`${user.name} used\n${move.name}!`);
            await battle.executeDamagePhase(user, target, move, user === battle.p);
            return true;
        }
    },
    'ENCORE': {
        isUnique: true,
        onHit: async (battle, user, target) => {
            if (!target.lastMoveUsed || target.volatiles.encored) {
                await UI.typeText("But it failed!");
                return 'FAIL';
            }
            const ctx = { attacker: user, defender: target, isPlayerAttacker: user === battle.p };
            await BattleAnims.playRegistered('encore', ctx);
            target.volatiles.encored = {
                move: target.lastMoveUsed,
                turns: Math.floor(Math.random() * 3) + 3
            };
            await UI.typeText(`${target.name} received\nan ENCORE!`);
            return true;
        }
    },
    'BELLY DRUM': {
        isUnique: true,
        onHit: async (battle, user, target) => {
            if (user.currentHp <= user.maxHp / 2 || user.stages.atk >= 6) { await UI.typeText("But it failed!"); return 'FAIL'; }
            const ctx = { attacker: user, defender: target, isPlayerAttacker: user === battle.p };
            await BattleAnims.playRegistered('belly-drum', ctx);
            user.currentHp = Math.floor(user.currentHp - (user.maxHp / 2));
            user.stages.atk = 6;
            UI.updateHUD(user, user === battle.p ? 'player' : 'enemy');
            await UI.typeText(`${user.name} cut its HP\nto max ATTACK!`);
            return true;
        }
    },
    'CURSE': {
        isUnique: true,
        onHit: async (battle, user, target) => {
            if (user.types.includes('ghost')) {
                if (user.currentHp <= Math.floor(user.maxHp / 2)) {
                    await UI.typeText("But it failed!");
                    return 'FAIL';
                }

                const ctx = { attacker: user, defender: target, isPlayerAttacker: user === battle.p };
                await BattleAnims.playRegistered('curse', ctx);

                user.currentHp = Math.floor(user.currentHp - (user.maxHp / 2));
                UI.updateHUD(user, user === battle.p ? 'player' : 'enemy');
                await UI.typeText(`${user.name} cut its HP\nto lay a curse!`);

                target.volatiles.cursed = true;
                await UI.typeText(`${target.name} was\ncursed!`);
            } else {
                const ctx = { attacker: user, defender: target, isPlayerAttacker: user === battle.p };
                await BattleAnims.playRegistered('curse', ctx);

                await battle.applyStatChanges(user, [{ stat: { name: 'speed' }, change: -1 }, { stat: { name: 'attack' }, change: 1 }, { stat: { name: 'defense' }, change: 1 }], user === battle.p);
            }
            return true;
        }
    },
    'PAIN SPLIT': {
        isUnique: true,
        onHit: async (battle, user, target) => {
            if (user.currentHp === user.maxHp && target.currentHp === target.maxHp) {
                await UI.typeText("But it failed!");
                return 'FAIL';
            }

            const ctx = { attacker: user, defender: target, isPlayerAttacker: user === battle.p };
            await BattleAnims.playRegistered('pain-split', ctx);
            const avg = Math.floor((user.currentHp + target.currentHp) / 2);
            user.currentHp = Math.min(user.maxHp, avg);
            target.currentHp = Math.min(target.maxHp, avg);
            UI.updateHUD(user, 'player');
            UI.updateHUD(target, 'enemy');
            UI.updateHUD(user, 'enemy'); // Redundant safety update
            UI.updateHUD(target, 'player');
            await UI.typeText("The battlers shared\ntheir pain!");
            return true;
        }
    },

    // --- TRAPPING MOVES ---
    'BIND': {
        isUnique: true,
        onHit: async (battle, user, target, weatherMod) => {
            // 1. Deal initial damage
            const moveData = { name: 'BIND', type: 'normal', power: 15, category: 'physical' };
            const result = await battle.handleDamageSequence(user, target, moveData, user === battle.p, weatherMod);

            if (result.success && target.currentHp > 0) {
                // 2. Apply trap
                target.volatiles.trapped = {
                    turns: Math.floor(Math.random() * 4) + 2, // 2-5 turns
                    source: user.name,
                    moveName: 'BIND'
                };
                await UI.typeText(`${target.name} was squeezed\nby ${user.name}!`);
            }
            return result.success;
        }
    },
    'WRAP': {
        isUnique: true,
        onHit: async (battle, user, target, weatherMod) => {
            const moveData = { name: 'WRAP', type: 'normal', power: 15, category: 'physical' };
            const result = await battle.handleDamageSequence(user, target, moveData, user === battle.p, weatherMod);

            if (result.success && target.currentHp > 0) {
                target.volatiles.trapped = {
                    turns: Math.floor(Math.random() * 4) + 2,
                    source: user.name,
                    moveName: 'WRAP'
                };
                await UI.typeText(`${target.name} was wrapped\nby ${user.name}!`);
            }
            return result.success;
        }
    },
    'FIRE SPIN': {
        isUnique: true,
        onHit: async (battle, user, target, weatherMod) => {
            const moveData = { name: 'FIRE SPIN', type: 'fire', power: 35, category: 'special' };
            const result = await battle.handleDamageSequence(user, target, moveData, user === battle.p, weatherMod);

            if (result.success && target.currentHp > 0) {
                target.volatiles.trapped = {
                    turns: Math.floor(Math.random() * 4) + 2,
                    source: user.name,
                    moveName: 'FIRE SPIN'
                };
                await UI.typeText(`${target.name} was trapped\nin the fiery vortex!`);
            }
            return result.success;
        }
    },
    'WHIRLPOOL': {
        isUnique: true,
        onHit: async (battle, user, target, weatherMod) => {
            const moveData = { name: 'WHIRLPOOL', type: 'water', power: 35, category: 'special' };
            const result = await battle.handleDamageSequence(user, target, moveData, user === battle.p, weatherMod);

            if (result.success && target.currentHp > 0) {
                target.volatiles.trapped = {
                    turns: Math.floor(Math.random() * 4) + 2,
                    source: user.name,
                    moveName: 'WHIRLPOOL'
                };
                await UI.typeText(`${target.name} was trapped\nin the vortex!`);
            }
            return result.success;
        }
    },
    'CLAMP': {
        isUnique: true,
        onHit: async (battle, user, target, weatherMod) => {
            const moveData = { name: 'CLAMP', type: 'water', power: 35, category: 'physical' };
            const result = await battle.handleDamageSequence(user, target, moveData, user === battle.p, weatherMod);

            if (result.success && target.currentHp > 0) {
                target.volatiles.trapped = {
                    turns: Math.floor(Math.random() * 4) + 2,
                    source: user.name,
                    moveName: 'CLAMP'
                };
                await UI.typeText(`${user.name} clamped\n${target.name}!`);
            }
            return result.success;
        }
    },

    // --- LEECH SEED ---
    'LEECH SEED': {
        isUnique: true,
        onHit: async (battle, user, target) => {
            // Grass types are immune
            if (target.types.includes('grass')) {
                await UI.typeText("It doesn't affect\n" + target.name + "...");
                return 'IMMUNE';
            }

            // Already seeded
            if (target.volatiles.seeded) {
                await UI.typeText(`${target.name} is already\nseeded!`);
                return 'FAIL';
            }

            const ctx = { attacker: user, defender: target, isPlayerAttacker: user === battle.p };
            await BattleAnims.playRegistered('leech-seed', ctx);

            target.volatiles.seeded = {
                source: user === battle.p ? 'player' : 'enemy'
            };

            AudioEngine.playSfx('poison');
            await UI.typeText(`${target.name} was seeded!`);
            return true;
        }
    },

    // --- CONDITIONAL ---
    'DREAM EATER': { condition: (t) => t.status === 'slp' },
    'NIGHTMARE': { condition: (t) => t.status === 'slp' },

    // --- WEATHER MOVES ---
    'RAIN DANCE': {
        isUnique: true,
        onHit: async (battle, user, target) => {
            const ctx = { attacker: user, defender: target, isPlayerAttacker: user === battle.p };
            await BattleAnims.playRegistered('rain-dance', ctx);
            await battle.setWeather('rain');
            return true;
        }
    },
    'SUNNY DAY': {
        isUnique: true,
        onHit: async (battle, user, target) => {
            const ctx = { attacker: user, defender: target, isPlayerAttacker: user === battle.p };
            await BattleAnims.playRegistered('sunny-day', ctx);
            await battle.setWeather('sun');
            return true;
        }
    },
    'SANDSTORM': {
        isUnique: true,
        onHit: async (battle, user, target) => {
            const ctx = { attacker: user, defender: target, isPlayerAttacker: user === battle.p };
            await BattleAnims.playRegistered('sandstorm', ctx);
            await battle.setWeather('sand');
            return true;
        }
    },
    'HAIL': {
        isUnique: true,
        onHit: async (battle, user, target) => {
            const ctx = { attacker: user, defender: target, isPlayerAttacker: user === battle.p };
            await BattleAnims.playRegistered('hail', ctx);
            await battle.setWeather('hail');
            return true;
        }
    },
};

// Logic for Two-Turn and Special Moves
const MOVE_LOGIC = {
    'fly': { type: 'charge', msg: "flew up high!", invuln: 'flying', hide: true, sound: 'swoosh' },
    'dig': { type: 'charge', msg: "burrowed underground!", invuln: 'digging', hide: true, sound: 'rumble' },
    'dive': { type: 'charge', msg: "hid underwater!", invuln: 'diving', hide: true, sound: 'swoosh' },
    'bounce': { type: 'charge', msg: "sprang up!", invuln: 'bouncing', hide: true, sound: 'swoosh' },
    'phantom-force': { type: 'charge', msg: "vanished instantly!", invuln: 'shadow', hide: true, sound: 'swoosh' },
    'solar-beam': { type: 'charge', msg: "took in sunlight!", invuln: null, hide: false, weatherSkip: 'sun' },
    'skull-bash': { type: 'charge', msg: "lowered its head!", invuln: null, hide: false, buff: { stat: 'def', val: 1 } },
    'hyper-beam': { type: 'recharge' },
    'giga-impact': { type: 'recharge' },
    'outrage': { type: 'lock-in' },
    'thrash': { type: 'lock-in' },
    'petal-dance': { type: 'lock-in' },
    'protect': { type: 'protect' },
    'detect': { type: 'protect' },
    'endure': { type: 'protect' }
};

// --- HELPERS for DEX ---
async function _heal(battle, user, pct, animName = 'fx-heal') {
    if (user.currentHp === user.maxHp) { await UI.typeText("It's already\nfully healthy!"); return false; }

    const amt = Math.floor(user.maxHp * pct);
    // Use Helper (automatically handles HUD, Sound, and "Regained health" text)
    await battle.applyHeal(user, amt, null, animName);

    return true;
}

async function _weatherHeal(battle, user, animName = 'fx-heal') {
    let pct = 0.5;
    if (battle.weather.type === 'sun') pct = 0.66;
    else if (battle.weather.type !== 'none') pct = 0.25;
    return _heal(battle, user, pct, animName);
}

// --- NEW HELPERS ---
async function _manualSwitch(battle, user) {
    // 1. AI Check
    if (user !== battle.p) {
        // AI doesn't switch out via moves yet in this simple engine
        return false;
    }

    // 2. Valid Party Check
    const valid = Game.party.filter((p, i) => p.currentHp > 0 && i !== Game.activeSlot);
    if (valid.length === 0) {
        await UI.typeText("But there is no one\nto switch to!");
        return false;
    }

    await UI.typeText(`${user.name} wants to\nswitch out!`);

    // 3. PAUSE BATTLE - WAIT FOR SELECTION
    const selectedIndex = await new Promise(resolve => {
        battle.userInputPromise = resolve;
        Game.openParty(true);
    });

    battle.userInputPromise = null;

    // 4. RESUME - EXECUTE SWITCH
    const newMon = Game.party[selectedIndex];
    await battle.processSwitch(newMon, false);
    return true;
}
