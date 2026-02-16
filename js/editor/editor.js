/**
 * Animation Editor Logic
 * Handles state, rendering, and interaction for the standalone editor tool.
 */

const Editor = {
    // State
    currentAnimName: null,
    rootSteps: [],          // The top-level animation steps
    selectedStepPath: null,    // Path to selected step: [index, 'steps', index, ...]
    isPlayerAttacker: true,
    collapsedPaths: new Set(), // Store paths that are collapsed (stringified)

    // History
    undoStack: [],
    redoStack: [],

    // UI Refs
    ui: {
        animList: document.getElementById('anim-list'),
        timeline: document.getElementById('timeline-steps'),
        propsForm: document.getElementById('props-form'),
        searchInput: document.getElementById('anim-search'),
        previewBtn: document.getElementById('btn-play'),
        timelineHeader: document.querySelector('#timeline-area .panel-header span')
    },

    // Schema Definition
    StepSchema: {
        wait: {
            ms: { type: 'number', default: 200 }
        },
        sfx: {
            sound: { type: 'select', options: ['tackle', 'scratch', 'cut', 'ember', 'watergun', 'thunder', 'psybeam', 'cry', 'stat_up', 'stat_down', 'run', 'faint', 'bites', 'ball', 'shiny', 'heal', 'rumble', 'explosion'], default: 'tackle' },
            wait: { type: 'number', default: 0 }
        },
        cry: {
            cry: { type: 'text', default: '' },
            target: { type: 'select', options: ['attacker', 'defender'], default: 'attacker' },
            wait: { type: 'number', default: 0 }
        },
        spriteMove: {
            target: { type: 'select', options: ['attacker', 'defender'], default: 'attacker' },
            preset: { type: 'select', options: ['lunge', 'dodge', 'jump', 'recoil', 'charge', 'slam', 'float', 'shake'], default: 'lunge' },
            duration: { type: 'number', default: 200 },
            easing: { type: 'select', options: ['ease-out', 'ease-in', 'linear', 'ease-in-out'], default: 'ease-out' }
        },
        move: {
            selector: { type: 'text', default: '#attacker' },
            x: { type: 'number', default: 0 },
            y: { type: 'number', default: 0 },
            duration: { type: 'number', default: 300 },
            easing: { type: 'select', options: ['ease-out', 'ease-in', 'linear'], default: 'ease-out' },
            reset: { type: 'boolean', default: true }
        },
        spriteShake: {
            target: { type: 'select', options: ['attacker', 'defender'], default: 'defender' },
            duration: { type: 'number', default: 400 },
            flipped: { type: 'boolean', default: false },
            skipIfInvisible: { type: 'boolean', default: true }
        },
        screenFx: {
            class: { type: 'select', options: ['fx-shake', 'fx-flash', 'fx-invert', 'fx-wavy', 'fx-impact', 'fx-fire', 'fx-water', 'fx-ice', 'fx-grass', 'fx-electric', 'fx-psychic', 'fx-ground', 'fx-poison', 'fx-dark'], default: 'fx-shake' },
            duration: { type: 'number', default: 500 },
            opacity: { type: 'number', default: 1 },
            text: { type: 'text', default: '' }
        },
        flash: {
            color: { type: 'color', default: '#ffffff' },
            duration: { type: 'number', default: 300 },
            opacity: { type: 'number', default: 0.8 }
        },
        particles: {
            position: { type: 'select', options: ['attacker', 'defender', 'center'], default: 'defender' },
            type: { type: 'select', options: ['circle', 'square', 'sparkle', 'star'], default: 'circle' },
            count: { type: 'number', default: 8 },
            spread: { type: 'number', default: 40 },
            gravity: { type: 'number', default: 0 },
            speed: { type: 'number', default: 10 },
            color: { type: 'color', default: '#ffffff' },
            duration: { type: 'number', default: 600 }
        },
        beam: {
            from: { type: 'select', options: ['attacker', 'defender'], default: 'attacker' },
            to: { type: 'select', options: ['attacker', 'defender'], default: 'defender' },
            className: { type: 'text', default: 'beam-projectile' },
            duration: { type: 'number', default: 400 },
            width: { type: 'number', default: 6 },
            height: { type: 'number', default: 6 },
            beamStyles: { type: 'text', default: '' }
        },
        stream: {
            from: { type: 'select', options: ['attacker', 'defender'], default: 'attacker' },
            to: { type: 'select', options: ['attacker', 'defender'], default: 'defender' },
            svgShape: { type: 'select', options: [], dynamic: 'shapes' },
            color: { type: 'color', default: '#ff4500' },
            count: { type: 'number', default: 15 },
            interval: { type: 'number', default: 35 },
            travelTime: { type: 'number', default: 400 },
            scaleStart: { type: 'number', default: 0.5 },
            scaleEnd: { type: 'number', default: 1.5 }
        },
        volley: {
            from: { type: 'select', options: ['attacker', 'defender'], default: 'attacker' },
            to: { type: 'select', options: ['attacker', 'defender'], default: 'defender' },
            count: { type: 'number', default: 5 },
            interval: { type: 'number', default: 100 },
            travelTime: { type: 'number', default: 250 }
        },
        overlay: {
            target: { type: 'select', options: ['attacker', 'defender'], default: 'defender' },
            shape: { type: 'select', options: [], dynamic: 'shapes' },
            animation: { type: 'select', options: ['strike', 'slam', 'grow', 'fade'], default: 'grow' },
            color: { type: 'color', default: '#ffd700' },
            duration: { type: 'number', default: 400 },
            outline: { type: 'color', default: null },
            width: { type: 'number', default: 24 },
            height: { type: 'number', default: 24 }
        },
        formation: {
            target: { type: 'select', options: ['attacker', 'defender'], default: 'defender' },
            pattern: { type: 'select', options: [], dynamic: 'formations' },
            particleSize: { type: 'number', default: 6 },
            color: { type: 'color', default: '#ff0000' },
            stagger: { type: 'number', default: 20 },
            duration: { type: 'number', default: 600 },
            particleStyles: { type: 'text', default: '' }
        },
        tilt: {
            angle: { type: 'number', default: 3 },
            duration: { type: 'number', default: 300 }
        },
        bgColor: {
            color: { type: 'color', default: '#000000' },
            duration: { type: 'number', default: 200 }
        },
        invert: {
            target: { type: 'select', options: ['scene', 'attacker', 'defender'], default: 'scene' },
            duration: { type: 'number', default: 100 }
        },
        wave: {
            intensity: { type: 'number', default: 20 },
            duration: { type: 'number', default: 500 },
            speed: { type: 'number', default: 10 }
        },
        spriteWave: {
            target: { type: 'select', options: ['attacker', 'defender'], default: 'defender' },
            intensity: { type: 'number', default: 3 },
            duration: { type: 'number', default: 600 },
            speed: { type: 'number', default: 100 }
        },
        spriteSilhouette: {
            target: { type: 'select', options: ['attacker', 'defender'], default: 'defender' },
            color: { type: 'color', default: '#ffffff' },
            hold: { type: 'number', default: 0 },
            duration: { type: 'number', default: 600 },
            follow: { type: 'boolean', default: true }
        },
        spriteGhost: {
            target: { type: 'select', options: ['attacker', 'defender'], default: 'defender' },
            color: { type: 'color', default: '#ffffff' },
            hold: { type: 'number', default: 0 },
            duration: { type: 'number', default: 600 }
        },
        spriteMetallic: {
            target: { type: 'select', options: ['attacker', 'defender'], default: 'attacker' },
            color: { type: 'select', options: [null, 'gold', 'bronze'], default: null },
            duration: { type: 'number', default: 1000 }
        },
        cssClass: {
            selector: { type: 'text', default: '#scene' },
            class: { type: 'select', options: ['fx-shake', 'fx-flash', 'anim-violent', 'anim-shake-only', 'anim-faint'], default: 'fx-shake' },
            duration: { type: 'number', default: 400 },
            persist: { type: 'boolean', default: false }
        },
        spawn: {
            parent: { type: 'text', default: 'fxContainer' },
            tag: { type: 'text', default: 'div' },
            className: { type: 'select', options: ['sparkle', 'smoke-particle', 'shiny-star'], default: 'sparkle' },
            text: { type: 'text', default: '' },
            duration: { type: 'number', default: 600 }
        },
        orbit: {
            target: { type: 'select', options: ['attacker', 'defender'], default: 'defender' },
            shape: { type: 'select', options: [], dynamic: 'shapes' },
            count: { type: 'number', default: 3 },
            radiusX: { type: 'number', default: 32 },
            radiusY: { type: 'number', default: 12 },
            yOffset: { type: 'number', default: -45 },
            speed: { type: 'number', default: 1.1 },
            duration: { type: 'number', default: 1800 },
            color: { type: 'color', default: '#ffd700' },
            outline: { type: 'color', default: '#b8860b' },
            particleSize: { type: 'number', default: 16 }
        },
        parallel: {
            // Special container type
        },
        sequence: {
            // Special container type
        }
    },

    // Common Presets
    Presets: {
        'Phantom Step': [
            { type: 'sfx', sound: 'ghost' },
            {
                type: 'parallel', steps: [
                    { type: 'spriteMove', target: 'attacker', preset: 'lunge' },
                    { type: 'spriteGhost', target: 'attacker', color: '#4b0082', duration: 800, hold: 100 }
                ]
            }
        ],
        'Spirit Surge': [
            { type: 'sfx', sound: 'psychic' },
            { type: 'spriteWave', target: 'attacker', intensity: 8, duration: 1000, speed: 80 },
            { type: 'spriteWave', target: 'defender', intensity: 5, duration: 800, speed: 120 }
        ],
        'Basic Hit': [
            { type: 'sfx', sound: 'normal' },
            {
                type: 'parallel', steps: [
                    { type: 'spriteShake', target: 'defender', duration: 400 },
                    { type: 'screenFx', class: 'fx-normal', duration: 300 }
                ]
            }
        ],
        'Physical Lunge': [
            { type: 'spriteMove', target: 'attacker', preset: 'lunge' },
            { type: 'sfx', sound: 'scratch' },
            { type: 'spriteShake', target: 'defender', duration: 300 }
        ],
        'Special Beam': [
            { type: 'sfx', sound: 'thunder' },
            { type: 'beam', from: 'attacker', to: 'defender', className: 'beam-projectile', duration: 400 },
            { type: 'flash', color: '#ffffff', duration: 300 }
        ],
        'Status Stat Up': [
            { type: 'sfx', sound: 'stat_up' },
            { type: 'screenFx', class: 'fx-flash', duration: 500 },
            { type: 'spriteMove', target: 'attacker', preset: 'jump' }
        ],
        'Shadow Veil': [
            { type: 'spriteSilhouette', target: 'attacker', color: '#440044', duration: 800, hold: 200 },
            { type: 'sfx', sound: 'ghost' },
            { type: 'screenFx', class: 'fx-invert', duration: 400 }
        ]
    },

    init() {
        console.log("Initializing Editor...");
        // Hydrate dynamic options
        if (typeof AnimFramework !== 'undefined') {
            if (AnimFramework._shapes) {
                this.StepSchema.stream.svgShape.options = Object.keys(AnimFramework._shapes);
                this.StepSchema.overlay.shape.options = Object.keys(AnimFramework._shapes);
                this.StepSchema.orbit.shape.options = Object.keys(AnimFramework._shapes);
            }
            if (AnimFramework._formations) {
                this.StepSchema.formation.pattern.options = Object.keys(AnimFramework._formations);
            }
        }

        this.loadAnimationList();
        this.bindEvents();

        // Load first animation by default if available
        const allAnims = AnimFramework.list();
        if (allAnims.length > 0) {
            this.selectAnimation(allAnims[0]);
        }

        // Add history buttons to header
        this.addHistoryControls();
    },

    addHistoryControls() {
        const tools = document.querySelector('.timeline-tools');
        if (!tools) return;

        const undoBtn = document.createElement('button');
        undoBtn.className = 'icon-btn';
        undoBtn.textContent = '↺';
        undoBtn.title = 'Undo';
        undoBtn.onclick = () => this.undo();

        const redoBtn = document.createElement('button');
        redoBtn.className = 'icon-btn';
        redoBtn.textContent = '↻';
        redoBtn.title = 'Redo';
        redoBtn.onclick = () => this.redo();

        // Insert before add step button
        tools.prepend(redoBtn);
        tools.prepend(undoBtn);
    },

    bindEvents() {
        // Search
        this.ui.searchInput.addEventListener('input', (e) => {
            const target = e.target;
            if (target instanceof HTMLInputElement) {
                this.filterList(target.value);
            }
        });

        // Play
        this.ui.previewBtn.addEventListener('click', () => this.playPreview());
        document.getElementById('btn-stop').addEventListener('click', () => this.stopPreview());

        // New Animation
        document.getElementById('btn-new-anim').addEventListener('click', () => this.createNewAnim());

        // Add Step (Root)
        document.getElementById('btn-add-step').addEventListener('click', () => {
            this.saveState();
            this.addStepToPath([]);
        });

        // Add Parallel Button (Header)
        const tools = document.querySelector('.timeline-tools');
        const addParBtn = document.createElement('button');
        addParBtn.className = 'action-btn';
        addParBtn.style.marginLeft = '5px';
        addParBtn.textContent = '+ PARA';
        addParBtn.title = 'Add Parallel Group';
        addParBtn.onclick = () => {
            this.saveState();
            this.addStepToPath([], 'parallel');
        };
        tools.appendChild(addParBtn);

        // Add Presets Button
        const presetBtn = document.createElement('button');
        presetBtn.className = 'action-btn';
        presetBtn.style.marginLeft = '5px';
        presetBtn.textContent = '+ PRESET';
        presetBtn.title = 'Add Animation Preset';
        presetBtn.onclick = () => this.showPresetMenu();
        tools.appendChild(presetBtn);


        // Export
        document.getElementById('btn-export').addEventListener('click', () => this.exportCode());

        // Player toggle
        document.getElementById('chk-player-atk').addEventListener('change', (e) => {
            const target = e.target;
            if (target instanceof HTMLInputElement) {
                this.isPlayerAttacker = target.checked;
            }
        });

        // Keyboard Shortcuts
        window.addEventListener('keydown', (e) => {
            const target = e.target;
            if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;

            // Ctrl/Cmd + Z = Undo
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                this.undo();
            }
            // Ctrl/Cmd + Y or Ctrl/Cmd + Shift + Z = Redo
            if (((e.ctrlKey || e.metaKey) && e.key === 'y') || ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Z')) {
                e.preventDefault();
                this.redo();
            }
            // Space = Toggle Play/Stop
            if (e.key === ' ') {
                e.preventDefault();
                this.playPreview();
            }
            // Escape = Stop
            if (e.key === 'Escape') {
                this.stopPreview();
            }
        });
    },

    // --- HISTORY ---
    saveState() {
        this.undoStack.push(JSON.stringify(this.rootSteps));
        if (this.undoStack.length > 50) this.undoStack.shift();
        this.redoStack = []; // Clear redo on new action
    },

    undo() {
        if (this.undoStack.length === 0) return;
        const state = this.undoStack.pop();
        this.redoStack.push(JSON.stringify(this.rootSteps));
        this.rootSteps = JSON.parse(state);
        this.renderTimeline();
        this.renderProps();
    },

    redo() {
        if (this.redoStack.length === 0) return;
        const state = this.redoStack.pop();
        this.undoStack.push(JSON.stringify(this.rootSteps));
        this.rootSteps = JSON.parse(state);
        this.renderTimeline();
        this.renderProps();
    },

    // --- LIBRARY ---
    loadAnimationList() {
        const list = AnimFramework.list().sort();
        this.ui.animList.innerHTML = '';

        list.forEach(name => {
            const el = document.createElement('div');
            el.className = 'anim-item';
            el.textContent = name;
            el.onclick = () => this.selectAnimation(name);
            el.dataset.name = name;
            this.ui.animList.appendChild(el);
        });
    },

    filterList(query) {
        const items = this.ui.animList.querySelectorAll('.anim-item');
        query = query.toLowerCase();
        items.forEach(item => {
            const name = item.dataset.name.toLowerCase();
            item.style.display = name.includes(query) ? 'flex' : 'none';
        });
    },

    selectAnimation(name) {
        this.currentAnimName = name;
        if (this.ui.timelineHeader) this.ui.timelineHeader.textContent = "TIMELINE"; // Reset header
        this.selectedStepPath = null;
        this.undoStack = [];
        this.redoStack = [];

        // Highlight in sidebar
        document.querySelectorAll('.anim-item').forEach(el => el.classList.remove('active'));
        const activeItem = document.querySelector(`.anim-item[data-name="${name}"]`);
        if (activeItem) activeItem.classList.add('active');

        const original = AnimFramework._registry[name.toLowerCase()];

        if (typeof original === 'function') {
            this.rootSteps = [];
            alert(`Animation "${name}" is function-based. Visual editing is limited to array-based animations.`);
        } else {
            this.rootSteps = JSON.parse(JSON.stringify(original));
        }

        this.renderTimeline();
        this.renderProps();
    },

    createNewAnim() {
        const name = prompt("Enter new animation name:");
        if (!name) return;
        if (AnimFramework.has(name)) {
            alert("Name already exists!");
            return;
        }

        // Mock register it so we can edit it
        AnimFramework.register(name, []);
        this.loadAnimationList();
        this.selectAnimation(name);
    },

    // --- TIMELINE RENDER ---
    renderTimeline() {
        this.ui.timeline.innerHTML = '';
        const duration = this.calculateDuration(this.rootSteps);
        if (this.ui.timelineHeader) {
            this.ui.timelineHeader.innerHTML = `TIMELINE <span style="font-weight:normal;opacity:0.6;font-size:10px;margin-left:8px;">(${duration}ms total)</span>`;
        }

        if (!this.rootSteps || this.rootSteps.length === 0) {
            this.ui.timeline.innerHTML = '<div class="empty-state">No steps. Add one!</div>';
            return;
        }

        // Render root list
        this.renderStepList(this.rootSteps, [], this.ui.timeline);
    },

    // Refined duration calculation logic
    calculateDuration(steps, isParallel = false) {
        if (isParallel) {
            let max = 0;
            steps.forEach(s => {
                const d = s.type === 'parallel' ? this.calculateDuration(s.steps || [], true) : (s.duration || s.ms || 0) + (s.wait || 0);
                if (d > max) max = d;
            });
            return max;
        } else {
            let sum = 0;
            steps.forEach(s => {
                sum += s.type === 'parallel' ? this.calculateDuration(s.steps || [], true) : (s.duration || s.ms || 0) + (s.wait || 0);
            });
            return sum;
        }
    },

    // Recursive Renderer
    renderStepList(steps, parentPath, container) {
        steps.forEach((step, index) => {
            const currentPath = [...parentPath, index];
            const pathStr = JSON.stringify(currentPath);
            const isSelected = JSON.stringify(this.selectedStepPath) === pathStr;
            const isCollapsed = this.collapsedPaths.has(pathStr);

            const card = document.createElement('div');
            card.className = `step-card ${isSelected ? 'selected' : ''}`;
            card.draggable = true;

            // 1. Header Row
            const header = document.createElement('div');
            header.className = 'step-header';

            // Collapse Toggle (only for Parallel)
            const isContainer = step.type === 'parallel' || step.type === 'sequence';
            if (isContainer) {
                const toggle = document.createElement('div');
                toggle.className = `collapse-toggle ${isCollapsed ? 'collapsed' : ''}`;
                toggle.textContent = isCollapsed ? '▶' : '▼';
                toggle.onclick = (e) => {
                    e.stopPropagation();
                    if (this.collapsedPaths.has(pathStr)) {
                        this.collapsedPaths.delete(pathStr);
                    } else {
                        this.collapsedPaths.add(pathStr);
                    }
                    this.renderTimeline();
                };
                header.appendChild(toggle);
            } else {
                // Spacer for non-parallel steps to align icons
                const spacer = document.createElement('div');
                spacer.className = 'collapse-toggle';
                spacer.style.visibility = 'hidden';
                header.appendChild(spacer);
            }

            const icon = document.createElement('div');
            icon.className = 'step-type-icon';
            icon.textContent = step.type.substring(0, 2).toUpperCase();
            icon.style.background = this.getStepColor(step.type);

            const info = document.createElement('div');
            info.className = 'step-info';
            info.innerHTML = `
                <span class="step-title">${step.type}</span>
                <span class="step-desc">${this.getStepDesc(step)}</span>
            `;

            // Actions (Duplicate/Del) - Handled by CSS for hover
            const actions = document.createElement('div');
            actions.className = 'step-actions';

            const dupBtn = document.createElement('button');
            dupBtn.innerHTML = '⧉';
            dupBtn.className = 'icon-btn';
            dupBtn.title = 'Duplicate';
            dupBtn.onclick = (e) => {
                e.stopPropagation();
                this.saveState();
                this.duplicateStep(currentPath);
            };

            const delBtn = document.createElement('button');
            delBtn.innerHTML = '×';
            delBtn.className = 'icon-btn';
            delBtn.style.color = '#ff6060';
            delBtn.title = 'Delete';
            delBtn.onclick = (e) => {
                e.stopPropagation();
                this.saveState();
                this.deleteStep(currentPath);
            };

            actions.appendChild(dupBtn);
            actions.appendChild(delBtn);

            header.appendChild(icon);
            header.appendChild(info);
            header.appendChild(actions);
            card.appendChild(header);

            // Click to select
            header.onclick = (e) => {
                e.stopPropagation();
                this.selectedStepPath = currentPath;
                this.renderTimeline();
                this.renderProps();
            };

            // 2. Container Children Container (Recursion)
            if (isContainer && !isCollapsed) {
                const childContainer = document.createElement('div');
                childContainer.className = `${step.type}-container container-block`;
                // Styles moved to classes or simplified
                childContainer.style.borderLeft = `2px solid ${step.type === 'sequence' ? '#7ed321' : '#40a0e0'}`;
                childContainer.style.marginLeft = '12px';
                childContainer.style.paddingLeft = '8px';
                childContainer.style.marginTop = '6px';
                childContainer.style.background = 'rgba(255, 255, 255, 0.03)';
                childContainer.style.borderRadius = '4px';
                childContainer.style.padding = '8px';

                if (!step.steps) step.steps = [];

                // Allow dropping directly into the container (to append)
                childContainer.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    childContainer.style.background = 'rgba(64, 160, 224, 0.15)';
                });
                childContainer.addEventListener('dragleave', (e) => {
                    e.stopPropagation();
                    childContainer.style.background = 'rgba(255, 255, 255, 0.03)';
                });
                childContainer.addEventListener('drop', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    childContainer.style.background = 'rgba(255, 255, 255, 0.03)';
                    const data = e.dataTransfer.getData('application/json');
                    if (!data) return;
                    const srcPath = JSON.parse(data);
                    this.saveState();
                    this.moveStepToContainer(srcPath, step.steps);
                });

                // --- Recursion call ---
                this.renderStepList(step.steps, [...currentPath, 'steps'], childContainer);

                // "Add Step Here" btn inside the parallel block
                const addBtn = document.createElement('button');
                addBtn.className = 'secondary-btn';
                addBtn.style.fontSize = '10px';
                addBtn.style.marginTop = '8px';
                addBtn.style.width = '100%';
                addBtn.style.padding = '4px';
                addBtn.textContent = `+ ADD ${step.type.toUpperCase()} STEP`;
                addBtn.onclick = (e) => {
                    e.stopPropagation();
                    this.saveState();
                    this.addStepToPath([...currentPath, 'steps']);
                };
                childContainer.appendChild(addBtn);

                card.appendChild(childContainer);
            }

            // Drag Handlers
            card.addEventListener('dragstart', (e) => {
                e.stopPropagation();
                e.dataTransfer.setData('application/json', JSON.stringify(currentPath));
                e.dataTransfer.effectAllowed = 'move';
                card.style.opacity = '0.5';
            });

            card.addEventListener('dragend', () => {
                card.style.opacity = '1';
                this.renderTimeline();
            });

            // Allow dropping onto this card (to reorder BEFORE this card)
            card.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.stopPropagation();
                card.style.borderTop = '2px solid var(--accent)';
            });

            card.addEventListener('dragleave', (e) => {
                e.stopPropagation();
                card.style.borderTop = '';
            });

            card.addEventListener('drop', (e) => {
                e.preventDefault();
                e.stopPropagation();
                card.style.borderTop = '';
                const data = e.dataTransfer.getData('application/json');
                if (!data) return;
                const srcPath = JSON.parse(data);
                this.saveState();
                this.moveStep(srcPath, currentPath);
            });

            container.appendChild(card);
        });

        // END LIST DROP ZONE
        const dropZone = document.createElement('div');
        dropZone.className = 'drop-target';

        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('active');
        });

        dropZone.addEventListener('dragleave', (e) => {
            dropZone.classList.remove('active');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('active');
            const data = e.dataTransfer.getData('application/json');
            if (!data) return;
            const srcPath = JSON.parse(data);

            this.saveState();
            this.moveStepToContainer(srcPath, steps);
        });
        container.appendChild(dropZone);
    },

    getStepColor(type) {
        const colors = {
            sfx: '#e0c040',
            wait: '#888',
            parallel: '#40a0e0',
            spriteMove: '#e06060',
            particles: '#60e0a0',
            flash: '#e0e0e0',
            overlay: '#a060e0',
            formation: '#ff4500',
            orbit: '#ffd700',
            spriteMetallic: '#a0a0a0'
        };
        return colors[type] || '#555';
    },

    getStepDesc(step) {
        if (step.type === 'sfx') return `Sound: ${step.sound || 'none'}`;
        if (step.type === 'wait') return `${step.ms}ms`;
        if (step.type === 'spriteMove') return `${step.target || 'attacker'} -> ${step.preset || 'custom'}`;
        if (step.type === 'parallel') return `(${step.steps ? step.steps.length : 0} steps)`;
        if (step.type === 'overlay') return `${step.shape || 'circle'} on ${step.target}`;
        if (step.type === 'screenFx') return `${step.class}`;
        if (step.type === 'particles') return `${step.type} (${step.count})`;
        if (step.type === 'orbit') return `${step.count} ${step.shape || 'duck'}s around ${step.target}`;
        if (step.type === 'spriteMetallic') return `${step.color || 'Silver'} Shine on ${step.target}`;
        return '';
    },

    // --- DATA HELPERS (Path = array of keys/indices) ---
    getStepByPath(path) {
        let current = this.rootSteps;
        for (let i = 0; i < path.length; i++) {
            const key = path[i];
            if (i === path.length - 1) return current[key];
            current = current[key];
        }
    },

    getParentArray(path) {
        let current = this.rootSteps;
        // Navigate up to the last index
        for (let i = 0; i < path.length - 1; i++) {
            current = current[path[i]];
        }
        return current;
    },

    addStepToPath(parentPath, type = 'wait') {
        // Parent path points to an array (either rootSteps itself [] or a nested 'steps' array)
        let targetArray = this.rootSteps;
        if (parentPath.length > 0) {
            let current = this.rootSteps;
            for (let i = 0; i < parentPath.length; i++) {
                current = current[parentPath[i]];
            }
            targetArray = current;
        }

        const newStep = { type: type };
        if (type === 'wait') newStep.ms = 200;
        else if (type === 'parallel') newStep.steps = [];

        targetArray.push(newStep);
        this.renderTimeline();
    },

    deleteStep(path) {
        const parentArr = this.getParentArray(path);
        const idx = path[path.length - 1];
        parentArr.splice(idx, 1);
        if (JSON.stringify(this.selectedStepPath) === JSON.stringify(path)) {
            this.selectedStepPath = null;
        }
        this.renderTimeline();
        this.renderProps();
    },

    duplicateStep(path) {
        const parentArr = this.getParentArray(path);
        const idx = path[path.length - 1];
        const item = JSON.parse(JSON.stringify(parentArr[idx]));
        parentArr.splice(idx + 1, 0, item);
        this.renderTimeline();
    },

    moveStep(srcPath, targetPath) {
        // Prevent moving parent into child (infinite recursion)
        const srcStr = JSON.stringify(srcPath);
        const tgtStr = JSON.stringify(targetPath);
        if (tgtStr.startsWith(srcStr)) {
            console.warn("Cannot move parent into child.");
            return;
        }

        const srcArray = this.getParentArray(srcPath);
        const srcIndex = srcPath[srcPath.length - 1];

        const targetArray = this.getParentArray(targetPath);
        const targetIndex = targetPath[targetPath.length - 1];

        // Retrieve and remove item
        const item = srcArray[srcIndex];
        srcArray.splice(srcIndex, 1);

        // Calculate new insertion index
        let actualTargetIndex = targetIndex;

        // If we are in the SAME array/level, and we removed from an index BEFORE the target,
        // all subsequent indices shifted down by 1. So target index effectively moves down too.
        if (srcArray === targetArray && srcIndex < targetIndex) {
            actualTargetIndex--;
        }

        targetArray.splice(actualTargetIndex, 0, item);
        this.renderTimeline();
    },

    moveStepToContainer(srcPath, containerArray) {
        // Special case: Dragging item into a container array (append to end)
        // Check if we are dragging a container into itself

        const srcArray = this.getParentArray(srcPath);
        const srcIndex = srcPath[srcPath.length - 1];
        const item = srcArray[srcIndex];

        srcArray.splice(srcIndex, 1);
        containerArray.push(item);
        this.renderTimeline();
    },

    // --- PROPERTIES ---
    renderProps() {
        this.ui.propsForm.innerHTML = '';

        if (!this.selectedStepPath) {
            this.ui.propsForm.innerHTML = '<div class="empty-state">Select a step to edit</div>';
            return;
        }

        const step = this.getStepByPath(this.selectedStepPath);
        const stepDef = this.StepSchema[step.type];

        // TYPE SELECTOR
        const allTypes = Object.keys(this.StepSchema);
        const typeRow = this.createPropRow('Type', 'select', step.type, allTypes);
        typeRow.querySelector('select').addEventListener('change', (e) => {
            const target = e.target;
            if (target instanceof HTMLSelectElement) {
                this.saveState();
                const val = target.value;
                step.type = val;
                this.hydrateDefaultFields(step);
                this.renderTimeline();
                this.renderProps();
            }
        });
        this.ui.propsForm.appendChild(typeRow);

        if (step.type === 'parallel') {
            this.ui.propsForm.innerHTML += `<div style="padding:10px; color:#aaa; font-style:italic; font-size:12px;">This is a container for parallel effects.<br><br>Drag other steps into the blue bracket in the Timeline to add them here.</div>`;
        } else if (stepDef) {
            Object.keys(stepDef).forEach(key => {
                const config = stepDef[key];
                const input = this.createInputForField(step, key, config);
                this.ui.propsForm.appendChild(input);
            });
        } else {
            this.ui.propsForm.innerHTML += `<div style="padding:10px; color:#aaa">No visual editor for this type yet.</div>`;
        }

        // DELETE BUTTON
        const delBtn = document.createElement('button');
        delBtn.textContent = 'DELETE STEP';
        delBtn.className = 'secondary-btn';
        delBtn.style.marginTop = 'auto'; // push to bottom
        delBtn.style.color = '#ff6060';
        delBtn.onclick = () => {
            this.saveState();
            const parentArr = this.getParentArray(this.selectedStepPath);
            const idx = this.selectedStepPath[this.selectedStepPath.length - 1];
            parentArr.splice(idx, 1);
            this.selectedStepPath = null;
            this.renderTimeline();
            this.renderProps();
        };
        this.ui.propsForm.appendChild(delBtn);
    },

    createInputForField(stepObj, key, config) {
        let val = stepObj[key];
        if (val === undefined) val = config.default;

        let row;
        if (config.type === 'select') {
            row = this.createPropRow(key, 'select', val, config.options);
            row.querySelector('select').addEventListener('change', (e) => {
                const target = e.target;
                if (target instanceof HTMLSelectElement) {
                    this.saveState();
                    stepObj[key] = target.value;
                    this.renderTimeline();
                }
            });
        } else if (config.type === 'boolean') {
            const div = document.createElement('div');
            div.className = 'prop-row';
            div.innerHTML = `<label class="prop-label">${key}</label>`;
            const chk = document.createElement('input');
            chk.type = 'checkbox';
            chk.checked = !!stepObj[key];
            chk.addEventListener('change', (e) => {
                const target = e.target;
                if (target instanceof HTMLInputElement) {
                    this.saveState();
                    stepObj[key] = target.checked;
                    this.renderTimeline();
                }
            });
            div.appendChild(chk);
            return div;
        } else if (config.type === 'color') {
            row = this.createPropRow(key, 'color', val);
            row.querySelector('input').addEventListener('input', (e) => {
                // No saveState on input for perf, use change
            });
            row.querySelector('input').addEventListener('change', (e) => {
                const target = e.target;
                if (target instanceof HTMLInputElement) {
                    this.saveState();
                    stepObj[key] = target.value;
                }
            });
        } else {
            // Number or Text
            row = this.createPropRow(key, config.type === 'number' ? 'number' : 'text', val);
            row.querySelector('input').addEventListener('change', (e) => {
                const target = e.target;
                if (target instanceof HTMLInputElement) {
                    this.saveState();
                    const raw = target.value;
                    stepObj[key] = config.type === 'number' ? Number(raw) : raw;
                    this.renderTimeline();
                }
            });
        }
        return row;
    },

    hydrateDefaultFields(step) {
        const def = this.StepSchema[step.type];
        if (!def) return;
        Object.keys(def).forEach(key => {
            if (step[key] === undefined) {
                step[key] = def[key].default;
            }
        });
        if (step.type === 'parallel' && !step.steps) step.steps = [];
    },

    createPropRow(label, type, value, options = []) {
        const div = document.createElement('div');
        div.className = 'prop-row';

        const lbl = document.createElement('label');
        lbl.className = 'prop-label';
        lbl.textContent = label;
        div.appendChild(lbl);

        let input;
        if (type === 'select') {
            input = document.createElement('select');
            input.className = 'prop-select';
            options.forEach(opt => {
                const o = document.createElement('option');
                o.value = opt;
                o.textContent = opt;
                if (opt === value) o.selected = true;
                input.appendChild(o);
            });
        } else if (type === 'color') {
            input = document.createElement('input');
            input.type = 'color';
            input.value = value || '#000000';
            input.style.width = '60px';
            input.style.minHeight = '30px';
        } else {
            input = document.createElement('input');
            input.className = 'prop-input';
            input.type = type === 'number' ? 'number' : 'text';
            input.value = value;
        }

        div.appendChild(input);
        return div;
    },

    // --- EXPORT ---
    exportCode() {
        if (!this.currentAnimName) return;

        // Custom stringify to avoid quoted keys and make it look like clean JS
        const stringifyJS = (obj, indent = 4) => {
            const spaces = ' '.repeat(indent);
            if (Array.isArray(obj)) {
                if (obj.length === 0) return '[]';
                const items = obj.map(item => stringifyJS(item, indent + 4)).join(',\n' + spaces);
                return `[\n${spaces}${items}\n${' '.repeat(indent - 4)}]`;
            } else if (typeof obj === 'object' && obj !== null) {
                const keys = Object.keys(obj);
                if (keys.length === 0) return '{}';
                const props = keys.map(key => {
                    const value = stringifyJS(obj[key], indent + 4);
                    // Only quote keys if they have special characters
                    const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `'${key}'`;
                    return `${safeKey}: ${value}`;
                }).join(', ');

                // Keep simple steps on one line if they aren't parallel/sequence containers
                const isContainer = obj.type === 'parallel' || obj.type === 'sequence';
                if (!isContainer && props.length < 100) { // arbitrary limit to keep it readable
                    return `{ ${props} }`;
                }

                const multilineProps = keys.map(key => {
                    const value = stringifyJS(obj[key], indent + 4);
                    const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `'${key}'`;
                    return `${safeKey}: ${value}`;
                }).join(',\n' + spaces);

                return `{\n${spaces}${multilineProps}\n${' '.repeat(indent - 4)}}`;
            } else if (typeof obj === 'string') {
                return `'${obj.replace(/'/g, "\\'")}'`;
            }
            return String(obj);
        };

        const code = `AnimFramework.register('${this.currentAnimName}', ${stringifyJS(this.rootSteps)});\n`;

        // Copy to clipboard
        navigator.clipboard.writeText(code).then(() => {
            const btn = document.getElementById('btn-export');
            const originalText = btn.textContent;
            btn.textContent = 'COPIED!';
            btn.style.background = '#4CAF50';
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = '';
            }, 2000);
        }).catch(err => {
            console.error('Could not copy text: ', err);
            alert("Exported code logged to console.");
            console.log(code);
        });
    },

    // --- PRESETS ---
    showPresetMenu() {
        const names = Object.keys(this.Presets);
        const name = prompt(`Enter preset name:\n${names.join(', ')}`);
        if (!name || !this.Presets[name]) return;

        this.saveState();
        const presetSteps = JSON.parse(JSON.stringify(this.Presets[name]));
        this.rootSteps.push(...presetSteps);
        this.renderTimeline();
    },

    // --- PREVIEW ---
    async playPreview() {
        if (!this.currentAnimName) return;
        this.stopPreview();

        // Apply registry temporarily to AnimFramework
        AnimFramework.register('preview_anim', this.rootSteps);

        console.log(`Playing ${this.currentAnimName} preview...`);
        try {
            await AnimFramework.play('preview_anim', {
                isPlayerAttacker: this.isPlayerAttacker
            });
        } catch (e) {
            console.warn("Preview interrupted or failed:", e);
        }
    },

    stopPreview() {
        const scene = document.getElementById('scene');
        if (!scene) return;
        scene.style.transform = '';
        scene.className = 'scene';
        const fx = document.getElementById('fx-container');
        if (fx) fx.innerHTML = '';

        ['player-sprite', 'enemy-sprite'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.style.transform = '';
                el.style.opacity = '1';
                el.style.filter = '';
                el.className = 'sprite'; // Removed sub-back, standard orientation
            }
        });
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => Editor.init());
