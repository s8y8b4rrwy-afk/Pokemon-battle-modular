const PackScreen = {
    id: 'BAG',
    currentPocketIdx: 0,
    pockets: [
        { id: 'items', name: 'HEALING ITEMS' },
        { id: 'balls', name: 'POKE BALLS' },
        { id: 'rogue', name: 'ROGUE ITEMS' },
        { id: 'key', name: 'KEY ITEMS' },
        ...(DEBUG.ENABLED ? [{ id: 'debug', name: 'DEBUG' }] : [])
    ],
    nextPocket() {
        this.currentPocketIdx = (this.currentPocketIdx + 1) % this.pockets.length;
        BattleMenus.renderPackList();
        Input.focus = 0;
        Input.updateVisuals();
        AudioEngine.playSfx('select');
    },
    prevPocket() {
        this.currentPocketIdx = (this.currentPocketIdx - 1 + this.pockets.length) % this.pockets.length;
        BattleMenus.renderPackList();
        Input.focus = 0;
        Input.updateVisuals();
        AudioEngine.playSfx('select');
    },
    onEnter() {
        UI.show('pack-screen');
        document.querySelector('.bag-icon').style.backgroundImage = "url('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/backpack.png')";
        BattleMenus.renderPackList();
        Input.setMode('BAG', 0);
    },
    onExit() {
        UI.hide('pack-screen');
    },
    onResume() {
        UI.show('pack-screen');
        BattleMenus.renderPackList();
        Input.setMode('BAG', Input.focus);
    },
    handleInput(key) {
        if (DialogManager.isTyping || DialogManager.queue.length > 0) return true;
        const len = document.querySelectorAll('.pack-item').length;
        if (key === 'ArrowDown') { Input.focus = Math.min(len - 1, Input.focus + 1); Input.updateVisuals(); AudioEngine.playSfx('select'); return true; }
        if (key === 'ArrowUp') { Input.focus = Math.max(0, Input.focus - 1); Input.updateVisuals(); AudioEngine.playSfx('select'); return true; }

        if (key === 'ArrowRight') {
            this.nextPocket();
            return true;
        }
        if (key === 'ArrowLeft') {
            this.prevPocket();
            return true;
        }

        if (['z', 'Z', 'Enter'].includes(key)) {
            const btns = document.querySelectorAll('.pack-item');
            if (btns[Input.focus]) btns[Input.focus].click();
            return true;
        }
        if (key === 'x' || key === 'X') {
            AudioEngine.playSfx('select');
            BattleMenus.uiToMenu();
            return true;
        }
        return false;
    }
};

const BattleMenus = {
    // --- MENU TOGGLES ---
    uiToMoves() {
        if (Battle.uiLocked) return;

        AudioEngine.playSfx('select');
        Battle.lastMenuIndex = Input.focus;

        // Rebuild menu to account for Transform/Metronome/etc changes
        this.buildMoveMenu();

        UI.hide('action-menu');
        UI.show('move-menu');
        UI.textEl.innerHTML = "Select a move.";

        Input.setMode('MOVES');

        // --- FIX: Prevent Instant Double-Input ---
        Battle.uiLocked = true;
        setTimeout(() => { Battle.uiLocked = false; }, 200);
    },

    uiToMenu() {
        // 1. CHECK RECHARGE
        if (Battle.p.volatiles.recharging) {
            Battle.performTurn({ name: 'Recharging', priority: 0 });
            return;
        }

        // 2. CHECK CHARGE
        if (Battle.p.volatiles.charging && Battle.p.volatiles.queuedMove) {
            Battle.performTurn(Battle.p.volatiles.queuedMove);
            return;
        }

        // 3. NORMAL STATE: Show Menu
        Game.state = 'BATTLE';
        AudioEngine.playSfx('select');

        // Ensure all screens are closed when returning to main battle menu
        if (typeof ScreenManager !== 'undefined') {
            ScreenManager.clear();
        }

        UI.hide('move-menu');
        UI.hide('pack-screen');
        UI.hide('party-screen');
        UI.show('action-menu');
        UI.textEl.innerHTML = `What will<br>${Battle.p.name} do?`;

        // Restore cursor position
        Input.setMode('BATTLE', Battle.lastMenuIndex);
    },

    async askRun() {
        if (Battle.e.isBoss) {
            UI.typeText("Can't escape a BOSS!");
            setTimeout(() => this.uiToMenu(), 1000);
            return;
        }

        AudioEngine.playSfx('select');
        UI.hide('action-menu');
        const choice = await DialogManager.ask("Give up and\nrestart?", ["Yes", "No"], { lock: true });

        if (choice === "Yes") {
            Battle.performRun();
        } else {
            this.uiToMenu();
        }
    },

    openPack() {
        if (Battle.uiLocked) return;
        AudioEngine.playSfx('select');
        Battle.lastMenuIndex = Input.focus;
        UI.hide('action-menu');
        Game.state = 'BAG';
        ScreenManager.push('BAG');
    },

    // --- RENDERERS ---
    renderPackList() {
        const pocket = PackScreen.pockets[PackScreen.currentPocketIdx];
        const header = document.querySelector('.pack-header');
        header.innerHTML = `<span class="pocket-arrow" id="pocket-prev" style="cursor:pointer; padding: 0 10px;">&lt;</span> ${pocket.name} <span class="pocket-arrow" id="pocket-next" style="cursor:pointer; padding: 0 10px;">&gt;</span>`;

        // Mouse Listeners for header arrows
        document.getElementById('pocket-prev').onclick = (e) => {
            if (DialogManager.isTyping || DialogManager.queue.length > 0) return;
            e.stopPropagation(); PackScreen.prevPocket();
        };
        document.getElementById('pocket-next').onclick = (e) => {
            if (DialogManager.isTyping || DialogManager.queue.length > 0) return;
            e.stopPropagation(); PackScreen.nextPocket();
        };

        const list = document.getElementById('pack-list');
        list.innerHTML = "";
        let idxCounter = 0;

        const itemOrder = [
            // HEALING
            'potion', 'superpotion', 'hyperpotion', 'maxpotion',
            'revive', 'maxrevive',
            'fullheal', 'antidote', 'paralyzeheal', 'burnheal', 'iceheal', 'awakening',

            // POKE BALLS
            'pokeball', 'greatball', 'ultraball', 'masterball',

            // ROGUE ITEMS (Stat Boosts -> Utility)
            'rogue_hp', 'rogue_attack', 'rogue_defense', 'rogue_sp_attack', 'rogue_sp_defense', 'rogue_speed',
            'rogue_crit', 'rogue_xp', 'rogue_shiny',

            // KEY ITEMS
            'pokedex', 'settings', 'exp_share', 'bicycle', 'evo_stone', 'inspiration_stone'
        ];

        let keysToShow = Object.keys(Game.inventory).filter(k => Game.inventory[k] > 0);
        if (pocket.id === 'debug') {
            const debugKeys = Object.keys(ITEMS).filter(k => ITEMS[k].pocket === 'debug');
            keysToShow = [...new Set([...keysToShow, ...debugKeys])];
        }

        const sortedKeys = keysToShow.sort((a, b) => {
            const idxA = itemOrder.indexOf(a);
            const idxB = itemOrder.indexOf(b);
            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            if (idxA !== -1) return -1;
            if (idxB !== -1) return 1;
            return a.localeCompare(b);
        });

        sortedKeys.forEach((key) => {
            const data = ITEMS[key];
            if (!data) return;

            // Filter by pocket
            if (data.pocket !== pocket.id) return;

            const count = Game.inventory[key] || 0;
            const displayCount = data.pocket === 'debug' ? '∞' : count;

            const div = document.createElement('div');
            div.className = 'pack-item';
            div.innerHTML = `<span>${data.name}</span> <span>x${displayCount}</span>`;

            const showDesc = () => {
                let desc = data.desc;
                if (key === 'exp_share') {
                    const state = GLOBAL_SETTINGS.EXP_SHARE ? "ON" : "OFF";
                    desc += `\nCurrent State: [${state}]`;
                }
                if (data.type === 'rogue') {
                    const stack = Game.rogueItemState && Game.rogueItemState[key] ? Game.rogueItemState[key] : [];
                    const count = Game.inventory[key] || 0;

                    if (count > 0) {
                        let buffVal = 0;
                        if (typeof ROGUE_CONFIG !== 'undefined') {
                            if (key === 'rogue_xp') buffVal = count * ROGUE_CONFIG.XP_BOOST_PER_STACK;
                            else if (key === 'rogue_shiny') buffVal = count * ROGUE_CONFIG.SHINY_BOOST_PER_STACK;
                            else if (key === 'rogue_crit') buffVal = count * ROGUE_CONFIG.CRIT_BOOST_PER_STACK;
                            else buffVal = count * ROGUE_CONFIG.STAT_BOOST_PER_STACK;
                        }
                        const newest = stack.length > 0 ? stack[stack.length - 1] : null;
                        const turns = newest ? newest.turns : (ROGUE_CONFIG.ROGUE_ITEM_LIFETIME || 5);
                        // Format nicely
                        const buffPct = (buffVal * 100).toFixed(1).replace(/\.0$/, '');
                        desc += `\nBuff: +${buffPct}% | Newest decays in: ${turns} turns`;
                    }
                }

                document.getElementById('pack-desc').innerText = desc;
                if (data.img) {
                    document.querySelector('.bag-icon').style.backgroundImage = `url('${data.img}')`;
                }
            };
            const currentIdx = idxCounter;

            div.onmouseover = () => {
                if (DialogManager.isTyping || DialogManager.queue.length > 0) return;
                showDesc();
            };
            div.onmouseenter = () => {
                if (DialogManager.isTyping || DialogManager.queue.length > 0) return;
                Input.focus = currentIdx;
                Input.updateVisuals();
                showDesc();
                AudioEngine.playSfx('select');
            };
            div.onclick = async () => {
                if (DialogManager.isTyping || DialogManager.queue.length > 0) return;

                if (key === 'pokedex') {
                    AudioEngine.playSfx('select');
                    ScreenManager.push('POKEDEX');
                    return;
                }
                if (key === 'settings') {
                    AudioEngine.playSfx('select');
                    ScreenManager.push('SETTINGS');
                    return;
                }
                if (key === 'exp_share') {
                    AudioEngine.playSfx('select');
                    Game.toggleExpShare();
                    const state = GLOBAL_SETTINGS.EXP_SHARE ? "ON" : "OFF";
                    await DialogManager.show(`The EXP. SHARE was\nturned ${state}!`);
                    this.renderPackList(); // Refresh visuals to maintain focus
                    return;
                }
                if (key === 'bicycle') {
                    AudioEngine.playSfx('error');
                    await DialogManager.show("Erm... What do you think\nyou will do with that?");
                    return;
                }
                if (data.type === 'rogue') {
                    AudioEngine.playSfx('select');
                    return;
                }
                if (data.type === 'debug') {
                    Game.selectedItemKey = key;
                    Game.state = 'HEAL'; // Reuse HEAL state mapping for party selection
                    ScreenManager.push('PARTY', { mode: 'HEAL' });
                    return;
                }
                if (data.type === 'heal' || data.type === 'revive' || data.type === 'status_heal' || data.type === 'evo_stone' || data.type === 'inspiration_stone') {
                    Game.selectedItemKey = key;
                    Game.state = 'HEAL';
                    ScreenManager.push('PARTY', { mode: 'HEAL' });
                } else {
                    AudioEngine.playSfx('select');
                    Battle.performItem(key);
                }
            };
            list.appendChild(div);
            idxCounter++;
        });

        // Add "None Found" message if pocket is empty
        if (idxCounter === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.className = 'pack-item disabled';
            emptyMsg.innerText = "NO ITEMS";
            list.appendChild(emptyMsg);
            idxCounter++;
        }

        const cancelBtn = document.createElement('div');
        cancelBtn.className = 'pack-item cancel-btn';
        cancelBtn.innerText = "CANCEL";
        cancelBtn.onmouseenter = () => {
            Input.focus = idxCounter;
            Input.updateVisuals();
            AudioEngine.playSfx('select');
        };
        cancelBtn.onmouseover = () => {
            document.getElementById('pack-desc').innerText = "Close the Pack.";
        };
        cancelBtn.onclick = () => {
            AudioEngine.playSfx('select');
            BattleMenus.uiToMenu();
        };
        list.appendChild(cancelBtn);
    },

    buildMoveMenu() {
        const menu = document.getElementById('move-menu');
        menu.innerHTML = '';
        const infoPanel = document.createElement('div');
        infoPanel.id = 'move-info';
        infoPanel.innerHTML = '<div>SELECT<br>A MOVE</div>';
        const grid = document.createElement('div');
        grid.id = 'move-grid';

        let playerMoves = [...Battle.p.moves];

        const hasDamagingMoves = playerMoves.some(m => m.category !== 'status');
        const hasTransform = playerMoves.some(m => m.name === 'TRANSFORM');
        const otherHealthy = Game.party.some(p => p !== Battle.p && p.currentHp > 0);

        if (!hasDamagingMoves && !hasTransform && !otherHealthy) {
            playerMoves.push({
                id: "165",
                name: 'STRUGGLE',
                type: 'normal',
                category: 'physical',
                power: 50,
                accuracy: 100,
                priority: 0,
                pp: 1,
                max_pp: 1,
                meta: { drain: -25 },
                stat_changes: [],
                target: 'selected-pokemon'
            });
        }

        playerMoves.forEach((m, i) => {
            let displayType = m.type;
            let displayPower = m.power;

            if (m.name === 'HIDDEN POWER') {
                displayType = Mechanics.getHiddenPowerType(Battle.p);
                displayPower = 60;
            }

            const btn = document.createElement('div');
            btn.className = 'move-btn';
            btn.innerText = m.name;
            btn.dataset.type = displayType;
            btn.dataset.power = displayPower > 0 ? displayPower : '-';
            btn.dataset.accuracy = m.accuracy || '-';

            btn.onclick = async () => {
                if (Battle.p.volatiles.disabled && Battle.p.volatiles.disabled.moveName === m.name) {
                    AudioEngine.playSfx('error');
                    UI.hide('move-menu');
                    await DialogManager.show(`${m.name} is disabled!`);
                    this.uiToMoves();
                    return;
                }
                Battle.performTurn(m);
            };

            const updateInfo = () => {
                infoPanel.innerHTML = `<div>TYPE/<br>${displayType.toUpperCase()}</div><div>PWR/${displayPower > 0 ? displayPower : '-'}</div><div>ACC/${m.accuracy || '-'}%</div>`;
            };
            btn.onmouseover = updateInfo;
            btn.onmouseenter = () => {
                Input.focus = i;
                Input.updateVisuals();
                updateInfo();
            };

            grid.appendChild(btn);
        });

        const backBtn = document.createElement('div');
        backBtn.className = 'move-btn cancel';
        backBtn.innerText = 'BACK';
        backBtn.dataset.action = 'back';
        backBtn.onclick = () => this.uiToMenu();

        const idx = Battle.p.moves.length;
        backBtn.onmouseenter = () => {
            Input.focus = idx;
            Input.updateVisuals();
            infoPanel.innerHTML = '<div>RETURN<br>TO MENU</div>';
        };

        grid.appendChild(backBtn);
        menu.appendChild(infoPanel);
        menu.appendChild(grid);
    }
};
