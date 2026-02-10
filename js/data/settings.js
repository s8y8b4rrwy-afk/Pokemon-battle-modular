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
        MOVES: ['destiny-bond', 'spikes', 'curse', 'u-turn']
    },

    // Control Drop Rates
    LOOT: {
        WIN_RATE: null,       // 0.0 to 1.0 (e.g. 1.0 = Guaranteed drop on win).
        MID_BATTLE_RATE: null,// 0.0 to 1.0 (e.g. 0.5 = 50% chance on every hit).
        FORCE_ITEM: null      // Force a specific item ID (e.g. 'masterball').
    }
};

// --- GAME BALANCE CONTROLLER ---
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

// --- ENCOUNTER CONFIGURATION ---
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
