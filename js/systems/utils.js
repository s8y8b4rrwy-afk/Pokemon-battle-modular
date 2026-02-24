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

        // --- ROGUE STAT BOOSTS (Apply to Player Party Only) ---
        if (typeof Game !== 'undefined' && Game.party && Game.party.includes(p) && Game.inventory) {
            const boost = (typeof ROGUE_CONFIG !== 'undefined') ? ROGUE_CONFIG.STAT_BOOST_PER_STACK : 0.05;
            const getMult = (key) => 1 + ((Game.inventory[key] || 0) * boost);

            p.stats.atk = Math.floor(p.stats.atk * getMult('rogue_attack'));
            p.stats.def = Math.floor(p.stats.def * getMult('rogue_defense'));
            p.stats.spa = Math.floor(p.stats.spa * getMult('rogue_sp_attack'));
            p.stats.spd = Math.floor(p.stats.spd * getMult('rogue_sp_defense'));
            p.stats.spe = Math.floor(p.stats.spe * getMult('rogue_speed'));
            const hpMult = getMult('rogue_hp');
            if (hpMult > 1) p.stats.hp = Math.floor(p.stats.hp * hpMult);
        }

        // Adjust current HP to match the growth
        p.maxHp = p.stats.hp;
        p.currentHp = Math.min(p.maxHp, p.currentHp + Math.max(0, p.maxHp - oldMax));
    }
};

const ExpCalc = {
    'erratic': (n) => {
        if (n <= 50) return Math.floor(Math.pow(n, 3) * (100 - n) / 50);
        if (n <= 68) return Math.floor(Math.pow(n, 3) * (150 - n) / 100);
        if (n <= 98) return Math.floor(Math.pow(n, 3) * Math.floor((1911 - 10 * n) / 3) / 500);
        return Math.floor(Math.pow(n, 3) * (160 - n) / 100);
    },
    'fast': (n) => Math.floor(4 * Math.pow(n, 3) / 5),
    'medium-fast': (n) => Math.floor(Math.pow(n, 3)),
    'medium-slow': (n) => Math.floor(1.2 * Math.pow(n, 3) - 15 * Math.pow(n, 2) + 100 * n - 140),
    'slow': (n) => Math.floor(5 * Math.pow(n, 3) / 4),
    'fluctuating': (n) => {
        if (n <= 15) return Math.floor(Math.pow(n, 3) * (Math.floor((n + 1) / 3) + 24) / 50);
        if (n <= 36) return Math.floor(Math.pow(n, 3) * (n + 14) / 50);
        return Math.floor(Math.pow(n, 3) * (Math.floor(n / 2) + 32) / 50);
    },

    getNextLevelExp: (rate, level) => {
        const formula = ExpCalc[rate] || ExpCalc['medium-fast'];
        return Math.max(1, formula(level + 1) - formula(level));
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


