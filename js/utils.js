// --- HELPERS ---
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const sleep = (ms) => wait(ms);

const StatCalc = {
    // Gen 2 Style Formula
    other: (base, lvl) => Math.floor((2 * base * lvl) / 100 + 5),
    hp: (base, lvl) => Math.floor((2 * base * lvl) / 100 + lvl + 10),

    // Updates a Pokemon object in-place
    recalculate: (p) => {
        const oldMax = p.maxHp;

        p.stats.atk = StatCalc.other(p.baseStats.atk, p.level);
        p.stats.def = StatCalc.other(p.baseStats.def, p.level);
        p.stats.spa = StatCalc.other(p.baseStats.spa, p.level);
        p.stats.spd = StatCalc.other(p.baseStats.spd, p.level);
        p.stats.spe = StatCalc.other(p.baseStats.spe, p.level);
        p.stats.hp = StatCalc.hp(p.baseStats.hp, p.level);

        // Adjust current HP to match the growth
        p.maxHp = p.stats.hp;
        p.currentHp += (p.maxHp - oldMax);
    }
};

const RNG = {
    // Returns true if roll is successful (chance 0.0 to 1.0)
    roll: (chance) => Math.random() < chance,

    // Returns integer between min and max (inclusive)
    int: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,

    // Returns a random item from an array
    pick: (array) => array[Math.floor(Math.random() * array.length)]
};


