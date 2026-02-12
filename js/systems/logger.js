/**
 * BattleLogger - Modular Console Logging System
 * Provides comprehensive, styled battle logs in the console.
 */
const BattleLogger = {
    enabled: true, // Can be toggled via DEBUG.BATTLE_LOGS

    // --- LOG TYPES ---
    log(msg, type = 'info') {
        if (!this.enabled) return;

        const styles = this.getStyles(type);
        const timestamp = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

        console.log(`%c[${timestamp}] %c${msg}`, 'color: #888;', styles);
    },

    battle(msg) { this.log(msg, 'battle'); },
    action(msg, isPlayer = true) { this.log(msg, isPlayer ? 'player' : 'enemy'); },
    damage(msg) { this.log(msg, 'damage'); },
    stat(msg) { this.log(msg, 'stat'); },
    status(msg) { this.log(msg, 'status'); },
    system(msg) { this.log(msg, 'system'); },

    // --- STYLING ---
    getStyles(type) {
        const base = 'font-weight: bold; padding: 2px 4px; border-radius: 3px;';
        switch (type) {
            case 'battle': return `${base} color: #fff; background: #333;`;
            case 'player': return `${base} color: #fff; background: #2196F3;`;
            case 'enemy': return `${base} color: #fff; background: #F44336;`;
            case 'damage': return `${base} color: #fff; background: #FF9800;`;
            case 'stat': return `${base} color: #fff; background: #4CAF50;`;
            case 'status': return `${base} color: #fff; background: #9C27B0;`;
            case 'system': return `${base} color: #607D8B; font-style: italic;`;
            default: return `${base} color: #000;`;
        }
    },

    // --- COMPREHENSIVE HELPERS ---
    logMove(attacker, move, isPlayer) {
        const side = isPlayer ? 'Player' : 'Enemy';
        this.action(`${side}'s ${attacker.name} used ${move.name.toUpperCase()}!`, isPlayer);
    },

    logDamage(target, amount, isPlayer, details = '') {
        const side = isPlayer ? 'Player' : 'Enemy';
        this.damage(`${side}'s ${target.name} took ${Math.floor(amount)} damage! ${details}`);
    },

    logStatChange(target, stat, levels, isPlayer) {
        const side = isPlayer ? 'Player' : 'Enemy';
        const direction = levels > 0 ? 'rose' : 'fell';
        const absoluteLevels = Math.abs(levels);
        const levelText = absoluteLevels > 1 ? ` sharply` : '';
        this.stat(`${side}'s ${target.name}'s ${stat.toUpperCase()} ${direction}${levelText}!`);
    }
};
