
const ScreenManager = {
    stack: [],
    activeScreen: null,

    // --- Core Navigation ---
    push(screenId, params = {}) {
        // 1. Suspend current screen if exists
        if (this.activeScreen) {
            if (this.activeScreen.onSuspend) this.activeScreen.onSuspend();
            // Don't hide if the new screen is an overlay
            if (!params.isOverlay) {
                if (this.activeScreen.onExit) this.activeScreen.onExit();
                this.manageVis('hide', this.activeScreen.id);
            }
        }

        // 2. Resolve requested screen
        const screen = this.getScreen(screenId);
        if (!screen) { console.error(`Screen ${screenId} not found`); return; }

        // 3. Push to stack
        this.stack.push({ id: screenId, params: params, instance: screen });
        this.activeScreen = screen;

        // 4. Initialize new screen
        this.manageVis('show', screenId);
        if (screen.onEnter) screen.onEnter(params);

        // 5. Update Input Mode
        // If screen has a custom mode, use it. Otherwise, use ID.
        // Legacy support: Some screens rely on Input.setMode being called inside onEnter. 
        // We can override that here or let the screen do it. 
        // Ideally: Input.setMode(screen.inputMode || screenId);

        console.log(`[ScreenManager] Pushed ${screenId}`, this.stack);
    },

    pushAndWait(screenId, params = {}) {
        return new Promise(resolve => {
            // Attach resolver to the params so the screen can find it?
            // Or better, wrap the resolve in a unique ID object stored in the stack.

            // We'll attach it to the screen instance temporarily (risky if recursive)
            // Or better: store it in the stack frame

            this.push(screenId, params);

            // The stack frame we just pushed is the last one
            const frame = this.stack[this.stack.length - 1];
            frame.resolve = resolve;
        });
    },

    pop(result = null) {
        if (this.stack.length === 0) return;

        // 1. Teardown active screen
        const frame = this.stack.pop();
        const screen = frame.instance;
        if (screen.onExit) screen.onExit();
        this.manageVis('hide', screen.id);

        // 2. Resolve Promise if this was a pushAndWait
        if (frame.resolve) {
            frame.resolve(result);
        }

        // 3. Resume previous screen
        if (this.stack.length > 0) {
            const prevFrame = this.stack[this.stack.length - 1];
            this.activeScreen = prevFrame.instance;

            // If the popped screen was NOT an overlay, we need to reshow the previous one
            // If it WAS an overlay, the previous one is likely still visible?
            // Simplest: Always show and resume
            this.manageVis('show', this.activeScreen.id);
            if (this.activeScreen.onResume) this.activeScreen.onResume();

            // Restore Input? 
            // Input.setMode(this.activeScreen.inputMode || this.activeScreen.id);
        } else {
            this.activeScreen = null;
            // Maybe return to a default state or root?
        }

        console.log(`[ScreenManager] Popped ${screen.id}`, this.stack);
    },

    replace(screenId, params = {}) {
        if (this.stack.length > 0) {
            const frame = this.stack.pop();
            if (frame.instance.onExit) frame.instance.onExit();
            this.manageVis('hide', frame.instance.id);
        }
        this.push(screenId, params);
    },

    // --- Helper ---
    getScreen(id) {
        // Map ID to Global Object
        switch (id) {
            case 'PARTY': return PartyScreen;
            case 'SUMMARY': return SummaryScreen;
            case 'SELECTION': return SelectionScreen;
            case 'TITLE': return TitleScreen;
            case 'CONTINUE': return ContinueScreen;
            case 'NAME_INPUT': return NameInputScreen;
            case 'BAG': return typeof PackScreen !== 'undefined' ? PackScreen : null; // Future proof
            case 'EVOLUTION': return EvolutionScreen;
            // Add others...
            default: return null;
        }
    },

    manageVis(action, id) {
        // Maps abstract IDs to DOM IDs if needed, otherwise assumes 1:1
        // Currently: PARTY -> party-screen, SUMMARY -> summary-panel
        const map = {
            'PARTY': 'party-screen',
            'SUMMARY': 'summary-panel',
            'SELECTION': 'selection-screen',
            'BAG': 'pack-screen',
            'TITLE': 'start-screen',
            'CONTINUE': 'continue-screen',
            'NAME_INPUT': 'name-screen',
            'EVOLUTION': 'evolution-screen'
        };
        const domId = map[id] || id; // Fallback
        if (action === 'show') UI.show(domId);
        else UI.hide(domId);
    },

    // --- Input Delegation ---
    handleInput(key) {
        if (!this.activeScreen) return false;

        // If the active screen has a handleInput method, use it
        if (this.activeScreen.handleInput) {
            return this.activeScreen.handleInput(key);
        }

        return false; // Fallback to global Input handler
    },

    resetToTitle() {
        this.stack = [];
        this.push('TITLE');
    },

    clear() {
        while (this.stack.length > 0) {
            const frame = this.stack.pop();
            const screen = frame.instance;
            if (screen.onExit) screen.onExit();
            this.manageVis('hide', screen.id);
        }
        this.activeScreen = null;
    }
};
