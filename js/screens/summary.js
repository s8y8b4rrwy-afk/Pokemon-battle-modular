const SummaryScreen = {
    open(p, mode) {
        Game.previousState = Game.state;
        Game.state = mode || 'SUMMARY';
        Input.setMode('SUMMARY', 1);

        if (mode === 'SELECTION') {
            Game.currentSummaryIndex = Game.tempSelectionList.indexOf(p);
        } else {
            const idx = Game.party.findIndex(mon => mon.id === p.id && mon.exp === p.exp);
            Game.currentSummaryIndex = (idx !== -1) ? idx : 0;
        }

        UI.show('summary-panel');
        this.render(p);

        // Setup Buttons
        const btn = document.getElementById('btn-action');
        const prevBtn = document.getElementById('btn-prev');
        const nextBtn = document.getElementById('btn-next');
        const backBtn = document.getElementById('btn-back-sum');

        // Basic Listeners
        [prevBtn, btn, backBtn, nextBtn].forEach((el, i) => {
            el.onmouseenter = () => { Input.focus = i; Input.updateVisuals(); };
        });

        btn.disabled = false;
        btn.className = "confirm-btn";
        prevBtn.disabled = false;
        nextBtn.disabled = false;

        if (Game.state === 'SELECTION') {
            btn.innerText = "I CHOOSE YOU!";
            btn.onclick = () => SelectionScreen.confirm();
        } else if (Game.state === 'OVERFLOW') {
            btn.innerText = "RELEASE";
            btn.className = "confirm-btn danger";
            btn.onclick = () => PartyScreen.release(Game.selectedPartyIndex);
            prevBtn.disabled = true;
            nextBtn.disabled = true;
        } else if (Game.state === 'READ_ONLY') {
            btn.innerText = "ACTION";
            btn.disabled = true;
        } else if (Game.state === 'HEAL') {
            btn.innerText = "USE";
            btn.onclick = () => PartyScreen.applyItem(Game.selectedPartyIndex);
            prevBtn.disabled = true;
            nextBtn.disabled = true;
        } else {
            btn.innerText = "SHIFT";
            btn.onclick = () => PartyScreen.shift();
        }
    },

    render(p) {
        AudioEngine.playCry(p.cry);
        const statusEl = document.getElementById('sum-status-text');

        if (p.currentHp <= 0) {
            statusEl.innerText = "STATUS/FNT";
            statusEl.style.color = "#c83828";
        } else if (p.status && STATUS_DATA[p.status]) {
            statusEl.innerText = `STATUS/${STATUS_DATA[p.status].name}`;
            statusEl.style.color = STATUS_DATA[p.status].color;
        } else {
            statusEl.innerText = "STATUS/OK";
            statusEl.style.color = "black";
        }

        document.getElementById('sum-name').innerText = p.name;
        document.getElementById('sum-name').style.color = p.isShiny ? "#d8b030" : "black";
        document.getElementById('sum-shiny-icon').style.display = p.isShiny ? "block" : "none";
        document.getElementById('sum-sprite-img').src = p.frontSprite;
        document.getElementById('sum-types').innerHTML = p.types.map(t => `<span class="type-tag">${t.toUpperCase()}</span>`).join('');

        document.getElementById('sum-hp-txt').innerText = `${Math.max(0, p.currentHp)}/${p.maxHp}`;
        const hpPct = Math.min(100, Math.max(0, (p.currentHp / p.maxHp) * 100));
        document.getElementById('sum-hp-bar').style.cssText = `width:${hpPct}%; background:${hpPct > 50 ? "var(--hp-green)" : hpPct > 20 ? "var(--hp-yellow)" : "var(--hp-red)"}`;

        document.getElementById('sum-exp-txt').innerText = `${p.exp}/${p.nextLvlExp}`;
        document.getElementById('sum-exp-bar').style.width = `${Math.min(100, (p.exp / p.nextLvlExp) * 100)}%`;

        document.getElementById('summary-stats').innerHTML = `
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:4px;">
                <div>ATK ${p.stats.atk}</div><div>DEF ${p.stats.def}</div>
                <div>SPA ${p.stats.spa}</div><div>SPD ${p.stats.spd}</div>
                <div>SPE ${p.stats.spe}</div>
            </div>`;

        document.getElementById('summary-moves').innerHTML = p.moves.map(m => `
            <div class="move-row">
                <span class="move-name">${m.name}</span>
                <div class="move-info-grp">
                    <span class="move-pwr">PWR ${m.power || '-'}</span>
                    <span class="move-type">${m.type.toUpperCase()}</span>
                </div>
            </div>`).join('');
    },

    nav(dir) {
        if (['HEAL', 'OVERFLOW'].includes(Game.state)) return;

        let list = (Game.state === 'SELECTION') ? Game.tempSelectionList : Game.party;
        let nextIdx = Game.currentSummaryIndex + dir;

        if (nextIdx < 0) nextIdx = list.length - 1;
        if (nextIdx >= list.length) nextIdx = 0;

        Game.currentSummaryIndex = nextIdx;

        if (['PARTY', 'SUMMARY'].includes(Game.state)) Game.selectedPartyIndex = nextIdx;
        if (Game.state === 'SELECTION') Game.tempSelection = list[nextIdx];

        this.render(list[nextIdx]);
    },

    close() {
        UI.hide('summary-panel');
        Game.state = Game.previousState;

        if (Game.state === 'SELECTION') {
            Input.setMode('SELECTION', Game.currentSummaryIndex);
        } else if (Game.state === 'PARTY') {
            UI.hide('party-context');
            Input.setMode('PARTY', Game.selectedPartyIndex);
        } else if (Game.state === 'HEAL') {
            Input.setMode('CONTEXT');
        } else if (Game.state === 'READ_ONLY') {
            Input.setMode('CONTINUE');
        }
    }
};
