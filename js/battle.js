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
    performVisualSwap(...args) { return BattleAnims.performVisualSwap(...args); },
    triggerRageAnim(...args) { return BattleAnims.triggerRageAnim(...args); },

    // 1. Standardized Damage Application
    async applyDamage(target, amount, type = 'normal') {
        // A. Handle Substitute
        if (target.volatiles.substituteHP > 0 && type !== 'recoil' && type !== 'poison' && type !== 'burn') {
            target.volatiles.substituteHP -= amount;
            await this.triggerHitAnim(target, type); // Hit the doll
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
        await this.triggerHitAnim(target, type); // Visuals
        target.currentHp -= amount; // Math
        UI.updateHUD(target, target === this.p ? 'player' : 'enemy'); // UI
    },


    // Standardized Healing Logic
    async applyHeal(target, amount, messageOverride = null) {
        if (target.currentHp >= target.maxHp) return false;

        const oldHp = target.currentHp;
        target.currentHp = Math.min(target.maxHp, target.currentHp + amount);
        const healedAmt = target.currentHp - oldHp;

        // Visuals
        AudioEngine.playSfx('heal');
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

    // --- Weather ---
    weather: { type: 'none', turns: 0 },

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

        this.weather = { type: 'none', turns: 0 };
        this.delayedMoves = [];
        this.uiLocked = false;

        // FIX: Clear Input Promise if resetting to avoid stuck menus
        this.userInputPromise = null;
    },

    // 2. The Legacy Wrapper (Keeps existing calls working)
    cleanup() {
        this.resetScene();
    },

    setWeather(type) {
        this.weather = { type: type, turns: 5 };
        const overlay = document.getElementById('scene');
        if (WEATHER_FX[type]) {
            overlay.style.backgroundColor = WEATHER_FX[type].color;
            UI.typeText(WEATHER_FX[type].msg);
        } else {
            overlay.style.backgroundColor = "";
            UI.typeText("The skies cleared.");
        }
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
                if (enemy.cry) AudioEngine.playCry(enemy.cry);
                AudioEngine.playSfx('rumble');
                document.getElementById('scene').classList.add('boss-intro');
                await sleep(ANIM.INTRO_BOSS_RUMBLE);
                document.getElementById('scene').classList.remove('boss-intro');
            } else {
                if (enemy.cry) AudioEngine.playCry(enemy.cry);
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

        let eMove;
        if (this.e.moves && this.e.moves.length > 0) {
            eMove = this.e.moves[Math.floor(Math.random() * this.e.moves.length)];
        } else {
            eMove = { name: "STRUGGLE", type: "normal", power: 50, accuracy: 100, priority: 0 };
        }

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


    // IN: Battle object (Add these as new methods)

    // 1. Check if Pokemon can move (Sleep, Freeze, Para, Confusion)
    async checkCanMove(mon, isPlayer) {
        // 0. FLINCH (Volatile - resets immediately)
        if (mon.volatiles.flinch) {
            mon.volatiles.flinch = false;
            await UI.typeText(`${mon.name} flinched!`);
            return false;
        }

        // 1. FREEZE
        if (mon.status === 'frz') {
            if (Math.random() < 0.2) {
                mon.status = null;
                UI.updateHUD(mon, isPlayer ? 'player' : 'enemy');
                await UI.typeText(`${mon.name} thawed out!`);
                return true;
            }
            await UI.typeText(`${mon.name} is\nfrozen solid!`);
            return false;
        }

        // 2. SLEEP
        if (mon.status === 'slp') {
            mon.volatiles.sleepTurns = (mon.volatiles.sleepTurns || Math.floor(Math.random() * 3) + 1) - 1;
            if (mon.volatiles.sleepTurns <= 0) {
                mon.status = null;
                UI.updateHUD(mon, isPlayer ? 'player' : 'enemy');
                await UI.typeText(`${mon.name} woke up!`);
                return true;
            }
            await UI.typeText(`${mon.name} is\nfast asleep!`);
            return false;
        }

        // 3. PARALYSIS
        if (mon.status === 'par' && Math.random() < 0.25) {
            await UI.typeText(`${mon.name} is paralyzed!\nIt can't move!`);
            return false;
        }

        // 4. CONFUSION
        if (mon.volatiles.confused > 0) {
            mon.volatiles.confused--;
            if (mon.volatiles.confused === 0) {
                UI.updateHUD(mon, isPlayer ? 'player' : 'enemy');
                await UI.typeText(`${mon.name} snapped\nout of confusion!`);
                return true;
            }

            await UI.typeText(`${mon.name} is\nconfused!`);

            // 33% chance to hit self
            if (Math.random() < 0.33) {
                await UI.typeText("It hurt itself in\nits confusion!");

                // Standard Gen 2 Confusion Damage Formula (Power 40)
                const dmg = Math.floor((((2 * mon.level / 5 + 2) * 40 * mon.stats.atk / mon.stats.def) / 50) + 2);

                // USE HELPER: This handles sound, shake, HP update, and HUD flash
                await this.applyDamage(mon, dmg, 'normal');

                return false;
            }
        }

        return true;
    },

    // 2. Apply End of Turn Damage (Burn/Poison/Weather effects)
    async processEndTurnEffects(mon, isPlayer) {
        if (mon.currentHp <= 0) return;
        const isInvisible = !!mon.volatiles.invulnerable;

        // 1. WEATHER DAMAGE
        if (this.weather.type === 'sand' || this.weather.type === 'hail') {
            let takesDamage = true;
            // Immunity checks
            if (this.weather.type === 'sand' && (mon.types.includes('rock') || mon.types.includes('ground') || mon.types.includes('steel'))) takesDamage = false;
            if (this.weather.type === 'hail' && mon.types.includes('ice')) takesDamage = false;

            if (takesDamage) {
                await wait(400);
                const msg = this.weather.type === 'sand' ? "is buffeted\nby the sandstorm!" : "is pelted\nby hail!";
                await UI.typeText(`${mon.name} ${msg}`);

                const dmg = Math.max(1, Math.floor(mon.maxHp / 16));
                // Use Helper (weather type triggers standard damage sound)
                await this.applyDamage(mon, dmg, 'normal');
                if (mon.currentHp <= 0) return;
            }
        }

        // 2. STATUS DAMAGE
        if (mon.status === 'brn' || mon.status === 'psn') {
            await wait(400);

            // Visual Status Flash (Purple/Red silhouette)
            if (!isInvisible) {
                const animClass = mon.status === 'brn' ? 'status-anim-brn' : 'status-anim-psn';
                const sprite = isPlayer ? document.getElementById('player-sprite') : document.getElementById('enemy-sprite');
                sprite.classList.add(animClass);
                await wait(600);
                sprite.classList.remove(animClass);
            }

            await UI.typeText(`${mon.name} ${STATUS_DATA[mon.status].msg}`);

            const dmg = Math.floor(mon.maxHp / 8);
            // Use Helper (pass 'burn' or 'poison' to trigger specific logic/sounds if needed)
            await this.applyDamage(mon, Math.max(1, dmg), mon.status === 'brn' ? 'burn' : 'poison');
        }
    },

    // 3. Apply Stat Changes (Buffs/Debuffs)
    async applyStatChanges(target, changes, isPlayer) {
        const sprite = isPlayer ? document.getElementById('player-sprite') : document.getElementById('enemy-sprite');

        // --- SUBSTITUTE IMMUNITY ---
        // Substitute blocks NEGATIVE stat changes from sources other than self.
        const hasSub = target.volatiles.substituteHP > 0;

        for (let c of changes) {
            // If Substitute exists and it's a debuff (change < 0), ignore it.
            // (Exceptions exist in newer gens like Intimidate, but for moves this is accurate)
            if (hasSub && c.change < 0) {
                await UI.typeText(`${target.name} is protected\nby the SUBSTITUTE!`);
                continue;
            }

            const stat = c.stat.name.replace('special-attack', 'spa').replace('special-defense', 'spd').replace('attack', 'atk').replace('defense', 'def').replace('speed', 'spe');
            const change = c.change;

            if (target.stages[stat] === 6 && change > 0) {
                await UI.typeText(`${target.name}'s ${stat.toUpperCase()}\nwon't go higher!`);
                continue;
            }
            if (target.stages[stat] === -6 && change < 0) {
                await UI.typeText(`${target.name}'s ${stat.toUpperCase()}\nwon't go lower!`);
                continue;
            }

            target.stages[stat] = Math.min(6, Math.max(-6, target.stages[stat] + change));

            const dir = change > 0 ? "rose!" : "fell!";
            const deg = Math.abs(change) > 1 ? "sharply " : "";

            const animClass = change > 0 ? 'anim-stat-up' : 'anim-stat-down';

            sprite.classList.add(animClass);

            if (change > 0) AudioEngine.playSfx('heal');
            else AudioEngine.playSfx('damage');

            await wait(800);
            sprite.classList.remove(animClass);

            await UI.typeText(`${target.name}'s ${stat.toUpperCase()}\n${deg}${dir}`);
        }
    },

    // 4. Apply Status Ailment
    async applyStatus(target, ailment, isPlayerTarget) {
        // 1. Substitute Block
        // Substitute blocks status unless it's sound-based (ignored for simplicity) or generated by the user
        if (target.volatiles.substituteHP > 0 && ailment !== 'confusion') {
            await UI.typeText("But it failed!");
            return false;
        }

        // 2. Handle Volatiles (Confusion)
        if (ailment === 'confusion') {
            if (target.volatiles.confused) {
                await UI.typeText(`${target.name} is\nalready confused!`);
                return false;
            }
            const scene = document.getElementById('scene');
            scene.classList.add('fx-psychic');
            await wait(400);
            scene.classList.remove('fx-psychic');

            target.volatiles.confused = Math.floor(Math.random() * 3) + 2;
            await UI.typeText(`${target.name} became\nconfused!`);
            return true;
        }

        // 3. Handle Major Statuses
        if (target.status) return false;

        if (['burn', 'poison', 'paralysis', 'freeze', 'sleep'].includes(ailment)) {
            const map = { 'burn': 'brn', 'poison': 'psn', 'paralysis': 'par', 'freeze': 'frz', 'sleep': 'slp' };

            const sprite = isPlayerTarget ? document.getElementById('player-sprite') : document.getElementById('enemy-sprite');

            let animClass = '';
            if (ailment === 'burn') animClass = 'status-anim-brn';
            else if (ailment === 'poison') animClass = 'status-anim-psn';
            else if (ailment === 'freeze') animClass = 'status-anim-frz';
            else if (ailment === 'paralysis') animClass = 'status-anim-par';
            else if (ailment === 'sleep') animClass = 'status-anim-slp';

            if (animClass) {
                sprite.classList.add(animClass);
                AudioEngine.playSfx(ailment === 'paralysis' ? 'electric' : 'damage');
                await wait(600);
                sprite.classList.remove(animClass);
            }

            target.status = map[ailment];
            UI.updateHUD(target, isPlayerTarget ? 'player' : 'enemy');

            let msg = `${target.name} was\n${ailment}ed!`;
            if (ailment === 'sleep') msg = `${target.name} fell\nasleep!`;
            if (ailment === 'freeze') msg = `${target.name} was\nfrozen solid!`;
            if (ailment === 'paralysis') msg = `${target.name} is\nparalyzed!`;

            AudioEngine.playSfx('clank');
            await UI.typeText(msg);
            return true;
        }
        return false;
    },

    async processDelayedMoves() {
        if (this.delayedMoves.length === 0) return;

        // Filter out moves that are finished
        const activeMoves = [];

        for (const item of this.delayedMoves) {
            item.turns--;
            if (item.turns > 0) {
                activeMoves.push(item);
            } else {
                // IT'S TIME!
                await UI.typeText(`${item.user.name} foresaw\nan attack!`);

                // Execute damage phase
                // We force the move type to 'typeless' logic for Gen 2 Future Sight if desired, 
                // or just run standard damage logic.
                await this.executeDamagePhase(item.user, item.target, item.moveData, item.isPlayer);
            }
        }

        this.delayedMoves = activeMoves;
    },

    async performTurn(playerMove) {
        if (this.uiLocked) return;

        // Safety: If charging, force the queued move
        if (this.p.volatiles.charging && this.p.volatiles.queuedMove) {
            playerMove = this.p.volatiles.queuedMove;
        }

        // 1. INSTANT UI FEEDBACK
        // Hide menus immediately so the selection box doesn't linger
        this.uiLocked = true;
        document.getElementById('action-menu').classList.add('hidden');
        document.getElementById('move-menu').classList.add('hidden');
        Input.setMode('NONE');

        // 2. BUILD QUEUE (No text here)
        try {
            const pAction = {
                type: 'ATTACK', user: this.p, target: this.e, move: playerMove,
                speed: this.p.stats.spe, priority: playerMove.priority || 0, isPlayer: true
            };

            // --- ENEMY AI ---
            let enemyMove;
            if (this.e.volatiles.recharging) {
                enemyMove = { name: "Recharging", priority: 0 };
            }
            else if (this.e.volatiles.charging && this.e.volatiles.queuedMove) {
                enemyMove = this.e.volatiles.queuedMove;
            }
            else if (this.e.moves && this.e.moves.length > 0) {
                enemyMove = this.e.moves[Math.floor(Math.random() * this.e.moves.length)];
            } else {
                enemyMove = { name: "STRUGGLE", type: "normal", power: 50, accuracy: 100, priority: 0 };
            }

            const eAction = {
                type: 'ATTACK', user: this.e, target: this.p, move: enemyMove,
                speed: this.e.stats.spe, priority: enemyMove.priority || 0, isPlayer: false
            };

            // Speed Tie / Priority Sorting
            const queue = [pAction, eAction].sort((a, b) => {
                if (a.priority !== b.priority) return b.priority - a.priority;
                if (a.speed !== b.speed) return b.speed - a.speed;
                return Math.random() - 0.5;
            });

            const result = await this.runQueue(queue);
            if (result === 'STOP_BATTLE') return;

            if (Game.state === 'BATTLE' && this.p.currentHp > 0 && this.e.currentHp > 0) {
                this.uiLocked = false; this.uiToMenu();
            }
        } catch (err) {
            console.error("Battle Error:", err);
            this.cleanup();
            this.uiLocked = false;
            this.uiToMenu();
        }
    },

    async performSwitch(newMon) {
        // FIX: Prevent double-clicks
        if (this.uiLocked) return;

        try {
            this.uiLocked = true;
            document.getElementById('action-menu').classList.add('hidden');

            const swapAction = { type: 'SWITCH', user: this.p, newMon: newMon, priority: 6, isPlayer: true };

            let eMove;
            if (this.e.moves && this.e.moves.length > 0) {
                eMove = this.e.moves[Math.floor(Math.random() * this.e.moves.length)];
            } else {
                eMove = { name: "STRUGGLE", type: "normal", power: 50, accuracy: 100, priority: 0 };
            }

            const eAction = {
                type: 'ATTACK', user: this.e, target: this.p, move: eMove,
                speed: this.e.stats.spe, priority: 0, isPlayer: false
            };

            const result = await this.runQueue([swapAction, eAction]);
            if (result === 'STOP_BATTLE') return;

            if (Game.state === 'BATTLE' && this.p.currentHp > 0 && this.e.currentHp > 0) {
                this.uiLocked = false; this.uiToMenu();
            }
        } catch (err) {
            console.error("Switch Error:", err);
            this.uiLocked = false;
            this.uiToMenu();
        }
    },

    async performItem(itemKey) {
        // FIX: Prevent double-clicks
        if (this.uiLocked) return;

        try {
            this.uiLocked = true;
            Input.setMode('NONE');
            document.getElementById('pack-screen').classList.add('hidden');
            document.getElementById('action-menu').classList.add('hidden');

            const itemAction = { type: 'ITEM', user: this.p, item: itemKey, priority: 6, isPlayer: true };

            let eMove;
            if (this.e.moves && this.e.moves.length > 0) {
                eMove = this.e.moves[Math.floor(Math.random() * this.e.moves.length)];
            } else {
                eMove = { name: "STRUGGLE", type: "normal", power: 50, accuracy: 100, priority: 0 };
            }

            const eAction = {
                type: 'ATTACK', user: this.e, target: this.p, move: eMove,
                speed: this.e.stats.spe, priority: 0, isPlayer: false
            };

            const result = await this.runQueue([itemAction, eAction]);

            if (result === 'STOP_BATTLE') return;

            if (Game.state === 'BATTLE' && this.p.currentHp > 0 && this.e.currentHp > 0) {
                this.uiLocked = false; this.uiToMenu();
            }
        } catch (err) {
            console.error("Item Error:", err);
            this.uiLocked = false;
            this.uiToMenu();
        }
    },

    async performRun() {
        this.uiLocked = true;
        document.getElementById('action-menu').classList.add('hidden');

        // Play Sound
        AudioEngine.playSfx('run');

        // Updated Text
        await UI.typeText("Got away safely!");

        // 1. SAVE FIRST (Suspend State)
        Game.save();

        // 2. STOP ENGINE
        Game.state = 'START';

        await wait(500);

        // 3. EXIT TO TITLE
        Game.returnToTitle();
    },

    // --- QUEUE EXECUTION ---
    async runQueue(queue) {
        // 1. PROCESS ACTIONS
        for (const action of queue) {
            if (Game.state !== 'BATTLE') return 'STOP_BATTLE';
            if (action.type !== 'SWITCH' && action.user.currentHp <= 0) continue;
            if (action.type === 'ATTACK') action.target = action.isPlayer ? this.e : this.p;

            const result = await this.executeAction(action);
            if (result === 'STOP_BATTLE') return 'STOP_BATTLE';

            if (this.p.currentHp <= 0) { await this.handleFaint(this.p, true); return; }
            if (this.e.currentHp <= 0) { await this.handleFaint(this.e, false); return; }
        }

        // 2. END OF TURN SEQUENCE
        if (Game.state === 'BATTLE') {
            // A. Delayed Moves (Future Sight / Wish / Yawn)
            await this.processDelayedMoves();
            if (this.p.currentHp <= 0) { await this.handleFaint(this.p, true); return; }
            if (this.e.currentHp <= 0) { await this.handleFaint(this.e, false); return; }

            // B. Status Effects
            await this.processEndTurnEffects(this.p, true);
            if (this.p.currentHp <= 0) { await this.handleFaint(this.p, true); return; }

            await this.processEndTurnEffects(this.e, false);
            if (this.e.currentHp <= 0) { await this.handleFaint(this.e, false); return; }

            // C. Weather
            if (this.weather.type !== 'none') {
                this.weather.turns--;
                if (this.weather.turns <= 0) {
                    await UI.typeText("The weather cleared.");
                    this.setWeather('none');
                } else {
                    const fx = WEATHER_FX[this.weather.type];
                    if (fx && fx.continue) await UI.typeText(fx.continue);
                }
            }
        }
    },

    async executeAction(action) {
        switch (action.type) {
            case 'ATTACK': await this.processAttack(action.user, action.target, action.move); break;
            case 'SWITCH': await this.processSwitch(action.newMon); break;
            case 'ITEM': return await this.processItem(action.item);
        }
    },

    async processSwitch(newMon, isFaintSwap = false) {
        document.getElementById('action-menu').classList.add('hidden');
        const eSprite = document.getElementById('enemy-sprite');
        eSprite.style.opacity = 1;

        await sleep(ANIM.SWITCH_STABILIZE);
        const sprite = document.getElementById('player-sprite');

        // --- BATON PASS LOGIC ---
        const isBP = this.batonPassActive;
        this.batonPassActive = false;

        // 1. Save/Reset Data
        if (this.p.transformBackup && !isBP) {
            this.revertTransform(this.p);
        }

        if (!isFaintSwap) {
            let msg = `Come back,\n${this.p.name}!`;
            if (isBP) msg = `${this.p.name} passed\nthe baton!`;

            await UI.typeText(msg);
            await sleep(ANIM.TEXT_READ_PAUSE);

            AudioEngine.playSfx('swoosh');
            document.getElementById('player-hud').classList.remove('hud-active');

            AudioEngine.playSfx('ball');
            sprite.classList.add('anim-return');
            UI.spawnSmoke(60, 150);
            await sleep(ANIM.SWITCH_RETURN_ANIM);
        } else {
            sprite.style.transition = 'none';
            sprite.style.opacity = 0;
            sprite.classList.remove('anim-faint');
            UI.forceReflow(sprite);
        }

        sprite.classList.remove('transformed-sprite');
        sprite.classList.remove('sub-back');

        // 2. Apply New Pokemon Data
        if (isBP) {
            newMon.stages = { ...this.p.stages };
            if (this.p.volatiles.substituteHP > 0) {
                newMon.volatiles.substituteHP = this.p.volatiles.substituteHP;
                newMon.volatiles.originalSprite = newMon.backSprite;
            }
            newMon.volatiles.focusEnergy = this.p.volatiles.focusEnergy;
        } else {
            newMon.volatiles = {};
            newMon.stages = { atk: 0, def: 0, spa: 0, spd: 0, spe: 0, acc: 0, eva: 0 };
        }

        this.p = newMon;
        this.participants.add(Game.activeSlot);

        UI.updateHUD(newMon, 'player'); this.buildMoveMenu();

        // --- HIDE BEFORE SOURCE CHANGE (ANTI-FLICKER) ---
        sprite.style.transition = 'none';
        sprite.style.opacity = 0;
        sprite.classList.remove('anim-return');
        UI.forceReflow(sprite);

        // --- 3. SHOW REAL POKEMON FIRST ---
        sprite.src = newMon.backSprite;

        await UI.typeText(`Go! ${newMon.name}!`);

        AudioEngine.playSfx('swoosh');
        await this.triggerPlayerEntry(newMon);

        AudioEngine.playSfx('swoosh');
        document.getElementById('player-hud').classList.add('hud-active');

        if (newMon.isShiny) { UI.playSparkle('player'); await sleep(1000); }

        // --- BATON PASS: LATE SUBSTITUTE ARRIVAL ---
        if (newMon.volatiles.substituteHP > 0) {
            await wait(500);
            const dollSrc = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/substitute.png";
            await this.performVisualSwap(newMon, dollSrc, true, true);
        }
    },

    async processItem(itemKey) {
        const data = ITEMS[itemKey];

        // 1. Decrement Inventory
        if (Game.inventory[itemKey] > 0) {
            Game.inventory[itemKey]--;
        } else {
            // Safety catch if UI didn't block it
            await UI.typeText("You don't have any!");
            return 'CONTINUE';
        }

        // 2. Logic Switch based on Item Type

        // --- POKEBALLS ---
        if (data.type === 'ball') {
            await UI.typeText(`You threw a\n${data.name}!`);
            return await this.attemptCatch(itemKey);
        }

        // --- HEALING ITEMS (Potions) ---
        else if (data.type === 'heal') {
            await UI.typeText(`You used a\n${data.name}!`);
            await this.applyHeal(this.p, data.heal);
        }

        // --- STATUS HEALS (Future Proofing for Full Heals/Antidotes) ---
        // You can add { type: 'status_heal', condition: 'psn' } to your ITEMS list later
        else if (data.type === 'status_heal') {
            await UI.typeText(`You used a\n${data.name}!`);
            if (this.p.status === data.condition || data.condition === 'all') {
                this.p.status = null;
                UI.updateHUD(this.p, 'player');
                AudioEngine.playSfx('heal');
                await UI.typeText(`${this.p.name} was\ncured!`);
            } else {
                await UI.typeText("It had no effect.");
            }
        }

        // --- BATTLE STAT BOOSTERS (Future Proofing for X Attack, etc) ---
        // You can add { type: 'buff', stat: 'atk', val: 1 } to your ITEMS list later
        else if (data.type === 'buff') {
            await UI.typeText(`You used an\n${data.name}!`);
            await this.applyStatChanges(this.p, [{ stat: { name: data.stat }, change: data.val }], true);
        }

        // --- REVIVES (Fails on active Pokemon) ---
        else if (data.type === 'revive') {
            await UI.typeText(`You used a\n${data.name}!`);
            await UI.typeText("But it failed!");
            // Optional: Refund item if failed
            Game.inventory[itemKey]++;
        }

        return 'CONTINUE';
    },




    async attemptCatch(ballKey) {
        const ballData = ITEMS[ballKey];

        // 1. CHECK BOSS/RAGE DEFLECTION
        if (this.e.isBoss && ballKey !== 'masterball') {
            let deflectChance = (this.e.rageLevel || 0) * GAME_BALANCE.RAGE_DEFLECT_CHANCE;

            if (this.e.rageLevel > 0 && Math.random() < deflectChance) {
                // REMOVED DUPLICATE TEXT HERE
                AudioEngine.playSfx('throw');

                // Short deflect animation
                await sleep(500);
                AudioEngine.playSfx('clank');
                document.getElementById('enemy-sprite').classList.add('anim-deflect');
                await sleep(300);
                document.getElementById('enemy-sprite').classList.remove('anim-deflect');

                await UI.typeText("The BOSS deflected\nthe Ball!");
                return 'CONTINUE';
            }
        }

        // REMOVED DUPLICATE TEXT HERE
        AudioEngine.playSfx('throw');

        const ball = document.createElement('div'); ball.className = `pokeball-anim ${ballData.css}`;
        ball.style.animation = "captureThrow 0.6s ease-out forwards";
        document.getElementById('scene').appendChild(ball);

        await sleep(ANIM.THROW_ANIM);

        const eSprite = document.getElementById('enemy-sprite');
        eSprite.style.transition = 'transform 0.4s, filter 0.4s';
        eSprite.style.filter = 'brightness(0) invert(1)';
        eSprite.style.transform = 'scale(0)';

        UI.spawnSmoke(230, 70);
        AudioEngine.playSfx('catch_success');
        ball.style.animation = "captureShake 1.0s ease-in-out infinite";

        const catchRate = ballData.rate * GAME_BALANCE.CATCH_RATE_MODIFIER;
        let catchProb = ((3 * this.e.maxHp - 2 * this.e.currentHp) / (3 * this.e.maxHp)) * catchRate;
        if (ballKey === 'pokeball') catchProb *= 0.5;
        const isCaught = Math.random() < catchProb;

        let shakes = 0;
        const maxShakes = 3;

        while (shakes < maxShakes) {
            await sleep(ANIM.CATCH_SHAKE_DELAY);
            shakes++;
            AudioEngine.playSfx('catch_click');
            if (!isCaught && Math.random() > 0.5) break;
        }

        if (isCaught && shakes === maxShakes) {
            AudioEngine.playSfx('swoosh');
            document.getElementById('enemy-hud').classList.remove('hud-active');

            AudioEngine.playSfx('heal');

            ball.style.animation = 'none';
            ball.style.transform = 'translate(215px, -100px)';
            ball.classList.add('pokeball-caught');

            Game.state = 'CAUGHT_ANIM';
            await UI.typeText(`Gotcha! ${this.e.name} was caught!`);
            document.getElementById('scene').removeChild(ball);

            this.e.rageLevel = 0;
            this.e.failedCatches = 0;
            this.e.currentHp = Math.min(this.e.maxHp, this.e.currentHp + Math.floor(this.e.maxHp * 0.2));

            Game.party.push(this.e);

            if (Game.party.length > 6) {
                Game.state = 'OVERFLOW';
                await UI.typeText(`Party is full!\nSelect PKMN to release.`);
                await sleep(ANIM.OVERFLOW_WARNING);
                Game.openParty(true);
            }
            else {
                await UI.typeText(`${this.e.name} was added\nto the party!`);
                Game.handleWin(true);
            }
            return 'STOP_BATTLE';
        } else {
            ball.style.display = 'none';
            eSprite.style.filter = 'none';
            eSprite.style.transform = 'scale(1)';

            UI.spawnSmoke(230, 70);
            AudioEngine.playSfx('ball');

            if (this.e.cry) AudioEngine.playCry(this.e.cry);

            this.e.failedCatches++;
            let gainedRage = false;

            const rageProb = GAME_BALANCE.RAGE_TRIGGER_CHANCE + (this.e.failedCatches * 0.1);

            if (Math.random() < rageProb) {
                this.e.rageLevel = Math.min(3, (this.e.rageLevel || 0) + 1);
                UI.updateHUD(this.e, 'enemy');
                gainedRage = true;
            }

            await UI.typeText(`Shoot! It was so close!`);
            document.getElementById('scene').removeChild(ball);

            if (gainedRage) {
                await this.triggerRageAnim(this.e.cry);
                await UI.typeText("It's getting aggressive!");
            }
            return 'CONTINUE';
        }
    },

    async processAttack(attacker, defender, move) {
        const isPlayer = (attacker === this.p);
        const logic = MOVE_LOGIC[move.id] || {};
        const sprite = isPlayer ? document.getElementById('player-sprite') : document.getElementById('enemy-sprite');

        // 1. RECHARGE CHECK
        if (attacker.volatiles.recharging) {
            attacker.volatiles.recharging = false;
            await UI.typeText(`${attacker.name} must\nrecharge!`);
            return;
        }

        // 2. CAN MOVE CHECK
        const canMove = await this.checkCanMove(attacker, isPlayer);
        if (!canMove) {
            if (attacker.volatiles.charging) {
                attacker.volatiles.charging = false;
                attacker.volatiles.queuedMove = null;
                attacker.volatiles.invulnerable = null;
                sprite.style.opacity = 1;
                if (logic.invuln) await UI.typeText(`${attacker.name} crashed\ndown!`);
            }
            return;
        }

        // 3. PROTECT RESET
        if (logic.type !== 'protect') {
            attacker.volatiles.protected = false;
        }

        // --- SUBSTITUTE ATTACK SEQUENCE (POOF OUT) ---
        const hasSub = attacker.volatiles.substituteHP > 0;

        // FIX: Removed "move.category !== 'status'"
        // Now ANY move that targets the opponent (or field) will make the Pokemon pop out
        if (hasSub && move.target !== 'user') {
            const realSrc = isPlayer ? attacker.backSprite : attacker.frontSprite;
            await this.performVisualSwap(attacker, realSrc, false, isPlayer);
        }
        // -------------------------------------------

        // 4. STANDARD MOVE TEXT
        await UI.typeText(`${attacker.name} used\n${move.name}!`);

        const checkInvulnHit = async () => {
            if (move.target === 'user' || move.target === 'users-field') return true;
            if (defender.volatiles.invulnerable) {
                const inv = defender.volatiles.invulnerable;
                let hits = false;
                if (inv === 'digging' && (move.name === 'EARTHQUAKE' || move.name === 'MAGNITUDE' || move.name === 'FISSURE')) hits = true;
                if (inv === 'flying' && (move.name === 'THUNDER' || move.name === 'GUST' || move.name === 'TWISTER' || move.name === 'SKY UPPERCUT')) hits = true;
                if (inv === 'diving' && (move.name === 'SURF' || move.name === 'WHIRLPOOL')) hits = true;
                if (!hits) {
                    await UI.typeText(`${defender.name} avoided\nthe attack!`);
                    return false;
                }
            }
            return true;
        };

        // Helper to put the doll back
        const restoreSub = async () => {
            const currentMon = isPlayer ? this.p : this.e;

            if (currentMon.volatiles.substituteHP > 0) {
                const dollSrc = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/substitute.png";

                if (sprite.src === dollSrc) return;

                await this.performVisualSwap(currentMon, dollSrc, true, isPlayer);
            }
        };

        // 5. CHARGE EXECUTION (Turn 2)
        if (attacker.volatiles.charging) {
            attacker.volatiles.charging = false;
            attacker.volatiles.invulnerable = null;
            sprite.style.opacity = 1;

            if (await checkInvulnHit() === false) { await restoreSub(); return; }

            if (defender.volatiles.protected && move.target !== 'user') {
                await UI.typeText(`${defender.name} protected\nitself!`);
                await restoreSub();
                return;
            }

            await this.executeDamagePhase(attacker, defender, move, isPlayer);
            await restoreSub();
            return;
        }

        // 6. START NEW MOVE (Logic)
        if (logic.type === 'protect') {
            if (attacker.volatiles.protected) {
                await UI.typeText("But it failed!");
                attacker.volatiles.protected = false;
            } else {
                attacker.volatiles.protected = true;
                await UI.typeText(`${attacker.name} protected\nitself!`);
                AudioEngine.playSfx('clank');
            }
            await restoreSub();
            return;
        }

        if (logic.type === 'charge') {
            if (logic.weatherSkip && this.weather.type === logic.weatherSkip) {
                // Continue
            } else {
                attacker.volatiles.charging = true;
                attacker.volatiles.queuedMove = move;
                if (logic.invuln) attacker.volatiles.invulnerable = logic.invuln;

                await wait(400);
                if (logic.hide) { AudioEngine.playSfx('swoosh'); sprite.style.opacity = 0; await wait(250); }

                await UI.typeText(`${attacker.name}\n${logic.msg}`);
                if (logic.buff) await this.applyStatChanges(attacker, [{ stat: { name: logic.buff.stat }, change: logic.buff.val }], isPlayer);
                await restoreSub();
                return;
            }
        }

        // 7. DEFENDER PROTECT
        if (defender.volatiles.protected && move.target !== 'user') {
            await UI.typeText(`${defender.name} protected\nitself!`);
            await restoreSub();
            return;
        }

        // 8. INVULNERABILITY
        if (await checkInvulnHit() === false) {
            if (move.name === 'SELF-DESTRUCT' || move.name === 'EXPLOSION') {
                await this.handleMoveSideEffects(attacker, defender, move, isPlayer, false);
            }
            await restoreSub();
            return;
        }

        // 9. ACCURACY
        let acc = move.accuracy;
        if (attacker.stages.acc) acc *= STAGE_MULT[attacker.stages.acc];
        if (defender.stages.eva) acc /= STAGE_MULT[defender.stages.eva];

        if (move.target !== 'user' && acc !== null && move.accuracy !== 0 && Math.random() * 100 > acc) {
            AudioEngine.playSfx('miss');
            await UI.typeText(`${attacker.name}'s attack\nmissed!`);

            if (Math.random() < GAME_BALANCE.RAGE_TRIGGER_CHANCE) {
                attacker.rageLevel = Math.min(3, (attacker.rageLevel || 0) + 1);
                UI.updateHUD(attacker, isPlayer ? 'player' : 'enemy');
                await this.triggerRageAnim(attacker.cry);
                await UI.typeText(`${attacker.name}'s RAGE\nis building!`);
            }
            if (move.name === 'SELF-DESTRUCT' || move.name === 'EXPLOSION') await this.handleMoveSideEffects(attacker, defender, move, isPlayer, false);

            await restoreSub();
            return;
        }

        // 10. EXECUTE
        await this.executeDamagePhase(attacker, defender, move, isPlayer);

        // 11. RECHARGE FLAG
        if (logic.type === 'recharge') attacker.volatiles.recharging = true;

        // --- SUBSTITUTE ATTACK SEQUENCE (POOF IN) ---
        await restoreSub();
    },

    // 1. THE DIRECTOR: Decides what logic to run based on move type
    async executeDamagePhase(attacker, defender, move, isPlayer) {
        let didSomething = false;
        let moveImmune = false;
        let explicitlyFailed = false;

        // Setup Weather Modifier
        let weatherMod = 1;
        if (this.weather.type === 'sun' && (move.type === 'fire' || move.type === 'water')) weatherMod = (move.type === 'fire' ? 1.5 : 0.5);
        if (this.weather.type === 'rain' && (move.type === 'water' || move.type === 'fire')) weatherMod = (move.type === 'water' ? 1.5 : 0.5);

        // 1. CHECK MOVE_DEX CONDITIONS
        const special = MOVE_DEX[move.name];
        if (special && special.condition) {
            if (!special.condition(defender)) {
                await UI.typeText("But it failed!");
                return;
            }
        }

        // 2. EXECUTE MAIN LOGIC
        let allowSideEffects = false;

        if (move.category !== 'status') {
            // --- DAMAGING MOVES ---
            const result = await this.handleDamageSequence(attacker, defender, move, isPlayer, weatherMod);
            didSomething = result.success;
            moveImmune = result.immune;
            // Only run side effects (e.g. Ancient Power stats) if damage landed
            allowSideEffects = didSomething && !moveImmune;
        } else {
            // --- STATUS MOVES ---
            // We check Type Immunity here (e.g. Thunder Wave vs Ground)
            const result = await this.handleStatusMove(attacker, defender, move);

            if (result === 'IMMUNE') {
                moveImmune = true;
                didSomething = false;
            } else if (result === 'FAIL') {
                explicitlyFailed = true;
                didSomething = false;
            } else if (result === true) {
                didSomething = true; // Weather or Unique Move handled itself (e.g. Rest)
            } else {
                // Result is false. This means it's a standard Status Move (Thunder Wave/Growl).
                // It passed immunity checks, so we MUST allow side effects to attempt to run.
                allowSideEffects = true;
            }
        }

        // 3. SIDE EFFECTS (The actual Status Application)
        // We pass 'allowSideEffects'. If true, it attempts to apply Paralysis/Poison/Etc.
        const sideEffectsHappened = await this.handleMoveSideEffects(attacker, defender, move, isPlayer, allowSideEffects);

        if (sideEffectsHappened) didSomething = true;

        // 4. FAILURE MESSAGE
        // If nothing happened, and it wasn't immune (already printed "No effect"), print "But it failed!"
        if (!didSomething && !moveImmune && !explicitlyFailed) {
            await UI.typeText("But it failed!");
        }
    },

    // 2. THE COMBO HANDLER: Manages Multi-hits, Drop RNG, and Attacker Rage
    async handleDamageSequence(attacker, defender, move, isPlayer, weatherMod) {
        let didSomething = false;
        // Removed "isImmune" variable as it wasn't being used effectively in the return,
        // but we keep the logic consistent with your previous version.

        let hitCount = 1;

        if (move.min_hits && move.max_hits) {
            hitCount = Math.floor(Math.random() * (move.max_hits - move.min_hits + 1)) + move.min_hits;
        } else if (move.min_hits) hitCount = move.min_hits;

        let hitsLanded = 0;
        let lastHitDamage = 0;
        let storedText = null;

        for (let i = 0; i < hitCount; i++) {
            if (defender.currentHp <= 0 || attacker.currentHp <= 0) break;

            const result = Mechanics.calcDamage(attacker, defender, move);
            result.damage = Math.floor(result.damage * weatherMod);
            if (result.damage > 0) lastHitDamage = result.damage;

            if (i === 0) {
                if (result.desc === 'failed') return { success: false, immune: false };

                // TYPE IMMUNITY CHECK
                if (result.eff === 0) {
                    await UI.typeText("It had no effect!");
                    return { success: false, immune: true };
                }

                if (result.isCrit) storedText = "A critical hit!";
                else if (result.desc) storedText = result.desc; // e.g. "It's super effective!"
            }

            if (result.damage > 0) {
                didSomething = true;
                await this.resolveSingleHit(attacker, defender, move, result.damage, isPlayer, i === 0, result);
                hitsLanded++;
            }
        }

        if (hitsLanded > 1) { await UI.typeText(`Hit ${hitsLanded} time(s)!`); await wait(500); }

        // 1. Show Effectiveness / Crit Text FIRST
        if (storedText) await UI.typeText(storedText);

        // 2. Check for Loot Drop
        if (hitsLanded > 0 && isPlayer && defender.currentHp > 0) await Game.tryMidBattleDrop(defender);

        // 3. NEW LOCATION: Check Defender Rage (Now happens after text)
        if (hitsLanded > 0 && defender.currentHp > 0 && defender.rageLevel !== undefined && defender.rageLevel < 3) {
            let chance = GAME_BALANCE.RAGE_TRIGGER_CHANCE;
            if ((defender.currentHp / defender.maxHp) < 0.5) chance += 0.25;

            if (Math.random() < chance) {
                defender.rageLevel++;
                UI.updateHUD(defender, isPlayer ? 'enemy' : 'player');

                // Full Animation
                await this.triggerRageAnim(defender.cry);
                await UI.typeText(`${defender.name}'s RAGE\nis building!`);
            }
        }

        // 4. Check Attacker Rage (Multi-hit fury)
        if (didSomething) await this.handleAttackerRage(attacker, defender, move, lastHitDamage, isPlayer);

        return { success: didSomething, immune: false };
    },

    // 3. THE BRAWLER: Handles Visuals, Audio, and HP for ONE hit
    async resolveSingleHit(attacker, defender, move, damage, isPlayer, isFirstHit, result) {
        // 1. Initial Audio Cues (Crit/Super Effective)
        if (isFirstHit) {
            if (result.isCrit) AudioEngine.playSfx('crit');
            else if (result.eff > 1) AudioEngine.playSfx('super_effective');
            else if (result.eff < 1) AudioEngine.playSfx('not_very_effective');
        }

        // 2. Apply the Damage (Handles Sprite Shake, Substitute, HP Update, HUD)
        await this.applyDamage(defender, damage, move.type);

        // 3. Handle Rage Building
        if (defender.currentHp > 0 && defender.rageLevel !== undefined && defender.rageLevel < 3) {
            let chance = GAME_BALANCE.RAGE_TRIGGER_CHANCE;
            if ((defender.currentHp / defender.maxHp) < 0.5) chance += 0.25;

            if (Math.random() < chance) {
                defender.rageLevel++;
                UI.updateHUD(defender, isPlayer ? 'enemy' : 'player');
                await this.triggerRageAnim(defender.cry);
                await UI.typeText(`${defender.name}'s RAGE\nis building!`);
            }
        }

        // 4. Handle Draining / Recoil
        if (move.meta && move.meta.drain) {
            await wait(500);
            const amount = Math.max(1, Math.floor(damage * (Math.abs(move.meta.drain) / 100)));

            if (move.meta.drain < 0) {
                // Recoil
                await UI.typeText(`${attacker.name} is hit\nwith recoil!`);
                await this.applyDamage(attacker, amount, 'recoil'); // Use helper!
            } else {
                // Drain Heal
                // We pass the custom text as the 3rd argument
                await this.applyHeal(attacker, amount, `${defender.name} had its\nenergy drained!`);
            }
        }
    },



    // 4. THE RAGE HANDLER: Handles angry Pokemon attacking again
    async handleAttackerRage(attacker, defender, move, baseDmg, isPlayer) {
        const rage = attacker.rageLevel || 0;
        if (attacker.currentHp <= 0 || rage === 0) return;

        // Determine bonus hits based on Rage Level
        let extraHits = 0;
        if (Math.random() < (rage * GAME_BALANCE.RAGE_MULTIHIT_BASE)) {
            extraHits = (rage === 3 && Math.random() < 0.5) ? 2 : 1;
        }

        if (extraHits > 0) {
            for (let j = 0; j < extraHits; j++) {
                if (defender.currentHp <= 0 || attacker.currentHp <= 0) break;

                await this.triggerRageAnim(attacker.cry);
                let msg = j === 1 ? "ULTRA ANGRY!" : "FULL OF RAGE!";
                await UI.typeText(`${attacker.name} is\n${msg}`);
                await UI.typeText(`${attacker.name} used\n${move.name} again!`);

                // Calculate reduced damage for extra hits
                const dmgMod = (j === 0) ? 0.8 : 0.5;
                const extraDmg = Math.max(1, Math.floor(baseDmg * dmgMod));

                // USE HELPER: Handles the hit on the defender
                await this.applyDamage(defender, extraDmg, move.type);

                // Rage Recoil Check
                if (Math.random() < GAME_BALANCE.RAGE_RECOIL_CHANCE) {
                    await wait(500);
                    await UI.typeText(`${attacker.name} is hit\nwith recoil!`);
                    const recoil = Math.max(1, Math.floor(baseDmg * GAME_BALANCE.RAGE_RECOIL_DMG));

                    // USE HELPER: Handles the recoil on the attacker
                    await this.applyDamage(attacker, recoil, 'recoil');
                }
            }
        }
    },

    // 5. THE SIDE-EFFECTS HANDLER: Stats, Status, and Weather

    async handleStatusMove(attacker, defender, move) {
        // 1. TYPE IMMUNITY CHECK (Use new Helper)
        // Example: Thunder Wave (Electric) vs Ground type = 0 effectiveness
        const typeMod = Mechanics.getTypeEffectiveness(move.type, defender.types);

        if (typeMod === 0) {
            await UI.typeText("It had no effect!");
            return 'IMMUNE';
        }

        // 2. CHECK MOVE_DEX (Unique Logic)
        // Handles specific script logic for Transform, Substitute, Rest, etc.
        const special = MOVE_DEX[move.name];
        if (special && special.isUnique) {
            // Run the custom function. If it returns true, success.
            // If it returns false (e.g. Yawn when already asleep), return 'FAIL'.
            return await special.onHit(this, attacker, defender) ? true : 'FAIL';
        }

        // 3. WEATHER MOVES
        const wMoves = { 'SUNNY DAY': 'sun', 'RAIN DANCE': 'rain', 'SANDSTORM': 'sand', 'HAIL': 'hail' };
        if (wMoves[move.name]) {
            AudioEngine.playSfx('swoosh');
            await wait(300);
            this.setWeather(wMoves[move.name]);
            await wait(1500);
            return true; // Success (did something)
        }

        // 4. FALLTHROUGH
        // If we reach here, it's a standard status move (like Growl or Poison Powder).
        // Returning false tells the engine: "Go ahead and check handleMoveSideEffects to apply the stats/status."
        return false;
    },

    async handleMoveSideEffects(attacker, defender, move, isPlayer, prevActionSuccess) {
        // 1. SELF-DESTRUCT / EXPLOSION (Priority Check)
        // FIX: Check 'move.id' (raw API name) to avoid dash/space formatting issues.
        // 'self-destruct' matches regardless of how we display it in text.
        if (move.id === 'self-destruct' || move.id === 'explosion') {
            // Explicitly set HP to 0
            attacker.currentHp = 0;
            UI.updateHUD(attacker, isPlayer ? 'player' : 'enemy');

            const sprite = isPlayer ? document.getElementById('player-sprite') : document.getElementById('enemy-sprite');

            // Force faint animation immediately so visual feedback is instant
            sprite.classList.add('anim-faint');

            // We manually add the faint message here or let handleFaint do it?
            // handleFaint handles the text/logic. We just update the visual state here.
            // We can add flavor text though.
            // (Wait for move text to finish reading in processAttack before this runs)

            return true;
        }

        // CRITICAL CHECK: For all other effects, stop if move failed
        if (!prevActionSuccess) return false;

        let didSomething = false;

        // 2. Stat Changes
        if (move.stat_changes && move.stat_changes.length > 0) {
            let chance = move.stat_chance === 0 ? 100 : move.stat_chance;
            if (Math.random() * 100 < chance) {
                let target = (move.target === 'user' || move.target === 'users-field') ? attacker : defender;
                if (move.category !== 'status') {
                    const first = move.stat_changes[0];
                    if (first && first.change > 0) target = attacker; else target = defender;
                }
                if (target.currentHp > 0) {
                    await this.applyStatChanges(target, move.stat_changes, target === this.p);
                    didSomething = true;
                }
            }
        }

        // 3. Status & Flinch
        if (move.meta) {
            if (defender.currentHp > 0 && move.meta.flinch_chance > 0) {
                if (Math.random() * 100 < move.meta.flinch_chance) {
                    defender.volatiles.flinch = true;
                }
            }
            if (defender.currentHp > 0 && move.meta.ailment && move.meta.ailment.name !== 'none') {
                let chance = move.meta.ailment_chance === 0 ? 100 : move.meta.ailment_chance;
                if (Math.random() * 100 < chance) {
                    let success = false;
                    if (move.meta.ailment.name === 'confusion') success = await this.applyStatus(defender, 'confusion', !isPlayer);
                    else success = await this.applyStatus(defender, move.meta.ailment.name, !isPlayer);
                    if (success) didSomething = true;
                }
            }
        }

        return didSomething;
    },

    async handleFaint(mon, isPlayer) {
        mon.currentHp = 0;
        mon.rageLevel = 0;

        const sprite = isPlayer ? document.getElementById('player-sprite') : document.getElementById('enemy-sprite');
        const hud = document.getElementById(isPlayer ? 'player-hud' : 'enemy-hud');

        if (mon.cry) AudioEngine.playCry(mon.cry);

        await sleep(ANIM.FAINT_PRE_DELAY);

        sprite.style.opacity = 1;
        sprite.classList.add('anim-faint');
        AudioEngine.playSfx('swoosh');

        setTimeout(() => {
            AudioEngine.playSfx('swoosh');
            hud.classList.remove('hud-active');
        }, ANIM.HUD_SLIDE_DELAY);

        // Logic Revert (Data only)
        const name = mon.transformBackup ? mon.transformBackup.name : mon.name;
        this.revertTransform(mon);

        // NOTE: We removed the line `sprite.classList.remove('transformed-sprite')`
        // The sprite now stays gray while fainting.

        await UI.typeText(`${name}\nfainted!`);
        await sleep(ANIM.FAINT_POST_DELAY);

        const textEl = document.getElementById('text-content');
        textEl.classList.remove('full-width');

        if (isPlayer) Game.handleLoss();
        else Game.handleWin(false);
    },




    // --- UTILS ---
    lastMenuIndex: 0,

    playSparkle(side) {
        AudioEngine.playSfx('shiny');
        const container = document.getElementById('fx-container'); const rect = side === 'enemy' ? { x: 239, y: 61 } : { x: 80, y: 130 }; const spread = side === 'enemy' ? 30 : 60;
        for (let i = 0; i < 5; i++) { const star = document.createElement('div'); star.className = 'shiny-star'; star.style.left = (rect.x - spread + Math.random() * (spread * 2)) + 'px'; star.style.top = (rect.y - spread + Math.random() * (spread * 2)) + 'px'; star.style.animation = `sparkle 0.6s ease-out ${i * 0.15}s forwards`; container.appendChild(star); setTimeout(() => star.remove(), 1500); }
    },

    switchIn(newMon, wasForced) {
        // We pass 'wasForced' as the second argument to processSwitch
        if (wasForced) {
            this.processSwitch(newMon, true).then(() => {
                this.uiLocked = false;
                BattleMenus.uiToMenu();
            });
        } else {
            this.performSwitch(newMon);
        }
    },



};

// Helper for Roar/Whirlwind/Dragon Tail
async function _forceSwitchOrRun(battle, user, target) {
    if (target.isBoss) {
        await UI.typeText("But it failed!");
        return false;
    }

    // CASE 1: Player used Roar -> End Battle, Find New Enemy
    if (user === battle.p) {
        await UI.typeText(`${target.name} fled\nin fear!`);
        AudioEngine.playSfx('run');

        // Visual fade out of enemy
        const eSprite = document.getElementById('enemy-sprite');
        eSprite.style.transition = "opacity 0.5s";
        eSprite.style.opacity = 0;
        await wait(500);

        // Trigger the "Skip Battle" logic
        Game.skipBattle();
        return true;
    }

    // CASE 2: Enemy used Roar -> Force Player Switch
    else {
        // Filter: Must be alive, and must NOT be the current one
        const validIndices = Game.party
            .map((p, index) => ({ p, index }))
            .filter(item => item.p.currentHp > 0 && item.index !== Game.activeSlot)
            .map(item => item.index);

        if (validIndices.length === 0) {
            await UI.typeText("But it failed!");
            return false;
        }

        // Pick Random
        const rndIndex = validIndices[Math.floor(Math.random() * validIndices.length)];
        const newMon = Game.party[rndIndex];

        await UI.typeText(`${target.name} was\ndragged out!`);

        // Update Game State Active Slot
        Game.activeSlot = rndIndex;

        // Perform the Switch (Force = true, so no menu)
        // Note: We set isFaintSwap=false because we want the animation of being dragged out
        await battle.processSwitch(newMon, false);
        return true;
    }
}
