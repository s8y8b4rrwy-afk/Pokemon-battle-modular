// --- LOOT SYSTEM ---
// A. Define your Rarities in plain English
const RARITY = {
    // BASE: How likely it is at Level 1 (Higher = More Common)
    // SCALING: How much more likely it gets as you level up (Higher = Becomes common later)

    COMMON: { base: 1000, scaling: 0.2 }, // Always finds these (Potions/Pokeballs)
    UNCOMMON: { base: 300, scaling: 1.5 }, // Sometimes finds these
    RARE: { base: 60, scaling: 3.0 }, // Hard to find early, easier later
    ULTRA_RARE: { base: 5, scaling: 6.0 }, // Almost impossible early, possible later
    LEGENDARY: { base: 0, scaling: 0.3 }, // Masterball (Very rare, increases VERY slowly)
    LUCKY_RARE: { base: 200, scaling: 2.0 }, // Higher base for Lucky Pokemon drops only
};

// B. Assign Items to Rarities
const LOOT_SYSTEM = {
    // --- NEW: Per-Pocket Roll System ---
    // Instead of one overall roll, we roll for each pocket independently.
    POCKET_RATES: {
        items: 0.25,      // 25% chance for healing/revives
        balls: 0.20,      // 20% chance for pokeballs
        key: 0.10,        // 10% chance for evolution stones
        tm: 0.00,         // Placeholder for future TMs
        hm: 0.00          // Placeholder for future HMs
    },

    // Multipliers for special encounters
    BOSS_MULTIPLIER: 1.8,   // Reduced from 2.5 to be more balanced
    LUCKY_MULTIPLIER: 1.5,  // Lucky mon get a slight boost to all pocket rolls

    // Caps to prevent "unlimited items" from one battle
    MAX_DROPS_WILD: 1,      // Wild mons drop at most 1 item from standard pockets
    MAX_DROPS_BOSS: 2,      // Bosses drop at most 2 items from standard pockets

    DROP_RATE_MID_BATTLE: 0.15, // Chance to drop on hit

    TABLE: [
        { key: 'potion', ...RARITY.COMMON },
        { key: 'antidote', ...RARITY.COMMON },
        { key: 'paralyzeheal', ...RARITY.COMMON },
        { key: 'pokeball', ...RARITY.COMMON },

        { key: 'superpotion', ...RARITY.UNCOMMON },
        { key: 'burnheal', ...RARITY.UNCOMMON },
        { key: 'iceheal', ...RARITY.UNCOMMON },
        { key: 'awakening', ...RARITY.UNCOMMON },
        { key: 'greatball', ...RARITY.UNCOMMON },

        { key: 'revive', ...RARITY.RARE },
        { key: 'hyperpotion', ...RARITY.RARE },
        { key: 'fullheal', ...RARITY.RARE },

        { key: 'ultraball', ...RARITY.ULTRA_RARE },
        { key: 'maxpotion', ...RARITY.ULTRA_RARE },
        { key: 'maxrevive', ...RARITY.ULTRA_RARE },

        // Evolution Stone — Rare drop from wild/boss; higher rate from Lucky Pokémon (handled separately in game.js)
        { key: 'evo_stone', ...RARITY.RARE },

        { key: 'masterball', ...RARITY.LEGENDARY },
    ]
};

/** @type {Object.<string, ItemEntry>} */
const ITEMS = {
    potion: { name: "POTION", heal: 20, type: 'heal', pocket: 'items', desc: "Restores Pokemon HP by 20.", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/potion.png" },
    superpotion: { name: "SUPER POTION", heal: 50, type: 'heal', pocket: 'items', desc: "Restores Pokemon HP by 50.", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/super-potion.png" },
    hyperpotion: { name: "HYPER POTION", heal: 200, type: 'heal', pocket: 'items', desc: "Restores Pokemon HP by 200.", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/hyper-potion.png" },
    maxpotion: { name: "MAX POTION", heal: 9999, type: 'heal', pocket: 'items', desc: "Fully restores Pokemon HP.", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/max-potion.png" },
    revive: { name: "REVIVE", type: 'revive', pocket: 'items', desc: "Restores a fainted Pokemon to 50% HP.", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/revive.png" },
    maxrevive: { name: "MAX REVIVE", type: 'revive', pocket: 'items', desc: "Fully restores a fainted Pokemon.", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/max-revive.png" },
    pokeball: { name: "POKE BALL", type: 'ball', pocket: 'balls', rate: 1, desc: "A device for catching wild Pokemon.", css: '', img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png" },
    greatball: { name: "GREAT BALL", type: 'ball', pocket: 'balls', rate: 1.5, desc: "A good Ball with a higher catch rate.", css: 'great', img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/great-ball.png" },
    ultraball: { name: "ULTRA BALL", type: 'ball', pocket: 'balls', rate: 2, desc: "A better Ball with a high catch rate.", css: 'ultra', img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ultra-ball.png" },
    masterball: { name: "MASTER BALL", type: 'ball', pocket: 'balls', rate: 255, desc: "The best Ball. It catches without fail.", css: 'master', img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/master-ball.png" },
    bicycle: { name: "BICYCLE", type: 'key', pocket: 'key', desc: "A folding bicycle for traveling faster.", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/bicycle.png" },
    pokedex: { name: "POKEDEX", type: 'key', pocket: 'key', desc: "A high-tech encyclopedia that records Pokemon.", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/pokedex.png" },
    evo_stone: { name: "EVOLUTION STONE", type: 'evo_stone', pocket: 'key', desc: "A mysterious stone pulsing with ancient energy. It can magically trigger the evolution of any Pokemon, bypassing the need to level up.", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/moon-stone.png" },
    inspiration_stone: { name: "INSPIRATION STONE", type: 'inspiration_stone', pocket: 'key', desc: "A sparkling gem that fills a Pokemon with sudden insight. It inspires them to learn a new technique after the next battle.", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/fire-stone.png" },

    // --- STATUS HEALERS ---
    antidote: { name: "ANTIDOTE", type: 'status_heal', condition: 'poison', pocket: 'items', desc: "Cures a poisoned Pokemon.", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/antidote.png" },
    paralyzeheal: { name: "PARALYZ HEAL", type: 'status_heal', condition: 'paralysis', pocket: 'items', desc: "Cures a paralyzed Pokemon.", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/paralyze-heal.png" },
    burnheal: { name: "BURN HEAL", type: 'status_heal', condition: 'burn', pocket: 'items', desc: "Cures a burnt Pokemon.", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/burn-heal.png" },
    iceheal: { name: "ICE HEAL", type: 'status_heal', condition: 'freeze', pocket: 'items', desc: "Thaws a frozen Pokemon.", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ice-heal.png" },
    awakening: { name: "AWAKENING", type: 'status_heal', condition: 'sleep', pocket: 'items', desc: "Wakes a sleeping Pokemon.", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/awakening.png" },
    fullheal: { name: "FULL HEAL", type: 'status_heal', condition: 'all', pocket: 'items', desc: "Cures all status problems.", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/full-heal.png" },

    // --- ROGUELIKE ITEMS ---
    rogue_attack: { name: "MIGHT CANDY", type: 'rogue', pocket: 'key', desc: "Slightly boosts Attack power. Stacks.", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/x-attack.png" },
    rogue_defense: { name: "GUARD CANDY", type: 'rogue', pocket: 'key', desc: "Slightly boosts Defense. Stacks.", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/x-defense.png" },
    rogue_sp_attack: { name: "MIND CANDY", type: 'rogue', pocket: 'key', desc: "Slightly boosts Sp. Atk. Stacks.", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/x-sp-atk.png" },
    rogue_sp_defense: { name: "SOUL CANDY", type: 'rogue', pocket: 'key', desc: "Slightly boosts Sp. Def. Stacks.", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/x-sp-def.png" },
    rogue_speed: { name: "SWIFT CANDY", type: 'rogue', pocket: 'key', desc: "Slightly boosts Speed. Stacks.", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/x-speed.png" },
    rogue_hp: { name: "LIFE CANDY", type: 'rogue', pocket: 'key', desc: "Slightly boosts Max HP. Stacks.", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/hp-up.png" },
    rogue_crit: { name: "FOCUS LENS", type: 'rogue', pocket: 'key', desc: "Boosts Critical Hit ratio. Stacks.", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/scope-lens.png" },
    rogue_xp: { name: "XP CHARM", type: 'rogue', pocket: 'key', desc: "Boosts EXP gained from battles. Stacks.", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/lucky-egg.png" },
    rogue_shiny: { name: "SHINY CHARM", type: 'rogue', pocket: 'key', desc: "Increases chance of finding Shiny Pokemon. Stacks.", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/shiny-charm.png" },

    // --- DEBUG ITEMS ---
    debug_force_evo: { name: "EVO-DEBUG", type: 'debug', pocket: 'debug', desc: "Forces Pokemon to evolve after battle.", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/rare-candy.png" },
    debug_force_evo_move: { name: "EVO+MOVE", type: 'debug', pocket: 'debug', desc: "Forces evolution & learns a random move.", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ability-capsule.png" }
};
