const PokedexData = {
    KEY: 'gs_battler_pokedex',
    data: {},

    init() {
        this.load();
    },

    load() {
        const str = localStorage.getItem(this.KEY);
        if (str) {
            try {
                this.data = JSON.parse(str);
            } catch (e) {
                console.error("Pokedex Load Error:", e);
                this.data = {};
            }
        } else {
            this.data = {};
        }
    },

    save() {
        try {
            localStorage.setItem(this.KEY, JSON.stringify(this.data));
        } catch (e) {
            console.error("Pokedex Save Error:", e);
        }
    },

    registerSeen(id, isShiny = false, isBoss = false) {
        if (!this.data[id]) {
            this.data[id] = { seen: false, caught: false, count: 0, shinySeen: false, bossSeen: false };
        }

        const entry = this.data[id];
        entry.seen = true;
        entry.count = (entry.count || 0) + 1;
        if (isShiny) entry.shinySeen = true;
        if (isBoss) entry.bossSeen = true;

        this.save();
    },

    registerCaught(id) {
        if (!this.data[id]) {
            this.data[id] = { seen: true, caught: false, count: 1, shinySeen: false, bossSeen: false };
        }
        const entry = this.data[id];
        entry.caught = true;
        entry.seen = true; // Implicitly seen
        this.save();
    },

    getEntry(id) {
        return this.data[id] || { seen: false, caught: false, count: 0 };
    },

    isCaught(id) {
        return this.data[id] && this.data[id].caught;
    },

    isSeen(id) {
        return this.data[id] && this.data[id].seen;
    },

    // Debug helper
    unlockAll() {
        for (let i = 1; i <= 251; i++) {
            this.registerSeen(i);
            if (Math.random() > 0.5) this.registerCaught(i);
        }
        this.save();
    }
};
