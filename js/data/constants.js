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

// --- AUDIO PALETTE ---
// Define the "Voice" of the game here.
const SFX_LIB = {
    // Simple Tones: { freq, type, duration, vol }
    select: { freq: 1200, type: 'square', dur: 0.05, vol: 0.05 },
    exp: { freq: 800, type: 'square', dur: 0.05, vol: 0.1 },
    clank: { freq: 2000, type: 'square', dur: 0.05, vol: 0.1 },

    // Complex Theme Frequencies (used in sequences)
    shiny_1: 1396.91, shiny_2: 1760.00,
    heal_base: 523.25,
    levelup_base: 1046.50,
    stat_up_base: 330.00,
    stat_down_base: 330.00
};

// --- TYPE CHART MATRIX ---
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

const STATUS_DATA = {
    par: { name: "PAR", color: "#d8b030", applyMsg: "was paralyzed!", tickMsg: "is paralyzed!\nIt can't move!" },
    brn: { name: "BRN", color: "#c83828", applyMsg: "was burned!", tickMsg: "is hurt\nby its burn!" },
    psn: { name: "PSN", color: "#a040a0", applyMsg: "was poisoned!", tickMsg: "is hurt\nby poison!" },
    tox: { name: "PSN", color: "#a040a0", applyMsg: "was badly\npoisoned!", tickMsg: "is hurt\nby poison!" },
    frz: { name: "FRZ", color: "#40a8c0", applyMsg: "was frozen\nsolid!", tickMsg: "is frozen\nsolid!" },
    slp: { name: "SLP", color: "#888888", applyMsg: "fell asleep!", tickMsg: "is fast\nasleep!" },
    confused: { name: "confused", applyMsg: "became confused!", tickMsg: "is confused!" }
};

// Stat stage multipliers: -6 to +6
const STAGE_MULT = {
    '-6': 2 / 8, '-5': 2 / 7, '-4': 2 / 6, '-3': 2 / 5, '-2': 2 / 4, '-1': 2 / 3,
    '0': 1,
    '1': 1.5, '2': 2.0, '3': 2.5, '4': 3.0, '5': 3.5, '6': 4.0
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
