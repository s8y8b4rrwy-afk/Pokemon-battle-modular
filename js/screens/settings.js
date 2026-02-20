const SettingsScreen = {
    id: 'SETTINGS',

    options: [
        { id: 'lcd', name: 'RETRO FILTER', type: 'toggle', getValue: () => Input.lcdEnabled, toggle: () => Game.toggleLcd() },
        { id: 'motion', name: 'RETRO MOTION', type: 'toggle', getValue: () => document.body.classList.contains('retro-motion'), toggle: () => Game.toggleRetroMotion() },
        {
            id: 'clearcache', name: 'CLEAR API CACHE', type: 'action', action: async () => {
                if (confirm('Clear all cached Pokemon data?')) {
                    await APICache.clear();
                    alert('Cache Cleared!');
                }
            }
        },
        { id: 'back', name: 'BACK', type: 'action', action: () => ScreenManager.pop() }
    ],

    onEnter(params) {
        this.render();
        Input.setMode('SETTINGS');
    },

    onExit() {
        // Handled by ScreenManager
    },

    onResume() {
        this.render();
        Input.setMode('SETTINGS', Input.focus);
    },

    handleInput(key) {
        const len = this.options.length;

        if (key === 'ArrowUp') {
            Input.focus = (Input.focus - 1 + len) % len;
            AudioEngine.playSfx('select');
            return true;
        }
        if (key === 'ArrowDown') {
            Input.focus = (Input.focus + 1) % len;
            AudioEngine.playSfx('select');
            return true;
        }

        if (['z', 'Z', 'Enter', 'ArrowRight', 'ArrowLeft'].includes(key)) {
            const opt = this.options[Input.focus];
            if (opt.type === 'toggle') {
                opt.toggle();
                AudioEngine.playSfx('select');
                this.updateOptionVisual(Input.focus);
            } else if (opt.type === 'action' && ['z', 'Z', 'Enter'].includes(key)) {
                AudioEngine.playSfx('select');
                opt.action();
            }
            return true;
        }

        if (key === 'x' || key === 'X' || key === 'Escape') {
            AudioEngine.playSfx('select');
            ScreenManager.pop();
            return true;
        }

        return false;
    },

    render() {
        const container = document.getElementById('settings-list');
        container.innerHTML = '';

        this.options.forEach((opt, idx) => {
            const el = document.createElement('div');
            el.className = 'settings-item';
            el.id = `settings-opt-${idx}`;

            el.onmouseover = () => {
                Input.focus = idx;
                Input.updateVisuals();
            };

            el.onclick = () => {
                const opt = this.options[idx];
                if (opt.type === 'toggle') {
                    opt.toggle();
                    AudioEngine.playSfx('select');
                    this.updateOptionVisual(idx);
                } else if (opt.type === 'action') {
                    AudioEngine.playSfx('select');
                    opt.action();
                }
            };

            const nameSpan = document.createElement('span');
            nameSpan.innerText = opt.name;
            el.appendChild(nameSpan);

            if (opt.type === 'toggle') {
                const valSpan = document.createElement('span');
                valSpan.className = 'settings-val';
                el.appendChild(valSpan);
                this.updateOptionVisual(idx, el);
            }

            container.appendChild(el);
        });
    },

    updateOptionVisual(index, element = null) {
        const el = element || document.getElementById(`settings-opt-${index}`);
        if (!el) return;

        const opt = this.options[index];
        if (opt.type === 'toggle') {
            const valSpan = el.querySelector('.settings-val');
            const val = opt.getValue();
            valSpan.innerText = val ? ' [ON]' : '[OFF]';
            valSpan.style.color = val ? '#d8b030' : '#888';
        }
    }
};
