const UIManager = {
    typeInterval: null,
    forceReflow(el) { void el.offsetWidth; },

    // --- TEXT ENGINE ---
    typeText(text, elId = 'text-content', fast = false) {
        return new Promise(resolve => {
            const el = document.getElementById(elId);
            if (!el) return resolve();

            clearInterval(this.typeInterval);
            el.innerHTML = "";

            // Layout Adjustments
            if (document.getElementById('action-menu').classList.contains('hidden')) el.classList.add('full-width');
            else el.classList.remove('full-width');

            let i = 0;
            this.typeInterval = setInterval(() => {
                const char = text.charAt(i);
                if (char === '\n') el.innerHTML += '<br>'; else el.innerHTML += char;
                i++;
                if (i >= text.length) {
                    clearInterval(this.typeInterval);
                    setTimeout(resolve, 1000);
                }
            }, fast ? 10 : 20);
        });
    },

    clearText(elId = 'text-content') {
        clearInterval(this.typeInterval);
        document.getElementById(elId).innerHTML = "";
    },

    // --- HUD & PROGRESS BARS ---
    updateHUD(mon, side) {
        const nameEl = document.getElementById(`${side}-name`);
        if (mon.name.startsWith("BOSS ")) nameEl.innerHTML = mon.name.replace("BOSS ", "BOSS<br>");
        else nameEl.innerText = mon.name;

        document.getElementById(`${side}-lvl`).innerText = `Lv${mon.level}`;

        // Status
        const statusEl = document.getElementById(`${side}-status-icon`);
        if (mon.status && STATUS_DATA[mon.status]) {
            statusEl.innerText = STATUS_DATA[mon.status].name;
            statusEl.style.color = STATUS_DATA[mon.status].color;
            statusEl.style.display = "inline-block";
        } else {
            statusEl.style.display = "none";
        }

        // Rage
        const rageEl = document.getElementById(`${side}-rage-icon`);
        rageEl.className = 'aggro-icon';
        if (mon.rageLevel > 0) {
            const icons = { 1: '!', 2: '!!', 3: '💢' };
            rageEl.innerText = icons[mon.rageLevel] || '💢';
            rageEl.classList.add(`aggro-${Math.min(3, mon.rageLevel)}`);
            rageEl.style.display = "inline-block";
        } else {
            rageEl.style.display = "none";
        }

        // HP
        const pct = (Math.max(0, mon.currentHp) / mon.maxHp) * 100;
        const bar = document.getElementById(`${side}-hp-bar`);
        bar.style.width = pct + "%";
        bar.style.backgroundColor = pct > 50 ? "var(--hp-green)" : pct > 20 ? "var(--hp-yellow)" : "var(--hp-red)";

        if (side === 'player') {
            document.getElementById('player-hp-text').innerText = `${Math.floor(mon.currentHp)}/${mon.maxHp}`;
            const expPct = (mon.exp / mon.nextLvlExp) * 100;
            document.getElementById('player-exp-bar').style.width = Math.min(100, expPct) + "%";
        }
    },

    // --- ANIMATIONS ---
    spawnSmoke(x, y) {
        const count = 12;
        const scene = document.getElementById('scene');
        for (let i = 0; i < count; i++) {
            const s = document.createElement('div'); s.className = 'smoke-particle';
            const angle = (i / count) * 2 * Math.PI;
            const velocity = 40 + Math.random() * 15;
            const tx = Math.cos(angle) * velocity;
            const ty = Math.sin(angle) * velocity;
            s.style.left = x + 'px'; s.style.top = y + 'px';
            s.style.setProperty('--tx', tx + 'px'); s.style.setProperty('--ty', ty + 'px');
            scene.appendChild(s);
            setTimeout(() => s.remove(), 600);
        }
    },

    async triggerHitAnim(isPlayer, moveType = 'normal', isInvisible = false) {
        const sprite = isPlayer ? document.getElementById('player-sprite') : document.getElementById('enemy-sprite');

        // Audio & Visual SFX handled by caller (AudioEngine) or here?
        // Let's handle Screen Flash here.
        if (['fire', 'water', 'ice', 'grass', 'electric', 'psychic'].includes(moveType)) {
            const scene = document.getElementById('scene');
            scene.classList.remove(`fx-${moveType}`);
            void scene.offsetWidth;
            scene.classList.add(`fx-${moveType}`);
            setTimeout(() => scene.classList.remove(`fx-${moveType}`), 600);
        }

        if (!isInvisible) {
            const isFlipped = sprite.classList.contains('sub-back');
            const hitClass = isFlipped ? 'anim-hit-flipped' : 'anim-hit';
            sprite.classList.remove('anim-hit', 'anim-hit-flipped');
            void sprite.offsetWidth;
            sprite.classList.add(hitClass);
            await wait(400);
            sprite.classList.remove(hitClass);
        } else {
            await wait(200);
        }
    },

    async performVisualSwap(isPlayer, targetSrc, isDoll, x = 60, y = 150) {
        const sprite = isPlayer ? document.getElementById('player-sprite') : document.getElementById('enemy-sprite');
        this.spawnSmoke(x, y);
        sprite.style.opacity = 0;
        await wait(100);
        sprite.src = targetSrc;
        if (isPlayer && isDoll) sprite.classList.add('sub-back');
        else sprite.classList.remove('sub-back');
        sprite.style.opacity = 1;
        sprite.classList.remove('anim-enter');
        void sprite.offsetWidth;
        sprite.classList.add('anim-enter');
        setTimeout(() => sprite.classList.remove('anim-enter'), 600);
        await wait(200);
    },

    // --- SCREEN MANAGEMENT ---
    showScreen(id) { document.getElementById(id).classList.remove('hidden'); },
    hideScreen(id) { document.getElementById(id).classList.add('hidden'); },
    hideAll(ids) { ids.forEach(id => this.hideScreen(id)); },

    // --- DATA RENDERING (Party/Summary) ---
    renderParty(party, activeSlot, onFocus, onClick) {
        const list = document.getElementById('party-list');
        list.innerHTML = "";
        party.forEach((p, i) => {
            const div = document.createElement('div');
            div.className = 'party-slot';
            if (p.currentHp <= 0) div.classList.add('fainted');
            if (i === activeSlot && p.currentHp > 0) div.classList.add('active-mon');
            const pct = (p.currentHp / p.maxHp) * 100;
            const color = pct > 50 ? "#48c050" : pct > 20 ? "#d8b030" : "#c83828";
            div.innerHTML = `<img class="slot-icon" src="${p.icon}"><div class="slot-info"><div class="slot-row"><span>${p.name}</span><span>Lv${p.level}</span></div><div class="slot-row"><div class="mini-hp-bg"><div class="mini-hp-fill" style="width:${pct}%; background:${color}"></div></div><span>${Math.max(0, Math.floor(p.currentHp))}/${p.maxHp}</span></div></div>`;
            div.onmouseenter = () => onFocus(i);
            div.onclick = () => onClick(i);
            list.appendChild(div);
        });
    },

    renderSummary(p) {
        document.getElementById('sum-name').innerText = p.name;
        document.getElementById('sum-name').style.color = p.isShiny ? "#d8b030" : "black";
        document.getElementById('sum-shiny-icon').style.display = p.isShiny ? "block" : "none";
        document.getElementById('sum-sprite-img').src = p.frontSprite;
        document.getElementById('sum-types').innerHTML = p.types.map(t => `<span class="type-tag">${t.toUpperCase()}</span>`).join('');

        const pct = (p.currentHp / p.maxHp) * 100;
        document.getElementById('sum-hp-txt').innerText = `${Math.floor(p.currentHp)}/${p.maxHp}`;
        document.getElementById('sum-hp-bar').style.width = pct + "%";
        document.getElementById('sum-hp-bar').style.backgroundColor = pct > 50 ? "var(--hp-green)" : pct > 20 ? "var(--hp-yellow)" : "var(--hp-red)";

        document.getElementById('sum-exp-txt').innerText = `${p.exp}/${p.nextLvlExp}`;
        document.getElementById('sum-exp-bar').style.width = `${Math.min(100, (p.exp / p.nextLvlExp) * 100)}%`;

        document.getElementById('summary-stats').innerHTML = `
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:4px;">
                <div>ATK ${p.stats.atk}</div><div>DEF ${p.stats.def}</div>
                <div>SPA ${p.stats.spa}</div><div>SPD ${p.stats.spd}</div>
                <div>SPE ${p.stats.spe}</div>
            </div>`;
        document.getElementById('summary-moves').innerHTML = p.moves.map(m => `
            <div class="move-row"><span class="move-name">${m.name}</span><div class="move-info-grp"><span class="move-pwr">PWR ${m.power || '-'}</span><span class="move-type">${m.type.toUpperCase()}</span></div></div>`).join('');
    },

    renderContextMenu(options, onFocus) {
        const ctx = document.getElementById('party-context');
        ctx.classList.remove('hidden');
        ctx.innerHTML = "";
        options.forEach((opt, i) => {
            const b = document.createElement('div');
            b.className = `ctx-btn ${opt.cls || ''}`;
            b.innerText = opt.text;
            b.onclick = opt.fn;
            b.onmouseenter = () => onFocus(i);
            ctx.appendChild(b);
        });
    },

    async triggerRageAnim(cry) {
        const scene = document.getElementById('scene');
        scene.classList.add('anim-violent');
        if (cry) AudioEngine.playCry(cry);
        AudioEngine.playSfx('rumble');
        await wait(500);
        scene.classList.remove('anim-violent');
    },

    resetSprite(el) {
        el.classList.remove('anim-faint', 'anim-enter', 'anim-return', 'anim-hit', 'anim-deflect');
        el.style.transform = "scale(1)"; el.style.filter = "none";
        void el.offsetWidth; el.style.opacity = 1;
    },

    renderMoveMenu(moves, focus, onFocus, onClick) {
        const grid = document.getElementById('move-grid');
        grid.innerHTML = "";
        const info = document.getElementById('move-info-box');

        const updateInfo = (m) => {
            if (!m) { info.innerHTML = ""; return; }
            const eff = p => (p || '-');
            info.innerHTML = `<div class="info-row"><span>TYPE</span><span class="type-tag">${m.type.toUpperCase()}</span></div><div class="info-row"><span>PWR</span><span>${eff(m.power)}</span></div><div class="info-row"><span>ACC</span><span>${eff(m.accuracy)}%</span></div><div class="info-desc">${m.description || ''}</div>`;
        };

        moves.forEach((m, i) => {
            const btn = document.createElement('div');
            btn.className = 'move-btn';
            if (i === focus) btn.classList.add('focused');
            btn.innerText = m.name;
            btn.onclick = () => onClick(i);
            btn.onmouseenter = () => { onFocus(i); updateInfo(m); };
            grid.appendChild(btn);
        });

        const cancel = document.createElement('div');
        cancel.className = 'move-btn cancel';
        cancel.innerText = 'BACK';
        if (focus === 4) cancel.classList.add('focused');
        cancel.onclick = () => onClick('back');
        cancel.onmouseenter = () => { onFocus(4); updateInfo(null); };
        grid.appendChild(cancel);

        if (focus >= 0 && focus < moves.length) updateInfo(moves[focus]);
        else updateInfo(null);
    },

    renderPack(items, focus, onFocus, onClick) {
        const grid = document.getElementById('pack-grid');
        grid.innerHTML = "";
        const info = document.getElementById('pack-info-box');

        const updateInfo = (item) => {
            if (!item) { info.innerHTML = ""; return; }
            info.innerHTML = `<div class="info-row"><span>${item.name}</span><span>x${items[item.key] || 0}</span></div><div class="info-desc">${item.description || ''}</div>`;
        };

        const keys = Object.keys(items);
        keys.forEach((key, i) => {
            const btn = document.createElement('div');
            btn.className = 'move-btn';
            if (i === focus) btn.classList.add('focused');
            btn.innerText = ITEMS[key].name;
            btn.onclick = () => onClick(key);
            btn.onmouseenter = () => { onFocus(i); updateInfo({ ...ITEMS[key], key }); };
            grid.appendChild(btn);
        });

        const back = document.createElement('div');
        back.className = 'move-btn cancel';
        back.innerText = 'BACK';
        if (focus === keys.length) back.classList.add('focused');
        back.onclick = () => onClick('back');
        back.onmouseenter = () => { onFocus(keys.length); updateInfo(null); };
        grid.appendChild(back);

        if (focus >= 0 && focus < keys.length) updateInfo({ ...ITEMS[keys[focus]], key: keys[focus] });
        else updateInfo(null);
    },

    playSparkle(side) {
        const scene = document.getElementById('scene');
        for (let i = 0; i < 8; i++) {
            const s = document.createElement('div');
            s.className = 'sparkle';
            s.style.left = (side === 'player' ? 60 : 230) + (Math.random() * 40 - 20) + 'px';
            s.style.top = (side === 'player' ? 150 : 70) + (Math.random() * 40 - 20) + 'px';
            s.style.setProperty('--tx', (Math.random() * 100 - 50) + 'px');
            s.style.setProperty('--ty', (Math.random() * 100 - 50) + 'px');
            scene.appendChild(s);
            setTimeout(() => s.remove(), 1000);
        }
        AudioEngine.playSfx('sparkle');
    }
};
