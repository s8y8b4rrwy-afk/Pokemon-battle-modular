const SelectionScreen = {
    id: 'SELECTION',

    onEnter() {
        this.open();
    },

    onResume() {
        UI.show('selection-screen');

        // Restore focus to the Pokemon we were looking at
        let resumeIdx = 0;
        if (Game.tempSelection && Game.tempSelectionList) {
            resumeIdx = Game.tempSelectionList.indexOf(Game.tempSelection);
            if (resumeIdx === -1) resumeIdx = 0;
        }

        Input.setMode('SELECTION', resumeIdx);
        this.updatePreview(resumeIdx);
    },

    onExit() {
        UI.hide('selection-screen');
    },

    handleInput(key) {
        if (key === 'ArrowRight') {
            Input.focus = Math.min(2, Input.focus + 1);
            this.updatePreview(Input.focus);
            return true;
        }
        if (key === 'ArrowLeft') {
            Input.focus = Math.max(0, Input.focus - 1);
            this.updatePreview(Input.focus);
            return true;
        }

        if (['z', 'Z', 'Enter'].includes(key)) {
            const idx = Input.focus;
            const p = Game.tempSelectionList[idx];
            if (p) {
                Game.tempSelection = p;
                // Use screen manager to push summary
                ScreenManager.push('SUMMARY', { mon: p, mode: 'SELECTION' });
            }
            return true;
        }
        return false;
    },

    updatePreview(idx) {
        if (!Game.tempSelectionList || !Game.tempSelectionList[idx]) return;
        const p = Game.tempSelectionList[idx];

        AudioEngine.playCry(p.cry);

        const prevImg = document.getElementById('sel-preview-img');
        const prevShiny = document.getElementById('sel-preview-shiny');

        if (prevImg) {
            prevImg.src = p.frontSprite;
            prevImg.classList.remove('hidden');
            prevImg.style.display = 'block';
            prevShiny.classList.remove('hidden');
            prevShiny.style.display = p.isShiny ? 'block' : 'none';
        }
        UI.typeText(`Will you choose\n${p.name}?`, null, true, 'sel-text-box');
    },

    // Legacy Logic
    async open() {
        Game.state = 'SELECTION';
        Battle.uiLocked = false;
        // Input.setMode('NONE'); // managed by ScreenManager usually, but open() is async

        UI.hideAll(['scene', 'dialog-box', 'summary-panel', 'streak-box']);
        UI.show('selection-screen');

        document.getElementById('sel-text-box').innerHTML = '<span class="blink-text">CATCHING POKEMON...</span>';
        document.getElementById('sel-cursor').style.display = 'none';

        // Cleanup old balls
        document.querySelectorAll('.pokeball-select').forEach(b => b.remove());

        UI.hide('sel-preview-img');
        UI.hide('sel-preview-shiny');

        // Determine Selection IDs
        const ids = [];
        if (DEBUG.ENABLED && DEBUG.PLAYER.ID) ids.push(DEBUG.PLAYER.ID);
        while (ids.length < 3) {
            const r = RNG.int(1, 251);
            if (!ids.includes(r)) ids.push(r);
        }

        const [_, list] = await Promise.all([
            wait(1000),
            Promise.all(ids.map((id, i) => {
                let lvl = 15;
                let shiny = null;
                const overrides = {};
                if (DEBUG.ENABLED && i === 0) {
                    if (DEBUG.PLAYER.LEVEL) lvl = DEBUG.PLAYER.LEVEL;
                    if (DEBUG.PLAYER.SHINY !== null) shiny = DEBUG.PLAYER.SHINY;
                    if (DEBUG.PLAYER.MOVES) overrides.moves = DEBUG.PLAYER.MOVES;
                }
                if (shiny !== null) overrides.shiny = shiny;
                return API.getPokemon(id, lvl, overrides);
            }))
        ]);

        Game.tempSelectionList = list;
        const table = document.getElementById('lab-table');

        // Create DOM Elements (Visuals only, input handled by Manager/Input.js)
        Game.tempSelectionList.forEach((p, i) => {
            if (!p) return;
            const ball = document.createElement('div');
            ball.className = 'pokeball-select';
            ball.id = `ball-${i}`;

            ball.onmouseenter = () => {
                Input.focus = i;
                Input.updateVisuals();
                this.updatePreview(i);
            };
            ball.onclick = () => {
                Game.tempSelection = p;
                ScreenManager.push('SUMMARY', { mon: p, mode: 'SELECTION' });
            };
            table.appendChild(ball);
        });

        UI.typeText('SELECT A POKEMON', null, true, 'sel-text-box');
        document.getElementById('sel-cursor').style.display = 'block';

        Input.setMode('SELECTION', 0);
        this.updatePreview(0); // Initialize first preview
    },

    async confirm() {
        if (!Game.tempSelection) return;

        if (typeof ScreenManager !== 'undefined') {
            ScreenManager.clear();
        }

        Game.party = [Game.tempSelection];
        Game.activeSlot = 0;
        Game.wins = 0;
        Game.bossesDefeated = 0;

        Game.save();

        UI.hide('selection-screen'); // Safety
        UI.showAll(['scene', 'dialog-box', 'streak-box']);

        document.getElementById('streak-box').innerText = "WINS: 0";
        Game.state = 'BATTLE';
        Game.startNewBattle(true);
    }
};
