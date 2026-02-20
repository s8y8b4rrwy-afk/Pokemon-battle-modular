const PokedexScreen = {
    id: 'POKEDEX',

    selectedIndex: 1, // 1-based ID
    maxIndex: 251,
    detailsOpen: false,

    visibleItems: [],

    onEnter() {
        UI.show('pokedex-screen');
        Input.setMode('POKEDEX');

        this.calculateVisibleItems();

        // Ensure selectedIndex is currently visible
        if (!this.visibleItems.includes(this.selectedIndex)) {
            // Find nearest or reset
            if (this.visibleItems.length > 0) {
                // Try to find closest
                const closest = this.visibleItems.reduce((prev, curr) =>
                    Math.abs(curr - this.selectedIndex) < Math.abs(prev - this.selectedIndex) ? curr : prev
                );
                this.selectedIndex = closest;
            } else {
                this.selectedIndex = 1;
            }
        }

        this.renderList();
        this.updateStats();
        AudioEngine.playSfx('pokedex_open');
    },

    onExit() {
        UI.hide('pokedex-screen');
        AudioEngine.playSfx('pokedex_close');
    },

    handleInput(key) {
        if (this.detailsOpen) {
            if (key === 'x' || key === 'X' || key === 'Escape') {
                this.closeDetails();
                return true;
            }
            if (key === 'ArrowUp' || key === 'ArrowLeft') {
                this.navigateDetails(-1);
                return true;
            }
            if (key === 'ArrowDown' || key === 'ArrowRight') {
                this.navigateDetails(1);
                return true;
            }
            return true; // Block other inputs
        }

        if (key === 'ArrowUp') {
            this.moveCursor(-1);
            return true;
        }
        if (key === 'ArrowDown') {
            this.moveCursor(1);
            return true;
        }
        if (key === 'ArrowLeft' || key === 'PageUp') { // Fast scroll
            this.moveCursor(-10);
            return true;
        }
        if (key === 'ArrowRight' || key === 'PageDown') {
            this.moveCursor(10);
            return true;
        }

        if (key === 'z' || key === 'Z' || key === 'Enter') {
            AudioEngine.playSfx('select');
            this.openDetails();
            return true;
        }

        if (key === 'x' || key === 'X' || key === 'Escape') {
            AudioEngine.playSfx('select');
            ScreenManager.pop();
            return true;
        }

        return false;
    },

    calculateVisibleItems() {
        const buffer = 5; // Reduced from 10
        const visibleSet = new Set();
        let hasSeenAny = false;

        for (let i = 1; i <= this.maxIndex; i++) {
            if (PokedexData.isSeen(i)) {
                hasSeenAny = true;
                // Add range [i - buffer, i + buffer]
                for (let j = i - buffer; j <= i + buffer; j++) {
                    if (j >= 1 && j <= this.maxIndex) {
                        visibleSet.add(j);
                    }
                }
            }
        }

        // Default if empty: show 1-10
        if (!hasSeenAny) {
            for (let i = 1; i <= buffer; i++) visibleSet.add(i);
        }

        // Convert to sorted array
        this.visibleItems = Array.from(visibleSet).sort((a, b) => a - b);
    },

    moveCursor(delta) {
        if (this.visibleItems.length === 0) return;

        // Find current index in the VISIBLE list
        let currentVisIdx = this.visibleItems.indexOf(this.selectedIndex);
        if (currentVisIdx === -1) currentVisIdx = 0; // Fallback

        let newVisIdx = currentVisIdx + delta;

        // Clamp
        if (newVisIdx < 0) newVisIdx = 0;
        if (newVisIdx >= this.visibleItems.length) newVisIdx = this.visibleItems.length - 1;

        const newId = this.visibleItems[newVisIdx];

        if (this.selectedIndex !== newId) {
            this.selectedIndex = newId;
            AudioEngine.playSfx('select'); // Nav sound
            this.highlightItem(this.selectedIndex);
            this.scrollToItem(this.selectedIndex);
        }
    },

    navigateDetails(delta) {
        // Only navigate to SEEN items
        // Find next seen item in visibleItems

        const currentVisIdx = this.visibleItems.indexOf(this.selectedIndex);
        let nextVisIdx = currentVisIdx;
        let found = false;

        // Search for next seen in direction
        let safety = 0;
        while (safety < this.visibleItems.length) {
            nextVisIdx += delta;

            // Allow wrapping for smoother experience
            if (nextVisIdx < 0) nextVisIdx = this.visibleItems.length - 1;
            if (nextVisIdx >= this.visibleItems.length) nextVisIdx = 0;

            const id = this.visibleItems[nextVisIdx];
            if (PokedexData.isSeen(id)) {
                this.selectedIndex = id;
                this.highlightItem(id); // Keep list synced (background)
                this.scrollToItem(id);
                this.openDetails(); // Re-render details
                found = true;
                break;
            }
            safety++;
        }
        if (!found) AudioEngine.playSfx('error');
    },

    async renderList() {
        const listContainer = document.getElementById('dex-list');
        listContainer.innerHTML = '';

        let lastId = -1;

        for (const i of this.visibleItems) {
            // Check for gap
            if (lastId !== -1 && i > lastId + 1) {
                const gap = document.createElement('div');
                gap.className = 'dex-gap';
                gap.innerText = '...';
                listContainer.appendChild(gap);
            }
            lastId = i;

            const el = document.createElement('div');
            el.className = 'dex-item';
            el.id = `dex-item-${i}`;
            el.onclick = () => {
                this.selectedIndex = i;
                this.highlightItem(i);
                this.openDetails();
            };

            // Structure
            // Num
            const numSpan = document.createElement('span');
            numSpan.className = 'dex-num';
            numSpan.innerText = i.toString().padStart(3, '0');
            el.appendChild(numSpan);

            // Icon Box
            const iconBox = document.createElement('div');
            iconBox.className = 'dex-icon-box';
            const iconImg = document.createElement('img');
            iconImg.className = 'dex-mini-sprite';
            iconImg.id = `dex-icon-${i}`;
            iconBox.appendChild(iconImg); // Empty initially
            el.appendChild(iconBox);

            // Caught Check
            const ball = document.createElement('div');
            ball.className = 'dex-pokeball'; // Default hidden
            if (PokedexData.isCaught(i)) {
                ball.classList.add('caught');
            }
            el.appendChild(ball);

            // Name
            const nameSpan = document.createElement('span');
            nameSpan.className = 'dex-name';
            nameSpan.id = `dex-name-${i}`;
            nameSpan.innerText = '-----';
            el.appendChild(nameSpan);

            listContainer.appendChild(el);

            // Lazy Load Data
            this.loadItemData(i);
        }

        this.highlightItem(this.selectedIndex);
        this.scrollToItem(this.selectedIndex);
    },

    async loadItemData(id) {
        const isSeen = PokedexData.isSeen(id);
        const nameEl = document.getElementById(`dex-name-${id}`);
        const iconEl = document.getElementById(`dex-icon-${id}`);

        if (!isSeen) {
            nameEl.innerText = '?????';
            iconEl.src = '';
            return;
        }

        // Fetch Data
        try {
            const data = await API.getPokemonData(id);
            if (data) {
                nameEl.innerText = data.name.toUpperCase();
                // Use icon if available, else front_default
                const icon = data.sprites.versions['generation-vii'].icons.front_default || data.sprites.front_default;
                iconEl.src = icon;

                // Add types to list item? Space is tight. Maybe just name is fine for list.
            }
        } catch (e) {
            console.warn(`Failed to load Dex data for ${id}`, e);
        }
    },

    highlightItem(id) {
        // Remove old
        const old = document.querySelector('.dex-item.selected');
        if (old) old.classList.remove('selected');

        const curr = document.getElementById(`dex-item-${id}`);
        if (curr) curr.classList.add('selected');
    },

    scrollToItem(id) {
        const curr = document.getElementById(`dex-item-${id}`);
        if (curr) {
            curr.scrollIntoView({ block: 'center', behavior: 'auto' });
        }
    },

    updateStats() {
        const { seen, caught } = PokedexData.getCounts();
        document.getElementById('dex-seen-count').innerText = seen.toString();
        document.getElementById('dex-caught-count').innerText = caught.toString();
    },

    // --- Details Panel ---
    async openDetails() {
        const id = this.selectedIndex;
        if (!PokedexData.isSeen(id)) {
            // Can't open details for unseen
            AudioEngine.playSfx('error');
            return;
        }

        this.detailsOpen = true;
        const panel = document.getElementById('dex-detail-panel');
        panel.classList.add('visible');

        // Reset contents
        document.getElementById('detail-sprite').src = '';
        document.getElementById('detail-name').innerText = 'LOADING...';
        document.getElementById('detail-types').innerText = '';
        document.getElementById('detail-desc').innerText = '...';
        document.getElementById('detail-encounters').innerText = '0';
        document.getElementById('detail-shiny').innerText = 'NO';
        document.getElementById('detail-boss').innerText = 'NO';
        document.getElementById('detail-height').innerText = '-.-m';
        document.getElementById('detail-weight').innerText = '-.-kg';
        document.getElementById('detail-evo-chain').innerHTML = '';

        // Load Data
        const data = await API.getPokemonData(id);
        if (!data) return;

        // Populate
        // USE CRYSTAL SPRITE (Gen 2)
        const vCrystal = data.sprites.versions['generation-ii']['crystal'];
        const sprite = vCrystal.front_transparent || vCrystal.front_default || data.sprites.front_default;

        document.getElementById('detail-sprite').src = sprite;
        document.getElementById('detail-name').innerText = `No. ${id.toString().padStart(3, '0')} ${data.name.toUpperCase()}`;

        // Play Cry
        if (data.cries && data.cries.latest) {
            AudioEngine.playCry(data.cries.latest);
        }

        // Types
        const types = data.types.map(t => t.type.name.toUpperCase()).join(' / ');
        document.getElementById('detail-types').innerText = `TYPE: ${types}`;

        // Description (Flavor Text)
        const speciesData = await API.getSpeciesData(data.species.url);
        if (!speciesData) return;

        // Find a Gen 2 entry if possible (Gold, Silver, Crystal)
        const gen2Games = ['gold', 'silver', 'crystal'];
        let entry = speciesData.flavor_text_entries.find(e => e.language.name === 'en' && gen2Games.includes(e.version.name));

        // Fallback to any english
        if (!entry) entry = speciesData.flavor_text_entries.find(e => e.language.name === 'en');

        const desc = entry ? entry.flavor_text.replace(/[\n\f]/g, ' ') : "No data.";
        document.getElementById('detail-desc').innerText = desc;

        // Encounters & Stats
        const dexEntry = PokedexData.getEntry(id);
        document.getElementById('detail-encounters').innerText = dexEntry.count || 0;
        document.getElementById('detail-shiny').innerText = dexEntry.shinySeen ? 'YES' : 'NO';
        document.getElementById('detail-boss').innerText = dexEntry.bossSeen ? 'YES' : 'NO';

        // Height/Weight
        document.getElementById('detail-height').innerText = (data.height / 10).toFixed(1) + 'm';
        document.getElementById('detail-weight').innerText = (data.weight / 10).toFixed(1) + 'kg';

        // Evolution Chain
        this.renderEvoChain(data.species.url);
    },

    closeDetails() {
        this.detailsOpen = false;
        document.getElementById('dex-detail-panel').classList.remove('visible');
    },

    async renderEvoChain(speciesUrl) {
        const container = document.getElementById('detail-evo-chain');
        container.innerHTML = 'Loading Chain...';

        try {
            const chain = await API.getEvolutionChain(speciesUrl);
            if (!chain) {
                container.innerHTML = 'No data.';
                return;
            }

            container.innerHTML = ''; // Clear

            // BFS or DFS traversal to flatten into a list for display? 
            // Pokemon Evolving is usually linear or branched.
            // Let's just show the direct line related to this pokemon if possible, or just the whole tree.
            // For simple linear display, we can just dump the nodes.

            const traverse = async (node) => {
                // Render Node
                const speciesId = parseInt(node.species.url.split('/').slice(-2, -1)[0]);

                // Gen 2 cap: skip Gen 3+ species entirely
                if (speciesId > 251) return;

                const isSeen = PokedexData.isSeen(speciesId);

                const stepDiv = document.createElement('div');
                stepDiv.className = 'evo-step';

                if (isSeen) {
                    stepDiv.style.cursor = 'pointer';
                    stepDiv.onclick = () => {
                        if (this.selectedIndex === speciesId) return;
                        this.selectedIndex = speciesId;
                        this.highlightItem(speciesId);
                        this.scrollToItem(speciesId);
                        this.openDetails();
                    };

                    const img = document.createElement('img');
                    img.className = 'evo-icon';
                    // Fetch icon for this species
                    try {
                        const pData = await API.getPokemonData(speciesId);
                        img.src = pData.sprites.versions['generation-vii'].icons.front_default || pData.sprites.front_default;
                    } catch (e) { img.src = ''; }
                    stepDiv.appendChild(img);
                } else {
                    const unk = document.createElement('div');
                    unk.className = 'unknown-icon';
                    unk.innerText = '?';
                    stepDiv.appendChild(unk);
                }
                container.appendChild(stepDiv);

                if (node.evolves_to && node.evolves_to.length > 0) {
                    // Filter to Gen 2 evolutions only before deciding whether to draw an arrow
                    const gen2Children = node.evolves_to.filter(child => {
                        const childId = parseInt(child.species.url.split('/').slice(-2, -1)[0]);
                        return childId <= 251;
                    });

                    if (gen2Children.length > 0) {
                        // Add arrow
                        const arrowProps = gen2Children[0].evolution_details[0]; // Simplification to first path
                        let infoText = '';
                        if (arrowProps) {
                            if (arrowProps.min_level) infoText = `L.${arrowProps.min_level}`;
                            else if (arrowProps.item) infoText = 'ITEM';
                            else if (arrowProps.trigger.name === 'trade') infoText = 'TRADE';
                            else if (arrowProps.happiness) infoText = 'HAPPINESS';
                            else infoText = '???';
                        }

                        const arrowContainer = document.createElement('div');
                        arrowContainer.style.display = 'flex';
                        arrowContainer.style.flexDirection = 'column';
                        arrowContainer.style.alignItems = 'center';

                        if (infoText) {
                            const info = document.createElement('span');
                            info.className = 'evo-info';
                            info.innerText = infoText;
                            arrowContainer.appendChild(info);
                        }

                        const arrow = document.createElement('span');
                        arrow.className = 'evo-arrow';
                        arrow.innerText = '→';
                        arrowContainer.appendChild(arrow);

                        container.appendChild(arrowContainer);

                        for (const child of gen2Children) {
                            await traverse(child);
                        }
                    }
                }
            };

            await traverse(chain);

        } catch (e) {
            console.error(e);
            container.innerText = "Chain Error";
        }
    }
};
