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
