const Game = {
    tempSelection: null, tempSelectionList: [], party: [], activeSlot: 0, enemyMon: null, selectedItemKey: null,
    inventory: { potion: 1, superpotion: 0, hyperpotion: 0, maxpotion: 0, revive: 0, pokeball: 1, greatball: 0, ultraball: 0, masterball: 0 },
    state: 'START', selectedPartyIndex: -1, forcedSwitch: false, previousState: 'SELECTION', wins: 0, bossesDefeated: 0,
    playerName: 'PLAYER', currentSummaryIndex: 0, savedBattleState: null,

    toggleLcd() {
        Input.lcdEnabled = !Input.lcdEnabled;
        const el = document.getElementById('lcd-check');
        const overlay = document.getElementById('lcd-overlay');
        if (Input.lcdEnabled) { el.classList.add('checked'); overlay.classList.add('active'); } else { el.classList.remove('checked'); overlay.classList.remove('active'); }
    },

    toggleRetroMotion() {
        document.body.classList.toggle('retro-motion');
        const el = document.getElementById('motion-check');
        if (document.body.classList.contains('retro-motion')) el.classList.add('checked');
        else el.classList.remove('checked');
    },

    // --- SAVES (Delegated to StorageSystem) ---
    checkSave() {
        if (StorageSystem.exists()) {
            const data = StorageSystem.load();
            document.getElementById('start-screen').classList.add('hidden');
            document.getElementById('continue-screen').classList.remove('hidden');
            document.getElementById('save-wins').innerText = data.wins || 0;
            document.getElementById('save-bosses').innerText = data.bossesDefeated || 0;
            document.getElementById('save-name').innerText = data.playerName || 'PLAYER';

            const prevRow = document.getElementById('save-preview');
            prevRow.innerHTML = '';
            data.party.forEach((p) => {
                const img = document.createElement('img'); img.src = p.icon; img.className = 'mini-icon';
                if (p.currentHp <= 0) img.classList.add('fainted');
                img.onclick = () => this.openSummary(p, 'READ_ONLY');
                prevRow.appendChild(img);
            });
            Input.setMode('CONTINUE');
        } else {
            document.getElementById('start-screen').classList.add('hidden');
            this.startNameInput();
        }
    },

    save() {
        const currentEnemy = (this.state === 'BATTLE' && this.enemyMon && this.enemyMon.currentHp > 0) ? this.enemyMon : null;
        StorageSystem.save({
            party: this.party, inventory: this.inventory, wins: this.wins,
            bossesDefeated: this.bossesDefeated, activeSlot: this.activeSlot, playerName: this.playerName,
            enemyMon: currentEnemy,
            weather: (this.state === 'BATTLE') ? Battle.weather : { type: 'none', turns: 0 },
            delayedMoves: (this.state === 'BATTLE') ? Battle.delayedMoves : []
        });
    },

    load() {
        const data = StorageSystem.load();
        if (!data) return false;

        this.party = data.party || [];
        this.inventory = data.inventory || {};
        this.wins = data.wins || 0;
        this.bossesDefeated = data.bossesDefeated || 0;
        this.activeSlot = data.activeSlot || 0;
        this.playerName = data.playerName || 'PLAYER';
        this.enemyMon = data.enemyMon || null;

        // Hold state for Battle to pick up
        this.savedBattleState = {
            weather: data.weather || { type: 'none', turns: 0 },
            delayedMoves: data.delayedMoves || []
        };

        // Cleanup if not resuming a battle
        const isResuming = (this.enemyMon !== null);
        this.party.forEach(p => {
            p.nextLvlExp = Math.pow(p.level + 1, 3) - Math.pow(p.level, 3);
            if (!isResuming) {
                p.volatiles = {}; p.rageLevel = 0;
                if (p.transformBackup) {
                    Object.assign(p, p.transformBackup); // Fast revert
                    p.transformBackup = null;
                }
            }
        });
        return true;
    },

    // --- FLOW CONTROL ---
    startNameInput() {
        document.getElementById('continue-screen').classList.add('hidden');
        document.getElementById('name-screen').classList.remove('hidden');
        document.getElementById('name-input').focus();
        Input.setMode('NAME');
    },

    confirmName() {
        const val = document.getElementById('name-input').value.trim().toUpperCase();
        this.playerName = val || 'GOLD';
        document.getElementById('name-screen').classList.add('hidden');
        this.newGame();
    },

    loadGame() {
        document.getElementById('continue-screen').classList.add('hidden');
        Battle.resetScene();
        Battle.uiLocked = true;

        if (this.load()) {
            if (DEBUG.ENABLED) Object.assign(this.inventory, DEBUG.INVENTORY);

            document.getElementById('selection-screen').classList.add('hidden');
            document.getElementById('scene').classList.remove('hidden');
            document.getElementById('dialog-box').classList.remove('hidden');
            document.getElementById('streak-box').classList.remove('hidden');
            document.getElementById('streak-box').innerText = `WINS: ${this.wins}`;

            // Safety Check: Active slot alive?
            if (!this.party[this.activeSlot] || this.party[this.activeSlot].currentHp <= 0) {
                const aliveIdx = this.party.findIndex(p => p.currentHp > 0);
                if (aliveIdx !== -1) this.activeSlot = aliveIdx;
                else { this.party.forEach(p => p.currentHp = p.maxHp); this.activeSlot = 0; } // Emergency heal
            }

            this.state = 'BATTLE';

            // RESUME LOGIC
            if (this.enemyMon && this.enemyMon.currentHp > 0) {
                if (this.savedBattleState) {
                    Battle.weather = this.savedBattleState.weather;
                    Battle.delayedMoves = this.savedBattleState.delayedMoves;
                }
                if (Battle.weather.type !== 'none' && WEATHER_FX[Battle.weather.type]) {
                    document.getElementById('scene').style.backgroundColor = WEATHER_FX[Battle.weather.type].color;
                }

                const img = new Image();
                const resumeStart = () => {
                    document.getElementById('enemy-sprite').src = this.enemyMon.frontSprite;
                    Battle.setup(this.party[this.activeSlot], this.enemyMon, false, true);
                    document.getElementById('enemy-sprite').style.opacity = 1;
                    document.getElementById('player-sprite').style.opacity = 1;
                    document.getElementById('player-hud').classList.add('hud-active');
                    document.getElementById('enemy-hud').classList.add('hud-active');
                    document.getElementById('scene').classList.add('anim-fade-in');
                    setTimeout(() => document.getElementById('scene').classList.remove('anim-fade-in'), 1000);
                    Battle.typeText(`Resumed battle against\n${this.enemyMon.name}!`, () => { Battle.uiLocked = false; Battle.uiToMenu(); });
                };
                img.onload = resumeStart;
                img.onerror = resumeStart;
                img.src = this.enemyMon.frontSprite;
            } else {
                this.startNewBattle(true);
            }
        }
    },

    newGame() {
        StorageSystem.wipe();
        this.party = []; this.wins = 0; this.bossesDefeated = 0;
        this.inventory = { potion: 1, superpotion: 0, hyperpotion: 0, maxpotion: 0, revive: 0, pokeball: 1, greatball: 0, ultraball: 0, masterball: 0 };
        if (DEBUG.ENABLED) Object.assign(this.inventory, DEBUG.INVENTORY);
        this.showSelectionScreen();
    },

    resetToTitle() {
        StorageSystem.wipe();
        this.party = []; this.wins = 0; this.bossesDefeated = 0;

        // Hide All
        ['scene', 'dialog-box', 'summary-panel', 'streak-box', 'pack-screen', 'party-screen', 'action-menu', 'move-menu', 'selection-screen'].forEach(id => document.getElementById(id).classList.add('hidden'));

        document.getElementById('start-screen').classList.remove('hidden');
        Input.setMode('START');
    },

    returnToTitle() {
        this.state = 'START';
        ['scene', 'dialog-box', 'streak-box', 'summary-panel', 'party-screen', 'pack-screen', 'action-menu', 'move-menu'].forEach(id => document.getElementById(id).classList.add('hidden'));
        Battle.resetScene();
        document.getElementById('start-screen').classList.remove('hidden');
        Input.setMode('START');
    },

    skipBattle() {
        Battle.cleanup();
        this.save();
        setTimeout(() => { this.startNewBattle(false); }, 1000);
    },

    async startNewBattle(isFirst = false) {
        Battle.resetScene();

        // Ghost Fix
        const eSprite = document.getElementById('enemy-sprite');
        eSprite.style.opacity = 0;
        eSprite.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

        Battle.uiLocked = true;
        this.enemyMon = null;

        Battle.typeText("Searching for wild Pokemon...", null, true);

        // Reset Player Logic
        if (this.party[this.activeSlot]) {
            const p = this.party[this.activeSlot];
            p.volatiles = {};
            p.stages = { atk: 0, def: 0, spa: 0, spd: 0, spe: 0, acc: 0, eva: 0 };
            p.rageLevel = 0;
            if (DEBUG.ENABLED) {
                if (DEBUG.PLAYER.RAGE !== null) p.rageLevel = DEBUG.PLAYER.RAGE;
                if (DEBUG.PLAYER.STATUS !== null) p.status = DEBUG.PLAYER.STATUS;
                if (DEBUG.PLAYER.STAGES !== null) Object.assign(p.stages, DEBUG.PLAYER.STAGES);
                if (DEBUG.PLAYER.VOLATILES) Object.assign(p.volatiles, DEBUG.PLAYER.VOLATILES);
            }
        }

        // GENERATE ENEMY (Delegated to Manager)
        try {
            this.enemyMon = await EncounterManager.generate(this.party, this.wins);
        } catch (err) {
            console.error(err);
            // Hard fallback
            this.enemyMon = await API.getPokemon(25, 5, {});
        }

        // Start Sequence
        const img = new Image();
        const launch = () => {
            eSprite.src = this.enemyMon.frontSprite;
            Battle.setup(this.party[this.activeSlot], this.enemyMon, true, !isFirst);
        };
        img.onload = launch;
        img.onerror = launch;
        img.src = this.enemyMon.frontSprite;

        this.save();
    },

    // --- MENUS (Selection, Summary, Party, etc) ---
    // These remain largely unchanged, just compacted slightly for cleanliness

    async showSelectionScreen() {
        this.state = 'SELECTION'; Battle.uiLocked = false; Input.setMode('NONE');
        ['scene', 'dialog-box', 'summary-panel', 'streak-box'].forEach(id => document.getElementById(id).classList.add('hidden'));
        document.getElementById('selection-screen').classList.remove('hidden');

        document.getElementById('sel-text-box').innerHTML = '<span class="blink-text">CATCHING POKEMON...</span>';
        document.getElementById('sel-cursor').style.display = 'none';
        document.querySelectorAll('.pokeball-select').forEach(b => b.remove());
        document.getElementById('sel-preview-img').style.display = 'none';
        document.getElementById('sel-preview-shiny').style.display = 'none';

        // Determine Selection IDs
        const ids = [];
        if (DEBUG.ENABLED && DEBUG.PLAYER.ID) ids.push(DEBUG.PLAYER.ID);
        while (ids.length < 3) { const r = RNG.int(1, 251); if (!ids.includes(r)) ids.push(r); }

        const [_, list] = await Promise.all([
            wait(1000),
            Promise.all(ids.map((id, i) => {
                let lvl = 15; let shiny = null; const overrides = {};
                if (DEBUG.ENABLED && i === 0) {
                    if (DEBUG.PLAYER.LEVEL) lvl = DEBUG.PLAYER.LEVEL;
                    if (DEBUG.PLAYER.SHINY !== null) shiny = DEBUG.PLAYER.SHINY;
                    if (DEBUG.PLAYER.MOVES) overrides.moves = DEBUG.PLAYER.MOVES;
                }
                if (shiny !== null) overrides.shiny = shiny;
                return API.getPokemon(id, lvl, overrides);
            }))
        ]);

        this.tempSelectionList = list;
        const table = document.getElementById('lab-table');

        this.tempSelectionList.forEach((p, i) => {
            if (!p) return;
            const ball = document.createElement('div'); ball.className = 'pokeball-select'; ball.id = `ball-${i}`;
            ball.onmouseenter = () => { Input.focus = i; Input.updateVisuals(); };
            ball.onclick = () => { this.tempSelection = p; this.openSummary(p, 'SELECTION'); };
            table.appendChild(ball);
        });

        document.getElementById('sel-text-box').innerHTML = 'SELECT A POKEMON';
        document.getElementById('sel-cursor').style.display = 'block';
        Input.setMode('SELECTION', 0);
    },

    openSummary(p, mode) {
        this.previousState = this.state;
        this.state = mode || 'SUMMARY';
        Input.setMode('SUMMARY', 1);

        if (mode === 'SELECTION') this.currentSummaryIndex = this.tempSelectionList.indexOf(p);
        else {
            const idx = this.party.findIndex(mon => mon.id === p.id && mon.exp === p.exp);
            this.currentSummaryIndex = (idx !== -1) ? idx : 0;
        }

        document.getElementById('summary-panel').classList.remove('hidden');
        this.renderSummaryData(p);

        // Setup Buttons
        const btn = document.getElementById('btn-action');
        const prevBtn = document.getElementById('btn-prev');
        const nextBtn = document.getElementById('btn-next');
        const backBtn = document.getElementById('btn-back-sum');

        // Basic Listeners
        [prevBtn, btn, backBtn, nextBtn].forEach((el, i) => el.onmouseenter = () => { Input.focus = i; Input.updateVisuals(); });

        btn.disabled = false; btn.className = "confirm-btn";
        prevBtn.disabled = false; nextBtn.disabled = false;

        if (this.state === 'SELECTION') {
            btn.innerText = "I CHOOSE YOU!"; btn.onclick = () => this.confirmSelection();
        } else if (this.state === 'OVERFLOW') {
            btn.innerText = "RELEASE"; btn.className = "confirm-btn danger"; btn.onclick = () => this.releasePokemon(this.selectedPartyIndex);
            prevBtn.disabled = true; nextBtn.disabled = true;
        } else if (this.state === 'READ_ONLY') {
            btn.innerText = "ACTION"; btn.disabled = true;
        } else if (this.state === 'HEAL') {
            btn.innerText = "USE"; btn.onclick = () => this.applyItemToPokemon(this.selectedPartyIndex);
            prevBtn.disabled = true; nextBtn.disabled = true;
        } else {
            btn.innerText = "SHIFT"; btn.onclick = () => this.partySwitch();
        }
    },

    renderSummaryData(p) {
        AudioEngine.playCry(p.cry);
        const statusEl = document.getElementById('sum-status-text');
        if (p.currentHp <= 0) { statusEl.innerText = "STATUS/FNT"; statusEl.style.color = "#c83828"; }
        else if (p.status && STATUS_DATA[p.status]) { statusEl.innerText = `STATUS/${STATUS_DATA[p.status].name}`; statusEl.style.color = STATUS_DATA[p.status].color; }
        else { statusEl.innerText = "STATUS/OK"; statusEl.style.color = "black"; }

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
    <div class="move-row"><span class="move-name">${m.name}</span><div class="move-info-grp"><span class="move-pwr">PWR ${m.power || '-'}</span><span class="move-type">${m.type.toUpperCase()}</span></div></div>`).join('');
    },

    navSummary(dir) {
        if (['HEAL', 'OVERFLOW'].includes(this.state)) return;
        let list = (this.state === 'SELECTION') ? this.tempSelectionList : this.party;
        let nextIdx = this.currentSummaryIndex + dir;
        if (nextIdx < 0) nextIdx = list.length - 1;
        if (nextIdx >= list.length) nextIdx = 0;
        this.currentSummaryIndex = nextIdx;
        if (['PARTY', 'SUMMARY'].includes(this.state)) this.selectedPartyIndex = nextIdx;
        if (this.state === 'SELECTION') this.tempSelection = list[nextIdx];
        this.renderSummaryData(list[nextIdx]);
    },

    closeSummary() {
        document.getElementById('summary-panel').classList.add('hidden');
        this.state = this.previousState;
        if (this.state === 'SELECTION') Input.setMode('SELECTION', this.currentSummaryIndex);
        else if (this.state === 'PARTY') { document.getElementById('party-context').classList.add('hidden'); Input.setMode('PARTY', this.selectedPartyIndex); }
        else if (this.state === 'HEAL') Input.setMode('CONTEXT');
        else if (this.state === 'READ_ONLY') Input.setMode('CONTINUE');
    },

    async confirmSelection() {
        if (!this.tempSelection) return;
        document.getElementById('summary-panel').classList.add('hidden');
        this.party = [this.tempSelection];
        this.activeSlot = 0; this.wins = 0; this.bossesDefeated = 0; this.save();
        document.getElementById('selection-screen').classList.add('hidden');
        ['scene', 'dialog-box', 'streak-box'].forEach(id => document.getElementById(id).classList.remove('hidden'));
        document.getElementById('streak-box').innerText = "WINS: 0";
        this.state = 'BATTLE'; this.startNewBattle(true);
    },

    openParty(forced) {
        if (Battle.uiLocked && !forced && !['OVERFLOW', 'HEAL'].includes(this.state)) return;
        if (this.state === 'BATTLE' && !forced) Battle.lastMenuIndex = Input.focus;

        if (!['OVERFLOW', 'HEAL'].includes(this.state)) this.state = 'PARTY';
        this.forcedSwitch = forced;
        document.getElementById('party-screen').classList.remove('hidden');
        document.getElementById('party-context').classList.add('hidden');

        const closeBtn = document.getElementById('party-close-btn');
        const header = document.getElementById('party-header-text');
        closeBtn.onmouseenter = () => { Input.focus = this.party.length; Input.updateVisuals(); };

        closeBtn.style.pointerEvents = "auto"; closeBtn.style.display = "block";

        if (this.state === 'OVERFLOW') {
            header.innerText = "PARTY FULL! RELEASE ONE.";
            closeBtn.innerText = "SELECT TO RELEASE"; closeBtn.style.pointerEvents = "none";
        } else if (this.state === 'HEAL') {
            header.innerText = "USE ON WHICH PKMN?"; closeBtn.innerText = "CANCEL";
            closeBtn.onclick = () => { document.getElementById('party-screen').classList.add('hidden'); Battle.openPack(); };
        } else {
            header.innerText = "POKEMON PARTY"; closeBtn.innerText = forced ? "CHOOSE A POKEMON" : "CLOSE [X]";
            closeBtn.onclick = forced ? null : () => Battle.uiToMenu();
            if (forced) closeBtn.style.display = "none";
        }
        this.renderParty(); Input.setMode('PARTY');
    },

    renderParty() {
        const list = document.getElementById('party-list'); list.innerHTML = "";
        this.party.forEach((p, i) => {
            const div = document.createElement('div'); div.className = 'party-slot';
            if (p.currentHp <= 0) div.classList.add('fainted');
            if (i === this.activeSlot && p.currentHp > 0) div.classList.add('active-mon');
            if (i === 6) div.classList.add('new-catch');
            const pct = (p.currentHp / p.maxHp) * 100; const color = pct > 50 ? "#48c050" : pct > 20 ? "#d8b030" : "#c83828";
            div.innerHTML = `<img class="slot-icon" src="${p.icon}"><div class="slot-info"><div class="slot-row"><span>${p.name}</span><span>Lv${p.level}</span></div><div class="slot-row"><div class="mini-hp-bg"><div class="mini-hp-fill" style="width:${pct}%; background:${color}"></div></div><span>${Math.max(0, p.currentHp)}/${p.maxHp}</span></div></div>`;
            div.onmouseenter = () => { Input.focus = i; Input.updateVisuals(); };
            div.onclick = () => { this.selectedPartyIndex = i; this.openContext(i); };
            list.appendChild(div);
        });
    },

    openContext(index) {
        this.selectedPartyIndex = index; const ctx = document.getElementById('party-context'); ctx.classList.remove('hidden'); ctx.innerHTML = "";
        const addBtn = (txt, fn, cls = '') => { const b = document.createElement('div'); b.className = `ctx-btn ${cls}`; b.innerText = txt; b.onclick = fn; const idx = ctx.children.length; b.onmouseenter = () => { Input.focus = idx; Input.updateVisuals(); }; ctx.appendChild(b); };
        if (this.state === 'HEAL') { addBtn("USE", () => this.applyItemToPokemon(index)); }
        else if (this.state === 'OVERFLOW') { addBtn("RELEASE", () => this.releasePokemon(index), "warn"); }
        else { addBtn("SHIFT", () => this.partySwitch()); }
        addBtn("SUMMARY", () => this.partyStats()); addBtn("CLOSE", () => this.closeContext());
        Input.setMode('CONTEXT');
    },

    closeContext() { document.getElementById('party-context').classList.add('hidden'); Input.setMode('PARTY', this.selectedPartyIndex); },

    releasePokemon(index) {
        this.closeContext(); this.closeSummary();
        const releasedMon = this.party[index]; this.party.splice(index, 1);
        document.getElementById('party-screen').classList.add('hidden');
        if (index < this.activeSlot) this.activeSlot--;
        if (index === this.activeSlot) {
            if (this.activeSlot >= this.party.length) this.activeSlot = this.party.length - 1;
            Battle.animateSwap(releasedMon, this.party[this.activeSlot], () => this.handleWin(true));
        } else {
            Battle.typeText(`Bye bye, ${releasedMon.name}!`, () => this.handleWin(true));
        }
    },

    applyItemToPokemon(index) {
        this.closeContext(); this.closeSummary(); const p = this.party[index]; const data = ITEMS[this.selectedItemKey];
        if (data.type === 'revive' && p.currentHp > 0) { AudioEngine.playSfx('error'); return; }
        if (data.type === 'heal' && (p.currentHp <= 0 || p.currentHp >= p.maxHp)) { AudioEngine.playSfx('error'); return; }

        if (data.type === 'revive') p.currentHp = Math.floor(p.maxHp / 2);
        if (data.type === 'heal') p.currentHp = Math.min(p.maxHp, p.currentHp + data.heal);

        this.inventory[this.selectedItemKey]--; AudioEngine.playSfx('heal'); this.renderParty();
        if (index === this.activeSlot) Battle.updateHUD(p, 'player');
        ['party-screen', 'pack-screen', 'action-menu'].forEach(id => document.getElementById(id).classList.add('hidden'));
        this.state = 'BATTLE'; Battle.typeText(`Used ${data.name} on ${p.name}!`, () => Battle.endTurnItem());
    },

    partySwitch() {
        const idx = this.selectedPartyIndex; const mon = this.party[idx];
        if (mon.currentHp <= 0 || idx === this.activeSlot) { AudioEngine.playSfx('error'); return; }

        if (Battle.userInputPromise) {
            this.closeContext(); this.closeSummary(); document.getElementById('party-screen').classList.add('hidden');
            this.activeSlot = idx; this.state = 'BATTLE';
            Battle.userInputPromise(idx); return;
        }

        this.party[this.activeSlot].rageLevel = 0;
        this.party[this.activeSlot].volatiles = {};
        this.party[this.activeSlot].stages = { atk: 0, def: 0, spa: 0, spd: 0, spe: 0, acc: 0, eva: 0 };

        this.closeContext(); this.closeSummary(); document.getElementById('party-screen').classList.add('hidden');
        this.activeSlot = idx; this.state = 'BATTLE';
        if (this.forcedSwitch) Battle.switchIn(mon, true); else Battle.performSwitch(mon);
    },

    // --- EXP & WINS ---
    async distributeExp(amount, targetIndices, isBossReward) {
        if (isBossReward) { AudioEngine.playSfx('exp'); await Battle.typeText(`The team gained\n${amount} EXP. Points!`); }
        for (const index of targetIndices) {
            const p = this.party[index];
            if (!p || p.currentHp <= 0) continue;
            if (index === this.activeSlot) {
                if (!isBossReward) await Battle.typeText(`${p.name} gained\n${amount} EXP. Points!`);
                await this.gainExpAnim(amount, p);
            } else {
                if (!isBossReward) await Battle.typeText(`${p.name} gained\n${amount} EXP. Points!`);
                p.exp += amount;
                if (p.exp >= p.nextLvlExp) await this.processLevelUp(p);
            }
        }
        this.finishWin();
    },

    gainExpAnim(amount, p) {
        p.exp += amount; Battle.updateHUD(p, 'player');
        const steps = 20; let i = 0;
        return new Promise(resolve => {
            const loop = setInterval(() => { AudioEngine.playSfx('exp'); i++; if (i >= steps) { clearInterval(loop); check(); } }, 50);
            const check = async () => {
                if (p.exp >= p.nextLvlExp) { await this.processLevelUp(p); resolve(); } else resolve();
            }
        });
    },

    processLevelUp(p) {
        return new Promise(async (resolve) => {
            const startLvl = p.level;
            while (p.exp >= p.nextLvlExp) { p.exp -= p.nextLvlExp; p.level++; p.nextLvlExp = Math.pow(p.level + 1, 3) - Math.pow(p.level, 3); }
            StatCalc.recalculate(p);
            AudioEngine.playSfx('levelup');
            if (this.activeSlot === this.party.indexOf(p)) {
                const hud = document.getElementById('player-hud');
                hud.classList.remove('hud-flash-blue'); void hud.offsetWidth; hud.classList.add('hud-flash-blue');
                Battle.updateHUD(p, 'player');
            }
            await Battle.typeText(p.level - startLvl > 1 ? `${p.name} grew all the way\nto Level ${p.level}!` : `${p.name} grew to Level ${p.level}!`);
            resolve();
        });
    },

    finishWin() {
        const p = this.party[this.activeSlot];
        const range = GAME_BALANCE.HEAL_WIN_MAX_PCT - GAME_BALANCE.HEAL_WIN_MIN_PCT;
        const healAmt = Math.floor(p.maxHp * (GAME_BALANCE.HEAL_WIN_MIN_PCT + (Math.random() * range)));
        if (healAmt > 0) { p.currentHp = Math.min(p.maxHp, p.currentHp + healAmt); AudioEngine.playSfx('heal'); Battle.updateHUD(p, 'player'); }

        const finalize = () => { this.save(); setTimeout(() => this.startNewBattle(false), 1000); };

        const checkTransform = async () => {
            if (p.transformBackup) {
                const s = document.getElementById('player-sprite');
                AudioEngine.playSfx('swoosh'); s.style.filter = "brightness(10)"; await wait(200);
                Battle.revertTransform(p);
                s.src = p.backSprite; s.classList.remove('transformed-sprite'); s.style.filter = "none";
                Battle.updateHUD(p, 'player'); await Battle.typeText(`${p.name} transformed\nback!`);
            }
            finalize();
        };

        const checkRage = () => { if (p.rageLevel > 0) { p.rageLevel = 0; Battle.updateHUD(p, 'player'); Battle.typeText(`${p.name} became\ncalm again!`, checkTransform); } else checkTransform(); };

        const checkLoot = () => {
            const levelDiff = this.enemyMon.level - p.level;
            let rate = this.enemyMon.isBoss ? LOOT_SYSTEM.DROP_RATE_BOSS : LOOT_SYSTEM.DROP_RATE_WILD;
            if (levelDiff > 0) rate += (levelDiff * 0.05);
            if (RNG.roll(rate)) {
                const key = this.getLoot(this.enemyMon, levelDiff); this.inventory[key]++; AudioEngine.playSfx('funfair');
                Battle.typeText(`Oh! ${this.enemyMon.name} dropped\na ${ITEMS[key].name}.`, checkRage);
            } else checkRage();
        };

        if (p.volatiles.substituteHP > 0) {
            if (p.volatiles.originalSprite) document.getElementById('player-sprite').src = p.volatiles.originalSprite;
            p.volatiles.substituteHP = 0; p.volatiles.originalSprite = null;
            AudioEngine.playSfx('swoosh'); Battle.typeText("The SUBSTITUTE\nfaded away!", checkLoot);
        } else checkLoot();
    },

    getLoot(enemy, levelDiff = 0) {
        if (DEBUG.ENABLED && DEBUG.LOOT.FORCE_ITEM) return DEBUG.LOOT.FORCE_ITEM;
        const bst = Object.values(enemy.baseStats).reduce((a, b) => a + b, 0);
        const score = (enemy.level * 1.5) + (bst / 10) + (this.wins * 1.5) + (Math.max(0, levelDiff) * 25);

        let totalWeight = 0;
        const pool = LOOT_SYSTEM.TABLE.map(item => {
            let weight = Math.max(0, item.base + (score * item.scaling));
            totalWeight += weight; return { key: item.key, weight: weight };
        });
        let random = Math.random() * totalWeight;
        for (let item of pool) { if (random < item.weight) return item.key; random -= item.weight; }
        return 'potion';
    },

    async tryMidBattleDrop(enemy) {
        let chance = DEBUG.ENABLED && DEBUG.LOOT.MID_BATTLE_RATE !== null ? DEBUG.LOOT.MID_BATTLE_RATE : LOOT_SYSTEM.DROP_RATE_MID_BATTLE;
        if (RNG.roll(chance)) {
            const key = this.getLoot(enemy, 0); this.inventory[key]++; AudioEngine.playSfx('catch_success');
            await Battle.typeText(`Oh! ${enemy.name} dropped\na ${ITEMS[key].name}.`);
        }
    },

    handleWin(wasCaught) {
        Battle.cleanup(); this.wins++; if (this.enemyMon.isBoss) this.bossesDefeated++;
        document.getElementById('streak-box').innerText = `WINS: ${this.wins}`; this.state = 'BATTLE';
        if (!wasCaught) this.enemyMon.currentHp = 0;

        // EXP Calc
        const b = this.enemyMon.baseExp; const L = this.enemyMon.level; const Lp = this.party[this.activeSlot].level;
        let gain = Math.floor(((b * L) / 5) * Math.pow((2 * L + 10) / (L + Lp + 10), 2.5)) + 1;
        if (this.enemyMon.isBoss) gain = Math.floor(gain * 1.5);
        if (wasCaught) gain = Math.floor(gain * 0.8);

        let targets, amt;
        if (this.enemyMon.isBoss) {
            targets = this.party.map((p, i) => ({ p, i })).filter(x => x.p.currentHp > 0).map(x => x.i); amt = gain;
        } else {
            targets = Array.from(Battle.participants); amt = Math.floor(gain / Math.max(1, targets.length));
        }
        this.distributeExp(amt, targets, this.enemyMon.isBoss);
    },

    handleLoss() {
        document.getElementById('text-content').classList.remove('full-width');
        if (this.party.some(p => p.currentHp > 0)) this.openParty(true);
        else {
            Battle.cleanup();
            document.getElementById('game-boy').style.animation = "flashWhite 0.5s";
            AudioEngine.playCry(this.party[this.activeSlot].cry);
            Battle.typeText(`Player is out of Pokemon...`, () => setTimeout(() => {
                document.getElementById('game-boy').style.animation = "";
                this.newGame();
            }, 2500));
        }
    },
};
