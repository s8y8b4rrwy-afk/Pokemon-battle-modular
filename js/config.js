// --- DEBUG SETTINGS ------------------------
// Change ENABLED to true to activate these overrides.
const DEBUG = {
    ENABLED: true,

    // Customize your starting items (Quantity)
    INVENTORY: {
        masterball: 50,
        maxpotion: 10,
        potion: 10,
        superpotion: 10,
        ultraball: 40,
        pokeball: 20
    },

    // Force specific Enemy attributes
    ENEMY: {
        ID: null,       // Pokedex Number (e.g. 150 = Mewtwo). Set null for random.
        LEVEL: null,    // Level (1-100). Set null for auto-scaling.
        SHINY: null,    // true = Always Shiny, false = Never Shiny, null = Random.
        IS_BOSS: null,  // true = Boss stats & music.
        RAGE: null,        // Start with Rage (0 = None, 1 = !, 2 = !!, 3 = MAX).

        // Major Status (Persistent)
        // Options: 'brn' (Burn), 'par' (Paralysis), 'slp' (Sleep), 'frz' (Freeze), 'psn' (Poison)
        STATUS: null,

        // Volatile Status (Temporary / Wear off)
        // e.g. { confused: 3 } (Confused for 3 turns)
        VOLATILES: {},

        // Stat Stages (Buffs/Debuffs)
        // Keys: atk, def, spa (Sp. Atk), spd (Sp. Def), spe, acc, eva
        // Range: -6 (Min) to +6 (Max)
        // e.g. { atk: 6, def: -2 }
        STAGES: null
    },

    // Force specific Player attributes
    PLAYER: {
        ID: null,       // Pokedex Number (e.g. 249 = Lugia).
        LEVEL: null,    // Level (1-100).
        SHINY: null,    // true/false.
        RAGE: 0,        // Start with Rage (0-3).

        // Major Status: 'brn', 'par', 'slp', 'frz', 'psn'
        STATUS: null,

        // Volatile Status: e.g. { confused: 5 }
        VOLATILES: null,

        // Stat Stages: e.g. { atk: 6, spe: 6 }
        STAGES: null,

        // Force specific moves (Array of lowercase strings with dashes)
        // e.g. ['fly', 'dig', 'solar-beam', 'protect']
        MOVES: ['substitute', 'baton-pass', 'self-destruct', 'tackle']
    },

    // Control Drop Rates
    LOOT: {
        WIN_RATE: null,       // 0.0 to 1.0 (e.g. 1.0 = Guaranteed drop on win).
        MID_BATTLE_RATE: null,// 0.0 to 1.0 (e.g. 0.5 = 50% chance on every hit).
        FORCE_ITEM: null      // Force a specific item ID (e.g. 'masterball').
    }
};

// --- HELPER ---
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// --- ANIMATION CONTROLLER ---
// Edit these values to change game speed globally!
const ANIM = {
    // Global UI
    HUD_SLIDE_DELAY: 200,      // Delay before HUD moves
    TEXT_READ_PAUSE: 600,      // Time to read short text (like "Come back!")

    // Intro Sequence
    INTRO_SILHOUETTE: 200,     // How long the enemy stays black
    INTRO_REVEAL_DELAY: 220,   // Pause after enemy turns color before HUD
    INTRO_BOSS_RUMBLE: 1000,   // Duration of Boss shake
    INTRO_PLAYER_WAIT: 1000,   // Pause before Player HUD appears

    // Battle Events
    CRY_DURATION: 200,        // Generic wait time for a Cry to finish
    FAINT_PRE_DELAY: 500,      // "Wait a little" before fainting
    FAINT_DROP_ANIM: 600,      // Duration of the fall animation
    FAINT_POST_DELAY: 800,     // Time to sit there before "X Fainted" text

    // Switching
    SWITCH_RETURN_ANIM: 400,   // Time for "Red beam" withdraw animation
    SWITCH_STABILIZE: 250,     // Small pause to let menus close

    // Catching
    THROW_ANIM: 600,           // How long the ball flies
    CATCH_SHAKE_DELAY: 800,    // Time between wobbles
    CATCH_SUCCESS_ANIM: 1000,  // How long the "Click" and dimming lasts
    OVERFLOW_WARNING: 1000     // How long to show "Party Full"
};

// --- LOOT SYSTEM ---
// A. Define your Rarities in plain English
const RARITY = {
    // BASE: How likely it is at Level 1 (Higher = More Common)
    // SCALING: How much more likely it gets as you level up (Higher = Becomes common later)

    COMMON: { base: 1000, scaling: 0.2 }, // Always finds these (Potions/Pokeballs)
    UNCOMMON: { base: 300, scaling: 1.5 }, // Sometimes finds these
    RARE: { base: 60, scaling: 3.0 }, // Hard to find early, easier later
    ULTRA_RARE: { base: 5, scaling: 6.0 }, // Almost impossible early, possible later
    LEGENDARY: { base: 0, scaling: 0.3 }  // Masterball (Very rare, increases VERY slowly)
};

// B. Assign Items to Rarities
const LOOT_SYSTEM = {
    DROP_RATE_WILD: 0.40,       // 40% chance
    DROP_RATE_BOSS: 1.00,       // 100% chance
    DROP_RATE_MID_BATTLE: 0.20, // chance on hit

    TABLE: [
        { key: 'potion', ...RARITY.COMMON },
        { key: 'pokeball', ...RARITY.COMMON },

        { key: 'superpotion', ...RARITY.UNCOMMON },
        { key: 'greatball', ...RARITY.UNCOMMON },

        { key: 'revive', ...RARITY.RARE },
        { key: 'hyperpotion', ...RARITY.RARE },

        { key: 'ultraball', ...RARITY.ULTRA_RARE },
        { key: 'maxpotion', ...RARITY.ULTRA_RARE },

        { key: 'masterball', ...RARITY.LEGENDARY }
    ]
};

// --- 1. GAME BALANCE CONTROLLER ---
// Tweak difficulty, RNG, and rewards here.
const GAME_BALANCE = {
    // Battle Math
    CRIT_CHANCE_PLAYER: 0.0625, // 6.25%
    CRIT_CHANCE_BOSS: 0.25,     // 25%
    DAMAGE_VARIANCE_MIN: 0.85,  // Damage rolls between 85% and 100%
    DAMAGE_VARIANCE_MAX: 1.00,

    // Catching & Rage
    CATCH_RATE_MODIFIER: 1.0,   // Higher = Easier to catch
    RAGE_TRIGGER_CHANCE: 0.25,  // 25% chance to get angry on miss/fail
    RAGE_DEFLECT_CHANCE: 0.20,  // % per rage level to deflect ball

    // RAGE MECHANICS (New)
    RAGE_MULTIHIT_BASE: 0.34,   // 34% chance per rage level to hit again
    RAGE_RECOIL_CHANCE: 0.20,   // 20% chance to take damage on extra hits
    RAGE_RECOIL_DMG: 0.20,      // Take 20% of damage dealt as recoil

    // Post-Battle
    HEAL_WIN_MIN_PCT: 0.15,     // Heal at least 15% HP after win
    HEAL_WIN_MAX_PCT: 0.35      // Heal up to 35% HP
};

// --- 2. ENCOUNTER CONFIGURATION ---
// Control what spawns and when.
const ENCOUNTER_CONFIG = {
    BOSS_CHANCE: 0.05,          // 5% base chance
    BOSS_STREAK_TRIGGER: 5,     // Every 5 wins, high boss chance
    BOSS_STREAK_CHANCE: 0.95,   // 95% chance on streak turns

    SHINY_CHANCE: 0.05,         // 1/20 chance (Generous for a simulation)

    // Level Scaling (Relative to Player)
    WILD_LEVEL_MIN: -5,         // Player Level - 5
    WILD_LEVEL_MAX: -2,         // Player Level - 2
    BOSS_LEVEL_MIN: 1,          // Player Level + 1
    BOSS_LEVEL_MAX: 5           // Player Level + 5
};

// --- 3. AUDIO PALETTE ---
// Define the "Voice" of the game here.
const SFX_LIB = {
    // Simple Tones: { freq, type, duration, vol }
    select: { freq: 1200, type: 'square', dur: 0.05, vol: 0.05 },
    exp: { freq: 800, type: 'square', dur: 0.05, vol: 0.1 },
    clank: { freq: 2000, type: 'square', dur: 0.05, vol: 0.1 },

    // Complex Theme Frequencies (used in sequences)
    shiny_1: 1396.91, shiny_2: 1760.00,
    heal_base: 523.25,
    levelup_base: 1046.50
};

// --- 4. TYPE CHART MATRIX ---
// Moved out of function for easy editing. 
// 2 = Super Effective, 0.5 = Not Very, 0 = Immune
const TYPE_CHART = {
    normal: { rock: 0.5, ghost: 0, steel: 0.5 },
    fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
    water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
    electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
    grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
    ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
    fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2 },
    poison: { grass: 2, poison: 0.5, ground: 0.5, bug: 1, rock: 0.5, ghost: 0.5, steel: 0 },
    ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
    flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
    psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
    bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5 },
    rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
    ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5, steel: 0.5 },
    dragon: { dragon: 2, steel: 0.5 },
    dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, steel: 0.5 },
    steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5 }
};

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

    // --- COMPLEX STATUS/STATS ---

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

            const cost = Math.floor(user.maxHp / 4);
            user.currentHp -= cost;
            user.volatiles.substituteHP = cost + 1;

            battle.updateHUD(user, user === battle.p ? 'player' : 'enemy');
            await battle.typeText(`${user.name} made\na SUBSTITUTE!`);

            const sprite = user === battle.p ? document.getElementById('player-sprite') : document.getElementById('enemy-sprite');
            AudioEngine.playSfx('swoosh');

            // Save Original
            if (!user.volatiles.originalSprite) user.volatiles.originalSprite = user === battle.p ? user.backSprite : user.frontSprite;

            // Apply Doll
            sprite.src = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/substitute.png";

            // FIX: Apply Flip Class if Player
            if (user === battle.p) sprite.classList.add('sub-back');

            sprite.classList.add('anim-enter');
            setTimeout(() => sprite.classList.remove('anim-enter'), 500);

            return true;
        }
    },

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

// Helper to use constants easier
// Usage: await sleep(ANIM.CRY_DURATION);
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));



const STATUS_DATA = {
    par: { name: "PAR", color: "#d8b030", msg: "is paralyzed!\nIt can't move!" },
    brn: { name: "BRN", color: "#c83828", msg: "is hurt\nby its burn!" },
    psn: { name: "PSN", color: "#a040a0", msg: "is hurt\nby poison!" },
    frz: { name: "FRZ", color: "#40a8c0", msg: "is frozen\nsolid!" },
    slp: { name: "SLP", color: "#888888", msg: "is fast\nasleep!" },
    confused: { name: "confused", msg: "is confused!" }
};

// Stat stage multipliers: -6 to +6
const STAGE_MULT = {
    '-6': 2 / 8, '-5': 2 / 7, '-4': 2 / 6, '-3': 2 / 5, '-2': 2 / 4, '-1': 2 / 3,
    '0': 1,
    '1': 1.5, '2': 2.0, '3': 2.5, '4': 3.0, '5': 3.5, '6': 4.0
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

// Weather Visuals & Text
const WEATHER_FX = {
    'sun': {
        color: 'rgba(255, 200, 0, 0.1)',
        msg: "The sunlight is strong.",
        continue: "The sunlight is strong."
    },
    'rain': {
        color: 'rgba(0, 0, 255, 0.1)',
        msg: "It started to rain.",
        continue: "Rain continues to fall."
    },
    'sand': {
        color: 'rgba(180, 160, 100, 0.2)',
        msg: "A sandstorm is brewing.",
        continue: "The sandstorm rages."
    },
    'hail': {
        color: 'rgba(200, 255, 255, 0.2)',
        msg: "It started to hail.",
        continue: "The hail continues to fall."
    }
};

const ITEMS = {
    potion: { name: "POTION", heal: 20, type: 'heal', desc: "Restores Pokemon HP by 20.", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/potion.png" },
    superpotion: { name: "SUPER POTION", heal: 50, type: 'heal', desc: "Restores Pokemon HP by 50.", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/super-potion.png" },
    hyperpotion: { name: "HYPER POTION", heal: 200, type: 'heal', desc: "Restores Pokemon HP by 200.", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/hyper-potion.png" },
    maxpotion: { name: "MAX POTION", heal: 9999, type: 'heal', desc: "Fully restores Pokemon HP.", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/max-potion.png" },
    revive: { name: "REVIVE", type: 'revive', desc: "Restores a fainted Pokemon to 50% HP.", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/revive.png" },
    pokeball: { name: "POKE BALL", type: 'ball', rate: 1, desc: "A device for catching wild Pokemon.", css: '', img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png" },
    greatball: { name: "GREAT BALL", type: 'ball', rate: 1.5, desc: "A good Ball with a higher catch rate.", css: 'great', img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/great-ball.png" },
    ultraball: { name: "ULTRA BALL", type: 'ball', rate: 2, desc: "A better Ball with a high catch rate.", css: 'ultra', img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ultra-ball.png" },
    masterball: { name: "MASTER BALL", type: 'ball', rate: 255, desc: "The best Ball. It catches without fail.", css: 'master', img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/master-ball.png" }
};
