// --- DEBUG SETTINGS ------------------------
// Change ENABLED to true to activate these overrides
const DEBUG = {
    ENABLED: false,
    BATTLE_LOGS: true, // Set to true to see detailed battle logs in console

    // Customize your starting items (Quantity)
    INVENTORY: {
        potion: 20,
        superpotion: 20,
        hyperpotion: 20,
        maxpotion: 20,
        revive: 20,
        maxrevive: 20,
        pokeball: 20,
        greatball: 20,
        ultraball: 20,
        masterball: 20
    },

    // Force specific Enemy attributes
    ENEMY: {
        ID: null,       // Pokedex Number (e.g. 150 = Mewtwo). Set null for random.
        LEVEL: 1,       // Level (1-100). Set null for auto-scaling.
        SHINY: null,    // true = Always Shiny, false = Never Shiny, null = Random.
        IS_BOSS: null,  // true = Boss stats & music.
        RAGE: null,     // Start with Rage (0 = None, 1 = !, 2 = !!, 3 = MAX).

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
        VOLATILES: { confused: 5 }, //null,

        // Stat Stages: e.g. { atk: 6, spe: 6 }
        STAGES: null,

        // Force specific items
        // NOTE: Uses INVENTORY above for quantities

        // Force specific moves (Array of lowercase strings with dashes)
        // e.g. ['fly', 'dig', 'solar-beam', 'protect']
        MOVES: ['blizzard', 'thunderbolt', 'ice-beam', 'flamethrower']
    },

    // Control Drop Rates
    LOOT: {
        WIN_RATE: null,       // 0.0 to 1.0 (e.g. 1.0 = Guaranteed drop on win).
        MID_BATTLE_RATE: null,// 0.0 to 1.0 (e.g. 0.5 = 50% chance on every hit).
        FORCE_ITEM: null      // Force a specific item ID (e.g. 'masterball').
    }
};
