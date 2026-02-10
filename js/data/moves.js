// --- UNIQUE MOVE DATABASE ---
const MOVE_DEX = {
    // --- RNG GODS ---
    'METRONOME': {
        isUnique: true,
        onHit: async (battle, user, target) => {
            await battle.typeText("Waggling a finger...");
            let rndId = Math.floor(Math.random() * 700) + 1;
            const moveData = await API.getMove(rndId);

            if (!moveData || moveData.name === 'METRONOME' || moveData.name === 'STRUGGLE') {
                await battle.typeText("But it failed!");
                return false;
            }

            await battle.typeText(`${user.name} used\n${moveData.name}!`);

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

    // --- SUBSTITUTE MECHANIC ---
    'SUBSTITUTE': {
        isUnique: true,
        onHit: async (battle, user, target) => {
            if (user.volatiles.substituteHP > 0) {
                await battle.typeText("But it failed!");
                return false;
            }
            if (user.currentHp <= Math.floor(user.maxHp / 4)) {
                await battle.typeText("Not enough HP!");
                return false;
            }

            // 1. Pay Cost
            const cost = Math.floor(user.maxHp / 4);
            user.currentHp -= cost;
            user.volatiles.substituteHP = cost + 1;

            battle.updateHUD(user, user === battle.p ? 'player' : 'enemy');

            // 2. Save Original Sprite
            if (!user.volatiles.originalSprite) user.volatiles.originalSprite = user === battle.p ? user.backSprite : user.frontSprite;

            const isPlayer = (user === battle.p);
            const dollSrc = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/substitute.png";

            // 3. ANIMATION + TEXT SYNC
            // We run them together so the doll appears WHILE the text types
            const animPromise = battle.performVisualSwap(user, dollSrc, true, isPlayer);
            const textPromise = battle.typeText(`${user.name} made\na SUBSTITUTE!`);

            await Promise.all([animPromise, textPromise]);

            return true;
        }
    },


    // --- BATON PASS ---
    'BATON PASS': {
        isUnique: true,
        onHit: async (battle, user, target) => {
            // 1. AI Check
            if (user !== battle.p) {
                await battle.typeText("But it failed!");
                return false;
            }

            // 2. Valid Party Check
            const valid = Game.party.filter((p, i) => p.currentHp > 0 && i !== Game.activeSlot);
            if (valid.length === 0) {
                await battle.typeText("But there is no one\nto switch to!");
                return false;
            }

            await battle.typeText(`${user.name} wants to\nswitch out!`);

            // 3. PAUSE BATTLE - WAIT FOR SELECTION
            // This prevents the enemy from attacking while the menu is open
            const selectedIndex = await new Promise(resolve => {
                battle.userInputPromise = resolve;
                Game.openParty(true);
            });

            battle.userInputPromise = null; // Clean up listener

            // 4. RESUME - EXECUTE SWITCH
            const newMon = Game.party[selectedIndex];

            // Set flag so processSwitch knows to copy stats
            battle.batonPassActive = true;

            // Trigger the switch animation manually
            await battle.processSwitch(newMon, false);

            // Reset flag
            battle.batonPassActive = false;

            return true;
        }
    },

    // --- HEALING & RESTORATION ---
    'REST': {
        isUnique: true,
        onHit: async (battle, user, target) => {
            if (user.currentHp === user.maxHp) { await battle.typeText("It's already\nfully healthy!"); return false; }

            AudioEngine.playSfx('heal');

            // 1. Heal & Status Clear
            user.status = 'slp';
            user.volatiles = {}; // Clears confusion, bad poison, etc
            user.volatiles.sleepTurns = 2; // Gen 2 style: 2 turns guaranteed sleep
            user.currentHp = user.maxHp;

            battle.updateHUD(user, user === battle.p ? 'player' : 'enemy');

            // 2. Animation
            const sprite = user === battle.p ? document.getElementById('player-sprite') : document.getElementById('enemy-sprite');
            sprite.classList.add('status-anim-slp');
            await wait(600);
            sprite.classList.remove('status-anim-slp');

            await battle.typeText(`${user.name} slept and\nbecame healthy!`);
            return true;
        }
    },
    'RECOVER': { isUnique: true, onHit: async (b, u, t) => _heal(b, u, 0.5) },
    'SOFT BOILED': { isUnique: true, onHit: async (b, u, t) => _heal(b, u, 0.5) },
    'MILK DRINK': { isUnique: true, onHit: async (b, u, t) => _heal(b, u, 0.5) },
    'SLACK OFF': { isUnique: true, onHit: async (b, u, t) => _heal(b, u, 0.5) },
    'ROOST': { isUnique: true, onHit: async (b, u, t) => _heal(b, u, 0.5) },
    'SYNTHESIS': { isUnique: true, onHit: async (b, u, t) => _weatherHeal(b, u) },
    'MORNING SUN': { isUnique: true, onHit: async (b, u, t) => _weatherHeal(b, u) },
    'MOONLIGHT': { isUnique: true, onHit: async (b, u, t) => _weatherHeal(b, u) },

    // --- DELAYED ATTACKS ---
    'FUTURE SIGHT': {
        isUnique: true,
        onHit: async (battle, user, target) => {
            const exists = battle.delayedMoves.find(m => m.moveData.name === 'FUTURE SIGHT' && m.target === target);
            if (exists) { await battle.typeText("But it failed!"); return false; }

            await battle.typeText(`${user.name} foresaw\nan attack!`);
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
            if (exists) { await battle.typeText("But it failed!"); return false; }
            await battle.typeText(`${user.name} chose\nDoom Desire!`);
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
            return await _forceSwitchOrRun(battle, user, target);
        }
    },
    'WHIRLWIND': {
        isUnique: true,
        onHit: async (battle, user, target) => {
            return await _forceSwitchOrRun(battle, user, target);
        }
    },

    'TRANSFORM': {
        isUnique: true,
        onHit: async (battle, user, target) => {
            if (user.transformBackup) return false; // Already transformed

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

            const sprite = user === battle.p ? document.getElementById('player-sprite') : document.getElementById('enemy-sprite');

            // Animation
            AudioEngine.playSfx('swoosh');
            sprite.style.transition = 'filter 0.2s';
            sprite.style.filter = "brightness(10)";
            await wait(300);
            sprite.src = user === battle.p ? user.backSprite : user.frontSprite;
            sprite.classList.add('transformed-sprite');
            sprite.style.filter = "";

            await battle.typeText(`${user.transformBackup.name} transformed\ninto ${target.name}!`);
            return true;
        }
    },
    'HAZE': {
        isUnique: true,
        onHit: async (battle, user, target) => {
            user.stages = { atk: 0, def: 0, spa: 0, spd: 0, spe: 0, acc: 0, eva: 0 };
            target.stages = { atk: 0, def: 0, spa: 0, spd: 0, spe: 0, acc: 0, eva: 0 };
            AudioEngine.playSfx('swoosh');
            await battle.typeText("All stat changes\nwere eliminated!");
            return true;
        }
    },
    'BELLY DRUM': {
        isUnique: true,
        onHit: async (battle, user, target) => {
            if (user.currentHp <= user.maxHp / 2 || user.stages.atk >= 6) { await battle.typeText("But it failed!"); return false; }
            user.currentHp = Math.floor(user.currentHp - (user.maxHp / 2));
            user.stages.atk = 6;
            battle.updateHUD(user, user === battle.p ? 'player' : 'enemy');
            await battle.typeText(`${user.name} cut its HP\nto max ATTACK!`);
            return true;
        }
    },
    'CURSE': {
        isUnique: true,
        onHit: async (battle, user, target) => {
            if (user.types.includes('ghost')) {
                user.currentHp = Math.floor(user.currentHp / 2);
                battle.updateHUD(user, user === battle.p ? 'player' : 'enemy');
                await battle.typeText(`${user.name} cut its HP\nto lay a curse!`);

                // Direct Damage Simulation (Since we don't have Curse volatile logic yet)
                const dmg = Math.floor(target.maxHp / 4);
                target.currentHp -= dmg;
                battle.updateHUD(target, user === battle.p ? 'enemy' : 'player');
                await battle.typeText(`${target.name} was hurt\nby the curse!`);
            } else {
                await battle.applyStatChanges(user, [{ stat: { name: 'speed' }, change: -1 }, { stat: { name: 'attack' }, change: 1 }, { stat: { name: 'defense' }, change: 1 }], user === battle.p);
            }
            return true;
        }
    },
    'PAIN SPLIT': {
        isUnique: true,
        onHit: async (battle, user, target) => {
            const avg = Math.floor((user.currentHp + target.currentHp) / 2);
            user.currentHp = Math.min(user.maxHp, avg);
            target.currentHp = Math.min(target.maxHp, avg);
            battle.updateHUD(user, 'player');
            battle.updateHUD(target, 'enemy');
            battle.updateHUD(user, 'enemy'); // Redundant safety update
            battle.updateHUD(target, 'player');
            await battle.typeText("The battlers shared\ntheir pain!");
            return true;
        }
    },

    // --- CONDITIONAL ---
    'DREAM EATER': { condition: (t) => t.status === 'slp' },
    'NIGHTMARE': { condition: (t) => t.status === 'slp' },
    'SNORE': { condition: (t) => true }, // Placeholder for sleep check
};

// Logic for Two-Turn and Special Moves
const MOVE_LOGIC = {
    'fly': { type: 'charge', msg: "flew up high!", invuln: 'flying', hide: true },
    'dig': { type: 'charge', msg: "burrowed underground!", invuln: 'digging', hide: true },
    'dive': { type: 'charge', msg: "hid underwater!", invuln: 'diving', hide: true },
    'solar-beam': { type: 'charge', msg: "took in sunlight!", invuln: null, hide: false, weatherSkip: 'sun' },
    'skull-bash': { type: 'charge', msg: "lowered its head!", invuln: null, hide: false, buff: { stat: 'def', val: 1 } },
    'hyper-beam': { type: 'recharge' },
    'giga-impact': { type: 'recharge' },
    'protect': { type: 'protect' },
    'detect': { type: 'protect' }
};

// --- HELPERS for DEX ---
async function _heal(battle, user, pct) {
    if (user.currentHp === user.maxHp) { await battle.typeText("It's already\nfully healthy!"); return false; }

    const amt = Math.floor(user.maxHp * pct);
    // Use Helper (automatically handles HUD, Sound, and "Regained health" text)
    await battle.applyHeal(user, amt);

    return true;
}

async function _weatherHeal(battle, user) {
    let pct = 0.5;
    if (battle.weather.type === 'sun') pct = 0.66;
    else if (battle.weather.type !== 'none') pct = 0.25;
    return _heal(battle, user, pct);
}
