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

        // 3. Simple Logic (Random for now, but modularized for smarter AI later)
        // Future: Filter out useless moves, prioritize super-effective, etc.
        const moves = enemy.moves;

        // Basic Logic: If we have a lot of moves, maybe avoid repeating a non-damaging move twice in a row?
        // For now, keeping it random to match original behavior but making it easy to extend.
        return moves[Math.floor(Math.random() * moves.length)];
    }
};
