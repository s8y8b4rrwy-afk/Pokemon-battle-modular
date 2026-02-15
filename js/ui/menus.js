const PackScreen = {
    id: 'BAG',
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
        const len = document.querySelectorAll('.pack-item').length;
        if (key === 'ArrowDown') { Input.focus = Math.min(len - 1, Input.focus + 1); Input.updateVisuals(); AudioEngine.playSfx('select'); return true; }
        if (key === 'ArrowUp') { Input.focus = Math.max(0, Input.focus - 1); Input.updateVisuals(); AudioEngine.playSfx('select'); return true; }
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
        Battle.lastMenuIndex = Input.focus;
        UI.hide('action-menu');
        Game.state = 'BAG';
        ScreenManager.push('BAG');
    },

    // --- RENDERERS ---
    renderPackList() {
        const list = document.getElementById('pack-list');
        list.innerHTML = "";
        let idxCounter = 0;

        const itemOrder = [
            'potion', 'superpotion', 'hyperpotion', 'maxpotion',
            'revive', 'maxrevive',
            'pokeball', 'greatball', 'ultraball', 'masterball'
        ];

        const sortedKeys = Object.keys(Game.inventory).sort((a, b) => {
            const idxA = itemOrder.indexOf(a);
            const idxB = itemOrder.indexOf(b);
            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            if (idxA !== -1) return -1;
            if (idxB !== -1) return 1;
            return a.localeCompare(b);
        });

        sortedKeys.forEach((key) => {
            const count = Game.inventory[key];
            if (count > 0) {
                const data = ITEMS[key];
                if (!data) return;
                const div = document.createElement('div');
                div.className = 'pack-item';
                div.innerHTML = `<span>${data.name}</span> <span>x${count}</span>`;

                const showDesc = () => {
                    document.getElementById('pack-desc').innerText = data.desc;
                    if (data.img) {
                        document.querySelector('.bag-icon').style.backgroundImage = `url('${data.img}')`;
                    }
                };
                const currentIdx = idxCounter;

                div.onmouseover = () => showDesc();
                div.onmouseenter = () => {
                    Input.focus = currentIdx;
                    Input.updateVisuals();
                    showDesc();
                    AudioEngine.playSfx('select');
                };
                div.onclick = () => {
                    if (data.type === 'heal' || data.type === 'revive') {
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
            }
        });

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

        Battle.p.moves.forEach((m, i) => {
            const btn = document.createElement('div');
            btn.className = 'move-btn';
            btn.innerText = m.name;
            btn.dataset.type = m.type;
            btn.dataset.power = m.power > 0 ? m.power : '-';
            btn.dataset.accuracy = m.accuracy || '-';

            btn.onclick = () => Battle.performTurn(m);

            const updateInfo = () => {
                infoPanel.innerHTML = `<div>TYPE/<br>${m.type.toUpperCase()}</div><div>PWR/${m.power > 0 ? m.power : '-'}</div><div>ACC/${m.accuracy || '-'}%</div>`;
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
