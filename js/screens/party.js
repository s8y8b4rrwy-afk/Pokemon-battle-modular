const PartyScreen = {
    id: 'PARTY',

    // --- ScreenManager Interface ---
    onEnter(params = {}) {
        // Legacy: Handle forced mode via params or global
        const forced = params.forced || Game.forcedSwitch;
        this.open(forced);
    },

    onExit() {
        UI.hide('party-screen');
        UI.hide('party-context');
        // Clean up any temporary states
    },

    onSuspend() {
        // When covered by another screen (e.g. Summary)
    },

    onResume() {
        this.render();
        Input.setMode('PARTY', Game.selectedPartyIndex !== -1 ? Game.selectedPartyIndex : 0);
    },

    handleInput(key) {
        // If Context Menu is open, delegate to it (or handle here)
        if (Input.mode === 'CONTEXT') {
            return this.handleContextInput(key);
        }

        const len = Game.party.length; // Length is the Close Button index
        const isForced = Game.forcedSwitch || Game.state === 'OVERFLOW';
        const maxFocus = isForced ? len - 1 : len;

        if (key === 'ArrowDown') {
            Input.focus = Math.min(maxFocus, Input.focus + 1);
            AudioEngine.playSfx('select');
            return true;
        }
        if (key === 'ArrowUp') {
            Input.focus = Math.max(0, Input.focus - 1);
            AudioEngine.playSfx('select');
            return true;
        }
        if (['z', 'Z', 'Enter'].includes(key)) {
            if (!isForced && Input.focus === len) document.getElementById('party-close-btn').click();
            else if (Input.focus < len) document.querySelectorAll('.party-slot')[Input.focus].click();
            return true;
        }
        if (key === 'x' || key === 'X') {
            if (Game.state === 'HEAL') {
                ScreenManager.pop();
            } else if (!isForced) {
                BattleMenus.uiToMenu();
            }
            return true;
        }

        return false; // Allow global fallbacks if needed
    },

    handleContextInput(key) {
        const len = document.querySelectorAll('#party-context .ctx-btn').length;

        if (key === 'ArrowDown') {
            Input.focus = Math.min(len - 1, Input.focus + 1);
            AudioEngine.playSfx('select');
            return true;
        }
        if (key === 'ArrowUp') {
            Input.focus = Math.max(0, Input.focus - 1);
            AudioEngine.playSfx('select');
            return true;
        }
        if (['z', 'Z', 'Enter'].includes(key)) {
            document.querySelectorAll('#party-context .ctx-btn')[Input.focus].click();
            return true;
        }
        if (key === 'x' || key === 'X') {
            this.closeContext();
            return true;
        }

        return true;
    },

    // --- Legacy / Internal Logic ---
    open(forced) {
        if (Battle.uiLocked && !forced && !['OVERFLOW', 'HEAL'].includes(Game.state)) return;

        // Prevent switching when trapped (unless forced)
        if (Game.state === 'BATTLE' && !forced && Battle.p && Battle.p.volatiles.trapped) {
            UI.typeText(`${Battle.p.name} can't be\nrecalled!`);
            return;
        }

        if (Game.state === 'BATTLE' && !forced) Battle.lastMenuIndex = Input.focus;

        if (!['OVERFLOW', 'HEAL'].includes(Game.state)) Game.state = 'PARTY';
        Game.forcedSwitch = forced;
        // UI.show managed by ScreenManager usually, but doubling up is safe
        UI.show('party-screen');
        UI.hide('party-context');

        const closeBtn = document.getElementById('party-close-btn');
        const header = document.getElementById('party-header-text');
        closeBtn.onmouseenter = () => { Input.focus = Game.party.length; Input.updateVisuals(); AudioEngine.playSfx('select'); };

        closeBtn.style.pointerEvents = "auto";
        closeBtn.style.display = "block";

        if (Game.state === 'OVERFLOW') {
            header.innerText = "PARTY FULL! RELEASE ONE.";
            closeBtn.innerText = "SELECT TO RELEASE";
            closeBtn.style.pointerEvents = "none";
        } else if (Game.state === 'HEAL') {
            header.innerText = "USE ON WHICH PKMN?";
            closeBtn.innerText = "CANCEL";
            closeBtn.onclick = () => { AudioEngine.playSfx('select'); ScreenManager.pop(); }; // Returns to BAG
        } else {
            header.innerText = "POKEMON PARTY";
            closeBtn.onclick = forced ? null : () => { AudioEngine.playSfx('select'); BattleMenus.uiToMenu(); };
            if (forced) closeBtn.style.display = "none";
        }
        this.render();
        Input.setMode('PARTY');
    },

    render() {
        const list = document.getElementById('party-list');
        list.innerHTML = "";
        Game.party.forEach((p, i) => {
            const div = document.createElement('div');
            div.className = 'party-slot';
            if (p.currentHp <= 0) div.classList.add('fainted');
            if (i === Game.activeSlot && p.currentHp > 0) div.classList.add('active-mon');
            if (i === 6) div.classList.add('new-catch');

            const pct = (p.currentHp / p.maxHp) * 100;
            const color = pct > 50 ? "#48c050" : pct > 20 ? "#d8b030" : "#c83828";

            div.innerHTML = `
                <img class="slot-icon" src="${p.icon}">
                <div class="slot-info">
                    <div class="slot-row"><span>${p.name}</span><span>Lv${p.level}</span></div>
                    <div class="slot-row">
                        <div class="mini-hp-bg"><div class="mini-hp-fill" style="width:${pct}%; background:${color}"></div></div>
                        <span>${Math.max(0, p.currentHp)}/${p.maxHp}</span>
                    </div>
                </div>`;

            div.onmouseenter = () => { Input.focus = i; Input.updateVisuals(); AudioEngine.playSfx('select'); };
            div.onclick = () => { Game.selectedPartyIndex = i; this.openContext(i); };
            list.appendChild(div);
        });
    },

    openContext(index) {
        Game.selectedPartyIndex = index;
        UI.show('party-context');
        const ctx = document.getElementById('party-context');
        ctx.innerHTML = "";

        const addBtn = (txt, fn, cls = '') => {
            const b = document.createElement('div');
            b.className = `ctx-btn ${cls}`;
            b.innerText = txt;
            b.onclick = fn;
            const idx = ctx.children.length;
            b.onmouseenter = () => { Input.focus = idx; Input.updateVisuals(); };
            ctx.appendChild(b);
        };

        if (Game.state === 'HEAL') {
            addBtn("USE", () => this.applyItem(index));
        } else if (Game.state === 'OVERFLOW') {
            addBtn("RELEASE", () => this.release(index), "warn");
        } else {
            addBtn("SHIFT", () => this.shift());
        }

        addBtn("SUMMARY", () => this.stats());
        addBtn("CLOSE", () => this.closeContext());
        Input.setMode('CONTEXT');
    },

    closeContext() {
        UI.hide('party-context');
        Input.setMode('PARTY', Game.selectedPartyIndex);
    },

    release(index) {
        this.closeContext();
        if (typeof SummaryScreen !== 'undefined') SummaryScreen.close();

        const releasedMon = Game.party[index];
        Game.party.splice(index, 1);

        if (typeof ScreenManager !== 'undefined') {
            ScreenManager.pop();
        } else {
            UI.hide('party-screen');
        }

        const onComplete = () => {
            if (Battle.userInputPromise) {
                Battle.userInputPromise(index);
            } else {
                Game.handleWin(true);
            }
        };

        if (index < Game.activeSlot) Game.activeSlot--;
        if (index === Game.activeSlot) {
            if (Game.activeSlot >= Game.party.length) Game.activeSlot = Game.party.length - 1;
            Battle.animateSwap(releasedMon, Game.party[Game.activeSlot], onComplete);
        } else {
            UI.typeText(`Bye bye, ${releasedMon.name}!`, onComplete);
        }
    },

    applyItem(index) {
        this.closeContext();
        SummaryScreen.close();
        const p = Game.party[index];
        const data = ITEMS[Game.selectedItemKey];

        if (data.type === 'revive' && p.currentHp > 0) { AudioEngine.playSfx('error'); return; }
        if (data.type === 'heal' && (p.currentHp <= 0 || p.currentHp >= p.maxHp)) { AudioEngine.playSfx('error'); return; }

        if (Game.selectedItemKey === 'revive') p.currentHp = Math.floor(p.maxHp / 2);
        if (Game.selectedItemKey === 'maxrevive') p.currentHp = p.maxHp;

        if (data.type === 'heal') p.currentHp = Math.min(p.maxHp, p.currentHp + data.heal);

        Game.inventory[Game.selectedItemKey]--;
        AudioEngine.playSfx('heal');
        this.render();

        if (index === Game.activeSlot) UI.updateHUD(p, 'player');

        if (index === Game.activeSlot) UI.updateHUD(p, 'player');

        // Clear everything to return to Battle Scene
        if (typeof ScreenManager !== 'undefined') {
            ScreenManager.clear();
        } else {
            UI.hide('party-screen');
            UI.hide('pack-screen');
            UI.hide('action-menu');
        }

        Game.state = 'BATTLE';

        // Delay effect to happen IN SCENE
        setTimeout(() => {
            UI.typeText(`Used ${data.name} on ${p.name}!`, () => Battle.endTurnItem());
        }, 300);
    },

    shift() {
        const idx = Game.selectedPartyIndex;
        const mon = Game.party[idx];
        if (mon.currentHp <= 0 || idx === Game.activeSlot) { AudioEngine.playSfx('error'); return; }

        const wasForced = Game.forcedSwitch;
        Game.forcedSwitch = false;

        if (Battle.userInputPromise) {
            if (typeof ScreenManager !== 'undefined') {
                ScreenManager.clear();
            } else {
                UI.hide('party-screen');
                UI.hide('party-context');
                if (typeof SummaryScreen !== 'undefined') SummaryScreen.close();
            }
            Game.activeSlot = idx;
            Game.state = 'BATTLE';
            Battle.userInputPromise(idx);
            return;
        }

        Game.party[Game.activeSlot].rageLevel = 0;
        Game.party[Game.activeSlot].volatiles = {};
        Game.party[Game.activeSlot].stages = { atk: 0, def: 0, spa: 0, spd: 0, spe: 0, acc: 0, eva: 0 };

        if (typeof ScreenManager !== 'undefined') {
            ScreenManager.clear();
        } else {
            UI.hide('party-screen');
            UI.hide('party-context');
            if (typeof SummaryScreen !== 'undefined') SummaryScreen.close();
        }
        Game.activeSlot = idx;
        Game.state = 'BATTLE';

        if (wasForced) Battle.switchIn(mon, true);
        else Battle.performSwitch(mon);
    },

    stats() {
        ScreenManager.push('SUMMARY', Game.party[Game.selectedPartyIndex]);
    }
};
