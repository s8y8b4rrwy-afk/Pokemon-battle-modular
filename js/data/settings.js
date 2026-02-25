// --- GAME BALANCE CONTROLLER ---
// Tweak difficulty, RNG, and rewards here.
const GAME_BALANCE = {
    // Battle Math
    CRIT_CHANCE_PLAYER: 0.0625, // 6.25%
    CRIT_CHANCE_BOSS: 0.15,     // 15%
    DAMAGE_VARIANCE_MIN: 0.85,  // Damage rolls between 85% and 100%
    DAMAGE_VARIANCE_MAX: 1.00,

    // Catching & Rage
    CATCH_RATE_MODIFIER: 1.0,   // Higher = Easier to catch
    RAGE_BASE_CHANCE: 0.20,     // 20% base chance to get angry
    RAGE_DEFLECT_CHANCE: 0.20,  // % per rage level to deflect ball

    // RAGE MECHANICS (New)
    RAGE_MULTIHIT_BASE: 0.20,   // 20% chance per rage level to hit again
    RAGE_RECOIL_CHANCE: 0.25,   // 25% chance to take damage on extra hits
    RAGE_RECOIL_DMG: 0.50,      // Take 50% of damage dealt as recoil
    RAGE_CRIT_BONUS: 0.25,      // Extra 25% chance if hit by crit
    RAGE_SUPER_EFF_BONUS: 0.15, // Extra 15% chance if hit by super effective move
    RAGE_LOW_HP_BONUS: 0.10,    // Extra 10% chance if HP < 50%
    RAGE_MAX_LEVEL: 3,          // Max level a pokemon can reach
    RAGE_MIN_DAMAGE_PCT: 0.10,  // Need > 10% HP damage taken to trigger building
    RAGE_STATUS_BONUS: 0.05,    // Extra 5% chance if status/volatile inflicted

    // Post-Battle
    HEAL_WIN_MIN_PCT: 0.15,     // Heal at least 15% HP after win
    HEAL_WIN_MAX_PCT: 0.35,      // Heal up to 35% HP

    // Move Generation (New)
    MOVE_GEN_SMART: true,       // Enable level-appropriate move selection
    MOVE_GEN_LEVEL_APPROPRIATE_CHANCE: 0.80, // 80% chance to pick moves close to current level
    MOVE_GEN_LEVEL_WINDOW: 6,   // Number of "most recent" moves to consider as "level-appropriate"
    MOVE_GEN_SPECIAL_CHANCE: 0.20, // 20% chance to have an egg move or higher level move
    MOVE_GEN_SPECIAL_COUNT_2_CHANCE: 0.35, // Of that 20%, 35% chance to have 2 special moves instead of 1
    MOVE_GEN_HIGHER_LEVEL_REACH: 15, // How many levels above current level to look for "special" moves
    MOVE_LEARN_SPECIAL_CHANCE: 0.15, // 15% chance to learn a special (TM/Tutor) move after level up

    // EXP System
    EXP_SHARE_TEAM_PCT: 0.50,   // Non-participants get 50% XP
    EXP_BOSS_MULT: 1.5,         // Bosses give 1.5x XP
    EXP_LUCKY_MULT: 2.0,        // Lucky Pokemon give 2x XP
    EXP_CATCH_MULT: 0.8,        // 80% XP if caught
};

// --- ENCOUNTER CONFIGURATION ---
// Control what spawns and when.
const ENCOUNTER_CONFIG = {
    BOSS_CHANCE: 0.05,          // 5% base chance
    BOSS_STREAK_TRIGGER: 5,     // Every 5 wins, high boss chance
    BOSS_STREAK_CHANCE: 0.95,   // 95% chance on streak turns

    LUCKY_CHANCE: 0.05,         // 5% chance (1/20) for independent roll
    LUCKY_PITY_THRESHOLD: 5,    // After 5 battles without one...
    LUCKY_PITY_CHANCE: 0.50,    // ...chance becomes 50% (1/2)

    SHINY_CHANCE: 0.05,         // 1/20 chance (Generous for a simulation)

    // Species that can be "Lucky"
    LUCKY_SPECIES: [
        35,  // Clefairy
        36,  // Clefable
        113, // Chansey
        132, // Ditto
        173, // Cleffa
        201, // Unown
        242, // Blissey
        //  531  // Audino (Future proofing)
    ],

    UNOWN_FORMS: [
        'unown-a', 'unown-b', 'unown-c', 'unown-d', 'unown-e', 'unown-f', 'unown-g',
        'unown-h', 'unown-i', 'unown-j', 'unown-k', 'unown-l', 'unown-m', 'unown-n',
        'unown-o', 'unown-p', 'unown-q', 'unown-r', 'unown-s', 'unown-t', 'unown-u',
        'unown-v', 'unown-w', 'unown-x', 'unown-y', 'unown-z', 'unown-exclamation', 'unown-question'
    ],

    // Level Scaling (Relative to Player)
    WILD_LEVEL_MIN: -5,         // Player Level - 5
    WILD_LEVEL_MAX: -2,         // Player Level - 2
    BOSS_LEVEL_MIN: 1,          // Player Level + 1
    BOSS_LEVEL_MAX: 3,           // Player Level + 3

    // High Tier (Legendary/Pseudo-Legendary) Scaling
    HI_TIER_BST_THRESHOLD: 420,  // Threshold for "Powerful" Pokemon
    HI_TIER_MIN_WINS: 10,        // Wins required to see naturally in wild
    HI_TIER_MIN_LEVEL: 18,       // Level required to see naturally in wild
    HI_TIER_BOSS_PROBABILITY: 0.60, // Chance a boss re-rolls to find a high-tier candidate

    // SCALING LOGIC (New)
    SCALING_HI_TIER_START_PROB: 0.10, // Start with 10% chance for hi-tier (90% rejection)
    SCALING_HI_TIER_MAX_PROB: 0.85,   // Scale up to 85% chance for hi-tier
    SCALING_HI_TIER_WINS_TARGET: 50,  // Reach max probability at 50 wins
    SCALING_BST_FLOOR_PER_WIN: 7,     // Increase BST floor by 7 per win
    SCALING_BST_FLOOR_MAX: 480        // Never floor above this BST
};

// --- ROGUELIKE MECHANICS ---
// Configuration for the "run-based" progression items
const ROGUE_CONFIG = {
    STAT_BOOST_PER_STACK: 0.05,  // 5% stat increase per Candy
    CRIT_BOOST_PER_STACK: 0.05,  // +5% crit chance per Lens
    XP_BOOST_PER_STACK: 0.10,    // +10% EXP gain per Charm
    SHINY_BOOST_PER_STACK: 0.005,// +0.5% shiny chance per Charm
    ROGUE_ITEM_LIFETIME: 20,      // Turns before a rogue item decays
};

const ROGUE_LOOT = {
    DROP_RATE_BASE: 0.35,        // 35% chance after every battle
    DROP_RATE_BOSS_BONUS: 0.50,  // +50% chance for bosses (Total 85%)

    // Weights for the secondary drop table
    TABLE: [
        { key: 'rogue_attack', weight: 100 },
        { key: 'rogue_defense', weight: 100 },
        { key: 'rogue_sp_attack', weight: 100 },
        { key: 'rogue_sp_defense', weight: 100 },
        { key: 'rogue_speed', weight: 100 },
        { key: 'rogue_hp', weight: 80 },
        { key: 'rogue_crit', weight: 40 },
        { key: 'rogue_xp', weight: 30 },
        { key: 'rogue_shiny', weight: 10 }
    ]
};

// --- ANIMATION & HUD CONFIG ---
// Control the "feel" of HP bars and XP growth.
const ANIM_HUD = {
    // HP Animation
    HP_BASE_DURATION: 1200,      // Time for 100% HP change in ms
    HP_ZONE_ORANGE_MULT: 1.4,    // Slowdown factor when health is < 50%
    HP_ZONE_RED_MULT: 1.8,       // Slowdown factor when health is < 20%
    HP_SMALL_HIT_THRESHOLD: 0.15, // Damage < 15% triggers extra slowdown
    HP_SMALL_HIT_MULT: 3.0,      // 4x slower for minor hits
    HP_TAIL_UNITS: 3,            // Number of final HP digits to "crawl"
    HP_TAIL_MS_PER_UNIT: 500,    // Milliseconds per digit during the crawl
    HP_EASE_POWER: 4,            // Higher = more aggressive slowdown at target
    HP_MIN_DURATION: 400,        // Minimum time for any hit
    HP_MAX_DURATION: 6000,       // Maximum time for a single hit

    // XP Animation
    XP_BASE_DURATION: 2500,      // Time for 100% XP bar fill (Slower = more prestige)
    XP_MIN_DURATION: 400,
    XP_MAX_DURATION: 1800,
    XP_EASE_POWER: 5,
    XP_TICK_RATE: 60,            // Interval between sound ticks during growth

    // Sprite Hit Effects
    HP_HIT_FLICKER_COUNT: 4,     // Number of times the pokemon blinks on hit
    HP_HIT_FLICKER_PERIOD: 100   // Duration of one full blink (on/off) in ms
};

