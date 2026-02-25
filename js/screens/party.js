const PartyScreen = {
    id: 'PARTY',

    // --- ScreenManager Interface ---
    onEnter(params = {}) {
        // Legacy: Handle forced mode via params or global
        const forced = params.forced || Game.forcedSwitch;
        this.open(forced);
    },

    onExit() {
        UI.hide('party-screen');
        UI.hide('party-context');
        // Clean up any temporary states
    },

    onSuspend() {
        // When covered by another screen (e.g. Summary)
    },

    onResume() {
        this.render();
        // Restore state
        if (Game.party.length > 6) Game.state = 'OVERFLOW';
        else if (Game.state !== 'HEAL' && Game.state !== 'PARTY') Game.state = 'PARTY';

        Input.setMode('PARTY', Game.selectedPartyIndex !== -1 ? Game.selectedPartyIndex : 0);
    },

    handleInput(key) {
        // If Context Menu is open, delegate to it (or handle here)
        if (Input.mode === 'CONTEXT') {
            return this.handleContextInput(key);
        }

        const len = Game.party.length; // Length is the Close Button index
        const isOverflow = (Game.state === 'OVERFLOW');
        const isForced = Game.forcedSwitch && !isOverflow; // Normal forced switch (e.g. faint)

        // Navigation rules:
        // - In Overflow: Max focus is the 7th Pokemon (index 6)
        // - In Forced: Max focus is the last Pokemon (index len - 1)
        // - Otherwise: Max focus is the Close button (index len)
        const maxFocus = isOverflow ? (len - 1) : (isForced ? len - 1 : len);

        if (key === 'ArrowDown') {
            Input.focus = Math.min(maxFocus, Input.focus + 1);
            AudioEngine.playSfx('select');
            return true;
        }
        if (key === 'ArrowUp') {
            Input.focus = Math.max(0, Input.focus - 1);
            AudioEngine.playSfx('select');
            return true;
        }
        if (['z', 'Z', 'Enter'].includes(key)) {
            AudioEngine.playSfx('select');
            if (Input.focus === len && !isForced && !isOverflow) {
                const closeBtn = document.getElementById('party-close-btn');
                if (closeBtn) (/** @type {HTMLElement} */ (closeBtn)).click();
            }
            else if (Input.focus < len) {
                const slots = document.querySelectorAll('.party-slot');
                if (slots[Input.focus]) (/** @type {HTMLElement} */ (slots[Input.focus])).click();
            }
            return true;
        }
        if (key === 'x' || key === 'X') {
            AudioEngine.playSfx('select');
            if (Game.state === 'HEAL') {
                ScreenManager.pop();
            } else if (isOverflow) {
                this.release(6); // X cancels the catch by releasing the new pokemon
            } else {
                const closeBtn = document.getElementById('party-close-btn');
                if (closeBtn && closeBtn.style.display !== 'none') {
                    (/** @type {HTMLElement} */ (closeBtn)).click();
                } else if (!isForced) {
                    BattleMenus.uiToMenu();
                }
            }
            return true;
        }

        return false; // Allow global fallbacks if needed
    },

    handleContextInput(key) {
        const len = document.querySelectorAll('#party-context .ctx-btn').length;

        if (key === 'ArrowDown') {
            Input.focus = Math.min(len - 1, Input.focus + 1);
            AudioEngine.playSfx('select');
            return true;
        }
        if (key === 'ArrowUp') {
            Input.focus = Math.max(0, Input.focus - 1);
            AudioEngine.playSfx('select');
            return true;
        }
        if (['z', 'Z', 'Enter'].includes(key)) {
            AudioEngine.playSfx('select');
            const btns = document.querySelectorAll('#party-context .ctx-btn');
            if (btns[Input.focus]) (/** @type {HTMLElement} */ (btns[Input.focus])).click();
            return true;
        }
        if (key === 'x' || key === 'X') {
            AudioEngine.playSfx('select');
            this.closeContext();
            return true;
        }

        return true;
    },

    // --- Legacy / Internal Logic ---
    open(forced) {
        // --- BUFF/REPAIR: Self-heal bugged saves with 7 pokemon ---
        if (Game.party.length > 6) {
            Game.state = 'OVERFLOW';
            forced = true; // Force it open
        }

        if (Battle.uiLocked && !forced && !['OVERFLOW', 'HEAL'].includes(Game.state)) return;

        // Prevent switching when trapped (unless forced)
        if (Game.state === 'BATTLE' && !forced && Battle.p && Battle.p.volatiles.trapped) {
            UI.typeText(`${Battle.p.name} can't be\nrecalled!`);
            return;
        }

        if (Game.state === 'BATTLE' && !forced) Battle.lastMenuIndex = Input.focus;

        // --- BUFF/REPAIR: Ensure overflow state is prioritized ---
        if (Game.party.length > 6) Game.state = 'OVERFLOW';
        else if (!['OVERFLOW', 'HEAL'].includes(Game.state)) Game.state = 'PARTY';

        Game.forcedSwitch = forced;
        // UI.show managed by ScreenManager usually, but doubling up is safe
        UI.show('party-screen');
        UI.hide('party-context');

        const closeBtn = document.getElementById('party-close-btn');
        const header = document.getElementById('party-header-text');
        closeBtn.onmouseenter = () => { Input.focus = Game.party.length; Input.updateVisuals(); AudioEngine.playSfx('select'); };

        closeBtn.style.pointerEvents = "auto";
        closeBtn.style.display = "block";

        if (Game.state === 'OVERFLOW') {
            header.innerText = "PARTY FULL! RELEASE ONE.";
            closeBtn.style.display = "none"; // Hide button as requested, slot 7 handles release
        } else if (Game.state === 'HEAL') {
            header.innerText = "USE ON WHICH PKMN?";
            closeBtn.innerText = "CANCEL";
            closeBtn.style.display = "block";
            closeBtn.onclick = () => { AudioEngine.playSfx('select'); ScreenManager.pop(); }; // Returns to BAG
        } else {
            header.innerText = "POKEMON PARTY";
            closeBtn.innerText = "CLOSE";
            closeBtn.style.display = forced ? "none" : "block";
            closeBtn.onclick = () => { AudioEngine.playSfx('select'); BattleMenus.uiToMenu(); };
        }
        this.render();
        Input.setMode('PARTY');
    },

    render() {
        const list = document.getElementById('party-list');
        list.innerHTML = "";
        Game.party.forEach((p, i) => {
            const div = document.createElement('div');
            div.className = 'party-slot';
            if (p.currentHp <= 0) div.classList.add('fainted');
            if (i === Game.activeSlot && p.currentHp > 0) div.classList.add('active-mon');
            if (i === 6) div.classList.add('new-catch');

            const pct = (p.currentHp / p.maxHp) * 100;
            const color = pct > 50 ? "#48c050" : pct > 20 ? "#d8b030" : "#c83828";

            div.innerHTML = `
                <img class="slot-icon" src="${p.icon}">
                <div class="slot-info">
                    <div class="slot-row"><span>${p.name}</span><span>Lv${p.level}</span></div>
                    <div class="slot-row">
                        <div class="mini-hp-bg"><div class="mini-hp-fill" style="width:${pct}%; background:${color}"></div></div>
                        <span>${Math.max(0, p.currentHp)}/${p.maxHp}</span>
                    </div>
                </div>`;

            div.onmouseenter = () => { Input.focus = i; Input.updateVisuals(); AudioEngine.playSfx('select'); };
            div.onclick = () => { Game.selectedPartyIndex = i; this.openContext(i); };
            list.appendChild(div);
        });
    },

    openContext(index) {
        Game.selectedPartyIndex = index;
        UI.show('party-context');
        const ctx = document.getElementById('party-context');
        ctx.innerHTML = "";

        const addBtn = (txt, fn, cls = '') => {
            const b = document.createElement('div');
            b.className = `ctx-btn ${cls}`;
            b.innerText = txt;
            b.onclick = fn;
            const idx = ctx.children.length;
            b.onmouseenter = () => { Input.focus = idx; Input.updateVisuals(); };
            ctx.appendChild(b);
        };

        if (Game.state === 'HEAL') {
            addBtn("USE", () => this.applyItem(index));
        } else if (Game.state === 'OVERFLOW') {
            addBtn("RELEASE", () => this.release(index), "warn");
        } else {
            addBtn("SHIFT", () => this.shift());
        }

        addBtn("SUMMARY", () => this.stats());
        addBtn("CLOSE", () => this.closeContext());
        Input.setMode('CONTEXT');
    },

    closeContext() {
        UI.hide('party-context');
        Input.setMode('PARTY', Game.selectedPartyIndex);
    },

    release(index) {
        const isOverflow = (Game.state === 'OVERFLOW');
        this.closeContext();
        if (typeof SummaryScreen !== 'undefined') SummaryScreen.close();

        const releasedMon = Game.party[index];
        const wasActive = (index === Game.activeSlot);

        // Immediate state reset to stop the "Overflow" mode visuals/logic
        if (isOverflow) Game.state = 'BATTLE';

        Game.party.splice(index, 1);

        if (typeof ScreenManager !== 'undefined') {
            ScreenManager.pop();
        } else {
            UI.hide('party-screen');
        }

        const onComplete = () => {
            if (Battle.userInputPromise) {
                Battle.userInputPromise(index);
            } else {
                Game.handleWin(true);
            }
        };

        // Adjust active slot if we released something before it
        if (index < Game.activeSlot) Game.activeSlot--;

        if (wasActive) {
            // Case 1: Releasing the active pokemon during overflow
            // We want the newly caught pokemon (previously at index 6, now index 5)
            // to jump into the active spot and play the swap animation.
            if (isOverflow && index !== 6) {
                const newMon = Game.party.pop(); // Take the new catch from the end
                Game.party.splice(index, 0, newMon); // Move it to the (index 0 usually) slot
                Game.activeSlot = index;
                Battle.animateSwap(releasedMon, Game.party[Game.activeSlot], onComplete);
            }
            // Case 2: Releasing the newly caught pokemon itself
            else if (isOverflow && index === 6) {
                UI.typeText(`Bye bye, ${releasedMon.name}!`, onComplete);
            }
            // Case 3: Normal release of active pokemon (not overflow)
            else {
                if (Game.party.length > 0) {
                    if (Game.activeSlot >= Game.party.length) Game.activeSlot = Game.party.length - 1;
                    Battle.animateSwap(releasedMon, Game.party[Game.activeSlot], onComplete);
                } else {
                    UI.typeText(`Bye bye, ${releasedMon.name}!`, onComplete);
                }
            }
        } else {
            // Case 4: Releasing a pokemon that is NOT on the field
            // User requested no animation here, just the farewell text.
            UI.typeText(`Bye bye, ${releasedMon.name}!`, onComplete);
        }
    },

    async applyItem(index) {
        this.closeContext();
        // Only pop the Summary screen if it's actually the active top screen.
        // Calling SummaryScreen.close() unconditionally would pop the Party screen
        // itself when Summary is not open, breaking the evo-stone selection menu.
        const topFrame = ScreenManager.stack[ScreenManager.stack.length - 1];
        if (topFrame && topFrame.id === 'SUMMARY') {
            SummaryScreen.close();
        }
        const p = Game.party[index];
        const data = ITEMS[Game.selectedItemKey];

        if (data.type === 'revive' && p.currentHp > 0) { AudioEngine.playSfx('error'); return; }
        if (data.type === 'heal' && (p.currentHp <= 0 || p.currentHp >= p.maxHp)) { AudioEngine.playSfx('error'); return; }
        if (data.type === 'status_heal' && (p.currentHp <= 0 || !p.status || (data.condition !== 'all' && p.status !== data.condition))) { AudioEngine.playSfx('error'); return; }

        if (data.type === 'evo_stone') {
            if (p.currentHp <= 0) { AudioEngine.playSfx('error'); return; }
            if (typeof Evolution !== 'undefined') {
                const chain = await Evolution.getChain(p);
                let currentNode = Evolution.findNodeByUrl(chain, p.speciesUrl);
                if (!currentNode) currentNode = Evolution.findNode(chain, p.name);

                if (!currentNode || currentNode.evolves_to.length === 0) {
                    AudioEngine.playSfx('error');
                    UI.show('dialog-box');
                    UI.typeText("It had no effect.", () => {
                        setTimeout(() => {
                            UI.hide('dialog-box');
                            Input.setMode('PARTY', Game.selectedPartyIndex);
                        }, 1500);
                    }, false, 'text-content', 0);
                    return;
                }

                // Filter evolves_to to Gen 2 only (species ID <= 251)
                const getSpeciesId = url => parseInt(url.split('/').filter(Boolean).pop());
                const gen2Evolutions = currentNode.evolves_to.filter(next => getSpeciesId(next.species.url) <= 251);

                if (gen2Evolutions.length > 1) {
                    Game.selectedPartyIndex = index;
                    UI.show('party-context');
                    const ctx = document.getElementById('party-context');
                    ctx.innerHTML = "";

                    gen2Evolutions.forEach(next => {
                        const btn = document.createElement('div');
                        btn.className = 'ctx-btn';
                        btn.innerText = next.species.name.toUpperCase();
                        btn.onclick = () => {
                            p.pendingEvoStone = { speciesName: next.species.name, speciesUrl: next.species.url, minLevel: 0 };
                            this.finishEvoStone(index, data);
                        };
                        const idx = ctx.children.length;
                        btn.onmouseenter = () => { Input.focus = idx; Input.updateVisuals(); AudioEngine.playSfx('select'); };
                        ctx.appendChild(btn);
                    });

                    const cancelBtn = document.createElement('div');
                    cancelBtn.className = 'ctx-btn';
                    cancelBtn.innerText = "CANCEL";
                    cancelBtn.onclick = () => { AudioEngine.playSfx('select'); this.closeContext(); };
                    const cIdx = ctx.children.length;
                    cancelBtn.onmouseenter = () => { Input.focus = cIdx; Input.updateVisuals(); AudioEngine.playSfx('select'); };
                    ctx.appendChild(cancelBtn);

                    Input.setMode('CONTEXT');
                    return;
                } else if (gen2Evolutions.length === 1) {
                    const next = gen2Evolutions[0];
                    p.pendingEvoStone = { speciesName: next.species.name, speciesUrl: next.species.url, minLevel: 0 };
                    this.finishEvoStone(index, data);
                    return;
                } else {
                    // All evolutions are Gen 3+ — stone has no effect
                    AudioEngine.playSfx('error');
                    UI.show('dialog-box');
                    UI.typeText("It had no effect.", () => {
                        setTimeout(() => {
                            UI.hide('dialog-box');
                            Input.setMode('PARTY', Game.selectedPartyIndex);
                        }, 1500);
                    }, false, 'text-content', 0);
                    return;
                }
            } else {
                AudioEngine.playSfx('error');
                return;
            }
        }
        if (data.type === 'inspiration_stone') {
            if (p.currentHp <= 0) { AudioEngine.playSfx('error'); return; }
            p.pendingInspirationMove = true;

            this.closeContext();
            Game.inventory[Game.selectedItemKey]--;
            AudioEngine.playSfx('heal');

            if (typeof ScreenManager !== 'undefined') ScreenManager.clear();
            else UI.hideAll(['party-screen', 'pack-screen', 'action-menu']);

            Game.state = 'BATTLE';

            setTimeout(() => {
                UI.typeText(`${p.name} feels\ninspired!`, () => {
                    Battle.uiLocked = false;
                    BattleMenus.uiToMoves();
                });
            }, 300);
            return;
        }


        // Check if we are in battle and targeting the active pokemon
        const isBattle = (typeof Battle !== 'undefined' && Battle.p);
        const isActive = isBattle && (index === Game.activeSlot);

        if (isActive) {
            // EXIT MENUS TO SHOW SCENE
            if (typeof ScreenManager !== 'undefined') ScreenManager.clear();
            else {
                UI.hide('party-screen');
                UI.hide('pack-screen');
                UI.hide('action-menu');
            }

            Game.inventory[Game.selectedItemKey]--;
            Game.state = 'BATTLE';

            // Run animation in the scene
            setTimeout(async () => {
                if (data.type === 'heal') {
                    await Battle.applyHeal(p, data.heal, `Used ${data.name} on\n${p.name}!`);
                } else if (data.type === 'status_heal') {
                    p.status = null;
                    UI.updateHUD(p, 'player');
                    AudioEngine.playSfx('heal');
                    await UI.typeText(`Used ${data.name} on\n${p.name}!`);
                    await UI.typeText(`${p.name} was\ncured!`);
                } else if (data.type === 'revive') {
                    const healAmt = data.name.includes("MAX") ? p.maxHp : Math.floor(p.maxHp / 2);
                    p.currentHp = 0;
                    await Battle.applyHeal(p, healAmt, `Used ${data.name} on\n${p.name}!`);
                }
                Battle.endTurnItem();
            }, 300);
            return;
        }

        // --- NON-ACTIVE OR NON-BATTLE FLOW (Instant) ---
        if (Game.selectedItemKey === 'revive' || Game.selectedItemKey === 'maxrevive') {
            const healAmt = data.name.includes("MAX") ? p.maxHp : Math.floor(p.maxHp / 2);
            p.currentHp = healAmt;
        }

        if (data.type === 'heal') p.currentHp = Math.min(p.maxHp, p.currentHp + data.heal);
        if (data.type === 'status_heal') p.status = null;

        if (data.pocket === 'debug') {
            this.render();
            if (typeof ScreenManager !== 'undefined') ScreenManager.clear();
            else UI.hideAll(['party-screen', 'pack-screen', 'action-menu']);

            Game.state = 'BATTLE';
            Game.selectedPartyIndex = index;

            setTimeout(() => {
                Battle.performItem(Game.selectedItemKey);
            }, 300);
            return;
        }

        Game.inventory[Game.selectedItemKey]--;
        AudioEngine.playSfx('heal');
        this.render();

        // If for some reason we missed the isActive check but it is the active slot, sync it
        if (index === Game.activeSlot) UI.updateHUD(p, 'player');

        // Clear everything to return to Battle Scene
        if (typeof ScreenManager !== 'undefined') {
            ScreenManager.clear();
        } else {
            UI.hide('party-screen');
            UI.hide('pack-screen');
            UI.hide('action-menu');
        }

        Game.state = 'BATTLE';

        // Show generic scene message (turn skipped internally by Battle.endTurnItem if targeting inactive)
        setTimeout(() => {
            UI.typeText(`Used ${data.name} on\n${p.name}!`, () => Battle.endTurnItem());
        }, 300);
    },

    finishEvoStone(index, data) {
        this.closeContext();
        Game.inventory[Game.selectedItemKey]--;
        AudioEngine.playSfx('heal');

        const p = Game.party[index];

        // Clear all screens back to the battle scene
        if (typeof ScreenManager !== 'undefined') {
            ScreenManager.clear();
        } else {
            UI.hideAll(['party-screen', 'pack-screen', 'action-menu']);
        }
        Game.state = 'BATTLE';

        // Evo Stone is FREE — doesn't cost a turn.
        // Show confirmation, then drop the player straight into the move menu
        // so they MUST choose an attack (can't open the bag again this turn).
        setTimeout(() => {
            UI.typeText(`${p.name} will evolve\nafter the battle!`, () => {
                // Go directly to the FIGHT (move selection) menu, bypassing the
                // action menu so no second item can be used this turn.
                Battle.uiLocked = false;
                BattleMenus.uiToMoves();
            });
        }, 300);
    },


    shift() {
        const idx = Game.selectedPartyIndex;
        const mon = Game.party[idx];
        if (mon.currentHp <= 0 || idx === Game.activeSlot) { AudioEngine.playSfx('error'); return; }

        const wasForced = Game.forcedSwitch;
        Game.forcedSwitch = false;

        if (Battle.userInputPromise) {
            if (typeof ScreenManager !== 'undefined') {
                ScreenManager.clear();
            } else {
                UI.hide('party-screen');
                UI.hide('party-context');
                if (typeof SummaryScreen !== 'undefined') SummaryScreen.close();
            }
            Game.activeSlot = idx;
            Game.state = 'BATTLE';
            Battle.userInputPromise(idx);
            return;
        }

        Game.party[Game.activeSlot].rageLevel = 0;
        Game.party[Game.activeSlot].volatiles = {};
        Game.party[Game.activeSlot].stages = { atk: 0, def: 0, spa: 0, spd: 0, spe: 0, acc: 0, eva: 0 };

        if (typeof ScreenManager !== 'undefined') {
            ScreenManager.clear();
        } else {
            UI.hide('party-screen');
            UI.hide('party-context');
            if (typeof SummaryScreen !== 'undefined') SummaryScreen.close();
        }
        Game.activeSlot = idx;
        Game.state = 'BATTLE';

        if (wasForced) Battle.switchIn(mon, true);
        else Battle.performSwitch(mon);
    },

    stats() {
        const mon = Game.party[Game.selectedPartyIndex];
        ScreenManager.push('SUMMARY', { mon, mode: Game.state });
    }
};
