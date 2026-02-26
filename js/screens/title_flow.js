const TitleScreen = {
    id: 'TITLE',

    onEnter(params = {}) {
        // Skip the click-to-start title screen — go directly to Save check
        this.checkSave();
    },

    onExit() {
        UI.hide('start-screen');
        UI.hide('continue-screen');
    },

    onResume() {
        // If we pop back to Title, we should probably stay on the Save screen
        this.checkSave();
    },

    // --- Continue / New Game Logic ---
    checkSave() {
        if (StorageSystem.exists()) {
            ScreenManager.push('CONTINUE');
        } else {
            ScreenManager.push('NAME_INPUT');
        }
    }
};

const ContinueScreen = {
    id: 'CONTINUE',

    onEnter(params = {}) {
        const data = StorageSystem.load();

        UI.hide('start-screen'); // Ensure title is gone
        UI.show('continue-screen');

        document.getElementById('save-wins').innerText = data.wins || 0;
        document.getElementById('save-bosses').innerText = data.bossesDefeated || 0;
        document.getElementById('save-name').innerText = data.playerName || 'GOLD';

        // Update Pokedex stats on continue screen
        const counts = PokedexData.getCounts();
        if (document.getElementById('save-seen')) document.getElementById('save-seen').innerText = counts.seen.toString();
        if (document.getElementById('save-caught')) document.getElementById('save-caught').innerText = counts.caught.toString();

        const prevRow = document.getElementById('save-preview');
        prevRow.innerHTML = '';
        if (data.party) {
            Game.tempPreviewList = data.party; // For SummaryScreen navigation
            data.party.forEach((p, idx) => {
                const img = document.createElement('img');
                img.src = p.icon;
                img.className = 'mini-icon';
                if (p.currentHp <= 0) img.classList.add('fainted');
                img.onclick = () => ScreenManager.push('SUMMARY', { mon: p, mode: 'READ_ONLY' });
                prevRow.appendChild(img);
            });
        }

        Input.setMode('CONTINUE', 0);
    },

    onResume() {
        UI.show('continue-screen');
        Input.setMode('CONTINUE', 0); // Always reset focus to first option to avoid out-of-bounds
    },

    onExit() {
        UI.hide('continue-screen');
    },

    handleInput(key) {
        if (key === 'ArrowUp') {
            Input.focus = (Input.focus - 1 + 4) % 4;
            Input.updateVisuals();
            AudioEngine.playSfx('select');
            return true;
        }
        if (key === 'ArrowDown') {
            Input.focus = (Input.focus + 1) % 4;
            Input.updateVisuals();
            AudioEngine.playSfx('select');
            return true;
        }

        if (['z', 'Z', 'Enter'].includes(key)) {
            AudioEngine.playSfx('select');
            this.confirm();
            return true;
        }

        if (['x', 'X'].includes(key)) {
            AudioEngine.playSfx('select');
            ScreenManager.pop();
            return true;
        }

        return false;
    },

    async confirm() {
        const choice = Input.focus; // 0 = Continue, 1 = Pokedex, 2 = Options, 3 = New Game
        if (choice === 0) {
            Game.loadGame();
        } else if (choice === 1) {
            ScreenManager.push('POKEDEX');
        } else if (choice === 2) {
            ScreenManager.push('SETTINGS');
        } else {
            // New Game Confirmation
            Input.setMode('NONE');
            const box = document.getElementById('dialog-box');
            box.classList.add('menu-style');
            UI.show('dialog-box');

            const ok = await DialogManager.ask("DELETE ALL DATA AND START OVER?", ["NO", "YES"]);

            UI.hide('dialog-box');
            box.classList.remove('menu-style');

            if (ok === "YES") {
                ScreenManager.replace('NAME_INPUT');
            } else {
                // Return to menu focus
                Input.setMode('CONTINUE', 3);
            }
        }
    }
};

const NameInputScreen = {
    id: 'NAME_INPUT',

    onEnter() {
        UI.hide('continue-screen');
        UI.hide('start-screen');
        UI.show('name-screen');

        const inputEl = document.getElementById('name-input');
        inputEl.value = '';
        inputEl.focus();

        Input.setMode('NAME');
    },

    onExit() {
        UI.hide('name-screen');
    },

    handleInput(key) {
        if (['z', 'Z', 'Enter'].includes(key)) {
            AudioEngine.playSfx('select');
            Game.confirmName();
            return true;
        }
        return false; // Allow typing
    }
};
