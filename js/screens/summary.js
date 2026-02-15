const SummaryScreen = {
    id: 'SUMMARY',

    // --- ScreenManager Interface ---
    onEnter(params = {}) {
        // Support legacy call signature: open(p, mode)
        // New Signature: push('SUMMARY', { mon: p, mode: 'MODE' })

        let p = params;
        if (params.mon) p = params.mon; // New style

        const mode = params.mode || null;

        // Legacy internal logic
        Game.previousState = Game.state;
        Game.state = mode || 'SUMMARY';
        // Note: 'SUMMARY' is not in Input.handlers anymore for logic, but fine for state tracking

        // Prepare State
        if (mode === 'SELECTION') {
            // In selection mode, find index in temp list
            Game.currentSummaryIndex = Game.tempSelectionList.indexOf(p);
        } else {
            // Find index in party
            const idx = Game.party.findIndex(mon => mon.id === p.id && mon.exp === p.exp);
            Game.currentSummaryIndex = (idx !== -1) ? idx : 0;
        }

        this.render(p); // Render content
        this.setupButtons(); // Update button states based on mode

        Input.setMode('SUMMARY', 1); // Focus on 'Action' button by default
    },

    onExit() {
        UI.hide('summary-panel');
        // Restore previous state logic
        if (Game.state !== 'SUMMARY') {
            // If we were in a special mode, we might need to revert Game.state
            Game.state = Game.previousState;
        }
    },

    handleInput(key) {
        const buttons = Array.from(document.querySelectorAll('.sum-buttons .confirm-btn'))
            .filter(b => b.style.display !== 'none');

        if (key === 'ArrowRight') {
            if (Input.focus < buttons.length - 1) {
                Input.focus++;
            } else {
                this.nav(1);
            }
            return true;
        }
        if (key === 'ArrowLeft') {
            if (Input.focus > 0) {
                Input.focus--;
            } else {
                this.nav(-1);
            }
            return true;
        }
        if (key === 'ArrowDown') { this.nav(1); return true; }
        if (key === 'ArrowUp') { this.nav(-1); return true; }

        if (['z', 'Z', 'Enter'].includes(key)) {
            if (buttons[Input.focus]) buttons[Input.focus].click();
            return true;
        }

        if (key === 'x' || key === 'X') {
            this.close();
            return true;
        }

        return false;
    },

    // --- Internal Logic ---
    setupButtons() {
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

        // Map button clicks to actions
        // Note: referencing PartyScreen globals is brittle, ideally should use ScreenManager.push
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
            btn.style.display = 'none';
        } else if (Game.state === 'HEAL') {
            btn.innerText = "USE";
            btn.onclick = () => PartyScreen.applyItem(Game.selectedPartyIndex);
            prevBtn.disabled = true;
            nextBtn.disabled = true;
        } else {
            btn.innerText = "SHIFT";
            btn.onclick = () => PartyScreen.shift();
        }

        // Nav and Back buttons
        prevBtn.onclick = () => this.nav(-1);
        nextBtn.onclick = () => this.nav(1);
        backBtn.onclick = () => this.close();

        // Update mouse listeners for dynamic indices
        const visibleButtons = [prevBtn, btn, backBtn, nextBtn].filter(b => b.style.display !== 'none');
        visibleButtons.forEach((el, i) => {
            el.onmouseenter = () => { Input.focus = i; Input.updateVisuals(); };
        });
    },

    // Legacy Open shim
    open(p, mode) {
        // UI.show moved to ScreenManager.push, but for legacy specific calls:
        // UI.show('summary-panel'); 
        // Actually, let's just use ScreenManager logic inside onEnter
        this.onEnter({ mon: p, mode: mode });
        UI.show('summary-panel'); // Ensure visibility for legacy calls bypassing Manager
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

        // Determine list based on state/mode
        let list = Game.party;
        if (Game.state === 'SELECTION') list = Game.tempSelectionList;
        if (Game.state === 'READ_ONLY') list = Game.tempPreviewList || Game.party;

        // Safety check
        if (!list || list.length === 0) return;

        let nextIdx = Game.currentSummaryIndex + dir;

        if (nextIdx < 0) nextIdx = list.length - 1;
        if (nextIdx >= list.length) nextIdx = 0;

        Game.currentSummaryIndex = nextIdx;

        // Update Global Refs
        if (['PARTY', 'SUMMARY', 'HEAL', 'READ_ONLY'].includes(Game.state)) {
            // Usually internal index is enough, but legacy might need this
            Game.selectedPartyIndex = nextIdx;
        }

        if (Game.state === 'SELECTION') {
            Game.tempSelection = list[nextIdx];
        }

        this.render(list[nextIdx]);
    },

    close() {
        if (this._closing) return; // Guard against double-popping
        this._closing = true;

        if (typeof ScreenManager !== 'undefined' && ScreenManager.stack.length > 0) {
            ScreenManager.pop();
            this._closing = false;
            return;
        }

        // Fallback for legacy calls not using push/pop
        UI.hide('summary-panel');
        Game.state = Game.previousState;

        if (Game.state === 'SELECTION') {
            Input.setMode('SELECTION', Game.currentSummaryIndex);
        } else if (Game.state === 'PARTY') {
            UI.hide('party-context');
            Input.setMode('PARTY', Game.selectedPartyIndex);
        } else if (Game.state === 'READ_ONLY') {
            Input.setMode('CONTINUE');
        }
        this._closing = false;
    }
};
