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
    RAGE_BASE_CHANCE: 0.20,     // 20% base chance to get angry
    RAGE_DEFLECT_CHANCE: 0.20,  // % per rage level to deflect ball

    // RAGE MECHANICS (New)
    RAGE_MULTIHIT_BASE: 0.20,   // 20% chance per rage level to hit again
    RAGE_RECOIL_CHANCE: 0.20,   // 20% chance to take damage on extra hits
    RAGE_RECOIL_DMG: 0.20,      // Take 20% of damage dealt as recoil
    RAGE_CRIT_BONUS: 0.25,      // Extra 25% chance if hit by crit
    RAGE_SUPER_EFF_BONUS: 0.15, // Extra 15% chance if hit by super effective move
    RAGE_LOW_HP_BONUS: 0.10,    // Extra 10% chance if HP < 50%
    RAGE_MAX_LEVEL: 3,          // Max level a pokemon can reach
    RAGE_MIN_DAMAGE_PCT: 0.20,  // Need > 20% HP damage taken to trigger building
    RAGE_STATUS_BONUS: 0.05,    // Extra 5% chance if status/volatile inflicted

    // Post-Battle
    HEAL_WIN_MIN_PCT: 0.15,     // Heal at least 15% HP after win
    HEAL_WIN_MAX_PCT: 0.35,      // Heal up to 35% HP

    // Move Generation (New)
    MOVE_GEN_SMART: true,       // Enable level-appropriate move selection
    MOVE_GEN_SPECIAL_CHANCE: 0.10, // 10% chance to have an egg move or higher level move
    MOVE_GEN_SPECIAL_COUNT_2_CHANCE: 0.30, // Of that 10%, 30% chance to have 2 special moves instead of 1
    MOVE_GEN_HIGHER_LEVEL_REACH: 10 // How many levels above current level to look for "special" moves
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
    BOSS_LEVEL_MAX: 5,           // Player Level + 5

    // High Tier (Legendary/Pseudo-Legendary) Scaling
    HI_TIER_BST_THRESHOLD: 520,  // Threshold for "Powerful" Pokemon
    HI_TIER_MIN_WINS: 10,        // Wins required to see naturally in wild
    HI_TIER_MIN_LEVEL: 30,       // Level required to see naturally in wild
    HI_TIER_BOSS_PROBABILITY: 0.60 // Chance a boss re-rolls to find a high-tier candidate
};
