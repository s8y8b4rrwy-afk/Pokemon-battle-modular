const Game = {
    tempSelection: null, tempSelectionList: [], party: [], activeSlot: 0, enemyMon: null, selectedItemKey: null,
    inventory: {
        potion: 1, superpotion: 0, hyperpotion: 0, maxpotion: 0, revive: 0, maxrevive: 0, fullheal: 0,
        antidote: 0, paralyzeheal: 0, burnheal: 0, iceheal: 0, awakening: 0,
        pokeball: 1, greatball: 0, ultraball: 0, masterball: 0, elixir: 0, bicycle: 1, pokedex: 1,
        rogue_attack: 0, rogue_defense: 0, rogue_sp_attack: 0, rogue_sp_defense: 0, rogue_speed: 0, rogue_hp: 0, rogue_crit: 0, rogue_xp: 0, rogue_shiny: 0
    },
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

        // --- MIGRATION: Ensure new items (Pokedex, Bicycle) exist in old saves ---
        if (this.inventory.pokedex === undefined) this.inventory.pokedex = 1;
        if (this.inventory.bicycle === undefined) this.inventory.bicycle = 1;

        // --- ROGUE MIGRATION ---
        ['rogue_attack', 'rogue_defense', 'rogue_sp_attack', 'rogue_sp_defense', 'rogue_speed', 'rogue_hp', 'rogue_crit', 'rogue_xp', 'rogue_shiny'].forEach(k => {
            if (this.inventory[k] === undefined) this.inventory[k] = 0;
        });

        this.bossesDefeated = data.bossesDefeated || 0;
        this.activeSlot = data.activeSlot || 0;
        this.playerName = data.playerName || 'PLAYER';
        this.enemyMon = data.enemyMon || null;
        this.battlesSinceLucky = data.battlesSinceLucky || 0;

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
            if (DEBUG.ENABLED) Object.assign(this.inventory, DEBUG.INVENTORY);

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
        if (DEBUG.ENABLED) Object.assign(this.inventory, DEBUG.INVENTORY);

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

            // Full Debug Inventory Override
            if (DEBUG.ENABLED && DEBUG.INVENTORY) {
                Object.assign(this.inventory, DEBUG.INVENTORY);
            }
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
                if (!isBossReward) await DialogManager.show(`${p.name} gained\n${amount} EXP. Points!`, { lock: true, delay: 1000, noSkip: true });
                await this.gainExpAnim(amount, p);
            } else {
                if (!isBossReward) await DialogManager.show(`${p.name} gained\n${amount} EXP. Points!`, { lock: true, delay: 1000, noSkip: true });
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
            const levelsGained = [];

            // 1. Calculate how many levels were gained
            while (p.exp >= p.nextLvlExp) {
                p.exp -= p.nextLvlExp;
                p.level++;
                levelsGained.push(p.level);
                p.nextLvlExp = Math.pow(p.level + 1, 3) - Math.pow(p.level, 3);
            }

            StatCalc.recalculate(p);
            AudioEngine.playSfx('levelup');

            if (this.activeSlot === this.party.indexOf(p)) {
                const hud = document.getElementById('player-hud');
                hud.classList.remove('hud-flash-blue'); void hud.offsetWidth; hud.classList.add('hud-flash-blue');
                UI.updateHUD(p, 'player');
            }

            await DialogManager.show(p.level - startLvl > 1 ? `${p.name} grew all the way\nto Level ${p.level}!` : `${p.name} grew to\nLevel ${p.level}!`, { lock: true });

            // 2. CHECK MOVES FOR EVERY LEVEL GAINED
            if (typeof API.getLearnableMoves === 'function' && typeof MoveLearnScreen !== 'undefined' && typeof DialogManager !== 'undefined') {
                for (const lvl of levelsGained) {
                    const newMoves = await API.getLearnableMoves(p.id, lvl);
                    for (const moveName of newMoves) {
                        // Check if already known (By ID or normalized Name)
                        const isKnown = p.moves.some(m =>
                            m.id === moveName ||
                            m.name === moveName.replace(/-/g, ' ').toUpperCase()
                        );

                        if (!isKnown) {
                            await MoveLearnScreen.tryLearn(p, moveName);
                        }
                    }
                }
            }

            // 3. Evolution Check (Only once at the end)
            if (typeof Evolution !== 'undefined') {
                const evo = await Evolution.check(p);
                if (evo) await Evolution.execute(p, evo);
            }

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
            const levelDiff = this.enemyMon.level - p.level;
            let rate = this.enemyMon.isBoss ? LOOT_SYSTEM.DROP_RATE_BOSS : LOOT_SYSTEM.DROP_RATE_WILD;
            if (levelDiff > 0) rate += (levelDiff * 0.05);

            // 1. Normal Loot
            if (RNG.roll(rate)) {
                const key = Mechanics.getLoot(this.enemyMon, this.wins, levelDiff); this.inventory[key]++; AudioEngine.playSfx('funfair');
                await DialogManager.show(`Oh! ${this.enemyMon.name} dropped\na ${ITEMS[key].name}.`, { lock: true });
            }

            // 2. Rogue Loot (Secondary Drop)
            let rogueRate = (ROGUE_LOOT && ROGUE_LOOT.DROP_RATE_BASE) ? ROGUE_LOOT.DROP_RATE_BASE : 0.35;
            if (this.enemyMon.isBoss) rogueRate += (ROGUE_LOOT && ROGUE_LOOT.DROP_RATE_BOSS_BONUS) ? ROGUE_LOOT.DROP_RATE_BOSS_BONUS : 0.50;

            if (RNG.roll(rogueRate)) {
                const key = Mechanics.getRogueLoot();
                this.inventory[key]++;

                // Recalculate stats immediately to apply passive boosts
                this.party.forEach(p => StatCalc.recalculate(p));

                AudioEngine.playSfx('funfair');
                await DialogManager.show(`Lucky! You found a\n${ITEMS[key].name}!`, { lock: true });

                // Multi-drop for Bosses
                if (this.enemyMon.isBoss && RNG.roll(0.5)) {
                    const key2 = Mechanics.getRogueLoot();
                    this.inventory[key2]++;
                    this.party.forEach(p => StatCalc.recalculate(p));
                    await DialogManager.show(`And another one!\nFound ${ITEMS[key2].name}!`, { lock: true });
                }
            }

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

    async tryMidBattleDrop(enemy) {
        let chance = DEBUG.ENABLED && DEBUG.LOOT.MID_BATTLE_RATE !== null ? DEBUG.LOOT.MID_BATTLE_RATE : LOOT_SYSTEM.DROP_RATE_MID_BATTLE;

        // Lucky Pokemon ALWAYS drop items on hit
        if (enemy.isLucky) chance = 1.0;

        if (RNG.roll(chance)) {
            // Lucky drops can be Rogue items
            let key;
            if (enemy.isLucky && RNG.roll(0.5)) {
                key = Mechanics.getRogueLoot();
                this.inventory[key]++;
                this.party.forEach(p => StatCalc.recalculate(p)); // update stats immediately for passive items
            } else {
                key = Mechanics.getLoot(enemy, this.wins, 0);
                this.inventory[key]++;
            }

            AudioEngine.playSfx('catch_success');
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
