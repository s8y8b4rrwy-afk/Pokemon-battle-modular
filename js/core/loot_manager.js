/**
 * LootManager handles all item drops from interactions with wild/boss Pokemon.
 * It implements a "Per-Pocket" roll system where different categories of items
 * (Healing, Balls, Stones) have independent chances to drop.
 */
const LootManager = {
    /**
     * Main entry point called after a battle is won.
     * @param {Object} enemy - The defeated Pokemon object.
     * @param {number} wins - Current win streak.
     */
    async processPostBattleDrops(enemy, wins) {
        const playerActive = Game.party[Game.activeSlot];
        const levelDiff = enemy.level - playerActive.level;

        // --- 1. DYNAMIC POCKET ROLLS ---
        // We iterate over whatever pockets are defined in LOOT_SYSTEM.POCKET_RATES
        const pockets = Object.keys(LOOT_SYSTEM.POCKET_RATES || {});
        const itemsDropped = [];

        // Limit standard drops to prevent "unlimited items" feel
        const maxDrops = enemy.isBoss ? (LOOT_SYSTEM.MAX_DROPS_BOSS || 2) : (LOOT_SYSTEM.MAX_DROPS_WILD || 1);

        for (const pocket of pockets) {
            if (itemsDropped.length >= maxDrops) break;

            if (this.shouldDropForPocket(pocket, enemy, levelDiff)) {
                const itemKey = this.rollForItemInPocket(pocket, enemy, wins, levelDiff);
                if (itemKey) itemsDropped.push(itemKey);
            }
        }

        // --- 2. LUCKY POKEMON GUARANTEE ---
        // Lucky Pokemon MUST drop at least one item. 
        if (enemy.isLucky && itemsDropped.length === 0 && pockets.length > 0) {
            const forcePocket = RNG.pick(pockets);
            const itemKey = this.rollForItemInPocket(forcePocket, enemy, wins, levelDiff);
            if (itemKey) itemsDropped.push(itemKey);
        }

        // --- 3. PROCESS DROPS ---
        if (itemsDropped.length > 0) {
            await this.awardItems(itemsDropped, enemy.name, false);
        }

        // --- 4. ROGUE LOOT (INDEPENDENT) ---
        await this.processRogueDrops(enemy);
    },

    /**
     * Handles item drops mid-battle (when a Pokemon is hit).
     * @param {Object} enemy - The Pokemon that was hit.
     */
    async processMidBattleDrop(enemy, options = {}) {
        let baseChance = (typeof LOOT_SYSTEM !== 'undefined') ? (LOOT_SYSTEM.DROP_RATE_MID_BATTLE || 0.15) : 0.15;

        // Modifiers for skill (Crits and Super Effective)
        if (options.isCrit) baseChance += 0.10;
        if (options.eff > 1) baseChance += 0.15;

        // Scale chance per pocket
        const pocketsData = (typeof LOOT_SYSTEM !== 'undefined' && LOOT_SYSTEM.POCKET_RATES) ? LOOT_SYSTEM.POCKET_RATES : { items: 0.25 };
        const pockets = Object.keys(pocketsData);
        let itemsDroppedList = [];

        for (const pocket of pockets) {
            let rollChance = baseChance;

            // Lucky Pokemon guarantee at least one item per hit
            if (enemy.isLucky) {
                // First pocket is guaranteed, others have high chance
                rollChance = (itemsDroppedList.length === 0) ? 1.0 : 0.4;
            }

            if (RNG.roll(rollChance)) {
                const itemKey = this.rollForItemInPocket(pocket, enemy, Game.wins, 0);
                if (itemKey) {
                    itemsDroppedList.push(itemKey);

                    // Optimization: Limit to max 2 items per hit to keep it from being "excessive"
                    if (itemsDroppedList.length >= 2) break;
                }
            }
        }

        if (itemsDroppedList.length > 0) {
            await this.awardItems(itemsDroppedList, enemy.name, true);
        }

        // --- ROGUE MID-BATTLE DROP ---
        let rogueRate = 0.05;
        if (options.isCrit) rogueRate += 0.05;
        if (options.eff > 1) rogueRate += 0.05;
        if (enemy.isLucky) rogueRate = 0.5;

        if (RNG.roll(rogueRate)) {
            const key = this.rollForRogueItem(enemy, Game.wins);
            await Game.addRogueItem(key);
            Game.party.forEach(mon => StatCalc.recalculate(mon));

            AudioEngine.playSfx('funfair');
            await DialogManager.show(`Nice! You snagged a\n${ITEMS[key].name}!`, { lock: true, skipWait: true });
            await UI.showRogueBoostStats(key);
        }
    },

    /**
     * Determines if a pocket roll succeeds based on enemy type and difficulty.
     */
    shouldDropForPocket(pocket, enemy, levelDiff) {
        // Use pocket specific rates from LOOT_SYSTEM, fallback to 0.1
        let rate = (LOOT_SYSTEM.POCKET_RATES && LOOT_SYSTEM.POCKET_RATES[pocket])
            ? LOOT_SYSTEM.POCKET_RATES[pocket]
            : 0.1;

        // Apply multipliers for special encounters
        if (enemy.isBoss) {
            rate *= (LOOT_SYSTEM.BOSS_MULTIPLIER || 2.0);
        } else if (enemy.isLucky) {
            rate *= (LOOT_SYSTEM.LUCKY_MULTIPLIER || 1.5);
        }

        // Difficulty scaling: Rewards for fighting higher level mons
        if (levelDiff > 0) rate += (levelDiff * 0.02);

        return RNG.roll(rate);
    },

    /**
     * Selects an item from the global TABLE, filtered by pocket and weighted by rarity/BST.
     */
    rollForItemInPocket(pocket, enemy, wins, levelDiff) {
        const bst = Object.values(enemy.baseStats).reduce((a, b) => a + b, 0);

        // Rarity Scaling (Targeting "Peak" loot around 80-100 wins)
        // BST now has a much stronger modifier as requested
        let score = (enemy.level * 1.0) + (wins * 2.2) + (bst / 5);

        // Special Encounter Modifiers
        if (enemy.isBoss) score += 100;
        if (enemy.isLucky) score += 200; // Lucky Pokemon are the best source of rare items

        // Difficulty bonus
        score += (Math.max(0, levelDiff) * 30);

        // Filter the table for items belonging to this pocket
        const validItems = LOOT_SYSTEM.TABLE.filter(entry => {
            const itemData = ITEMS[entry.key];
            return itemData && itemData.pocket === pocket;
        });

        if (validItems.length === 0) return null;

        // Calculate weights based on RARITY constants and current score
        let totalWeight = 0;
        const pool = validItems.map(item => {
            let weight = Math.max(0.1, item.base + (score * item.scaling));
            totalWeight += weight;
            return { key: item.key, weight: weight };
        });

        // Weighted random selection
        let random = Math.random() * totalWeight;
        for (let item of pool) {
            if (random < item.weight) return item.key;
            random -= item.weight;
        }

        return validItems[0].key; // Fallback to first item
    },

    /**
     * Handles the separate Rogue item drop sequence.
     */
    async processRogueDrops(enemy) {
        let rogueRate = (ROGUE_LOOT && ROGUE_LOOT.DROP_RATE_BASE) ? ROGUE_LOOT.DROP_RATE_BASE : 0.35;
        if (enemy.isBoss) rogueRate += (ROGUE_LOOT && ROGUE_LOOT.DROP_RATE_BOSS_BONUS) ? ROGUE_LOOT.DROP_RATE_BOSS_BONUS : 0.50;

        if (RNG.roll(rogueRate)) {
            const key = this.rollForRogueItem(enemy, Game.wins);
            await Game.addRogueItem(key);

            // Recalculate stats immediately to apply passive boosts
            Game.party.forEach(mon => StatCalc.recalculate(mon));

            AudioEngine.playSfx('funfair');
            await DialogManager.show(`Lucky! You found a\n${ITEMS[key].name}!`, { lock: true, skipWait: true });

            // Show the stat box (like level up) with highlighting for the new item
            await UI.showRogueBoostStats(key);

            // Multi-drop for Bosses
            if (enemy.isBoss && RNG.roll(0.5)) {
                const key2 = this.rollForRogueItem(enemy, Game.wins);
                await Game.addRogueItem(key2);
                Game.party.forEach(mon => StatCalc.recalculate(mon));
                await DialogManager.show(`And another one!\nFound ${ITEMS[key2].name}!`, { lock: true, skipWait: true });
                await UI.showRogueBoostStats(key2);
            }
        }
    },

    /**
     * Weighted roll for Rogue items from ROGUE_LOOT.TABLE
     */
    /**
     * Weighted roll for Rogue items from ROGUE_LOOT.TABLE
     * Rarity scales based on wins and enemy strength.
     */
    rollForRogueItem(enemy, wins) {
        if (!ROGUE_LOOT || !ROGUE_LOOT.TABLE) return 'rogue_attack';

        const bst = Object.values(enemy.baseStats).reduce((a, b) => a + b, 0);
        // Similar scaling score as standard loot
        let score = (enemy.level * 0.5) + (wins * 1.5) + (bst / 10);
        if (enemy.isBoss) score += 50;
        if (enemy.isLucky) score += 100;

        // Dynamic weights: Rare rogue items (Lens, Charms) scale up with score
        const pool = ROGUE_LOOT.TABLE.map(item => {
            let weight = item.weight;
            // Items with weight < 50 are "Rare" rogue items (Lens, Charms)
            // We increase their relative weight as the player progresses
            if (weight < 50) {
                weight += (score * 0.5); // Boost rare items significantly
            }
            return { key: item.key, weight: Math.max(1, weight) };
        });

        const totalWeight = pool.reduce((sum, item) => sum + item.weight, 0);
        let random = Math.random() * totalWeight;

        for (let item of pool) {
            if (random < item.weight) return item.key;
            random -= item.weight;
        }
        return 'rogue_attack';
    },

    /**
     * Internal helper to handle inventory addition and UI notifications in groups.
     */
    async awardItems(keys, enemyName, isMidBattle) {
        // First add all to inventory and check tutorials
        for (const key of keys) {
            if (!ITEMS[key]) continue;
            Game.inventory[key] = (Game.inventory[key] || 0) + 1;
            if (typeof TutorialManager !== 'undefined') {
                await TutorialManager.checkTutorial(key);
            }
        }

        // Individual notifications
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (!ITEMS[key]) continue;

            const name = ITEMS[key].name;
            let msg = i === 0
                ? `Oh! ${enemyName} dropped\na ${name}.`
                : `And a ${name}!`;

            // Visuals and SFX
            AudioEngine.playSfx(isMidBattle ? 'catch_success' : 'funfair');

            if (isMidBattle) {
                await UI.typeText(msg);
            } else {
                await DialogManager.show(msg, { lock: true });
            }
        }
    }
};
