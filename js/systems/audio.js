const AudioEngine = {
    ctx: null,
    noiseBuffer: null, // Cache

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            // Generate Noise Buffer ONCE
            const dur = 1.0;
            const bufSize = this.ctx.sampleRate * dur;
            const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
            const data = buf.getChannelData(0);
            for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
            this.noiseBuffer = buf;
        }
        this.resume();
    },

    async resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            await this.ctx.resume();
        }
    },

    playCry(url, rate = 1.0, isBoss = false) {
        if (!url) return;
        this.init();

        const finalRate = isBoss ? rate * 0.85 : rate; // Pitch down bosses by default
        const vol = 0.4;

        const playInstance = (v, delay) => {
            const a = new Audio(url);
            a.volume = v;
            a.preservesPitch = false;
            a.playbackRate = finalRate;
            if (delay) setTimeout(() => a.play().catch(() => { }), delay);
            else a.play().catch(() => { });
        };

        // Primary Cry
        playInstance(vol, 0);

        // Boss Echo Effect (Staggered second play for that "Legendary" feel)
        if (isBoss) {
            playInstance(vol * 0.3, 150); // Small delay, lower volume
        }
    },

    playTone(freq, type, dur, vol, delay) {
        const t = this.ctx.currentTime + delay;
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = type; o.frequency.value = freq;
        o.connect(g); g.connect(this.ctx.destination);
        g.gain.setValueAtTime(vol, t);
        g.gain.linearRampToValueAtTime(0, t + dur);
        o.start(t); o.stop(t + dur);
    },

    playNoise(dur) {
        const t = this.ctx.currentTime;
        const src = this.ctx.createBufferSource();
        src.buffer = this.noiseBuffer; // Reuse cached buffer
        // Loop it if duration is longer than 1s (unlikely but safe)
        src.loop = true;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.linearRampToValueAtTime(0, t + dur);

        src.connect(gain); gain.connect(this.ctx.destination);
        src.start(t); src.stop(t + dur);
    },

    playSfx(key) {
        this.init(); const now = this.ctx.currentTime;

        if (SFX_LIB[key]) {
            const s = SFX_LIB[key];
            this.playTone(s.freq, s.type, s.dur, s.vol, 0);
            return;
        }

        const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain();
        osc.connect(gain); gain.connect(this.ctx.destination);

        switch (key) {
            case 'run':
                const rSrc = this.ctx.createBufferSource(); rSrc.buffer = this.noiseBuffer; rSrc.loop = true;
                const rFilter = this.ctx.createBiquadFilter(); rFilter.type = "lowpass";
                rFilter.frequency.setValueAtTime(800, now); rFilter.frequency.linearRampToValueAtTime(100, now + 0.3);
                const rGain = this.ctx.createGain(); rGain.gain.setValueAtTime(0.2, now); rGain.gain.linearRampToValueAtTime(0, now + 0.3);
                rSrc.connect(rFilter); rFilter.connect(rGain); rGain.connect(this.ctx.destination);
                rSrc.start(now); rSrc.stop(now + 0.3);
                break;

            case 'normal':
                osc.type = 'square'; osc.frequency.setValueAtTime(300, now); osc.frequency.linearRampToValueAtTime(50, now + 0.1);
                gain.gain.setValueAtTime(0.1, now); gain.gain.linearRampToValueAtTime(0, now + 0.1);
                osc.start(now); osc.stop(now + 0.1);
                break;

            case 'fire':
                osc.type = 'sawtooth'; osc.frequency.setValueAtTime(400, now); osc.frequency.linearRampToValueAtTime(100, now + 0.3);
                gain.gain.setValueAtTime(0.1, now); gain.gain.linearRampToValueAtTime(0, now + 0.3);
                osc.start(now); osc.stop(now + 0.3);
                break;

            case 'water':
                [0, 0.05, 0.1, 0.15].forEach((d) => this.playTone(200 + Math.random() * 300, 'sine', 0.1, 0.08, d));
                break;

            case 'grass':
                const gSrc = this.ctx.createBufferSource(); gSrc.buffer = this.noiseBuffer;
                const gFilter = this.ctx.createBiquadFilter(); gFilter.type = "highpass"; gFilter.frequency.setValueAtTime(2000, now);
                const gGain = this.ctx.createGain(); gGain.gain.setValueAtTime(0.1, now); gGain.gain.linearRampToValueAtTime(0, now + 0.2);
                gSrc.connect(gFilter); gFilter.connect(gGain); gGain.connect(this.ctx.destination);
                gSrc.start(now); gSrc.stop(now + 0.2);
                break;

            case 'electric':
                osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, now); osc.frequency.linearRampToValueAtTime(600, now + 0.1); osc.frequency.linearRampToValueAtTime(100, now + 0.3);
                gain.gain.setValueAtTime(0.15, now); gain.gain.linearRampToValueAtTime(0, now + 0.3);
                osc.start(now); osc.stop(now + 0.3);
                break;

            case 'ice':
                this.playTone(1200, 'sine', 0.05, 0.1, 0); this.playTone(1800, 'sine', 0.05, 0.1, 0.05); this.playTone(1400, 'sine', 0.05, 0.1, 0.1);
                break;

            case 'fighting':
                osc.type = 'square'; osc.frequency.setValueAtTime(150, now); osc.frequency.exponentialRampToValueAtTime(50, now + 0.15);
                gain.gain.setValueAtTime(0.2, now); gain.gain.linearRampToValueAtTime(0, now + 0.15);
                osc.start(now); osc.stop(now + 0.15);
                break;

            case 'poison':
                osc.type = 'sine'; osc.frequency.setValueAtTime(80, now); osc.frequency.linearRampToValueAtTime(200, now + 0.1); osc.frequency.linearRampToValueAtTime(50, now + 0.3);
                gain.gain.setValueAtTime(0.2, now); gain.gain.linearRampToValueAtTime(0, now + 0.3);
                osc.start(now); osc.stop(now + 0.3);
                break;

            case 'ground':
                const grSrc = this.ctx.createBufferSource(); grSrc.buffer = this.noiseBuffer;
                const grFilter = this.ctx.createBiquadFilter(); grFilter.type = "lowpass"; grFilter.frequency.setValueAtTime(120, now);
                const grGain = this.ctx.createGain(); grGain.gain.setValueAtTime(0.3, now); grGain.gain.linearRampToValueAtTime(0, now + 0.4);
                grSrc.connect(grFilter); grFilter.connect(grGain); grGain.connect(this.ctx.destination);
                grSrc.start(now); grSrc.stop(now + 0.4);
                break;

            case 'flying':
                const flSrc = this.ctx.createBufferSource(); flSrc.buffer = this.noiseBuffer;
                const flFilter = this.ctx.createBiquadFilter(); flFilter.type = "bandpass"; flFilter.frequency.setValueAtTime(1000, now); flFilter.frequency.linearRampToValueAtTime(400, now + 0.2);
                const flGain = this.ctx.createGain(); flGain.gain.setValueAtTime(0.15, now); flGain.gain.linearRampToValueAtTime(0, now + 0.2);
                flSrc.connect(flFilter); flFilter.connect(flGain); flGain.connect(this.ctx.destination);
                flSrc.start(now); flSrc.stop(now + 0.2);
                break;

            case 'psychic':
                osc.type = 'sine'; osc.frequency.setValueAtTime(1200, now); osc.frequency.linearRampToValueAtTime(600, now + 0.5);
                gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
                osc.start(now); osc.stop(now + 0.5);
                break;

            case 'bug':
                osc.type = 'sawtooth'; osc.frequency.setValueAtTime(250, now);
                [0, 0.05, 0.1, 0.15].forEach(d => { gain.gain.setValueAtTime(0.1, now + d); gain.gain.setValueAtTime(0, now + d + 0.03); });
                osc.start(now); osc.stop(now + 0.2);
                break;

            case 'rock':
                this.playTone(180, 'square', 0.2, 0.2, 0); this.playNoise(0.1);
                break;

            case 'ghost':
                osc.type = 'sine'; osc.frequency.setValueAtTime(400, now); osc.frequency.linearRampToValueAtTime(100, now + 0.6);
                gain.gain.setValueAtTime(0.1, now); gain.gain.linearRampToValueAtTime(0, now + 0.6);
                osc.start(now); osc.stop(now + 0.6);
                break;

            case 'dragon':
                osc.type = 'sawtooth'; osc.frequency.setValueAtTime(80, now); osc.frequency.linearRampToValueAtTime(200, now + 0.4); osc.frequency.linearRampToValueAtTime(50, now + 0.8);
                gain.gain.setValueAtTime(0.2, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
                osc.start(now); osc.stop(now + 0.8);
                break;

            case 'steel':
                this.playTone(3000, 'sine', 0.1, 0.15, 0); this.playTone(2000, 'sine', 0.2, 0.1, 0.05);
                break;

            case 'dark':
                osc.type = 'sine'; osc.frequency.setValueAtTime(120, now); osc.frequency.linearRampToValueAtTime(60, now + 0.5);
                gain.gain.setValueAtTime(0.15, now); gain.gain.linearRampToValueAtTime(0, now + 0.5);
                osc.start(now); osc.stop(now + 0.5);
                break;

            case 'sleep':
                osc.type = 'sine'; osc.frequency.setValueAtTime(150, now); osc.frequency.linearRampToValueAtTime(100, now + 0.4);
                gain.gain.setValueAtTime(0.1, now); gain.gain.linearRampToValueAtTime(0, now + 0.4);
                osc.start(now); osc.stop(now + 0.4);
                break;

            case 'burn': this.playSfx('fire'); break;
            case 'ball': this.playNoise(0.3); break;
            case 'rumble': this.playNoise(0.5); break;
            case 'catch_success': this.playNoise(0.2); break;
            case 'shiny': this.playTone(SFX_LIB.shiny_1, 'sine', 0.1, 0.1, 0); this.playTone(SFX_LIB.shiny_2, 'sine', 0.2, 0.1, 0.1); break;
            case 'heal': [0, 0.1, 0.2, 0.3].forEach((d, i) => this.playTone(SFX_LIB.heal_base * [1, 1.25, 1.5, 2][i], 'sine', 0.1 + (i * 0.05), 0.1, d)); break;
            case 'levelup': [0, 0.15, 0.3, 0.45].forEach((d, i) => this.playTone(SFX_LIB.levelup_base * [1, 1.25, 1.5, 2][i], 'square', 0.1, 0.1, d)); break;
            case 'funfair': this.playTone(523.25, 'square', 0.1, 0.1, 0); this.playTone(659.25, 'square', 0.1, 0.1, 0.1); this.playTone(783.99, 'square', 0.1, 0.1, 0.2); this.playTone(1046.50, 'square', 0.2, 0.1, 0.3); break;
            case 'error': osc.type = 'sawtooth'; osc.frequency.setValueAtTime(100, now); gain.gain.setValueAtTime(0.3, now); gain.gain.linearRampToValueAtTime(0, now + 0.2); osc.start(now); osc.stop(now + 0.2); break;
            case 'crit': osc.type = 'square'; osc.frequency.setValueAtTime(80, now); gain.gain.setValueAtTime(0.5, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3); osc.start(now); osc.stop(now + 0.3); break;
            case 'miss': osc.type = 'square'; osc.frequency.setValueAtTime(500, now); gain.gain.setValueAtTime(0.2, now); gain.gain.linearRampToValueAtTime(0, now + 0.1); osc.start(now); osc.stop(now + 0.1); break;
            case 'damage': osc.type = 'square'; osc.frequency.setValueAtTime(200, now); osc.frequency.exponentialRampToValueAtTime(50, now + 0.2); gain.gain.setValueAtTime(0.2, now); gain.gain.linearRampToValueAtTime(0, now + 0.2); osc.start(now); osc.stop(now + 0.2); break;
            case 'super_effective':
                // Two layered oscillators for that authentic extra-heavy "crunch"
                const o2 = this.ctx.createOscillator(); const g2 = this.ctx.createGain();
                o2.connect(g2); g2.connect(this.ctx.destination);

                // Primary deep hit
                osc.type = 'square'; osc.frequency.setValueAtTime(120, now); osc.frequency.exponentialRampToValueAtTime(40, now + 0.4);
                gain.gain.setValueAtTime(0.4, now); gain.gain.linearRampToValueAtTime(0, now + 0.4);

                // Staggered secondary hit for "crunch" texture
                o2.type = 'square'; o2.frequency.setValueAtTime(100, now + 0.05); o2.frequency.exponentialRampToValueAtTime(30, now + 0.45);
                g2.gain.setValueAtTime(0, now); g2.gain.setValueAtTime(0.3, now + 0.05); g2.gain.linearRampToValueAtTime(0, now + 0.45);

                osc.start(now); osc.stop(now + 0.4);
                o2.start(now + 0.05); o2.stop(now + 0.45);
                break;
            case 'not_very_effective':
                // Dull "Thud" - Short burst of low-passed noise
                const nSrc = this.ctx.createBufferSource(); nSrc.buffer = this.noiseBuffer;
                const nFilter = this.ctx.createBiquadFilter(); nFilter.type = "lowpass";
                // Lower frequency for a deeper thud
                nFilter.frequency.setValueAtTime(180, now);
                const nGain = this.ctx.createGain();
                // Moderate gain to avoid sounding "sharp" like a crit
                nGain.gain.setValueAtTime(6.5, now);
                nGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                nSrc.connect(nFilter); nFilter.connect(nGain); nGain.connect(this.ctx.destination);
                nSrc.start(now); nSrc.stop(now + 0.2);
                break;
            case 'throw': osc.type = 'sawtooth'; osc.frequency.setValueAtTime(300, now); osc.frequency.linearRampToValueAtTime(100, now + 0.3); gain.gain.setValueAtTime(0.1, now); gain.gain.linearRampToValueAtTime(0, now + 0.3); osc.start(now); osc.stop(now + 0.3); break;
            case 'catch_click': osc.type = 'square'; osc.frequency.setValueAtTime(800, now); gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05); osc.start(now); osc.stop(now + 0.05); break;

            case 'stat_up':
                [0, 0.05, 0.1, 0.15, 0.2].forEach((d, i) => this.playTone(SFX_LIB.stat_up_base * [1, 1.25, 1.5, 1.75, 2][i], 'triangle', 0.1, 0.1, d));
                break;
            case 'stat_down':
                [0, 0.05, 0.1, 0.15, 0.2].forEach((d, i) => this.playTone(SFX_LIB.stat_down_base * [1, 0.8, 0.7, 0.6, 0.5][i], 'triangle', 0.1, 0.1, d));
                break;

            case 'swoosh':
                const bSrc = this.ctx.createBufferSource(); bSrc.buffer = this.noiseBuffer; bSrc.loop = true;
                const bFilter = this.ctx.createBiquadFilter(); bFilter.type = "lowpass"; bFilter.frequency.setValueAtTime(800, now); bFilter.frequency.linearRampToValueAtTime(100, now + 0.2);
                const bGain = this.ctx.createGain(); bGain.gain.setValueAtTime(0.1, now); bGain.gain.linearRampToValueAtTime(0, now + 0.2);
                bSrc.connect(bFilter); bFilter.connect(bGain); bGain.connect(this.ctx.destination);
                bSrc.start(now); bSrc.stop(now + 0.2);
                break;

            case 'explosion':
                const exSrc = this.ctx.createBufferSource(); exSrc.buffer = this.noiseBuffer; exSrc.loop = true;
                const exFilter = this.ctx.createBiquadFilter(); exFilter.type = "lowpass"; exFilter.frequency.setValueAtTime(300, now); exFilter.frequency.exponentialRampToValueAtTime(50, now + 1.2);
                const exGain = this.ctx.createGain(); exGain.gain.setValueAtTime(0.6, now); exGain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);
                exSrc.connect(exFilter); exFilter.connect(exGain); exGain.connect(this.ctx.destination);
                exSrc.start(now); exSrc.stop(now + 1.3);
                break;

            case 'faint':
                // "Laser-like" drop sound
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(1200, now);
                osc.frequency.exponentialRampToValueAtTime(60, now + 0.6);
                gain.gain.setValueAtTime(0.15, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.6);
                osc.start(now);
                osc.stop(now + 0.6);
                break;

            default: osc.type = 'square'; osc.frequency.setValueAtTime(150, now); osc.frequency.exponentialRampToValueAtTime(40, now + 0.1); gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1); osc.start(now); osc.stop(now + 0.1); break;
        }
    },
};
