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
        UI.hide('move-menu');
        UI.hide('pack-screen');
        UI.hide('party-screen');
        UI.show('action-menu');
        UI.textEl.innerHTML = `What will<br>${Battle.p.name} do?`;

        // Restore cursor position
        Input.setMode('BATTLE', Battle.lastMenuIndex);
    },

    askRun() {
        if (Battle.e.isBoss) {
            UI.typeText("Can't escape a BOSS!");
            setTimeout(() => this.uiToMenu(), 1000);
            return;
        }

        Battle.lastMenuIndex = Input.focus;
        const menu = document.getElementById('action-menu');

        menu.innerHTML = `
            <div class="menu-item centered" id="run-yes" onclick="Battle.performRun()" onmouseenter="Input.focus=0;Input.updateVisuals()">YES</div>
            <div class="menu-item centered" id="run-no" onclick="BattleMenus.uiToMenu()" onmouseenter="Input.focus=1;Input.updateVisuals()">NO</div>
        `;
        UI.textEl.innerHTML = "Give up and\nrestart?";
        Input.setMode('CONFIRM_RUN');
    },

    openPack() {
        if (Battle.uiLocked) return;
        Battle.lastMenuIndex = Input.focus;
        UI.show('pack-screen');
        document.querySelector('.bag-icon').style.backgroundImage = "url('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/backpack.png')";
        this.renderPackList();
        Input.setMode('BAG');
    },

    // --- RENDERERS ---
    renderPackList() {
        const list = document.getElementById('pack-list');
        list.innerHTML = "";
        let idxCounter = 0;

        Object.keys(Game.inventory).forEach((key) => {
            const count = Game.inventory[key];
            if (count > 0) {
                const data = ITEMS[key];
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
                };
                div.onclick = () => {
                    if (data.type === 'heal' || data.type === 'revive') {
                        Game.selectedItemKey = key;
                        Game.state = 'HEAL';
                        UI.hide('pack-screen');
                        Game.openParty(false);
                    } else {
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
        };
        cancelBtn.onmouseover = () => {
            document.getElementById('pack-desc').innerText = "Close the Pack.";
        };
        cancelBtn.onclick = () => {
            this.uiToMenu();
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
