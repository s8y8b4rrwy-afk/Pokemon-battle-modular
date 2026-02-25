const Game = {
    tempSelection: null, tempSelectionList: [], party: [], activeSlot: 0, enemyMon: null, selectedItemKey: null,
    inventory: {
        potion: 1, superpotion: 0, hyperpotion: 0, maxpotion: 0, revive: 0, maxrevive: 0, fullheal: 0,
        antidote: 0, paralyzeheal: 0, burnheal: 0, iceheal: 0, awakening: 0,
        pokeball: 1, greatball: 0, ultraball: 0, masterball: 0, elixir: 0, bicycle: 1, pokedex: 1,
        rogue_attack: 0, rogue_defense: 0, rogue_sp_attack: 0, rogue_sp_defense: 0, rogue_speed: 0, rogue_hp: 0, rogue_crit: 0, rogue_xp: 0, rogue_shiny: 0
    },
    rogueItemState: {},
    state: 'START', selectedPartyIndex: -1, forcedSwitch: false, previousState: 'SELECTION', wins: 0, bossesDefeated: 0,
    playerName: 'PLAYER', currentSummaryIndex: 0, savedBattleState: null, battlesSinceLucky: 0,

    // --- SCREEN SHIMS ---
    showSelectionScreen(params) { return SelectionScreen.open(params); },
    openSummary(mon) { return SummaryScreen.open(mon); },
    renderSummaryData(mon) { return SummaryScreen.render(mon); },
    navSummary(dir) { return SummaryScreen.nav(dir); },
    closeSummary() { return SummaryScreen.close(); },
    confirmSelection() { return SelectionScreen.confirm(); },
    openParty(forced = false) {
        AudioEngine.playSfx('select');
        if (typeof ScreenManager !== 'undefined') {
            ScreenManager.push('PARTY', { forced: forced });
        } else {
            return PartyScreen.open(forced);
        }
    },
    renderParty() { return PartyScreen.render(); },
    openContext(index) { return PartyScreen.openContext(index); },
    closeContext() { return PartyScreen.closeContext(); },
    releasePokemon(index) { return PartyScreen.release(index); },
    applyItemToPokemon(index) { return PartyScreen.applyItem(index); },
    partySwitch() { return PartyScreen.shift(); },

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
            ScreenManager.push('CONTINUE');
        } else {
            ScreenManager.push('NAME_INPUT');
        }
    },

    save() {
        const currentEnemy = (this.state === 'BATTLE' && this.enemyMon && this.enemyMon.currentHp > 0) ? this.enemyMon : null;
        StorageSystem.save({
            party: this.party, inventory: this.inventory, wins: this.wins,
            bossesDefeated: this.bossesDefeated, activeSlot: this.activeSlot, playerName: this.playerName,
            enemyMon: currentEnemy, battlesSinceLucky: this.battlesSinceLucky,
            rogueItemState: this.rogueItemState,
            weather: (this.state === 'BATTLE') ? Battle.weather : { type: 'none', turns: 0 },
            delayedMoves: (this.state === 'BATTLE') ? Battle.delayedMoves : []
        });
    },

    load() {
        const data = StorageSystem.load();
        if (!data) return false;

        this.party = data.party || [];
        this.inventory = data.inventory || {};
        this.rogueItemState = data.rogueItemState || {};
        this.wins = data.wins || 0;

        // --- MIGRATION: Ensure new items (Pokedex, Bicycle) exist in old saves ---
        if (this.inventory.pokedex === undefined) this.inventory.pokedex = 1;
        if (this.inventory.bicycle === undefined) this.inventory.bicycle = 1;

        // --- ROGUE MIGRATION ---
        // --- ROGUE MIGRATION ---
        ['rogue_attack', 'rogue_defense', 'rogue_sp_attack', 'rogue_sp_defense', 'rogue_speed', 'rogue_hp', 'rogue_crit', 'rogue_xp', 'rogue_shiny'].forEach(k => {
            if (this.inventory[k] === undefined) this.inventory[k] = 0;

            // Integrity Check: Ensure state exists for items we have
            if (this.inventory[k] > 0) {
                if (!this.rogueItemState[k]) this.rogueItemState[k] = [];
                // Fill missing instances
                while (this.rogueItemState[k].length < this.inventory[k]) {
                    const lifetime = (typeof ROGUE_CONFIG !== 'undefined' && ROGUE_CONFIG.ROGUE_ITEM_LIFETIME) ? ROGUE_CONFIG.ROGUE_ITEM_LIFETIME : 5;
                    this.rogueItemState[k].push({ turns: lifetime });
                }
            }
        });

        this.bossesDefeated = data.bossesDefeated || 0;
        this.activeSlot = data.activeSlot || 0;
        this.playerName = data.playerName || 'PLAYER';
        this.enemyMon = data.enemyMon || null;
        this.battlesSinceLucky = data.battlesSinceLucky || 0;

        // --- MIGRATION: Growth Rates ---
        this.party.forEach(p => {
            if (!p.growthRate) p.growthRate = 'medium-fast';
        });

        // Hold state for Battle to pick up
        this.savedBattleState = {
            weather: data.weather || { type: 'none', turns: 0 },
            delayedMoves: data.delayedMoves || []
        };

        // Cleanup if not resuming a battle
        const isResuming = (this.enemyMon !== null);
        this.party.forEach(p => {
            p.nextLvlExp = ExpCalc.getNextLevelExp(p.growthRate, p.level);
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

    handleDebug() {
        if (!DEBUG.ENABLED) {
            return;
        }

        // 1. Apply standard overrides from debug.js
        if (DEBUG.INVENTORY) {
            Object.assign(this.inventory, DEBUG.INVENTORY);
        }

        // 2. Comprehensive Item Fill
        if (DEBUG.GIVE_ALL_ITEMS && typeof ITEMS !== 'undefined') {
            for (const key in ITEMS) {
                const item = ITEMS[key];
                // Decide quantity based on item type
                let qty = DEBUG.BASE_ITEM_QUANTITY || 20;
                if (item.type === 'rogue') qty = DEBUG.ROGUE_QUANTITY || 10;
                if (item.type === 'key') qty = 1;

                // Apply quantity (preserve manual overrides if they are higher)
                if (this.inventory[key] === undefined || this.inventory[key] < qty) {
                    this.inventory[key] = qty;
                }
            }
        }
    },

    // --- FLOW CONTROL ---
    startNameInput() {
        ScreenManager.push('NAME_INPUT');
    },

    confirmName() {
        const val = document.getElementById('name-input').value.trim().toUpperCase();
        this.playerName = val || 'GOLD';
        this.newGame();
    },

    loadGame() {
        document.getElementById('continue-screen').classList.add('hidden');
        Battle.resetScene();
        Battle.uiLocked = true;

        if (this.load()) {
            // Sync Pokedex with party
            if (typeof PokedexData !== 'undefined') PokedexData.registerTeam(this.party);

            // Hide everything and clear the stack properly
            if (typeof ScreenManager !== 'undefined') {
                ScreenManager.clear();
            } else {
                UI.hideAll(['start-screen', 'continue-screen', 'name-screen', 'selection-screen', 'summary-panel', 'party-screen', 'pack-screen']);
            }

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

            // --- BUFF/REPAIR: Force overflow release if party is bugged at 7 ---
            if (this.party.length > 6) {
                this.state = 'OVERFLOW';
                setTimeout(() => this.openParty(true), 500);
                return;
            }

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
                // Ensure we don't wipe progress on a simple continue
                const isBrandNew = (this.party.length === 0);
                this.startNewBattle(isBrandNew);
            }
        }
    },

    newGame() {
        StorageSystem.wipe();
        this.party = []; this.wins = 0; this.bossesDefeated = 0;
        this.inventory = {
            potion: 1, superpotion: 0, hyperpotion: 0, maxpotion: 0, revive: 0, maxrevive: 0, fullheal: 0,
            antidote: 0, paralyzeheal: 0, burnheal: 0, iceheal: 0, awakening: 0,
            pokeball: 1, greatball: 0, ultraball: 0, masterball: 0, elixir: 0, bicycle: 1, pokedex: 1,
            rogue_attack: 0, rogue_defense: 0, rogue_sp_attack: 0, rogue_sp_defense: 0, rogue_speed: 0, rogue_hp: 0, rogue_crit: 0, rogue_xp: 0, rogue_shiny: 0
        };
        this.rogueItemState = {}; // Tracks individual item lifetimes
        this.handleDebug();

        // Use ScreenManager for Selection
        if (typeof ScreenManager !== 'undefined') {
            ScreenManager.replace('SELECTION');
        } else {
            SelectionScreen.open();
        }
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
        UI.hideAll(['scene', 'dialog-box', 'streak-box', 'summary-panel', 'party-screen', 'pack-screen', 'action-menu', 'move-menu', 'selection-screen', 'name-screen', 'continue-screen']);
        Battle.resetScene();

        if (typeof ScreenManager !== 'undefined') {
            ScreenManager.resetToTitle();
        } else {
            UI.show('start-screen');
            Input.setMode('START');
        }
    },

    skipBattle() {
        Battle.cleanup();
        this.save();
        setTimeout(() => { this.startNewBattle(false); }, 1000);
    },

    async startNewBattle(isFirst = false) {

        this.state = 'BATTLE';
        Battle.resetScene();

        // Loading Logic: Only show text if load is slow (>2s)
        let showLoading = true;
        const loadTimer = setTimeout(() => {
            if (showLoading) {
                UI.typeText("Searching for wild\nPokemon...");
            }
        }, 2000);

        if (isFirst) {
            // New Game Setup
            this.wins = 0; this.bossesDefeated = 0;

            // Only generate starter if party is empty (e.g. skipped selection screen?)
            if (this.party.length === 0) {
                const starterId = DEBUG.ENABLED && DEBUG.PLAYER.ID ? DEBUG.PLAYER.ID : [152, 155, 158][RNG.int(0, 2)];
                const level = DEBUG.ENABLED && DEBUG.PLAYER.LEVEL ? DEBUG.PLAYER.LEVEL : 5;

                const overrides = {};
                if (DEBUG.ENABLED) {
                    if (DEBUG.PLAYER.SHINY !== null) overrides.shiny = DEBUG.PLAYER.SHINY;
                }

                const p = await API.getPokemon(starterId, level, overrides);
                if (DEBUG.ENABLED && DEBUG.PLAYER.RAGE) p.rageLevel = DEBUG.PLAYER.RAGE;

                this.party.push(p);
            }
            this.activeSlot = 0;

            // Generate initial inventory driven by constants/debug
            const potions = DEBUG.ENABLED && DEBUG.INVENTORY && DEBUG.INVENTORY.potion ? DEBUG.INVENTORY.potion : 5;
            const balls = DEBUG.ENABLED && DEBUG.INVENTORY && DEBUG.INVENTORY.pokeball ? DEBUG.INVENTORY.pokeball : 10;

            // Default Inventory
            this.inventory = {
                'potion': potions, 'pokeball': balls, 'superpotion': 0, 'hyperpotion': 0, 'maxpotion': 0, 'greatball': 0, 'ultraball': 0, 'masterball': 0, 'revive': 0, 'maxrevive': 0, 'fullheal': 0,
                'antidote': 0, 'paralyzeheal': 0, 'burnheal': 0, 'iceheal': 0, 'awakening': 0, 'elixir': 0, 'bicycle': 1, 'pokedex': 1,
                rogue_attack: 0, rogue_defense: 0, rogue_sp_attack: 0, rogue_sp_defense: 0, rogue_speed: 0, rogue_hp: 0, rogue_crit: 0, rogue_xp: 0, rogue_shiny: 0
            };
            this.rogueItemState = {};

            // Full Debug Inventory Override
            this.handleDebug();
        } else {
            // Restore Volatiles for existing party (Reset all, not just active)
            this.party.forEach(p => {
                p.volatiles = {};
                p.stages = { atk: 0, def: 0, spa: 0, spd: 0, spe: 0, acc: 0, eva: 0 };
                p.rageLevel = 0;
            });

        }

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

        // GENERATE ENEMY (Delegated to Manager)
        try {
            this.enemyMon = await EncounterManager.generate(this.party, this.wins);
        } catch (err) {
            console.error(err);
            // Hard fallback
            this.enemyMon = await API.getPokemon(25, 5, {});
        }

        // Load Complete
        clearTimeout(loadTimer);
        showLoading = false;

        // Clear text immediately if it started typing, or ensure it's empty
        const textEl = document.getElementById('text-content');
        textEl.innerHTML = "";

        // Start Sequence
        const img = new Image();
        const launch = () => {
            eSprite.src = this.enemyMon.frontSprite;
            Battle.setup(this.party[this.activeSlot], this.enemyMon, true, !isFirst);
        };
        img.onload = launch;
        img.onerror = launch;
        img.src = this.enemyMon.frontSprite;

        // Ensure party is registered in Pokedex (Catch-all for new starters/backups)
        if (typeof PokedexData !== 'undefined') PokedexData.registerTeam(this.party);

        this.save();
    },

    // --- MENUS (Selection, Summary, Party, etc) ---
    // These remain largely unchanged, just compacted slightly for cleanliness



    // --- ROGUE LOGIC ---
    async addRogueItem(key) {
        if (!this.inventory[key]) this.inventory[key] = 0;
        this.inventory[key]++;

        const itemData = (typeof ITEMS !== 'undefined') ? ITEMS[key] : null;
        if (!itemData || itemData.type !== 'rogue') return; // Safety: Non-rogue items don't decay

        if (!this.rogueItemState) this.rogueItemState = {};
        if (!this.rogueItemState[key]) this.rogueItemState[key] = [];

        // Add new instance with full lifetime
        // Use default lifetime from settings or fallback to 5
        const lifetime = (typeof ROGUE_CONFIG !== 'undefined' && ROGUE_CONFIG.ROGUE_ITEM_LIFETIME) ? ROGUE_CONFIG.ROGUE_ITEM_LIFETIME : 5;
        this.rogueItemState[key].push({ turns: lifetime });

        if (typeof TutorialManager !== 'undefined') {
            await TutorialManager.checkTutorial(key);
        }
    },

    async processRogueTurn() {
        if (!this.rogueItemState) return;

        let changed = false;
        let expiredNames = [];
        let expiredKeys = [];

        for (const key in this.rogueItemState) {
            const itemData = (typeof ITEMS !== 'undefined') ? ITEMS[key] : null;
            if (!itemData || itemData.type !== 'rogue') {
                delete this.rogueItemState[key]; // Cleanup non-rogue or legacy items
                continue;
            }

            const list = this.rogueItemState[key];
            if (!list || list.length === 0) continue;

            const nextList = [];
            for (const item of list) {
                item.turns--;
                if (item.turns > 0) {
                    nextList.push(item);
                } else {
                    changed = true;
                }
            }

            this.rogueItemState[key] = nextList;

            // Sync Inventory Count
            const prevCount = this.inventory[key] || 0;
            if (prevCount !== nextList.length) {
                // If items were lost
                if (prevCount > nextList.length) {
                    const name = (typeof ITEMS !== 'undefined' && ITEMS[key]) ? ITEMS[key].name : key;
                    expiredNames.push(name);
                    expiredKeys.push(key);
                }
                this.inventory[key] = nextList.length;
            }
        }

        if (changed) {
            // Recalculate stats for all party members as buffs might have expired
            this.party.forEach(p => StatCalc.recalculate(p));

            // Sync HUD if we are currently in a battle and the active mon was affected
            if (typeof Battle !== 'undefined' && Battle.p) {
                UI.updateHUD(Battle.p, 'player');
                if (Battle.e) UI.updateHUD(Battle.e, 'enemy');
            }

            if (expiredNames.length > 0 && typeof DialogManager !== 'undefined') {
                // Group notifications to avoid spamming 1 line per item
                for (let i = 0; i < expiredNames.length; i += 2) {
                    const n1 = expiredNames[i];
                    const k1 = expiredKeys[i];
                    const n2 = expiredNames[i + 1];
                    const k2 = expiredKeys[i + 1];

                    let msg = `The ${n1}\ndecayed!`;
                    let keysToPass = [k1];

                    if (n2) {
                        msg = `The ${n1} and\n${n2} decayed!`;
                        keysToPass.push(k2);
                    }

                    AudioEngine.playSfx('stat_down');
                    // Show message and box
                    await DialogManager.show(msg, { lock: true, skipWait: true });
                    await UI.showRogueBoostStats(keysToPass, true);
                }
            }
        }
    },

    // --- EXP & WINS ---
    async distributeExp(participantIndices, shareIndices, wasCaught, amountOverride = null) {
        const isSpecialReward = amountOverride !== null || (this.enemyMon && (this.enemyMon.isBoss || this.enemyMon.isLucky));

        if (amountOverride !== null) {
            AudioEngine.playSfx('exp');
            await UI.typeText(`The team gained\na boosted ${amountOverride} EXP!`);
        }

        // 1. DISTRIBUTE TO PARTICIPANTS (100% XP)
        for (const index of participantIndices) {
            const p = this.party[index];
            if (!p || p.currentHp <= 0) continue;

            // Calculate gain for THIS participant specifically (fixes level scaling issues)
            let amount = amountOverride !== null ? amountOverride : Mechanics.calcExpGain(this.enemyMon, p, wasCaught);

            // No splitting! (Modern style as requested)
            if (amount < 1) amount = 1;

            // Individual message for participants
            await DialogManager.show(`${p.name} gained\n${amount} EXP. Points!`, { lock: true, delay: 1000, noSkip: true });

            if (index === this.activeSlot) {
                await this.gainExpAnim(amount, p);
            } else {
                p.exp += amount;
                if (p.exp >= p.nextLvlExp) await this.processLevelUp(p);
            }
        }

        // 2. DISTRIBUTE TO TEAM (XP SHARE - Usually 50% XP)
        if (shareIndices && shareIndices.length > 0) {
            const shareMult = (typeof GAME_BALANCE !== 'undefined') ? GAME_BALANCE.EXP_SHARE_TEAM_PCT : 0.50;

            // Single collective message
            await DialogManager.show(`The rest of the team\ngained EXP. Points!`, { lock: true });

            for (const index of shareIndices) {
                const p = this.party[index];
                if (!p || p.currentHp <= 0) continue;

                let amount = amountOverride !== null ? Math.floor(amountOverride * shareMult) : Math.floor(Mechanics.calcExpGain(this.enemyMon, p, wasCaught) * shareMult);
                if (amount < 1) amount = 1;

                p.exp += amount;
                if (p.exp >= p.nextLvlExp) {
                    // Still show level up because it's important
                    await this.processLevelUp(p);
                }
            }
        }

        await this.finishWin();
    },

    async gainExpAnim(amount, p) {
        let remaining = amount;
        let levelsGained = 0;

        while (remaining > 0) {
            const startExp = p.exp;
            const distanceToNext = p.nextLvlExp - p.exp;
            const toAdd = Math.min(remaining, distanceToNext);
            const targetExp = p.exp + toAdd;

            // Animate XP bar growth for this level's segment
            await UI.animateXP(p, startExp, targetExp, levelsGained);

            p.exp = targetExp;
            remaining -= toAdd;

            if (p.exp >= p.nextLvlExp) {
                levelsGained++;
                // Force sync and process level up
                UI.updateHUD(p, 'player');
                await this.processLevelUp(p);
            }

            // Sync after each segment
            UI.updateHUD(p, 'player');
            await wait(100);
        }
    },



    async processLevelUp(p) {
        const startLvl = p.level;
        const levelsGained = [];

        // Capture old stats for the UI display
        const oldStats = { ...p.stats };

        // 1. Calculate how many levels were gained
        while (p.exp >= p.nextLvlExp) {
            p.exp -= p.nextLvlExp;
            p.level++;
            levelsGained.push(p.level);
            p.nextLvlExp = ExpCalc.getNextLevelExp(p.growthRate, p.level);
        }

        StatCalc.recalculate(p);
        AudioEngine.playSfx('levelup');

        if (this.activeSlot === this.party.indexOf(p)) {
            const hud = document.getElementById('player-hud');
            hud.classList.remove('hud-flash-blue'); void hud.offsetWidth; hud.classList.add('hud-flash-blue');
            UI.updateHUD(p, 'player');
        }

        await DialogManager.show(p.level - startLvl > 1 ? `${p.name} grew all the way\nto Level ${p.level}!` : `${p.name} grew to\nLevel ${p.level}!`, { lock: true, skipWait: true });

        // Show the little box with stat gains
        await UI.showLevelUpStats(p, oldStats);

        // 2. CHECK MOVES FOR EVERY LEVEL GAINED
        if (typeof MoveLearnScreen !== 'undefined') {
            for (const lvl of levelsGained) {
                await MoveLearnScreen.checkAndLearn(p, lvl);

                // --- NEW: SPECIAL MOVE CHANCE (TM/Tutor) ---
                const specialChance = GAME_BALANCE.MOVE_LEARN_SPECIAL_CHANCE || 0.15;
                if (Math.random() < specialChance) {
                    const specialMoveName = await API.getRandomSpecialMove(p.id);
                    if (specialMoveName) {
                        await DialogManager.show(`Oh! ${p.name}\ngot inspired!`, { lock: true });
                        await MoveLearnScreen.tryLearn(p, specialMoveName);
                    }
                }
            }
        }

        // 3. Evolution Check (Only once at the end)
        if (typeof Evolution !== 'undefined') {
            const evo = await Evolution.check(p);
            if (evo) await Evolution.execute(p, evo);
        }
    },


    async finishWin() {
        // --- PENDING EVOLUTIONS (Stone & Debug) ---
        for (const mon of this.party) {
            if (mon && mon.pendingEvoStone) {
                const targetData = mon.pendingEvoStone;
                mon.pendingEvoStone = null;
                if (typeof Evolution !== 'undefined') {
                    await Evolution.execute(mon, targetData, false);
                }
            }

            if (mon && (mon.pendingDebugEvo || mon.pendingDebugEvoMove)) {
                const learnMove = !!mon.pendingDebugEvoMove;
                mon.pendingDebugEvo = false;
                mon.pendingDebugEvoMove = false;
                if (typeof Evolution !== 'undefined') {
                    await Evolution.forceEvolveByItem(mon, learnMove);
                }
            }

            if (mon && mon.pendingInspirationMove) {
                mon.pendingInspirationMove = false;
                const specialMoveName = await API.getRandomSpecialMove(mon.id);
                if (specialMoveName) {
                    await DialogManager.show(`${mon.name} is inspired\nby the battle!`, { lock: true });
                    if (typeof MoveLearnScreen !== 'undefined') {
                        await MoveLearnScreen.tryLearn(mon, specialMoveName);
                    }
                }
            }
        }

        const p = this.party[this.activeSlot];

        const finalize = async () => {
            // Check if active mon is fainted (Simultaneous faint case)
            if (p && p.currentHp <= 0) {
                // Manually trigger faint animation for the player
                const sprite = document.getElementById('player-sprite');
                const hud = document.getElementById('player-hud');

                if (p.cry) AudioEngine.playCry(p.cry);
                await wait(ANIM.FAINT_PRE_DELAY);

                sprite.style.opacity = 1;
                sprite.classList.add('anim-faint');
                AudioEngine.playSfx('swoosh');
                setTimeout(() => hud.classList.remove('hud-active'), ANIM.HUD_SLIDE_DELAY);

                await DialogManager.show(`${p.name}\nfainted!`, { lock: true });
                await wait(ANIM.FAINT_POST_DELAY);

                const hasOthers = this.party.some(mon => mon.currentHp > 0);
                if (hasOthers) {
                    await UI.typeText(`Choose another! \nPokemon!`);
                    const selectedIndex = await new Promise(resolve => {
                        Battle.userInputPromise = resolve;
                        this.openParty(true);
                    });
                    Battle.userInputPromise = null;
                    this.activeSlot = selectedIndex;

                    // Trigger switch animation for the new mon
                    await Battle.processSwitch(this.party[selectedIndex], true);
                } else {
                    // Everyone is fainted - handle loss sequence
                    await this.handleLoss();
                    return;
                }
            }

            this.save();

            await wait(1000);

            this.startNewBattle(false);
        };

        if (!p) { await finalize(); return; }

        // 1. Conditional HP restoration (Only if NOT fainted)
        if (p.currentHp > 0) {
            const range = GAME_BALANCE.HEAL_WIN_MAX_PCT - GAME_BALANCE.HEAL_WIN_MIN_PCT;
            const healAmt = Math.floor(p.maxHp * (GAME_BALANCE.HEAL_WIN_MIN_PCT + (Math.random() * range)));
            if (healAmt > 0) {
                const startHp = p.currentHp;
                const endHp = Math.min(p.maxHp, p.currentHp + healAmt);
                AudioEngine.playSfx('heal');
                await UI.animateHP(p, 'player', startHp, endHp);
            }
        }


        const checkTransform = async () => {
            if (p.transformBackup) {
                const s = document.getElementById('player-sprite');
                AudioEngine.playSfx('swoosh'); s.style.filter = "brightness(10)"; await wait(200);
                Battle.revertTransform(p);
                s.src = p.backSprite; s.classList.remove('transformed-sprite'); s.style.filter = "none";
                UI.updateHUD(p, 'player');
                await DialogManager.show(`${p.name} transformed\nback!`, { lock: true });
            }
            await finalize();
        };

        const checkRage = async () => {
            if (p.rageLevel > 0) {
                p.rageLevel = 0;
                UI.updateHUD(p, 'player');
                await DialogManager.show(`${p.name} became\ncalm again!`, { lock: true });
                await checkTransform();
            } else await checkTransform();
        };

        const checkLoot = async () => {
            if (this.enemyMon) await LootManager.processPostBattleDrops(this.enemyMon, this.wins);
            await checkRage();
        };

        const checkFieldRecovery = async () => {
            for (const member of this.party) {
                if (member.status) {
                    member.statusTurnCount = (member.statusTurnCount || 0) + 1;
                    if (member.statusTurnCount >= 2) {
                        const oldStatus = member.status;
                        member.status = null;
                        member.statusTurnCount = 0;

                        let msg = `${member.name} recovered from\nits status!`;
                        if (oldStatus === 'poison') msg = `${member.name} extracted the\npoison!`;
                        else if (oldStatus === 'burn') msg = `${member.name} healed its\nburn!`;
                        else if (oldStatus === 'paralysis') msg = `${member.name} shook off the\nparalysis!`;
                        else if (oldStatus === 'freeze') msg = `${member.name} melted the\nice!`;
                        else if (oldStatus === 'sleep') msg = `${member.name} woke up!`;

                        await DialogManager.show(msg, { lock: true });

                        if (member === this.party[this.activeSlot]) {
                            UI.updateHUD(member, 'player');
                        }
                    }
                } else {
                    member.statusTurnCount = 0;
                }
            }
            await checkLoot();
        };

        if (p.volatiles.substituteHP > 0) {
            if (p.volatiles.originalSprite) document.getElementById('player-sprite').src = p.volatiles.originalSprite;
            p.volatiles.substituteHP = 0; p.volatiles.originalSprite = null;
            AudioEngine.playSfx('swoosh');
            await DialogManager.show("The SUBSTITUTE\\nfaded away!", { lock: true });
            await checkFieldRecovery();
        } else await checkFieldRecovery();
    },

    async tryMidBattleDrop(enemy, options = {}) {
        await LootManager.processMidBattleDrop(enemy, options);
    },

    async handleWin(wasCaught) {
        await this.processRogueTurn();
        Battle.cleanup();

        // Safety: If no enemy (e.g. overflow cleanup on load), just finish
        if (!this.enemyMon) {
            this.state = 'START';
            await this.finishWin();
            return;
        }

        this.wins++;
        if (this.enemyMon.isBoss) this.bossesDefeated++;
        document.getElementById('streak-box').innerText = `WINS: ${this.wins}`;
        this.state = 'BATTLE';

        if (!wasCaught) this.enemyMon.currentHp = 0;

        // EXP Calc (Only if we have an enemy to gain rewards from)
        const participants = Array.from(Battle.participants).filter(idx => this.party[idx] && this.party[idx].currentHp > 0);
        const nonParticipants = this.party.map((p, i) => i).filter(i => !participants.includes(i) && this.party[i].currentHp > 0);

        if (participants.length > 0 || nonParticipants.length > 0) {
            await this.distributeExp(participants, nonParticipants, wasCaught);
        } else {
            await this.finishWin();
        }
    },

    async handleLoss() {
        await this.processRogueTurn();
        UI.textEl.classList.remove('full-width');
        if (this.party.some(p => p.currentHp > 0)) {
            const selectedIndex = await new Promise(resolve => {
                const wasForced = this.forcedSwitch;
                this.forcedSwitch = true;
                Battle.userInputPromise = resolve;
                this.openParty(true);
            });
            Battle.userInputPromise = null;
            this.activeSlot = selectedIndex;

            // Trigger switch animation for the new mon
            await Battle.processSwitch(this.party[selectedIndex], true);
            Battle.uiLocked = false;
            BattleMenus.uiToMenu();
        } else {
            // document.getElementById('game-boy').style.animation = "flashWhite 0.5s";

            await UI.typeText(`${this.playerName} is out of\nuseable Pokemon!`);
            await wait(1000);
            await UI.typeText(`${this.playerName} blacked out!`);
            await wait(2000);

            // NEW: Persistence Logic
            // 1. Capture current inventory
            const savedInventory = { ...this.inventory };

            // 2. Replenish Essentials (if low)
            if (savedInventory.potion < 5) savedInventory.potion = 5;
            if (savedInventory.pokeball < 5) savedInventory.pokeball = 5;

            await UI.typeText(`...but managed to\nkeep hold of items!`);
            await wait(2000);

            document.getElementById('game-boy').style.animation = "";

            // 3. Reset Game
            this.newGame();

            // 4. Restore Inventory
            this.inventory = savedInventory;

            // 5. Save immediately so the reload has the items
            this.save();
        }
    },
};
