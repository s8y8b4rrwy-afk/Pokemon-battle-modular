// --- DEBUG SETTINGS & DOCUMENTATION ------------------------
/**
 * HOW TO USE DEBUG SETTINGS:
 * 
 * 1. ENABLED: Set to 'true' to activate any of these overrides.
 * 2. GIVE_ALL_ITEMS: If true, your inventory is automatically filled with 
 *    every item in the game database on start/load.
 * 3. ROGUE_QUANTITY: Sets the quantity for "stackable" rogue items (Caries, Lenses).
 * 4. ENEMY / PLAYER / LOOT Blocks:
 *    - Set specific IDs (Pokedex number) to force which Pokemon appears.
 *    - Set LEVELS to force specific level scaling.
 *    - Use 'null' on any setting to let the game use its natural RNG.
 *    - SHINY: Set true to force shiny, false to disable, null for random.
 * 5. PLAYER.MOVES: 
 *    - You can provide an array of move names (e.g., ['thunder', 'fly']).
 *    - If you set a slot to 'null', the game will automatically fill it with
 *       a level-appropriate move (e.g., ['fly', null, 'surf', null]).
 */

const DEBUG = {
    ENABLED: true,
    BATTLE_LOGS: true, // Set to true to see detailed battle logs in console

    // --- AUTOMATED TESTING SETTINGS ---
    GIVE_ALL_ITEMS: true,    // Automatically populate inventory with EVERYTHING in ITEMS
    ROGUE_QUANTITY: 10,      // Default quantity for the "Rogue" stackable items (0-99)
    BASE_ITEM_QUANTITY: 20,  // Default quantity for standard items (Potions, Balls)

    // Customize your starting items (Manual Overrides)
    // NOTE: If GIVE_ALL_ITEMS is true, these will still override those keys if provided
    INVENTORY: {
        potion: 20,
        superpotion: 20,
        hyperpotion: 20,
        maxpotion: 20,
        revive: 20,
        maxrevive: 20,
        pokeball: 50,
        greatball: 50,
        ultraball: 50,
        masterball: 99,
        bicycle: 1,
        pokedex: 1
    },

    // Force specific Enemy attributes
    ENEMY: {
        ID: null,       // Pokedex Number (e.g. 150 = Mewtwo).
        LEVEL: null,    // Level (1-100).
        SHINY: null,    // true = Always Shiny, false = Never Shiny, null = Random.
        IS_BOSS: null,  // true = Boss stats & music.
        IS_LUCKY: null, // Set true to force Lucky status (and specific species).
        RAGE: null,     // Start with Rage (0 = None, 1 = !, 2 = !!, 3 = MAX).

        // Major Status (Persistent)
        // Options: 'brn', 'par', 'slp', 'frz', 'psn'
        STATUS: null,

        // Volatile Status (Temporary / Wear off)
        VOLATILES: null,

        // Stat Stages (Buffs/Debuffs)
        // Keys: atk, def, spa, spd, spe, acc, eva (-6 to +6)
        STAGES: null
    },

    // Force specific Player attributes
    PLAYER: {
        ID: 133,       // Pokedex Number (e.g. 249 = Lugia).
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
        // If a slot is null, it will be auto-filled by the generator.
        MOVES: ['hyper-beam', null, null, null]
    },

    // Control Drop Rates
    LOOT: {
        WIN_RATE: null,       // 0.0 to 1.0 (e.g. 1.0 = Guaranteed drop on win).
        MID_BATTLE_RATE: null,// 0.0 to 1.0 (e.g. 0.5 = 50% chance on every hit).
        FORCE_ITEM: null      // Force a specific item ID (e.g. 'masterball').
    }
};

// --- DEBUG CONSOLE HELPERS ---
// Teaching a move: DebugTeach(0, 'hyper-beam')
window.DebugTeach = async (slotIndex, moveName) => {
    if (typeof Game === 'undefined' || !Game.party[slotIndex]) {
        console.error("Invalid slot or Game not ready.");
        return;
    }
    const p = Game.party[slotIndex];
    console.log(`Attempting to teach ${moveName} to ${p.name} via full flow...`);

    if (typeof MoveLearnScreen !== 'undefined') {
        // Force hide standard menus to prevent overlap
        if (typeof UI !== 'undefined') {
            UI.hide('action-menu');
            UI.hide('move-menu');
        }
        await MoveLearnScreen.tryLearn(p, moveName);
        console.log("Move Learn Flow complete.");
    } else {
        console.error("MoveLearnScreen not found.");
    }
};

// Check for new moves: DebugCheckMoves(0)
window.DebugCheckMoves = async (slotIndex) => {
    if (typeof Game === 'undefined' || !Game.party[slotIndex]) return;
    const p = Game.party[slotIndex];
    if (typeof API.getLearnableMoves === 'function') {
        const moves = await API.getLearnableMoves(p.id, p.level);
        console.log(`Learnable moves for ${p.name} at Lvl ${p.level}:`, moves);
        if (moves.length > 0) {
            console.log("Triggering learn sequence...");
            for (const m of moves) {
                if (p.moves.find(x => x.name === m.toUpperCase())) continue;
                await MoveLearnScreen.tryLearn(p, m);
            }
        }
    }
};

// Force a win and level up: DebugWinAndLevelUp('flamethrower')
window.DebugWinAndLevelUp = async (forceMove = 'solar-beam') => {
    if (typeof Battle === 'undefined' || !Battle.e) {
        console.error("No active battle.");
        return;
    }

    const p = Game.party[Game.activeSlot];
    const e = Battle.e;

    // 1. Hide Menus
    if (typeof UI !== 'undefined') {
        UI.hide('action-menu');
        UI.hide('move-menu');
    }

    // 2. Simulate "JUDGEMENT" Move
    await DialogManager.show(`${p.name} used\nJUDGEMENT!`, { lock: true, delay: 500 });

    // Play powerful animation
    if (typeof Battle.triggerHitAnim === 'function') {
        await Battle.triggerHitAnim(e, 'normal', 'hyper-beam');
    }

    // 3. Temporarily BOOST enemy level/yield to GUARANTEE a level up
    // We modify the enemy object directly so Mechanics.calcExpGain picks it up
    const originalLvl = e.level;
    const originalBase = e.baseExp;

    // Set to something that yields massive EXP based on player level
    e.level = p.level + 10;
    e.baseExp = 250;

    // 4. Apply Lethal Damage
    await Battle.applyDamage(e, e.maxHp, 'normal', false, { eff: 2 });

    // 5. Trigger Faint via Manager
    // This will trigger the standard EXP/Level Up flow
    await FaintManager.processFaint(Battle, e, false);

    // 6. Force the move learning for debug testing
    // We do this AFTER the standard flow finishes to ensure a "learn" happens for testing
    if (forceMove && typeof MoveLearnScreen !== 'undefined') {
        // Check if we already have it to avoid duplicates
        if (!p.moves.find(m => m.name === forceMove.toUpperCase().replace(/-/g, ' '))) {
            console.log(`Debug: Forcing learn of ${forceMove}...`);
            await MoveLearnScreen.tryLearn(p, forceMove);
        }
    }

    // 7. Restore original enemy stats
    e.level = originalLvl;
    e.baseExp = originalBase;

    console.log("Debug win sequence complete. Standard flow + Forced move finished.");
};
