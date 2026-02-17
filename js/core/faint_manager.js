const FaintManager = {
    /**
     * Central entry point to check for and handle faints in a specific order.
     * @returns {Promise<boolean>} True if a faint occurred (and likely battle state changed)
     */
    async checkFaints(battle, order = ['enemy', 'player']) {
        for (const side of order) {
            const mon = side === 'player' ? battle.p : battle.e;
            if (mon.currentHp <= 0 && Game.state === 'BATTLE') {
                await this.processFaint(battle, mon, side === 'player');
                return true;
            }
        }
        return false;
    },

    /**
     * Handles the full sequence of a single Pokémon fainting.
     */
    async processFaint(battle, mon, isPlayer) {
        mon.currentHp = 0;
        mon.rageLevel = 0;
        mon.status = null;
        mon.volatiles = {};
        const sprite = isPlayer ? document.getElementById('player-sprite') : document.getElementById('enemy-sprite');
        const hud = document.getElementById(isPlayer ? 'player-hud' : 'enemy-hud');

        // 1. Play Cry First
        if (mon.cry) {
            AudioEngine.playCry(mon.cry, 0.6, mon.isBoss);
            await wait(ANIM.CRY_DURATION + 1300); // Wait for cry to mostly finish
        } else {
            await wait(ANIM.FAINT_PRE_DELAY);
        }

        // 2. Slide Out Animation + Swoosh Sync
        sprite.style.opacity = 1;
        sprite.classList.add('anim-faint');
        AudioEngine.playSfx('faint'); // Play "laser-like" drop SFX AT THE SAME TIME

        // HUD removal delay
        setTimeout(() => {
            hud.classList.remove('hud-active');
        }, ANIM.HUD_SLIDE_DELAY);

        // 3. Text & Meta Changes
        const name = mon.transformBackup ? mon.transformBackup.name : mon.name;
        battle.revertTransform(mon);

        await UI.typeText(`${name}\nfainted!`);
        await wait(ANIM.FAINT_POST_DELAY);

        // 4. Destiny Bond Logic (Simultaneous Fainting)
        if (mon.volatiles.destinyBond) {
            const opponent = isPlayer ? battle.e : battle.p;
            if (opponent.currentHp > 0) {
                await UI.typeText(`${mon.name} took\nits foe with it!`);

                // Process the opponent's faint too
                // We manually duplicate basic faint steps here to avoid messy recursion state
                opponent.currentHp = 0;
                opponent.rageLevel = 0;
                UI.updateHUD(opponent, isPlayer ? 'enemy' : 'player');

                const oppSprite = isPlayer ? document.getElementById('enemy-sprite') : document.getElementById('player-sprite');
                const oppHud = document.getElementById(isPlayer ? 'enemy-hud' : 'player-hud');

                if (opponent.cry) AudioEngine.playCry(opponent.cry, 0.8, opponent.isBoss);
                await wait(ANIM.FAINT_PRE_DELAY);
                oppSprite.classList.add('anim-faint');
                AudioEngine.playSfx('swoosh');

                setTimeout(() => oppHud.classList.remove('hud-active'), ANIM.HUD_SLIDE_DELAY);

                const oppName = opponent.transformBackup ? opponent.transformBackup.name : opponent.name;
                battle.revertTransform(opponent);

                await UI.typeText(`${oppName}\nfainted!`);
                await wait(ANIM.FAINT_POST_DELAY);

                // If Destiny Bond triggers, it's always handled as a win for the player in this engine's current state
                await Game.handleWin(false);
                return true;
            }
        }

        // 5. Final State Management
        const textEl = document.getElementById('text-content');
        textEl.classList.remove('full-width');

        if (isPlayer) {
            await Game.handleLoss();
        } else {
            await Game.handleWin(false);
        }

        return true;
    }
};
