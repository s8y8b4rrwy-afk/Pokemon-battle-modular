const Game = {
    tempSelection: null, tempSelectionList: [], party: [], activeSlot: 0, enemyMon: null, selectedItemKey: null,
    inventory: { potion: 1, superpotion: 0, hyperpotion: 0, maxpotion: 0, revive: 0, pokeball: 1, greatball: 0, ultraball: 0, masterball: 0 },
    state: 'START', selectedPartyIndex: -1, forcedSwitch: false, previousState: 'SELECTION', wins: 0, bossesDefeated: 0,
    playerName: 'PLAYER', currentSummaryIndex: 0, savedBattleState: null,

    // --- SCREEN SHIMS ---
    showSelectionScreen(...args) { return SelectionScreen.open(...args); },
    openSummary(...args) { return SummaryScreen.open(...args); },
    renderSummaryData(...args) { return SummaryScreen.render(...args); },
    navSummary(...args) { return SummaryScreen.nav(...args); },
    closeSummary(...args) { return SummaryScreen.close(...args); },
    confirmSelection(...args) { return SelectionScreen.confirm(...args); },
    openParty(...args) { return PartyScreen.open(...args); },
    renderParty(...args) { return PartyScreen.render(...args); },
    openContext(...args) { return PartyScreen.openContext(...args); },
    closeContext(...args) { return PartyScreen.closeContext(...args); },
    releasePokemon(...args) { return PartyScreen.release(...args); },
    applyItemToPokemon(...args) { return PartyScreen.applyItem(...args); },
    partySwitch(...args) { return PartyScreen.shift(...args); },

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
        AudioEngine.init();
        if (StorageSystem.exists()) {
            const data = StorageSystem.load();
            UI.hide('start-screen');
            UI.show('continue-screen');
            document.getElementById('save-wins').innerText = data.wins || 0;
            document.getElementById('save-bosses').innerText = data.bossesDefeated || 0;
            document.getElementById('save-name').innerText = data.playerName || 'PLAYER';

            const prevRow = document.getElementById('save-preview');
            prevRow.innerHTML = '';
            data.party.forEach((p) => {
                const img = document.createElement('img'); img.src = p.icon; img.className = 'mini-icon';
                if (p.currentHp <= 0) img.classList.add('fainted');
                img.onclick = () => SummaryScreen.open(p, 'READ_ONLY');
                prevRow.appendChild(img);
            });
            Input.setMode('CONTINUE');
        } else {
            UI.hide('start-screen');
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
        UI.hide('continue-screen');
        UI.show('name-screen');
        document.getElementById('name-input').focus();
        Input.setMode('NAME');
    },

    confirmName() {
        const val = document.getElementById('name-input').value.trim().toUpperCase();
        this.playerName = val || 'GOLD';
        UI.hide('name-screen');
        this.newGame();
    },

    loadGame() {
        document.getElementById('continue-screen').classList.add('hidden');
        Battle.resetScene();
        Battle.uiLocked = true;

        if (this.load()) {
            if (DEBUG.ENABLED) Object.assign(this.inventory, DEBUG.INVENTORY);

            UI.hide('selection-screen');
            UI.show('scene');
            UI.show('dialog-box');
            UI.show('streak-box');
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
                    UI.typeText(`Resumed battle against\n${this.enemyMon.name}!`, () => { Battle.uiLocked = false; Battle.uiToMenu(); });
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
        SelectionScreen.open();
    },

    resetToTitle() {
        StorageSystem.wipe();
        this.party = []; this.wins = 0; this.bossesDefeated = 0;

        // Hide All
        UI.hideAll(['scene', 'dialog-box', 'summary-panel', 'streak-box', 'pack-screen', 'party-screen', 'action-menu', 'move-menu', 'selection-screen']);

        UI.show('start-screen');
        Input.setMode('START');
    },

    returnToTitle() {
        this.state = 'START';
        UI.hideAll(['scene', 'dialog-box', 'streak-box', 'summary-panel', 'party-screen', 'pack-screen', 'action-menu', 'move-menu']);
        Battle.resetScene();
        UI.show('start-screen');
        Input.setMode('START');
    },

    skipBattle() {
        Battle.cleanup();
        this.save();
        setTimeout(() => { this.startNewBattle(false); }, 1000);
    },

    async startNewBattle(isFirst = false) {
        Battle.resetScene();

        // Safety Check: If active slot fainted (e.g. via Destiny Bond), pick next healthy one
        if (!this.party[this.activeSlot] || this.party[this.activeSlot].currentHp <= 0) {
            const nextIdx = this.party.findIndex(p => p.currentHp > 0);
            if (nextIdx !== -1) this.activeSlot = nextIdx;
        }

        // Ghost Fix
        const eSprite = document.getElementById('enemy-sprite');
        eSprite.style.opacity = 0;
        eSprite.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

        Battle.uiLocked = true;
        this.enemyMon = null;

        UI.typeText("Searching for wild Pokemon...", null, true);

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



    // --- EXP & WINS ---
    async distributeExp(amount, targetIndices, isBossReward) {
        if (isBossReward) { AudioEngine.playSfx('exp'); await UI.typeText(`The team gained\n${amount} EXP. Points!`); }
        for (const index of targetIndices) {
            const p = this.party[index];
            if (!p || p.currentHp <= 0) continue;
            if (index === this.activeSlot) {
                if (!isBossReward) await UI.typeText(`${p.name} gained\n${amount} EXP. Points!`);
                await this.gainExpAnim(amount, p);
            } else {
                if (!isBossReward) await UI.typeText(`${p.name} gained\n${amount} EXP. Points!`);
                p.exp += amount;
                if (p.exp >= p.nextLvlExp) await this.processLevelUp(p);
            }
        }
        await this.finishWin();
    },

    gainExpAnim(amount, p) {
        p.exp += amount; UI.updateHUD(p, 'player');
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
                UI.updateHUD(p, 'player');
            }
            await UI.typeText(p.level - startLvl > 1 ? `${p.name} grew all the way\nto Level ${p.level}!` : `${p.name} grew to Level ${p.level}!`);
            resolve();
        });
    },

    async finishWin() {
        const p = this.party[this.activeSlot];

        // 1. Conditional HP restoration (Only if NOT fainted)
        if (p.currentHp > 0) {
            const range = GAME_BALANCE.HEAL_WIN_MAX_PCT - GAME_BALANCE.HEAL_WIN_MIN_PCT;
            const healAmt = Math.floor(p.maxHp * (GAME_BALANCE.HEAL_WIN_MIN_PCT + (Math.random() * range)));
            if (healAmt > 0) {
                p.currentHp = Math.min(p.maxHp, p.currentHp + healAmt);
                AudioEngine.playSfx('heal');
                UI.updateHUD(p, 'player');
            }
        }

        const finalize = async () => {
            // Check if active mon is fainted (Simultaneous faint case)
            if (p.currentHp <= 0) {
                const hasOthers = this.party.some(mon => mon.currentHp > 0);
                if (hasOthers) {
                    await UI.typeText(`${p.name} fainted!\nChoose another!`);
                    const selectedIndex = await new Promise(resolve => {
                        Battle.userInputPromise = resolve;
                        this.openParty(true);
                    });
                    Battle.userInputPromise = null;
                    this.activeSlot = selectedIndex;
                } else {
                    // Everyone is fainted - this shouldn't happen if handleWin/Loss are synced
                    // but as a safety, trigger loss if no one is left.
                    await this.handleLoss();
                    return;
                }
            }

            this.save();
            setTimeout(() => this.startNewBattle(false), 1000);
        };

        const checkTransform = async () => {
            if (p.transformBackup) {
                const s = document.getElementById('player-sprite');
                AudioEngine.playSfx('swoosh'); s.style.filter = "brightness(10)"; await wait(200);
                Battle.revertTransform(p);
                s.src = p.backSprite; s.classList.remove('transformed-sprite'); s.style.filter = "none";
                UI.updateHUD(p, 'player');
                await UI.typeText(`${p.name} transformed\nback!`);
            }
            await finalize();
        };

        const checkRage = async () => {
            if (p.rageLevel > 0) {
                p.rageLevel = 0;
                UI.updateHUD(p, 'player');
                await UI.typeText(`${p.name} became\ncalm again!`);
                await checkTransform();
            } else await checkTransform();
        };

        const checkLoot = async () => {
            const levelDiff = this.enemyMon.level - p.level;
            let rate = this.enemyMon.isBoss ? LOOT_SYSTEM.DROP_RATE_BOSS : LOOT_SYSTEM.DROP_RATE_WILD;
            if (levelDiff > 0) rate += (levelDiff * 0.05);
            if (RNG.roll(rate)) {
                const key = Mechanics.getLoot(this.enemyMon, this.wins, levelDiff); this.inventory[key]++; AudioEngine.playSfx('funfair');
                await UI.typeText(`Oh! ${this.enemyMon.name} dropped\\na ${ITEMS[key].name}.`);
                await checkRage();
            } else await checkRage();
        };

        if (p.volatiles.substituteHP > 0) {
            if (p.volatiles.originalSprite) document.getElementById('player-sprite').src = p.volatiles.originalSprite;
            p.volatiles.substituteHP = 0; p.volatiles.originalSprite = null;
            AudioEngine.playSfx('swoosh');
            await UI.typeText("The SUBSTITUTE\\nfaded away!");
            await checkLoot();
        } else await checkLoot();
    },

    async tryMidBattleDrop(enemy) {
        let chance = DEBUG.ENABLED && DEBUG.LOOT.MID_BATTLE_RATE !== null ? DEBUG.LOOT.MID_BATTLE_RATE : LOOT_SYSTEM.DROP_RATE_MID_BATTLE;
        if (RNG.roll(chance)) {
            const key = Mechanics.getLoot(enemy, this.wins, 0); this.inventory[key]++; AudioEngine.playSfx('catch_success');
            await UI.typeText(`Oh! ${enemy.name} dropped\na ${ITEMS[key].name}.`);
        }
    },

    async handleWin(wasCaught) {
        Battle.cleanup(); this.wins++; if (this.enemyMon.isBoss) this.bossesDefeated++;
        document.getElementById('streak-box').innerText = `WINS: ${this.wins}`; this.state = 'BATTLE';
        if (!wasCaught) this.enemyMon.currentHp = 0;

        // EXP Calc
        const activeMon = this.party[this.activeSlot];
        let gain = Mechanics.calcExpGain(this.enemyMon, activeMon, wasCaught);

        let targets, amt;
        if (this.enemyMon.isBoss) {
            targets = this.party.map((p, i) => ({ p, i })).filter(x => x.p.currentHp > 0).map(x => x.i);
            amt = gain;
        } else {
            // Filter participants to only those still alive (Gen 2 style)
            targets = Array.from(Battle.participants).filter(idx => this.party[idx] && this.party[idx].currentHp > 0);
            amt = Math.floor(gain / Math.max(1, targets.length));
        }

        if (targets.length > 0) {
            await this.distributeExp(amt, targets, this.enemyMon.isBoss);
        } else {
            await this.finishWin();
        }
    },

    async handleLoss() {
        UI.textEl.classList.remove('full-width');
        if (this.party.some(p => p.currentHp > 0)) {
            PartyScreen.open(true);
        } else {
            Battle.cleanup();
            document.getElementById('game-boy').style.animation = "flashWhite 0.5s";

            await UI.typeText(`${this.playerName} is out of\nuseable Pokemon!`);
            await wait(1000);
            await UI.typeText(`${this.playerName} blacked out!`);
            await wait(2000);

            document.getElementById('game-boy').style.animation = "";
            this.newGame(); // Reset game & wipe save
        }
    },
};
