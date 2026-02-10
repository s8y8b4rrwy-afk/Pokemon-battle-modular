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

    playCry(url) {
        if (!url) return;
        this.init();
        const a = new Audio(url); a.volume = 0.4; a.play().catch(() => { });
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
                // Reuse Noise Buffer for sweep
                const rSrc = this.ctx.createBufferSource();
                rSrc.buffer = this.noiseBuffer; rSrc.loop = true;
                const rFilter = this.ctx.createBiquadFilter(); rFilter.type = "lowpass";
                rFilter.frequency.setValueAtTime(800, now);
                rFilter.frequency.linearRampToValueAtTime(100, now + 0.3);
                const rGain = this.ctx.createGain();
                rGain.gain.setValueAtTime(0.2, now); rGain.gain.linearRampToValueAtTime(0, now + 0.3);
                rSrc.connect(rFilter); rFilter.connect(rGain); rGain.connect(this.ctx.destination);
                rSrc.start(now); rSrc.stop(now + 0.3);
                break;

            case 'electric':
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(150, now);
                osc.frequency.linearRampToValueAtTime(600, now + 0.1);
                osc.frequency.linearRampToValueAtTime(100, now + 0.3);
                gain.gain.setValueAtTime(0.15, now); gain.gain.linearRampToValueAtTime(0, now + 0.3);
                osc.start(now); osc.stop(now + 0.3);
                break;

            case 'ball': this.playNoise(0.3); break;
            case 'rumble': this.playNoise(0.5); break;
            case 'catch_success': this.playNoise(0.2); break;

            case 'shiny':
                this.playTone(SFX_LIB.shiny_1, 'sine', 0.1, 0.1, 0);
                this.playTone(SFX_LIB.shiny_2, 'sine', 0.2, 0.1, 0.1);
                break;

            case 'heal':
                [0, 0.1, 0.2, 0.3].forEach((d, i) => this.playTone(SFX_LIB.heal_base * [1, 1.25, 1.5, 2][i], 'sine', 0.1 + (i * 0.05), 0.1, d));
                break;

            case 'levelup':
                [0, 0.15, 0.3, 0.45].forEach((d, i) => this.playTone(SFX_LIB.levelup_base * [1, 1.25, 1.5, 2][i], 'square', 0.1, 0.1, d));
                break;

            case 'funfair':
                this.playTone(523.25, 'square', 0.1, 0.1, 0); this.playTone(659.25, 'square', 0.1, 0.1, 0.1); this.playTone(783.99, 'square', 0.1, 0.1, 0.2); this.playTone(1046.50, 'square', 0.2, 0.1, 0.3);
                break;

            case 'error': osc.type = 'sawtooth'; osc.frequency.setValueAtTime(100, now); gain.gain.setValueAtTime(0.3, now); gain.gain.linearRampToValueAtTime(0, now + 0.2); osc.start(now); osc.stop(now + 0.2); break;
            case 'crit': osc.type = 'square'; osc.frequency.setValueAtTime(80, now); gain.gain.setValueAtTime(0.5, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3); osc.start(now); osc.stop(now + 0.3); break;
            case 'miss': osc.type = 'square'; osc.frequency.setValueAtTime(500, now); gain.gain.setValueAtTime(0.2, now); gain.gain.linearRampToValueAtTime(0, now + 0.1); osc.start(now); osc.stop(now + 0.1); break;
            case 'damage': osc.type = 'square'; osc.frequency.setValueAtTime(200, now); osc.frequency.exponentialRampToValueAtTime(50, now + 0.2); gain.gain.setValueAtTime(0.2, now); gain.gain.linearRampToValueAtTime(0, now + 0.2); osc.start(now); osc.stop(now + 0.2); break;
            case 'throw': osc.type = 'sawtooth'; osc.frequency.setValueAtTime(300, now); osc.frequency.linearRampToValueAtTime(100, now + 0.3); gain.gain.setValueAtTime(0.1, now); gain.gain.linearRampToValueAtTime(0, now + 0.3); osc.start(now); osc.stop(now + 0.3); break;
            case 'catch_click': osc.type = 'square'; osc.frequency.setValueAtTime(800, now); gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05); osc.start(now); osc.stop(now + 0.05); break;

            case 'swoosh':
                const bSrc = this.ctx.createBufferSource(); bSrc.buffer = this.noiseBuffer; bSrc.loop = true;
                const bFilter = this.ctx.createBiquadFilter(); bFilter.type = "lowpass";
                bFilter.frequency.setValueAtTime(800, now); bFilter.frequency.linearRampToValueAtTime(100, now + 0.2);
                const bGain = this.ctx.createGain(); bGain.gain.setValueAtTime(0.1, now); bGain.gain.linearRampToValueAtTime(0, now + 0.2);
                bSrc.connect(bFilter); bFilter.connect(bGain); bGain.connect(this.ctx.destination);
                bSrc.start(now); bSrc.stop(now + 0.2);
                break;

            case 'explosion':
                // Deep, long rumble
                const exSrc = this.ctx.createBufferSource(); exSrc.buffer = this.noiseBuffer; exSrc.loop = true;
                const exFilter = this.ctx.createBiquadFilter(); exFilter.type = "lowpass";
                exFilter.frequency.setValueAtTime(300, now); // Low rumble start
                exFilter.frequency.exponentialRampToValueAtTime(50, now + 1.2); // Fade to deep bass
                const exGain = this.ctx.createGain();
                exGain.gain.setValueAtTime(0.6, now); // Loud!
                exGain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);
                exSrc.connect(exFilter); exFilter.connect(exGain); exGain.connect(this.ctx.destination);
                exSrc.start(now); exSrc.stop(now + 1.3);
                break;

            default: osc.type = 'square'; osc.frequency.setValueAtTime(150, now); osc.frequency.exponentialRampToValueAtTime(40, now + 0.1); gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1); osc.start(now); osc.stop(now + 0.1); break;
        }
    },
};
