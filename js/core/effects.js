const EffectsManager = {
    // Helper: Convert PokeAPI ailment names to short codes
    normalizeAilment(ailment) {
        const ailmentMap = {
            'paralysis': 'par',
            'burn': 'brn',
            'poison': 'psn',
            'freeze': 'frz',
            'sleep': 'slp',
            'confusion': 'confusion'
        };
        return ailmentMap[ailment] || ailment;
    },

    // 1. Check if Pokemon can move (Flinch, Sleep, Freeze, Para, Confusion)
    async checkCanMove(battle, mon, isPlayer) {
        // 0. FLINCH (Volatile - resets immediately)
        if (mon.volatiles.flinch) {
            mon.volatiles.flinch = false;
            await UI.typeText(`${mon.name} flinched!`);
            return false;
        }

        // 1. FREEZE
        if (mon.status === 'frz') {
            if (Math.random() < 0.2) {
                mon.status = null;
                UI.updateHUD(mon, isPlayer ? 'player' : 'enemy');
                await UI.typeText(`${mon.name} thawed out!`);
                return true;
            }
            const sprite = isPlayer ? document.getElementById('player-sprite') : document.getElementById('enemy-sprite');
            sprite.classList.add('status-anim-frz');
            AudioEngine.playSfx('ice');
            await wait(600);
            sprite.classList.remove('status-anim-frz');
            await UI.typeText(`${mon.name} is\nfrozen solid!`);
            return false;
        }

        // 2. SLEEP
        if (mon.status === 'slp') {
            // Allows moves like Snore or Sleep Talk to skip the sleep check
            const currentMove = mon.lastMoveUsed;
            if (currentMove && ['SNORE', 'SLEEP TALK'].includes(currentMove.name)) {
                return true;
            }

            mon.volatiles.sleepTurns = (mon.volatiles.sleepTurns || Math.floor(Math.random() * 3) + 1) - 1;
            if (mon.volatiles.sleepTurns <= 0) {
                mon.status = null;
                UI.updateHUD(mon, isPlayer ? 'player' : 'enemy');
                await UI.typeText(`${mon.name} woke up!`);
                return true;
            }
            const sprite = isPlayer ? document.getElementById('player-sprite') : document.getElementById('enemy-sprite');
            sprite.classList.add('status-anim-slp');
            AudioEngine.playSfx('sleep');
            await wait(600);
            sprite.classList.remove('status-anim-slp');
            await UI.typeText(`${mon.name} is\nfast asleep!`);
            return false;
        }

        // 3. PARALYSIS
        if (mon.status === 'par' && Math.random() < 0.25) {
            const sprite = isPlayer ? document.getElementById('player-sprite') : document.getElementById('enemy-sprite');
            sprite.classList.add('status-anim-par');
            AudioEngine.playSfx('electric');
            await wait(600);
            sprite.classList.remove('status-anim-par');
            await UI.typeText(`${mon.name} is paralyzed!\nIt can't move!`);
            return false;
        }

        // 4. CONFUSION
        if (mon.volatiles.confused > 0) {
            mon.volatiles.confused--;
            if (mon.volatiles.confused === 0) {
                UI.updateHUD(mon, isPlayer ? 'player' : 'enemy');
                await UI.typeText(`${mon.name} snapped\nout of confusion!`);
                return true;
            }

            await UI.typeText(`${mon.name} is\nconfused!`);

            // Play confusion animation
            const ctx = { attacker: isPlayer ? battle.e : battle.p, defender: mon, isPlayerAttacker: !isPlayer };
            await AnimFramework.play('confused', ctx);

            // 33% chance to hit self
            if (Math.random() < 0.33) {
                await UI.typeText("It hurt itself in\nits confusion!");

                // Standard Gen 2 Confusion Damage Formula (Power 40)
                const dmg = Math.floor((((2 * mon.level / 5 + 2) * 40 * mon.stats.atk / mon.stats.def) / 50) + 2);

                // USE HELPER: This handles sound, shake, HP update, and HUD flash
                await battle.applyDamage(mon, dmg, 'normal');

                return false;
            }
        }

        return true;
    },

    // 2. Apply Stat Changes (Buffs/Debuffs)
    async applyStatChanges(battle, target, changes, isPlayer) {
        const sprite = isPlayer ? document.getElementById('player-sprite') : document.getElementById('enemy-sprite');

        // Substitute blocks NEGATIVE stat changes from sources other than self.
        const hasSub = target.volatiles.substituteHP > 0;

        for (let c of changes) {
            if (hasSub && c.change < 0) {
                await UI.typeText(`${target.name} is protected\nby the SUBSTITUTE!`);
                continue;
            }

            const stat = c.stat.name.replace('special-attack', 'spa').replace('special-defense', 'spd').replace('attack', 'atk').replace('defense', 'def').replace('speed', 'spe');
            const change = c.change;

            if (target.stages[stat] === 6 && change > 0) {
                await UI.typeText(`${target.name}'s ${stat.toUpperCase()}\nwon't go higher!`);
                continue;
            }
            if (target.stages[stat] === -6 && change < 0) {
                await UI.typeText(`${target.name}'s ${stat.toUpperCase()}\nwon't go lower!`);
                continue;
            }

            target.stages[stat] = Math.min(6, Math.max(-6, target.stages[stat] + change));

            // Comprehensive Logging
            if (typeof BattleLogger !== 'undefined' && BattleLogger.enabled) {
                BattleLogger.logStatChange(target, stat, change, isPlayer);
            }

            const dir = change > 0 ? "rose!" : "fell!";
            const deg = Math.abs(change) > 1 ? "sharply " : "";
            const animClass = change > 0 ? 'anim-stat-up' : 'anim-stat-down';

            sprite.classList.add(animClass);
            if (change > 0) AudioEngine.playSfx('stat_up');
            else AudioEngine.playSfx('stat_down');

            await wait(800);
            sprite.classList.remove(animClass);

            await UI.typeText(`${target.name}'s ${stat.toUpperCase()}\n${deg}${dir}`);
        }
    },

    // 3. Apply Status Ailment
    async applyStatus(battle, target, ailment, isPlayerTarget) {
        // Normalize ailment name (convert PokeAPI names to short codes)
        ailment = this.normalizeAilment(ailment);

        if (target.volatiles.substituteHP > 0 && ailment !== 'confusion') {
            await UI.typeText("But it failed!");
            return false;
        }

        if (ailment === 'confusion') {
            if (target.volatiles.confused) {
                await UI.typeText(`${target.name} is\nalready confused!`);
                return false;
            }
            const ctx = { attacker: isPlayerTarget ? battle.p : battle.e, defender: target, isPlayerAttacker: !isPlayerTarget };
            await AnimFramework.play('confused', ctx);

            target.volatiles.confused = Math.floor(Math.random() * 4) + 2;
            await UI.typeText(`${target.name} became\nconfused!`);
            return true;
        }

        // Check if already has a status (fail silently - move will show "But it failed!")
        if (target.status) {
            return false;
        }

        // Immunity Checks
        const typeMatch = ((ailment === 'psn' || ailment === 'tox') && (target.types.includes('poison') || target.types.includes('steel'))) ||
            (ailment === 'brn' && target.types.includes('fire')) ||
            (ailment === 'par' && target.types.includes('electric')) ||
            (ailment === 'frz' && target.types.includes('ice'));

        if (typeMatch) {
            await UI.typeText("It doesn't affect\n" + target.name + "...");
            return 'IMMUNE';
        }

        target.status = ailment;
        if (ailment === 'tox') {
            target.volatiles.toxicCounter = 1;
        }
        UI.updateHUD(target, isPlayerTarget ? 'player' : 'enemy');

        // Sprite Flash & Sound
        const sprite = isPlayerTarget ? document.getElementById('player-sprite') : document.getElementById('enemy-sprite');
        const animClass = `status-anim-${ailment === 'tox' ? 'psn' : ailment}`;
        const sfxMap = { 'par': 'electric', 'psn': 'poison', 'tox': 'poison', 'brn': 'burn', 'frz': 'ice', 'slp': 'sleep' };

        if (animClass) sprite.classList.add(animClass);
        AudioEngine.playSfx(sfxMap[ailment] || 'damage');
        await wait(600);
        if (animClass) sprite.classList.remove(animClass);

        const msg = STATUS_DATA[ailment].applyMsg || STATUS_DATA[ailment].msg || 'was affected!';
        await UI.typeText(`${target.name} ${msg}`);

        if (ailment === 'slp') {
            target.volatiles.sleepTurns = Math.floor(Math.random() * 3) + 3;
        }

        return true;
    },

    // 4. End of Turn Status Ticks
    async processEndTurnStatus(battle, mon, isPlayer) {
        if (mon.currentHp <= 0) return;
        const isInvisible = !!mon.volatiles.invulnerable;

        // Safety: Clear invalid status values (e.g. 'confusion' which should be volatile)
        if (mon.status && !STATUS_DATA[mon.status]) {
            console.warn(`Invalid status '${mon.status}' on ${mon.name}, clearing...`);
            mon.status = null;
            UI.updateHUD(mon, isPlayer ? 'player' : 'enemy');
            return;
        }

        // A. STATUS DAMAGE (Burn/Poison/Toxic)
        if (mon.status === 'brn' || mon.status === 'psn' || mon.status === 'tox') {
            await wait(400);
            if (!isInvisible) {
                const animClass = mon.status === 'brn' ? 'status-anim-brn' : 'status-anim-psn';
                const sprite = isPlayer ? document.getElementById('player-sprite') : document.getElementById('enemy-sprite');
                sprite.classList.add(animClass);
                AudioEngine.playSfx(mon.status === 'brn' ? 'burn' : 'poison');
                await wait(600);
                sprite.classList.remove(animClass);
            }
            const tickMsg = STATUS_DATA[mon.status].tickMsg || STATUS_DATA[mon.status].msg || 'is affected!';
            await UI.typeText(`${mon.name} ${tickMsg}`);

            let dmg;
            if (mon.status === 'tox') {
                const n = mon.volatiles.toxicCounter || 1;
                dmg = Math.floor((mon.maxHp / 16) * n);
                mon.volatiles.toxicCounter++;
            } else {
                dmg = Math.floor(mon.maxHp / 8);
            }

            await battle.applyDamage(mon, Math.max(1, dmg), mon.status === 'brn' ? 'burn' : 'poison');
            if (mon.currentHp <= 0) return;
        }

        // B. PERISH SONG
        if (mon.volatiles.perishCount !== undefined) {
            // Trigger Visuals
            const ctx = { defender: mon, isPlayerAttacker: (mon !== battle.p) };
            if (AnimFramework.has('tick-perish-song')) {
                await AnimFramework.play('tick-perish-song', ctx);
            }

            mon.volatiles.perishCount--;
            await UI.typeText(`${mon.name}'s perish count\nfell to ${mon.volatiles.perishCount}!`);
            if (mon.volatiles.perishCount <= 0) {
                delete mon.volatiles.perishCount;
                await battle.applyDamage(mon, mon.maxHp, 'normal');
                if (mon.currentHp <= 0) return;
            }
        }

        // C. CURSE
        if (mon.volatiles.cursed) {
            // Trigger Visuals
            const ctx = { defender: mon, isPlayerAttacker: (mon !== battle.p) };
            if (AnimFramework.has('tick-curse')) {
                await AnimFramework.play('tick-curse', ctx);
            }

            await UI.typeText(`${mon.name} is afflicted\nby the CURSE!`);
            const dmg = Math.floor(mon.maxHp / 4);
            await battle.applyDamage(mon, Math.max(1, dmg), 'poison');
            if (mon.currentHp <= 0) return;
        }

        // D. TRAPPED (Bind, Wrap, Fire Spin, Whirlpool, Clamp)
        if (mon.volatiles.trapped) {
            await wait(400);
            const trap = mon.volatiles.trapped;
            await UI.typeText(`${mon.name} is hurt by\n${trap.moveName}!`);
            const dmg = Math.floor(mon.maxHp / 16);
            await battle.applyDamage(mon, Math.max(1, dmg), 'normal');

            trap.turns--;
            if (trap.turns <= 0) {
                delete mon.volatiles.trapped;
                await UI.typeText(`${mon.name} was freed\nfrom ${trap.moveName}!`);
            }
            if (mon.currentHp <= 0) return;
        }

        // E. LEECH SEED
        if (mon.volatiles.seeded) {
            // Trigger Visuals
            const ctx = { defender: mon, isPlayerAttacker: (mon !== battle.p) };
            if (AnimFramework.has('tick-leech-seed')) {
                await AnimFramework.play('tick-leech-seed', ctx);
            }

            const dmg = Math.floor(mon.maxHp / 8);
            await UI.typeText(`${mon.name}'s health\nis sapped by LEECH SEED!`);
            await battle.applyDamage(mon, Math.max(1, dmg), 'grass');

            // Heal the source (if still alive)
            const source = mon.volatiles.seeded.source === 'player' ? battle.p : battle.e;
            if (source && source.currentHp > 0 && source.currentHp < source.maxHp) {
                await battle.applyHeal(source, Math.max(1, dmg), null);
            }

            if (mon.currentHp <= 0) return;
        }

        // F. DISABLE
        if (mon.volatiles.disabled) {
            mon.volatiles.disabled.turns--;
            if (mon.volatiles.disabled.turns <= 0) {
                const moveName = mon.volatiles.disabled.moveName;
                delete mon.volatiles.disabled;
                await UI.typeText(`${mon.name}'s ${moveName}\nis no longer disabled!`);
            }
        }

        // G. DROWSY (Yawn)
        if (mon.volatiles.drowsy !== undefined) {
            mon.volatiles.drowsy--;
            if (mon.volatiles.drowsy <= 0) {
                delete mon.volatiles.drowsy;
                await this.applyStatus(battle, mon, 'slp', isPlayer);
            } else {
                await UI.typeText(`${mon.name} is\ngetting drowsy!`);
            }
        }

        // H. ENCORE
        if (mon.volatiles.encored) {
            mon.volatiles.encored.turns--;
            if (mon.volatiles.encored.turns <= 0) {
                delete mon.volatiles.encored;
                await UI.typeText(`${mon.name}'s ENCORE\nended!`);
            }
        }
    }
};
