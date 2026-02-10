const SelectionScreen = {
    async open() {
        Game.state = 'SELECTION';
        Battle.uiLocked = false;
        Input.setMode('NONE');

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

        Game.tempSelectionList.forEach((p, i) => {
            if (!p) return;
            const ball = document.createElement('div');
            ball.className = 'pokeball-select';
            ball.id = `ball-${i}`;

            ball.onmouseenter = () => {
                Input.focus = i;
                Input.updateVisuals();
            };
            ball.onclick = () => {
                Game.tempSelection = p;
                SummaryScreen.open(p, 'SELECTION');
            };
            table.appendChild(ball);
        });

        document.getElementById('sel-text-box').innerHTML = 'SELECT A POKEMON';
        document.getElementById('sel-cursor').style.display = 'block';
        Input.setMode('SELECTION', 0);
    },

    async confirm() {
        if (!Game.tempSelection) return;
        UI.hide('summary-panel');

        Game.party = [Game.tempSelection];
        Game.activeSlot = 0;
        Game.wins = 0;
        Game.bossesDefeated = 0;

        Game.save();

        UI.hide('selection-screen');
        UI.showAll(['scene', 'dialog-box', 'streak-box']);

        document.getElementById('streak-box').innerText = "WINS: 0";
        Game.state = 'BATTLE';
        Game.startNewBattle(true);
    }
};
