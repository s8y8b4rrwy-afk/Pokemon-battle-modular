/** @type {BattleEngine} */
const Battle = {
    p: null, e: null, uiLocked: true,
    participants: new Set(),
    userInputPromise: null,

    // --- UI & MENU SHIMS (Delegately to UI/BattleMenus modules) ---
    resetSprite(...args) { return UI.resetSprite(...args); },
    forceReflow(...args) { return UI.forceReflow(...args); },
    uiToMoves(...args) { return BattleMenus.uiToMoves(...args); },
    uiToMenu(...args) { return BattleMenus.uiToMenu(...args); },
    askRun(...args) { return BattleMenus.askRun(...args); },
    openPack(...args) { return BattleMenus.openPack(...args); },
    renderPackList(...args) { return BattleMenus.renderPackList(...args); },
    buildMoveMenu(...args) { return BattleMenus.buildMoveMenu(...args); },

    // --- ANIMATION SHIMS (Delegately to BattleAnims module) ---
    triggerHitAnim(...args) { return BattleAnims.triggerHitAnim(...args); },
    triggerHealAnim(...args) { return BattleAnims.triggerHealAnim(...args); },
    performVisualSwap(...args) { return BattleAnims.performVisualSwap(...args); },
    triggerRageAnim(...args) { return BattleAnims.triggerRageAnim(...args); },
    animateSwap(...args) { return BattleAnims.animateSwap(...args); },

    // 1. Standardized Damage Application
    // Flow: move animation → delay → hit flash + effectiveness SFX + HP decrease
    /**
     * @param {Pokemon} target 
     * @param {number} amount 
     * @param {string} type 
     * @param {string|boolean} moveName 
     * @param {Object} effectivenessData 
     */
    async applyDamage(target, amount, type = 'normal', moveName = null, effectivenessData = null) {
        // A. Handle Substitute
        if (target.volatiles.substituteHP > 0 && type !== 'recoil' && type !== 'poison' && type !== 'burn') {
            target.volatiles.substituteHP -= amount;
            if (moveName !== false) {
                await this.triggerHitAnim(target, type, moveName); // Move animation on doll
            }
            await wait(150); // Beat before impact
            this._playEffectivenessSfx(effectivenessData, moveName);
            await this._flashSprite(target); // Sprite flash
            await UI.typeText("The SUBSTITUTE took\ndamage for it!");

            // Check Break
            if (target.volatiles.substituteHP <= 0) {
                target.volatiles.substituteHP = 0;
                AudioEngine.playSfx('damage');

                // Poof back logic
                const isPlayer = (target === this.p);
                const realSrc = target.volatiles.originalSprite || (isPlayer ? target.backSprite : target.frontSprite);
                const animPromise = this.performVisualSwap(target, realSrc, false, isPlayer);
                const textPromise = UI.typeText("The SUBSTITUTE\nfaded!");
                target.volatiles.originalSprite = null;
                await Promise.all([animPromise, textPromise]);
            }
            return;
        }

        // B. Handle Real HP
        // Step 1: Move animation (projectiles, streams, overlays)
        // If moveName is explicitly false (from skipAnim), we skip this step
        if (moveName !== false) {
            await this.triggerHitAnim(target, type, moveName);
        }

        // Step 2: Brief pause for dramatic timing
        await wait(150);

        // Step 3: Effectiveness SFX + sprite flash + HP decrease (simultaneous)
        this._playEffectivenessSfx(effectivenessData, moveName);
        const flashPromise = this._flashSprite(target);
        target.currentHp -= amount;
        UI.updateHUD(target, target === this.p ? 'player' : 'enemy');
        await flashPromise;
    },

    // Play the correct SFX based on effectiveness
    _playEffectivenessSfx(data, moveName = null) {
        if (!data) {
            if (moveName) AudioEngine.playSfx('damage');
            return;
        }
        if (data.isCrit) AudioEngine.playSfx('crit');
        else if (data.eff > 1) AudioEngine.playSfx('super_effective');
        else if (data.eff < 1 && data.eff > 0) AudioEngine.playSfx('not_very_effective');
        else AudioEngine.playSfx('damage');
    },

    // Flash/flicker the target sprite (the "hit" reaction)
    async _flashSprite(target) {
        const isPlayer = (target === this.p);
        const sprite = isPlayer ? document.getElementById('player-sprite') : document.getElementById('enemy-sprite');
        if (!sprite) return;

        const isInvisible = !!target.volatiles.invulnerable;
        if (isInvisible) { await wait(200); return; }

        const isFlipped = sprite.classList.contains('sub-back');
        const hitClass = 'anim-flicker-only';

        sprite.classList.remove('anim-flicker-only', 'anim-shake-only');
        UI.forceReflow(sprite);
        sprite.classList.add(hitClass);
        await wait(400);
        sprite.classList.remove(hitClass);
    },


    // Standardized Healing Logic
    /**
     * @param {Pokemon} target 
     * @param {number} amount 
     * @param {string|false} messageOverride 
     */
    async applyHeal(target, amount, messageOverride = null, animName = 'fx-heal') {
        if (target.currentHp >= target.maxHp) return false;

        const oldHp = target.currentHp;
        target.currentHp = Math.min(target.maxHp, target.currentHp + amount);
        const healedAmt = target.currentHp - oldHp;

        // Visuals
        await BattleAnims.triggerHealAnim(target, animName);
        UI.updateHUD(target, target === this.p ? 'player' : 'enemy');

        // Text
        // Pass 'false' as messageOverride to skip text (for silent heals)
        if (messageOverride !== false) {
            const msg = messageOverride || `${target.name} regained\nhealth!`;
            await UI.typeText(msg);
        }

        return healedAmt;
    },


    revertTransform(mon) {
        if (mon && mon.transformBackup) {
            // Restore Data
            mon.moves = mon.transformBackup.moves;
            mon.stats = mon.transformBackup.stats;
            mon.types = mon.transformBackup.types;
            mon.stages = mon.transformBackup.stages; // Usually stages reset on switch anyway, but good for safety
            mon.frontSprite = mon.transformBackup.frontSprite;
            mon.backSprite = mon.transformBackup.backSprite;

            // Clear Backup
            mon.transformBackup = null;
        }
    },

    get weather() { return EnvironmentManager.weather; },
    set weather(v) { EnvironmentManager.weather = v; },
    get sideConditions() { return EnvironmentManager.sideConditions; },
    set sideConditions(v) { EnvironmentManager.sideConditions = v; },
    delayedMoves: [],
    // 1. The New "Nuclear" Reset (Clears everything)
    resetScene() {
        clearInterval(UI.typeInterval);
        UI.typeInterval = null;

        const pSprite = document.getElementById('player-sprite');
        const eSprite = document.getElementById('enemy-sprite');
        const scene = document.getElementById('scene');
        const textEl = document.getElementById('text-content');

        const isTransformed = pSprite.classList.contains('transformed-sprite');

        // Cleanup Classes
        pSprite.className = 'sprite';
        eSprite.className = 'sprite';
        scene.className = 'scene';

        // FIX: Remove Substitute Flip
        pSprite.classList.remove('sub-back');

        if (isTransformed) pSprite.classList.add('transformed-sprite');

        // Reset Styles
        pSprite.style = "transition: none;";
        eSprite.style = "opacity: 0; transition: none;";

        scene.style = "";
        textEl.innerHTML = "";
        textEl.classList.remove('full-width');

        UI.forceReflow(pSprite);
        UI.forceReflow(eSprite);

        EnvironmentManager.reset();
        this.delayedMoves = [];
        this.uiLocked = false;

        // FIX: Clear Input Promise if resetting to avoid stuck menus
        this.userInputPromise = null;
    },

    // 2. The Legacy Wrapper (Keeps existing calls working)
    cleanup() {
        this.resetScene();
    },

    async setWeather(type, turns = 5) {
        return await EnvironmentManager.setWeather(type, turns);
    },

    // --- SETUP ---
    setup(player, enemy, playIntro, skipPlayerAnim) {
        this.p = player; this.e = enemy;
        this.participants.clear(); this.participants.add(Game.activeSlot);

        // Only reset delayed moves if we are NOT resuming (playIntro = true usually implies new battle)
        if (playIntro) this.delayedMoves = [];

        const pSprite = document.getElementById('player-sprite');
        const eSprite = document.getElementById('enemy-sprite');

        pSprite.style.transition = 'none';
        eSprite.style.transition = 'none';

        UI.resetSprite(eSprite);

        // RESUME FIX: If not playing intro, keep opacity 1
        if (!playIntro) eSprite.style.opacity = 1;
        else eSprite.style.opacity = 0;

        pSprite.src = player.backSprite;

        if (!playIntro || skipPlayerAnim) pSprite.style.opacity = 1; else pSprite.style.opacity = 0;

        UI.forceReflow(pSprite);
        UI.forceReflow(eSprite);

        pSprite.style.transition = 'opacity 0.2s, transform 0.4s, filter 0.4s';
        eSprite.style.transition = 'opacity 0.2s, transform 0.4s, filter 0.4s';

        if (!skipPlayerAnim) document.getElementById('player-hud').classList.remove('hud-active');
        document.getElementById('enemy-hud').classList.remove('hud-active');

        UI.updateHUD(player, 'player'); UI.updateHUD(enemy, 'enemy');

        const nameEl = document.getElementById('enemy-name');
        if (enemy.isBoss) nameEl.classList.add('boss-name'); else nameEl.classList.remove('boss-name');

        ['opt-fight', 'opt-pkmn', 'opt-pack', 'opt-run'].forEach((id, i) => {
            document.getElementById(id).onmouseenter = () => { if (!this.uiLocked) { Input.focus = i; Input.updateVisuals(); } };
        });

        // Only run the sequence if it's a new encounter
        if (playIntro) {
            this.startEncounterSequence(player, enemy, playIntro, skipPlayerAnim, eSprite);
        }
    },

    async startEncounterSequence(player, enemy, playIntro, skipPlayerAnim, eSprite) {
        this.buildMoveMenu(); clearInterval(UI.typeInterval); UI.textEl.innerHTML = "";

        if (playIntro) {
            // Setup instant invisibility
            eSprite.style.transition = 'none';
            eSprite.style.filter = 'brightness(0)';
            UI.forceReflow(eSprite);
            eSprite.style.transition = 'opacity 0.2s, transform 0.4s, filter 0.4s';

            await sleep(500); // Hardcoded small buffer for browser render

            // 1. Appear as Silhouette
            eSprite.style.opacity = 1;

            const introText = enemy.isBoss ? `The ${enemy.name}\nappeared!` : `Wild ${enemy.name}\nappeared!`;
            const textAnim = UI.typeText(introText);

            // 2. Wait (Controlled by Constant)
            await sleep(ANIM.INTRO_SILHOUETTE);

            // 3. Reveal
            eSprite.style.filter = 'none';

            if (enemy.isBoss) {
                if (enemy.cry) AudioEngine.playCry(enemy.cry, 1.0, true);
                AudioEngine.playSfx('rumble');
                document.getElementById('scene').classList.add('boss-intro');
                await sleep(ANIM.INTRO_BOSS_RUMBLE);
                document.getElementById('scene').classList.remove('boss-intro');
            } else {
                if (enemy.cry) AudioEngine.playCry(enemy.cry, 1.0, false);
            }

            await sleep(ANIM.INTRO_REVEAL_DELAY);

            // 5. Enemy HUD In
            AudioEngine.playSfx('swoosh');
            document.getElementById('enemy-hud').classList.add('hud-active');

            await textAnim; // Ensure text finishes

            if (enemy.isShiny) { UI.playSparkle('enemy'); await sleep(1000); }

            await sleep(ANIM.INTRO_PLAYER_WAIT);

            if (skipPlayerAnim) {
                AudioEngine.playSfx('swoosh');
                document.getElementById('player-hud').classList.add('hud-active');
                this.uiLocked = false; this.uiToMenu();
            } else {
                await UI.typeText(`Go! ${player.name}!`);

                AudioEngine.playSfx('swoosh');
                await this.triggerPlayerEntry(player);

                // 6. Player HUD In
                AudioEngine.playSfx('swoosh');
                document.getElementById('player-hud').classList.add('hud-active');

                if (player.isShiny) { UI.playSparkle('player'); await sleep(1200); }
                this.uiLocked = false; this.uiToMenu();
            }
        } else {
            // Resume Game
            eSprite.style.filter = 'none';
            eSprite.style.opacity = 1;
            this.uiLocked = false; this.uiToMenu();
        }
    },

    async triggerPlayerEntry(mon) {
        AudioEngine.playSfx('ball');
        const sprite = document.getElementById('player-sprite');

        sprite.style.transition = 'none';
        UI.resetSprite(sprite);
        sprite.style.opacity = 0;
        UI.forceReflow(sprite);

        sprite.style.transition = 'opacity 0.2s, transform 0.4s, filter 0.4s';
        sprite.classList.add('anim-enter');
        UI.spawnSmoke(60, 150);

        await wait(200);

        // Only play cry if not a doll (Optional polish, but playing cry is usually fine)
        if (mon.cry) AudioEngine.playCry(mon.cry);

        await wait(1000);

        sprite.classList.remove('anim-enter');
        sprite.style.opacity = 1;
    },

    endTurnItem() {
        this.uiLocked = true;
        document.getElementById('action-menu').classList.add('hidden');

        const eMove = BattleAI.chooseMove(this.e, this.p);

        const eAction = {
            type: 'ATTACK', user: this.e, target: this.p, move: eMove,
            speed: this.e.stats.spe, priority: 0, isPlayer: false
        };
        this.runQueue([eAction]).then((res) => {
            if (res === 'STOP_BATTLE') return;
            this.uiLocked = false;
            this.uiToMenu();
        });
    },

    // --- TURN EXECUTION ---
    async runQueue(queue) {
        return await TurnManager.runQueue(this, queue);
    },

    async executeAction(action) {
        return await TurnManager.executeAction(this, action);
    },

    async processAttack(attacker, defender, move) {
        return await TurnManager.processAttack(this, attacker, defender, move);
    },

    async processSwitch(newMon, isFaintSwap = false) {
        return await TurnManager.processSwitch(this, newMon, isFaintSwap);
    },

    async checkCanMove(mon, isPlayer) {
        return await EffectsManager.checkCanMove(this, mon, isPlayer);
    },

    async processEndTurnEffects(mon, isPlayer) {
        await EnvironmentManager.processEndTurnWeather(this, mon);
        await EffectsManager.processEndTurnStatus(this, mon, isPlayer);
    },

    async applyStatChanges(target, changes, isPlayer) {
        return await EffectsManager.applyStatChanges(this, target, changes, isPlayer);
    },

    async applyStatus(target, ailment, isPlayerTarget) {
        return await EffectsManager.applyStatus(this, target, ailment, isPlayerTarget);
    },

    async processDelayedMoves() {
        return await TurnManager.processDelayedMoves(this);
    },

    async performTurn(playerMove) {
        return await TurnManager.performTurn(this, playerMove);
    },

    async performSwitch(newMon) {
        return await TurnManager.performSwitch(this, newMon);
    },

    async performItem(itemKey) {
        if (this.uiLocked) return;
        try {
            this.uiLocked = true;
            Input.setMode('NONE');
            document.getElementById('pack-screen').classList.add('hidden');
            document.getElementById('action-menu').classList.add('hidden');

            const itemAction = { type: 'ITEM', user: this.p, item: itemKey, priority: 6, isPlayer: true };
            const eMove = BattleAI.chooseMove(this.e, this.p);
            const eAction = {
                type: 'ATTACK', user: this.e, target: this.p, move: eMove,
                speed: this.e.stats.spe, priority: 0, isPlayer: false
            };
            const result = await this.runQueue([itemAction, eAction]);
            if (result === 'STOP_BATTLE') return;
            if (Game.state === 'BATTLE' && this.p.currentHp > 0 && this.e.currentHp > 0) {
                this.uiLocked = false;
                BattleMenus.uiToMenu();
            }
        } catch (err) {
            console.error('Item Error:', err);
            this.uiLocked = false;
            BattleMenus.uiToMenu();
        }
    },

    async performRun() {
        this.uiLocked = true;
        document.getElementById('action-menu').classList.add('hidden');
        AudioEngine.playSfx('run');
        await UI.typeText('Got away safely!');
        Game.save();
        Game.state = 'START';
        await wait(500);
        Game.returnToTitle();
    },

    async processItem(itemKey) {
        const data = ITEMS[itemKey];
        if (Game.inventory[itemKey] > 0) {
            Game.inventory[itemKey]--;
        } else {
            await UI.typeText("You don't have any!");
            return 'CONTINUE';
        }

        if (data.type === 'ball') {
            await UI.typeText(`You threw a\n${data.name}!`);
            return await CaptureManager.attemptCatch(this, itemKey);
        } else if (data.type === 'heal') {
            await UI.typeText(`You used a\n${data.name}!`);
            await this.applyHeal(this.p, data.heal);
        } else if (data.type === 'status_heal') {
            await UI.typeText(`You used a\n${data.name}!`);
            if (this.p.status === data.condition || data.condition === 'all') {
                this.p.status = null;
                UI.updateHUD(this.p, 'player');
                AudioEngine.playSfx('heal');
                await UI.typeText(`${this.p.name} was\ncured!`);
            } else {
                await UI.typeText("It had no effect.");
            }
        } else if (data.type === 'buff') {
            await UI.typeText(`You used an\n${data.name}!`);
            await this.applyStatChanges(this.p, [{ stat: { name: data.stat }, change: data.val }], true);
        } else if (data.type === 'revive') {
            await UI.typeText(`You used a\n${data.name}!`);
            await UI.typeText("But it failed!");
            Game.inventory[itemKey]++;
        }
        return 'CONTINUE';
    },

    // 1. THE DIRECTOR: Decides what logic to run based on move type
    async executeDamagePhase(attacker, defender, move, isPlayer) {
        return await MovesEngine.executeDamagePhase(this, attacker, defender, move, isPlayer);
    },

    async handleDamageSequence(attacker, defender, move, isPlayer, weatherMod) {
        return await MovesEngine.handleDamageSequence(this, attacker, defender, move, isPlayer, weatherMod);
    },

    async resolveSingleHit(attacker, defender, move, damage, isPlayer, isFirstHit, result) {
        return await MovesEngine.resolveSingleHit(this, attacker, defender, move, damage, isPlayer, isFirstHit, result);
    },

    async handleAttackerRage(attacker, defender, move, baseDmg, isPlayer) {
        return await MovesEngine.handleAttackerRage(this, attacker, defender, move, baseDmg, isPlayer);
    },

    async handleStatusMove(attacker, defender, move) {
        return await MovesEngine.handleStatusMove(this, attacker, defender, move);
    },

    async handleMoveSideEffects(attacker, defender, move, isPlayer, prevActionSuccess) {
        return await MovesEngine.handleMoveSideEffects(this, attacker, defender, move, isPlayer, prevActionSuccess);
    },



    lastMenuIndex: 0,

    playSparkle(side) {
        AudioEngine.playSfx('shiny');
        const container = document.getElementById('fx-container');
        const rect = side === 'enemy' ? { x: 239, y: 61 } : { x: 80, y: 130 };
        const spread = side === 'enemy' ? 30 : 60;
        for (let i = 0; i < 5; i++) {
            const star = document.createElement('div');
            star.className = 'shiny-star';
            star.style.left = (rect.x - spread + Math.random() * (spread * 2)) + 'px';
            star.style.top = (rect.y - spread + Math.random() * (spread * 2)) + 'px';
            star.style.animation = `sparkle 0.6s ease-out ${i * 0.15}s forwards`;
            container.appendChild(star);
            setTimeout(() => star.remove(), 1500);
        }
    },

    switchIn(newMon, wasForced) {
        if (wasForced) {
            this.processSwitch(newMon, true).then(() => {
                this.uiLocked = false;
                BattleMenus.uiToMenu();
            });
        } else {
            this.performSwitch(newMon);
        }
    }
};
