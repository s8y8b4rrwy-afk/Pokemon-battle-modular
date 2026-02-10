const StorageSystem = {
    KEY: 'gs_battler_save',

    save(data) {
        try {
            localStorage.setItem(this.KEY, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error("Save Failed:", e);
            return false;
        }
    },

    load() {
        const str = localStorage.getItem(this.KEY);
        if (!str) return null;
        try {
            return JSON.parse(str);
        } catch (e) {
            console.error("Save Corrupted:", e);
            return null;
        }
    },

    exists() {
        return !!localStorage.getItem(this.KEY);
    },

    wipe() {
        localStorage.removeItem(this.KEY);
    }
};
