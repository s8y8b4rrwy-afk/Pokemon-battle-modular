const BattleAI = {
    /**
     * Decisions which move the enemy should use.
     * @param {Object} enemy - The enemy Pokemon instance.
     * @param {Object} player - The player Pokemon instance.
     * @returns {Object} The chosen move.
     */
    chooseMove(enemy, player) {
        // 1. Forced Actions (Recharging/Charging)
        if (enemy.volatiles.recharging) {
            return { name: "Recharging", priority: 0 };
        }
        if (enemy.volatiles.charging && enemy.volatiles.queuedMove) {
            return enemy.volatiles.queuedMove;
        }
        if (enemy.volatiles.encored) {
            return enemy.volatiles.encored.move;
        }

        // 2. Base Move Selection
        if (!enemy.moves || enemy.moves.length === 0) {
            return { name: "STRUGGLE", type: "normal", power: 50, accuracy: 100, priority: 0 };
        }

        // 3. Filter Disabled Moves
        let availableMoves = enemy.moves;
        if (enemy.volatiles.disabled) {
            availableMoves = availableMoves.filter(m => m.name !== enemy.volatiles.disabled.moveName);
        }

        // 4. Fallback to Struggle if all moves are disabled
        if (availableMoves.length === 0) {
            return { name: "STRUGGLE", type: "normal", power: 50, accuracy: 100, priority: 0 };
        }

        // 5. Simple Logic (Random for now, but modularized for smarter AI later)
        // Future: Filter out useless moves, prioritize super-effective, etc.
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }
};
