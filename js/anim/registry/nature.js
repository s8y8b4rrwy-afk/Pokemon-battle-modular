/** @type {AnimationEngine} */

AnimFramework.register('earthquake', [
    { type: 'sfx', sound: 'ground' },
    {
        type: 'parallel', steps: [
            { type: 'screenFx', class: 'fx-ground', duration: 1000 },
            { type: 'tilt', angle: 5, duration: 200 },
            { type: 'spriteWave', target: 'defender', intensity: 4, duration: 1000, speed: 100 },
            { type: 'spriteWave', target: 'attacker', intensity: 2, duration: 1000, speed: 150 },
            { type: 'spriteShake', target: 'defender', duration: 1000 },
            { type: 'spriteShake', target: 'attacker', duration: 1000 }
        ]
    },
    { type: 'tilt', angle: -5, duration: 200 },
    { type: 'tilt', angle: 0, duration: 200 }
]);

AnimFramework.register('earth-power', [
    { type: 'sfx', sound: 'ground' },
    {
        type: 'formation', target: 'defender', pattern: 'rise',
        shape: 'rock', particleSize: 15, color: '#8b4513', duration: 800, stagger: 40
    },
    {
        type: 'parallel', steps: [
            { type: 'flash', color: '#b8860b', duration: 300, opacity: 0.4 },
            { type: 'spriteShake', target: 'defender', duration: 400 }
        ]
    }
]);

AnimFramework.register('sandstorm', [
    { type: 'sfx', sound: 'ground' },
    { type: 'bgColor', color: '#f4a460', duration: 1000 },
    {
        type: 'parallel', steps: [
            { type: 'wave', intensity: 2, duration: 1500, speed: 180 },
            { type: 'spriteWave', target: 'attacker', intensity: 2, duration: 1500, speed: 120 },
            { type: 'spriteWave', target: 'defender', intensity: 2, duration: 1500, speed: 120 },
            {
                type: 'stream', from: { x: -20, y: 100 }, to: { x: 340, y: 100 },
                count: 40, interval: 20, spread: 200, travelTime: 800,
                size: 3, color: '#d2b48c', outline: '#8b4513'
            }
        ]
    }
]);

AnimFramework.register('double-team', [
    { type: 'sfx', sound: 'psychic' },
    {
        type: 'parallel', steps: [
            { type: 'spriteWave', target: 'attacker', intensity: 10, duration: 1000, speed: 80 },
            {
                type: 'sequence', steps: [
                    { type: 'spriteMove', target: 'attacker', x: -40, y: 0, duration: 100 },
                    { type: 'spriteGhost', target: 'attacker', color: '#ffffff', duration: 400, hold: 50 },
                    { type: 'spriteMove', target: 'attacker', x: 80, y: 0, duration: 100 },
                    { type: 'spriteGhost', target: 'attacker', color: '#ffffff', duration: 400, hold: 50 },
                    { type: 'spriteMove', target: 'attacker', x: -40, y: 0, duration: 100 },
                    { type: 'spriteGhost', target: 'attacker', color: '#ffffff', duration: 400, hold: 50 }
                ]
            }
        ]
    }
]);

AnimFramework.register('rock-slide', [
    { type: 'sfx', sound: 'rock' },
    {
        type: 'stream', from: { x: 230, y: -20 }, to: 'defender',
        count: 10, interval: 100, spread: 30, travelTime: 400,
        size: 15, color: '#b8a038', outline: '#000000', scaleStart: 1.5, scaleEnd: 1.0
    },
    {
        type: 'parallel', steps: [
            { type: 'sfx', sound: 'damage' },
            { type: 'spriteShake', target: 'defender', duration: 400 },
            { type: 'tilt', angle: 4, duration: 200 }
        ]
    }
]);

AnimFramework.register('ancient-power', [
    { type: 'sfx', sound: 'rock' },
    {
        type: 'formation', target: 'attacker', pattern: 'rise',
        shape: 'star', particleSize: 10, color: '#b8a038', duration: 1000, stagger: 100
    },
    {
        type: 'stream', from: 'attacker', to: 'defender',
        count: 5, interval: 150, travelTime: 500,
        size: 12, color: '#b8a038', outline: '#000000'
    },
    { type: 'spriteShake', target: 'defender', duration: 400 }
]);

AnimFramework.register('stone-edge', [
    { type: 'sfx', sound: 'rock' },
    { type: 'spriteShake', target: 'defender', duration: 400 }
]);

AnimFramework.register('dig', [
    {
        type: 'callback', fn: ctx => {
            const sprite = ctx.attackerSprite;
            sprite.style.transition = 'none';
            sprite.style.transform = 'translateY(150px)'; // Underground
            sprite.style.opacity = '1';
        }
    },
    { type: 'wait', ms: 500 }, // Underground suspense
    { type: 'sfx', sound: 'ground' },
    {
        type: 'parallel', steps: [
            // Pop up
            {
                type: 'callback', fn: ctx => {
                    const sprite = ctx.attackerSprite;
                    sprite.style.transition = 'transform 0.2s ease-out';
                    sprite.style.transform = 'translateY(0)';
                }
            },
            { type: 'screenFx', class: 'fx-ground', duration: 400 },
            { type: 'spriteShake', target: 'defender', duration: 400 },
            {
                type: 'particles', position: 'defender', count: 12, spread: 30, duration: 400,
                particleStyles: { background: '#d2b48c', border: '1px solid #8b4513' }
            }
        ]
    },
    { type: 'wait', ms: 200 },
    { type: 'callback', fn: ctx => { ctx.attackerSprite.style.transition = ''; ctx.attackerSprite.style.transform = ''; } }
]);

AnimFramework.register('rock-tomb', [
    { type: 'sfx', sound: 'rock' },
    {
        type: 'parallel', steps: [
            {
                type: 'overlay', target: 'defender', shape: 'rock',
                color: '#8b4513', outline: '#000', width: 40, height: 40,
                duration: 600, animation: 'slam', count: 4, spread: 40
            },
            { type: 'spriteShake', target: 'defender', duration: 500 }
        ]
    }
]);

AnimFramework.register('power-gem', [
    { type: 'sfx', sound: 'rock' },
    { type: 'flash', color: '#ffd700', duration: 300, opacity: 0.4 },
    {
        type: 'beam', from: 'attacker', to: 'defender', duration: 400,
        width: 12, height: 6, beamStyles: {
            background: 'linear-gradient(45deg, #ffd700, #daa520, #fff)',
            borderRadius: '2px', boxShadow: '0 0 10px #ffd700'
        }
    },
    { type: 'spriteShake', target: 'defender', duration: 400 }
]);

AnimFramework.register('leech-seed', [
    { type: 'sfx', sound: 'grass' },
    {
        type: 'stream', from: 'attacker', to: 'defender',
        count: 8, interval: 40, spread: 20, travelTime: 500,
        size: 8, color: '#32cd32', outline: '#006400',
        offsetX: 0, offsetY: 0,
    },
    {
        type: 'overlay', target: 'defender', shape: 'leaf',
        color: '#32cd32', outline: '#006400', width: 24, height: 24,
        duration: 800, animation: 'contain'
    }
]);

AnimFramework.register('spikes', [
    { type: 'sfx', sound: 'ground' },
    {
        type: 'formation', target: 'defender', pattern: 'xShape', // Place around opponent's field
        shape: 'rock', particleSize: 10, color: '#d2b48c', outline: '#8b4513',
        duration: 800, stagger: 20
    }
]);

AnimFramework.register('stealth-rock', [
    { type: 'sfx', sound: 'rock' },
    {
        type: 'formation', target: 'defender', pattern: 'ring', // Levitating rocks
        shape: 'rock', particleSize: 12, color: '#a0522d', outline: '#000',
        duration: 1000, stagger: 40
    }
]);
