const TitleScreen = {
    id: 'TITLE',

    onEnter(params = {}) {
        this.resetInternalState();
        Input.setMode('START'); // Legacy mode for visual updater
    },

    onExit() {
        UI.hide('start-screen');
        UI.hide('continue-screen');
    },

    onResume() {
        this.resetInternalState();
        Input.setMode('START');
    },

    resetInternalState() {
        // Start screen is clean slate
        UI.hideAll(['scene', 'dialog-box', 'summary-panel', 'streak-box', 'pack-screen', 'party-screen', 'action-menu', 'move-menu', 'selection-screen', 'continue-screen', 'name-screen']);
        UI.show('start-screen');
    },

    handleInput(key) {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
            Game.toggleLcd();
            AudioEngine.playSfx('select');
            return true;
        }

        if (['z', 'Z', 'Enter'].includes(key)) {
            // Transition to CONTINUE screen logic
            AudioEngine.init();
            this.checkSave();
            return true;
        }

        return false;
    },

    // --- Continue / New Game Logic ---
    // Ideally this could be a sub-screen or state, but let's keep it here for now
    checkSave() {
        AudioEngine.init();
        AudioEngine.playSfx('select');
        if (StorageSystem.exists()) {
            // Show Continue Screen
            ScreenManager.push('CONTINUE');
        } else {
            // Go straight to Name Input (New Game)
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
        document.getElementById('save-name').innerText = data.playerName || 'PLAYER';

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
            Input.focus = (Input.focus - 1 + 3) % 3;
            Input.updateVisuals();
            AudioEngine.playSfx('select');
            return true;
        }
        if (key === 'ArrowDown') {
            Input.focus = (Input.focus + 1) % 3;
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

    confirm() {
        const choice = Input.focus; // 0 = Continue, 1 = Pokedex, 2 = New Game
        if (choice === 0) {
            Game.loadGame();
        } else if (choice === 1) {
            ScreenManager.push('POKEDEX');
        } else {
            ScreenManager.replace('NAME_INPUT');
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
