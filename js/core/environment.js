const EnvironmentManager = {
    weather: { type: 'none', turns: 0 },
    sideConditions: { player: { spikes: 0 }, enemy: { spikes: 0 } },

    reset() {
        this.weather = { type: 'none', turns: 0 };
        this.sideConditions = { player: { spikes: 0 }, enemy: { spikes: 0 } };
        const scene = document.getElementById('scene');
        if (scene) scene.style.backgroundColor = "";
    },

    async setWeather(type, turns = 5) {
        this.weather = { type: type, turns: turns };
        const overlay = document.getElementById('scene');
        if (WEATHER_FX[type]) {
            if (overlay) overlay.style.backgroundColor = WEATHER_FX[type].color;
            // Await the text so the player sees "It started to rain!" before the turn ends
            await UI.typeText(WEATHER_FX[type].msg);
        } else {
            if (overlay) overlay.style.backgroundColor = "";
            await UI.typeText("The skies cleared.");
        }
    },

    async processEndTurnWeather(battle, mon) {
        if (mon.currentHp <= 0) return;

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
                await battle.applyDamage(mon, dmg, 'normal');
            }
        }
    },

    async tickWeather() {
        if (this.weather.type !== 'none') {
            this.weather.turns--;
            if (this.weather.turns <= 0) {
                await this.setWeather('none');
            } else {
                const fx = WEATHER_FX[this.weather.type];
                if (fx && fx.continue) await UI.typeText(fx.continue);
            }
        }
    },

    async processEntryHazards(battle, mon, isPlayer) {
        const side = isPlayer ? 'player' : 'enemy';
        const spikes = this.sideConditions[side].spikes || 0;

        if (spikes > 0 && !mon.types.includes('flying')) {
            await wait(400);
            await UI.typeText(`${mon.name} is hurt\nby the spikes!`);
            const damage = Math.floor(mon.maxHp * (spikes === 1 ? 0.125 : spikes === 2 ? 0.1875 : 0.25));
            await battle.applyDamage(mon, damage, 'normal');
        }
    }
};
