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
    typeText(text, cb, fast = false, targetId = 'text-content') {
        const el = document.getElementById(targetId);
        if (!el) return Promise.resolve();

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
                const char = text.charAt(i);
                if (char === '\n') el.innerHTML += '<br>'; else el.innerHTML += char;
                i++;
                if (i >= text.length) {
                    clearInterval(this.typeInterval);
                    setTimeout(() => {
                        if (cb && typeof cb === 'function') cb();
                        resolve();
                    }, 1000); // Wait 1s after finishing
                }
            }, fast ? 10 : 20);
        });
    },

    resetText(text, targetId = 'text-content') {
        const el = document.getElementById(targetId);
        if (el) el.innerHTML = text.replace(/\n/g, '<br>');
    },

    // --- HUD & PROGRESS ---
    updateHUD(mon, side) {
        const nameEl = document.getElementById(`${side}-name`);
        if (mon.name.startsWith("BOSS ")) nameEl.innerHTML = mon.name.replace("BOSS ", "BOSS<br>");
        else nameEl.innerText = mon.name;

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

        const pct = (Math.max(0, mon.currentHp) / mon.maxHp) * 100;
        const bar = document.getElementById(`${side}-hp-bar`);
        bar.style.width = Math.max(0, pct) + "%";
        bar.style.backgroundColor = pct > 50 ? "var(--hp-green)" : pct > 20 ? "var(--hp-yellow)" : "var(--hp-red)";

        if (side === 'player') {
            document.getElementById('player-hp-text').innerText = `${Math.floor(Math.max(0, mon.currentHp))}/${mon.maxHp}`;
            const expPct = (mon.exp / mon.nextLvlExp) * 100;
            document.getElementById('player-exp-bar').style.width = Math.min(100, expPct) + "%";
        }
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
    }
};
