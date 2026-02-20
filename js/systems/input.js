const Input = {
    focus: 0, mode: 'NONE', lcdEnabled: false, lastFocus: -1,

    init() { document.addEventListener('keydown', (e) => this.handleKey(e)); },

    setMode(m, resetIndex = 0) {
        this.mode = m;
        this.focus = resetIndex;
        this.lastFocus = -1;
        this.updateVisuals();
    },

    // --- 1. VISUAL HIGHLIGHTING LOGIC ---
    visuals: {
        'BATTLE': () => document.getElementById(['opt-fight', 'opt-pkmn', 'opt-pack', 'opt-run'][Input.focus]),
        'CONTINUE': () => document.getElementById(['opt-continue', 'opt-pokedex', 'opt-newgame', 'opt-clearcache'][Input.focus]),
        'DIALOG_CHOICE': () => document.querySelectorAll('#dialog-choice-box .choice-item')[Input.focus],

        'MOVES': () => {
            const opts = document.querySelectorAll('#move-grid .move-btn');
            if (Input.focus >= opts.length) Input.focus = opts.length - 1;
            const target = opts[Input.focus];

            // Update Info Panel
            if (target) {
                const info = document.getElementById('move-info');
                if (target.dataset.action === 'back') {
                    info.innerHTML = '<div>RETURN<br>TO MENU</div>';
                } else if (target.dataset.type) {
                    info.innerHTML = `<div>TYPE/<br>${target.dataset.type.toUpperCase()}</div><div>PWR/${target.dataset.power}</div><div>ACC/${target.dataset.accuracy}%</div>`;
                }
            }
            return target;
        },

        'SELECTION': () => {
            // Visuals handled by SelectionScreen logic now, but keeping this shim for compatibility if needed.
            const target = document.getElementById(`ball-${Input.focus}`);
            const cursor = document.getElementById('sel-cursor');
            const positions = [25, 90, 155];
            if (cursor) cursor.style.left = positions[Input.focus] + 'px';
            return target;
        },

        'PARTY': () => {
            const opts = document.querySelectorAll('.party-slot');
            if (Input.focus === opts.length) return document.getElementById('party-close-btn');
            return opts[Input.focus];
        },

        'CONTEXT': () => document.querySelectorAll('#party-context .ctx-btn')[Input.focus],

        'BAG': () => {
            const target = document.querySelectorAll('.pack-item')[Input.focus];
            // Trigger hover description
            if (target && target.classList.contains('pack-item') && !target.classList.contains('cancel-btn')) target.onmouseover();
            return target;
        },

        'SUMMARY': () => {
            const btns = Array.from(document.querySelectorAll('.sum-buttons .confirm-btn'))
                .filter(b => b.style.display !== 'none');
            if (Input.focus >= btns.length) Input.focus = btns.length - 1;
            return btns[Input.focus];
        }
    },

    updateVisuals() {
        // Clear old focus
        document.querySelectorAll('.focused').forEach(el => el.classList.remove('focused'));

        // Find new target based on current Mode
        let target = null;
        if (this.visuals[this.mode]) {
            target = this.visuals[this.mode]();
        }

        // Apply Focus
        if (target) {
            target.classList.add('focused');
            if (target.scrollIntoViewIfNeeded) target.scrollIntoViewIfNeeded(false);
            else target.scrollIntoView({ block: 'nearest' });
        } else {
            // Safety: If no target, and mode is not NONE, maybe focus needs reset
            if (this.mode !== 'NONE' && this.mode !== 'NAME') {
                console.warn(`Input: No target found for mode ${this.mode} at focus ${this.focus}`);
            }
        }
    },

    // --- 2. INPUT HANDLERS ---
    handlers: {
        'BATTLE': (k) => {
            if (k === 'ArrowRight' && Input.focus % 2 === 0) Input.focus++;
            if (k === 'ArrowLeft' && Input.focus % 2 !== 0) Input.focus--;
            if (k === 'ArrowDown' && Input.focus < 2) Input.focus += 2;
            if (k === 'ArrowUp' && Input.focus > 1) Input.focus -= 2;
            if (['z', 'Z', 'Enter'].includes(k)) document.getElementById(['opt-fight', 'opt-pkmn', 'opt-pack', 'opt-run'][Input.focus]).click();
        },
        'MOVES': (k) => {
            const len = document.querySelectorAll('.move-btn').length;
            if (k === 'ArrowRight' && Input.focus % 2 === 0 && Input.focus < len - 1) Input.focus++;
            if (k === 'ArrowLeft' && Input.focus % 2 !== 0) Input.focus--;
            if (k === 'ArrowDown') { if (Input.focus < len - 2) Input.focus += 2; else if (Input.focus < len - 1) Input.focus = len - 1; }
            if (k === 'ArrowUp') { if (Input.focus >= 2) Input.focus -= 2; else if (Input.focus === len - 1) Input.focus = 0; }
            if (Input.focus >= len) Input.focus = len - 1;
            if (['z', 'Z', 'Enter'].includes(k)) document.querySelectorAll('.move-btn')[Input.focus].click();
        },
        // SELECTION handler removed - see js/screens/selection.js
        'BAG': (k) => {
            const len = document.querySelectorAll('.pack-item').length;
            if (k === 'ArrowDown') Input.focus = Math.min(len - 1, Input.focus + 1);
            if (k === 'ArrowUp') Input.focus = Math.max(0, Input.focus - 1);
            if (['z', 'Z', 'Enter'].includes(k)) document.querySelectorAll('.pack-item')[Input.focus].click();
        },
        'PARTY': (k) => {
            const len = Game.party.length; // Length is the Close Button index
            if (k === 'ArrowDown') Input.focus = Math.min(len, Input.focus + 1);
            if (k === 'ArrowUp') Input.focus = Math.max(0, Input.focus - 1);
            if (['z', 'Z', 'Enter'].includes(k)) {
                if (Input.focus === len) document.getElementById('party-close-btn').click();
                else document.querySelectorAll('.party-slot')[Input.focus].click();
            }
        },
        'CONTEXT': (k) => {
            const len = document.querySelectorAll('#party-context .ctx-btn').length;
            if (k === 'ArrowDown') Input.focus = Math.min(len - 1, Input.focus + 1);
            if (k === 'ArrowUp') Input.focus = Math.max(0, Input.focus - 1);
            if (['z', 'Z', 'Enter'].includes(k)) document.querySelectorAll('#party-context .ctx-btn')[Input.focus].click();
        },
        'SUMMARY': (k) => {
            if (k === 'ArrowRight') { if (Input.focus < 3) Input.focus++; else SummaryScreen.nav(1); }
            if (k === 'ArrowLeft') { if (Input.focus > 0) Input.focus--; else SummaryScreen.nav(-1); }
            if (k === 'ArrowDown') SummaryScreen.nav(1);
            if (k === 'ArrowUp') SummaryScreen.nav(-1);
            if (['z', 'Z', 'Enter'].includes(k)) document.querySelectorAll('.sum-buttons .confirm-btn')[Input.focus].click();
        }
    },

    handleKey(e) {
        // Prime audio on first interaction
        AudioEngine.init();

        const k = e.key;

        // 0. Priority: Dialog System
        if (this.mode === 'DIALOG_CHOICE') {
            if (typeof DialogManager !== 'undefined') {
                if (DialogManager.handleInput(k)) {
                    this.updateVisuals();
                    return;
                }
            }
        }

        // 1. Priority: Screen Manager
        if (typeof ScreenManager !== 'undefined' && ScreenManager.activeScreen) {
            if (ScreenManager.handleInput(k)) {
                this.updateVisuals();
                return;
            }
        }

        // Global Lock Check (Allows specific system menus to remain interactive)
        if (Battle.uiLocked && !['START', 'CONTINUE', 'NAME', 'DIALOG_CHOICE', 'PARTY', 'CONTEXT', 'SUMMARY'].includes(this.mode)) return;

        // 2. Global Back Button (X)
        if (k === 'x' || k === 'X') {
            if (['MOVES', 'BAG'].includes(this.mode)) { BattleMenus.uiToMenu(); return; }
            if (this.mode === 'PARTY') { if (document.getElementById('party-close-btn').innerText !== "CHOOSE A POKEMON") BattleMenus.uiToMenu(); return; }
            if (this.mode === 'CONTEXT') { PartyScreen.closeContext(); return; }
            if (this.mode === 'SUMMARY') { SummaryScreen.close(); return; }
        }

        // 2. Global Navigation Sound
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(k) && this.mode !== 'NAME' && this.mode !== 'START') {
            AudioEngine.playSfx('select');
        }

        // 3. Delegate to Specific Handler
        if (this.handlers[this.mode]) {
            this.handlers[this.mode](k);
            this.updateVisuals();
        }
    }
};
