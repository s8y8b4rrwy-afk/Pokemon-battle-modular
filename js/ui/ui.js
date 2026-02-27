const UI = {
    get textEl() { return document.getElementById('text-content'); },
    typeInterval: null,

    // --- UTILS ---
    forceReflow(el) { void el.offsetWidth; },

    // --- SCREEN MANAGEMENT ---
    show(idOrEl) {
        const el = typeof idOrEl === 'string' ? document.getElementById(idOrEl) : idOrEl;
        if (el) el.classList.remove('hidden');
    },
    hide(idOrEl) {
        const el = typeof idOrEl === 'string' ? document.getElementById(idOrEl) : idOrEl;
        if (el) el.classList.add('hidden');
    },
    showAll(ids) { ids.forEach(id => this.show(id)); },
    hideAll(ids) { ids.forEach(id => this.hide(id)); },

    // --- TEXT ENGINE ---
    typeText(text, cb, fast = false, targetId = 'text-content', delay = -1) {
        const el = document.getElementById(targetId);
        if (!el) return Promise.resolve();

        // Standard battle delay is 1000ms unless overridden
        let postDelay = delay;
        if (postDelay === -1) {
            postDelay = (targetId === 'text-content' && !fast) ? 1000 : 0;
        }

        // Modular Battle Logging (only log main battle text)
        if (targetId === 'text-content' && typeof BattleLogger !== 'undefined') {
            BattleLogger.enabled = DEBUG.BATTLE_LOGS;
            BattleLogger.battle(text.replace(/\n/g, ' '));
        }

        return new Promise(resolve => {
            clearInterval(this.typeInterval);
            el.innerHTML = "";

            // Layout adjustment (only for main dialog box)
            if (targetId === 'text-content') {
                if (document.getElementById('action-menu').classList.contains('hidden')) el.classList.add('full-width');
                else el.classList.remove('full-width');
            }

            let i = 0;
            this.typeInterval = setInterval(() => {
                // Handle HTML tags (don't type them char-by-char)
                while (text.charAt(i) === '<') {
                    const endOfTag = text.indexOf('>', i);
                    if (endOfTag === -1) break;
                    const tag = text.substring(i, endOfTag + 1);
                    el.innerHTML += tag;
                    i = endOfTag + 1;
                }

                if (i >= text.length) {
                    clearInterval(this.typeInterval);
                    setTimeout(() => {
                        if (cb && typeof cb === 'function') cb();
                        resolve();
                    }, postDelay);
                    return;
                }

                const char = text.charAt(i);
                if (char === '\n') el.innerHTML += '<br>';
                else el.innerHTML += char;

                i++;
                if (i >= text.length) {
                    clearInterval(this.typeInterval);
                    setTimeout(() => {
                        if (cb && typeof cb === 'function') cb();
                        resolve();
                    }, postDelay);
                }
            }, (fast || GLOBAL_SETTINGS.TEXT_SPEED >= 1) ? 8 : 16);

            // Instant typing support
            if (GLOBAL_SETTINGS.TEXT_SPEED === 2) {
                clearInterval(this.typeInterval);
                el.innerHTML = text.replace(/\n/g, '<br>');
                setTimeout(() => {
                    if (cb && typeof cb === 'function') cb();
                    resolve();
                }, postDelay);
            }
        });
    },

    resetText(text, targetId = 'text-content') {
        const el = document.getElementById(targetId);
        if (el) el.innerHTML = text.replace(/\n/g, '<br>');
    },

    // --- HUD & PROGRESS ---
    updateHUD(mon, side) {
        const nameEl = document.getElementById(`${side}-name`);
        if (mon.name.startsWith("BOSS ")) {
            nameEl.innerHTML = mon.name.replace("BOSS ", '<span class="boss-name-tag">BOSS</span><br>');
        } else if (mon.name.startsWith("LUCKY ")) {
            nameEl.innerHTML = mon.name.replace("LUCKY ", '<span class="lucky-name-tag">LUCKY</span><br>');
        } else {
            nameEl.innerText = mon.name;
        }

        document.getElementById(`${side}-lvl`).innerText = `Lv${mon.level}`;

        const statusEl = document.getElementById(`${side}-status-icon`);
        if (mon.status && STATUS_DATA[mon.status]) {
            statusEl.innerText = STATUS_DATA[mon.status].name;
            statusEl.style.color = STATUS_DATA[mon.status].color;
            statusEl.style.display = "inline-block";
        } else {
            statusEl.style.display = "none";
        }

        const rageEl = document.getElementById(`${side}-rage-icon`);
        rageEl.className = 'aggro-icon';
        if (mon.rageLevel > 0) {
            if (mon.rageLevel === 1) { rageEl.innerText = '!'; rageEl.classList.add('aggro-1'); }
            else if (mon.rageLevel === 2) { rageEl.innerText = '!!'; rageEl.classList.add('aggro-2'); }
            else if (mon.rageLevel >= 3) { rageEl.innerText = '💢'; rageEl.classList.add('aggro-3'); }
            rageEl.style.display = "inline-block";
        } else {
            rageEl.style.display = "none";
        }

        const bar = document.getElementById(`${side}-hp-bar`);
        const pct = (Math.max(0, mon.currentHp) / mon.maxHp) * 100;

        // Instant update for HUD refreshes (Level up, item gain)
        const originalTransition = bar.style.transition;
        bar.style.transition = 'none';
        bar.style.width = Math.max(0, pct) + "%";
        bar.style.backgroundColor = pct > 50 ? "var(--hp-green)" : pct > 20 ? "var(--hp-yellow)" : "var(--hp-red)";
        void bar.offsetWidth;
        bar.style.transition = originalTransition;

        if (side === 'player') {
            document.getElementById('player-hp-text').innerText = `${Math.floor(Math.max(0, mon.currentHp))}/${mon.maxHp}`;
            const expPct = (mon.exp / mon.nextLvlExp) * 100;
            document.getElementById('player-exp-bar').style.width = Math.min(100, expPct) + "%";
        }
    },

    /**
     * Smoothly animate HP change including numbers and bar color.
     */
    async animateHP(mon, side, startHp, endHp) {
        const bar = document.getElementById(`${side}-hp-bar`);
        const text = side === 'player' ? document.getElementById('player-hp-text') : null;

        // Use a capped target for calculations so overkill doesn't hang the animation
        const targetHp = Math.max(0, endHp);
        const hpDelta = Math.abs(targetHp - startHp);
        const hpPct = hpDelta / mon.maxHp;
        const currentZone = targetHp / mon.maxHp;

        // 1. BASE SPEED: Normal hits take ~1.2s for a full bar.
        let baseDuration = ANIM_HUD.HP_BASE_DURATION * hpPct;

        // 2. ZONE MULTIPLIERS
        let zoneMult = 1.0;
        if (currentZone < 0.2) zoneMult = ANIM_HUD.HP_ZONE_RED_MULT;
        else if (currentZone < 0.5) zoneMult = ANIM_HUD.HP_ZONE_ORANGE_MULT;

        // 3. SMALL HIT SLOWDOWN (Requested: < 15% is 4x slower)
        if (hpPct < ANIM_HUD.HP_SMALL_HIT_THRESHOLD) {
            zoneMult *= ANIM_HUD.HP_SMALL_HIT_MULT;
        }

        // 4. THE "CRAWL" PHASE (Requested: Last units take ~1s each)
        const tailUnits = Math.min(hpDelta, ANIM_HUD.HP_TAIL_UNITS);
        const tailDuration = tailUnits * ANIM_HUD.HP_TAIL_MS_PER_UNIT;

        let duration = (baseDuration * zoneMult) + tailDuration;
        duration = Math.max(ANIM_HUD.HP_MIN_DURATION, Math.min(ANIM_HUD.HP_MAX_DURATION, duration));

        const startTime = performance.now();
        const originalTransition = bar.style.transition;
        bar.style.transition = 'none';

        // 5. BALANCED EASING
        // Constant power 4 creates a heavy slowdown without "snapping" to white space.
        const easePower = ANIM_HUD.HP_EASE_POWER;

        return new Promise(resolve => {
            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                let progress = Math.min(elapsed / duration, 1);

                const easedProgress = 1 - Math.pow(1 - progress, easePower);
                const currentVal = startHp + (targetHp - startHp) * easedProgress;
                const displayHp = Math.max(0, Math.floor(currentVal + 0.01)); // Offset to favor target

                const pct = (Math.max(0, currentVal) / mon.maxHp) * 100;
                bar.style.width = pct + "%";
                bar.style.backgroundColor = pct > 50 ? "var(--hp-green)" : pct > 20 ? "var(--hp-yellow)" : "var(--hp-red)";

                if (text) text.innerText = `${displayHp}/${mon.maxHp}`;

                // EARLY RESOLVE: If we are practically at the end or the visual matches, finish.
                const isPracticallyDone = progress > 0.99 || (Math.abs(currentVal - targetHp) < 0.05);

                if (!isPracticallyDone) {
                    requestAnimationFrame(animate);
                } else {
                    mon.currentHp = endHp;
                    bar.style.transition = originalTransition;
                    this.updateHUD(mon, side);
                    resolve();
                }
            };
            requestAnimationFrame(animate);
        });

    },

    /**
     * Smoothly animate XP gain for the player.
     */
    async animateXP(mon, startExp, endExp, levelOffset = 0) {
        const bar = document.getElementById('player-exp-bar');
        const expDelta = endExp - startExp;
        const expPct = expDelta / mon.nextLvlExp;
        let duration = ANIM_HUD.XP_BASE_DURATION * expPct;
        duration = Math.max(ANIM_HUD.XP_MIN_DURATION, Math.min(ANIM_HUD.XP_MAX_DURATION, duration));

        const startTime = performance.now();
        const originalTransition = bar.style.transition;
        bar.style.transition = 'none';

        let lastSoundTime = 0;
        const levelBonus = levelOffset * (ANIM_HUD.XP_LEVEL_PITCH_BONUS || 0);

        return new Promise(resolve => {
            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);

                const easedProgress = 1 - Math.pow(1 - progress, ANIM_HUD.XP_EASE_POWER);

                const currentExp = startExp + (endExp - startExp) * easedProgress;
                const pct = (currentExp / mon.nextLvlExp) * 100;

                bar.style.width = Math.min(100, pct) + "%";

                if (currentTime - lastSoundTime > ANIM_HUD.XP_TICK_RATE) {
                    // Total rise for this specific gain is proportional to the bar fill %
                    const totalRiseForGain = expPct * ANIM_HUD.XP_PITCH_SCALE;
                    const basePitch = ANIM_HUD.XP_PITCH_START + levelBonus;
                    const currentPitch = basePitch + (progress * totalRiseForGain);

                    AudioEngine.playSfx('exp', currentPitch);
                    lastSoundTime = currentTime;
                }

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    bar.style.transition = originalTransition;
                    resolve();
                }
            };
            requestAnimationFrame(animate);
        });
    },


    // --- VISUAL EFFECTS ---
    spawnSmoke(x, y) {
        const count = 12;
        for (let i = 0; i < count; i++) {
            const s = document.createElement('div'); s.className = 'smoke-particle';
            const angle = (i / count) * 2 * Math.PI;
            const velocity = 40 + Math.random() * 15;
            const tx = Math.cos(angle) * velocity;
            const ty = Math.sin(angle) * velocity;
            s.style.left = x + 'px'; s.style.top = y + 'px';
            s.style.setProperty('--tx', tx + 'px'); s.style.setProperty('--ty', ty + 'px');
            document.getElementById('scene').appendChild(s);
            setTimeout(() => s.remove(), 600);
        }
    },

    playSparkle(side) {
        AudioEngine.playSfx('shiny');
        const container = document.getElementById('fx-container');
        const rect = side === 'enemy' ? { x: 239, y: 61 } : { x: 80, y: 130 };
        const spread = side === 'enemy' ? 30 : 60;
        for (let i = 0; i < 5; i++) {
            const star = document.createElement('div');
            star.className = 'shiny-star';
            star.style.left = (rect.x - spread + Math.random() * (spread * 2)) + 'px';
            star.style.top = (rect.y - spread + Math.random() * (spread * 2)) + 'px';
            star.style.animation = `sparkle 0.6s ease-out ${i * 0.15}s forwards`;
            container.appendChild(star);
            setTimeout(() => star.remove(), 1500);
        }
    },

    resetSprite(el) {
        el.classList.remove('anim-faint', 'anim-enter', 'anim-return', 'anim-hit', 'anim-deflect');
        el.style.transform = "scale(1)"; el.style.filter = "none";
        this.forceReflow(el);
        el.style.opacity = 1;
    },

    async showLevelUpStats(p, oldStats) {
        const box = document.getElementById('level-up-box');
        const list = document.getElementById('lu-stats-list');
        const sprite = document.getElementById('lu-poke-sprite');

        if (!box || !list || !sprite) return;

        // Use icon or front sprite (Icon is already the Gen 7+ mini-sprite from PokeAPI)
        const iconSrc = p.icon || p.frontSprite;
        sprite.setAttribute('src', iconSrc);

        const statNames = {
            hp: 'HP',
            atk: 'ATK',
            def: 'DEF',
            spa: 'SP. ATK',
            spd: 'SP. DEF',
            spe: 'SPD'
        };

        const renderStats = (showGain) => {
            list.innerHTML = '';
            for (const [key, label] of Object.entries(statNames)) {
                const row = document.createElement('div');
                row.className = 'lu-stat-row';

                const labelSpan = document.createElement('span');
                labelSpan.className = 'lu-stat-label';
                labelSpan.innerText = label;

                const valuesDiv = document.createElement('div');
                valuesDiv.className = 'lu-stat-values';

                const valSpan = document.createElement('span');
                valSpan.className = 'lu-stat-value';
                valSpan.innerText = showGain ? oldStats[key] : p.stats[key];

                valuesDiv.appendChild(valSpan);

                if (showGain) {
                    const gain = p.stats[key] - oldStats[key];
                    const gainSpan = document.createElement('span');
                    gainSpan.className = 'lu-stat-gain';
                    gainSpan.innerText = `+${gain}`;
                    valuesDiv.appendChild(gainSpan);
                }

                row.appendChild(labelSpan);
                row.appendChild(valuesDiv);
                list.appendChild(row);
            }
        };

        box.classList.remove('hidden');
        renderStats(true);

        // First wait: show old stats + gain
        await DialogManager.waitForInput(null);

        // Second phase: update to new totals
        renderStats(false);

        // Second wait: show new totals
        await DialogManager.waitForInput(null);

        box.classList.add('hidden');
    },

    async showRogueBoostStats(changedKeys = null, isRemoval = false) {
        const box = document.getElementById('rogue-boost-box');
        const list = document.getElementById('rb-stats-list');

        if (!box || !list) return;

        // Normalize changedKeys to an array
        const keysArr = Array.isArray(changedKeys) ? changedKeys : (changedKeys ? [changedKeys] : []);

        const rogueItems = [
            { key: 'rogue_attack', label: 'ATK', type: 'stat' },
            { key: 'rogue_defense', label: 'DEF', type: 'stat' },
            { key: 'rogue_sp_attack', label: 'SP. ATK', type: 'stat' },
            { key: 'rogue_sp_defense', label: 'SP. DEF', type: 'stat' },
            { key: 'rogue_speed', label: 'SPD', type: 'stat' },
            { key: 'rogue_hp', label: 'HP', type: 'stat' },
            { key: 'rogue_crit', label: 'CRIT', type: 'crit' },
            { key: 'rogue_xp', label: 'XP', type: 'xp' },
            { key: 'rogue_shiny', label: 'SHINY', type: 'shiny' }
        ];

        const getPctPerStack = (type) => {
            if (type === 'stat') return ROGUE_CONFIG.STAT_BOOST_PER_STACK * 100;
            if (type === 'crit') return ROGUE_CONFIG.CRIT_BOOST_PER_STACK * 100;
            if (type === 'xp') return ROGUE_CONFIG.XP_BOOST_PER_STACK * 100;
            if (type === 'shiny') return ROGUE_CONFIG.SHINY_BOOST_PER_STACK * 100;
            return 0;
        };

        const renderStats = (showDelta) => {
            list.innerHTML = '';
            let hasAny = false;

            for (const item of rogueItems) {
                const count = Game.inventory[item.key] || 0;
                const isChanged = keysArr.includes(item.key);

                // Delta logic
                let displayCount = count;
                let delta = 0;

                if (isChanged) {
                    delta = isRemoval ? -1 : 1;
                    if (showDelta) displayCount = count - delta;
                }

                // Visibility: Show if we have some or are getting/losing some
                if (displayCount === 0 && delta === 0) continue;

                hasAny = true;

                const pctPerStack = getPctPerStack(item.type);
                const displayPct = displayCount * pctPerStack;

                const row = document.createElement('div');
                row.className = 'lu-stat-row';

                const labelSpan = document.createElement('span');
                labelSpan.className = 'lu-stat-label';
                labelSpan.innerText = item.label;

                const valuesDiv = document.createElement('div');
                valuesDiv.className = 'lu-stat-values';

                const countSpan = document.createElement('span');
                countSpan.className = 'lu-stat-value';
                countSpan.innerText = `x${displayCount}`;

                valuesDiv.appendChild(countSpan);

                const gainSpan = document.createElement('span');
                gainSpan.className = 'lu-stat-gain';

                if (showDelta && delta !== 0) {
                    // Show item delta (+1/-1)
                    const sign = delta > 0 ? '+' : '';
                    gainSpan.innerText = `${sign}${delta}`;
                    gainSpan.classList.add(delta > 0 ? 'rogue-gain' : 'rogue-loss');
                } else {
                    // Show total percentage
                    gainSpan.innerText = `+${displayPct.toFixed(displayPct >= 1 ? 0 : 1)}%`;

                    // Highlight color ONLY if this specific stat changed in this event
                    if (isChanged) {
                        gainSpan.classList.add(isRemoval ? 'rogue-loss' : 'rogue-gain');
                    }
                }

                valuesDiv.appendChild(gainSpan);
                row.appendChild(labelSpan);
                row.appendChild(valuesDiv);
                list.appendChild(row);
            }
            return hasAny;
        };

        // Stage 1: Show Old + Delta
        if (!renderStats(true)) return;
        box.classList.remove('hidden');
        await DialogManager.waitForInput(null);

        // Stage 2: Show New Totals
        renderStats(false);
        await DialogManager.waitForInput(null);

        box.classList.add('hidden');
    }
};
