
const TutorialManager = {
    KEY: 'gs_tutorial_flags',

    getFlags() {
        const str = localStorage.getItem(this.KEY);
        if (!str) return {};
        try {
            return JSON.parse(str);
        } catch (e) {
            return {};
        }
    },

    setFlag(flag) {
        const flags = this.getFlags();
        flags[flag] = true;
        localStorage.setItem(this.KEY, JSON.stringify(flags));
    },

    async checkTutorial(itemKey) {
        const flags = this.getFlags();
        const itemType = ITEMS[itemKey] ? ITEMS[itemKey].type : null;

        if (itemKey === 'evo_stone') {
            if (!flags.evo_stone) {
                this.setFlag('evo_stone');
                await DialogManager.show("TUTORIAL: EVOLUTION STONE\nThis item can evolve ANY Pokemon immediately!", { lock: true });
                await DialogManager.show("Use it from the PACK\nto trigger an evolution\nwithout needing a level up.", { lock: true });
            }
        } else if (itemType === 'rogue') {
            if (!flags.rogue_items) {
                this.setFlag('rogue_items');
                await DialogManager.show("TUTORIAL: ROGUE ITEMS\nThese items provide passive\nbuffs to your entire team!", { lock: true });
                await DialogManager.show("They decay after a few\nbattles, so keep finding\nmore to stay strong!", { lock: true });
            }
        }
    }
};
