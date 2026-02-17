// --- DEBUG SETTINGS ------------------------
// Change ENABLED to true to activate these overrides
const DEBUG = {
    ENABLED: true,
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
        masterball: 20,
        bicycle: 1,
        pokedex: 1
    },

    // Force specific Enemy attributes
    ENEMY: {
        ID: null,       // Pokedex Number (e.g. 150 = Mewtwo). Set null for random.
        LEVEL: null,       // Level (1-100). Set null for auto-scaling.
        SHINY: null,    // true = Always Shiny, false = Never Shiny, null = Random.
        IS_BOSS: null,  // true = Boss stats & music.
        IS_LUCKY: true, // true = Force Lucky Status
        RAGE: null,     // Start with Rage (0 = None, 1 = !, 2 = !!, 3 = MAX).

        // Major Status (Persistent)
        // Options: 'brn' (Burn), 'par' (Paralysis), 'slp' (Sleep), 'frz' (Freeze), 'psn' (Poison)
        STATUS: null,

        // Volatile Status (Temporary / Wear off)
        // e.g. { confused: 3 } (Confused for 3 turns)
        VOLATILES: { confused: 3 },

        // Stat Stages (Buffs/Debuffs)
        // Keys: atk, def, spa (Sp. Atk), spd (Sp. Def), spe, acc, eva
        // Range: -6 (Min) to +6 (Max)
        // e.g. { atk: 6, def: -2 }
        STAGES: null
    },

    // Force specific Player attributes
    PLAYER: {
        ID: 1,       // Pokedex Number (e.g. 249 = Lugia).
        LEVEL: 15,    // Level (1-100).
        SHINY: null,    // true/false.
        RAGE: 0,        // Start with Rage (0-3).

        // Major Status: 'brn', 'par', 'slp', 'frz', 'psn'
        STATUS: null,

        // Volatile Status: e.g. { confused: 5 }
        VOLATILES: { sleep: 3 },

        // Stat Stages: e.g. { atk: 6, spe: 6 }
        STAGES: null,

        // Force specific items
        // NOTE: Uses INVENTORY above for quantities

        // Force specific moves (Array of lowercase strings with dashes)
        // e.g. ['fly', 'dig', 'solar-beam', 'protect']
        MOVES: ['transform', 'thunder', 'ice-beam', 'flamethrower']
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
