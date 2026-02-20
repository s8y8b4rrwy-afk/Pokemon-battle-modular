const APICache = {
    DB_NAME: 'PokeAPICache',
    DB_VERSION: 1,
    STORES: {
        pokemon: 'pokemon',
        species: 'species',
        moves: 'moves',
        evolution: 'evolution',
        forms: 'forms'
    },
    db: null,

    async init() {
        if (this.db) return;
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

            request.onupgradeneeded = (event) => {
                const db = request.result;
                Object.values(this.STORES).forEach(storeName => {
                    if (!db.objectStoreNames.contains(storeName)) {
                        db.createObjectStore(storeName);
                    }
                });
            };

            request.onsuccess = (event) => {
                this.db = request.result;
                resolve();
            };

            request.onerror = (event) => {
                console.error("IndexedDB initialization error:", request.error);
                reject(request.error);
            };
        });
    },

    async get(storeName, key) {
        await this.init();
        return new Promise((resolve) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(key.toString());

            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => resolve(null);
        });
    },

    async set(storeName, key, value) {
        await this.init();
        return new Promise((resolve) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(value, key.toString());

            request.onsuccess = () => resolve(true);
            request.onerror = () => resolve(false);
        });
    },

    async clear() {
        await this.init();
        Object.values(this.STORES).forEach(storeName => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            transaction.objectStore(storeName).clear();
        });
    }
};
