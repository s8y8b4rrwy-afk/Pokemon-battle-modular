/** @type {AnimationEngine} */

AnimFramework.register('metal-claw', [
    { type: 'sfx', sound: 'steel' },
    { type: 'spriteMetallic', target: 'attacker', duration: 400, color: 'silver' },
    { type: 'spriteMove', target: 'attacker', preset: 'lunge' },
    {
        type: 'parallel', steps: [
            {
                type: 'overlay', target: 'defender', shape: 'claw',
                color: '#c0c0c0', outline: '#707070', width: 35, height: 35,
                duration: 300, animation: 'strike'
            },
            { type: 'spriteShake', target: 'defender', duration: 300 }
        ]
    }
]);

AnimFramework.register('steel-wing', [
    { type: 'sfx', sound: 'steel' },
    { type: 'spriteMetallic', target: 'attacker', duration: 500, color: 'silver' },
    { type: 'spriteMove', target: 'attacker', preset: 'lunge', x: 50, y: -20 }, // Swoop
    {
        type: 'parallel', steps: [
            {
                type: 'overlay', target: 'defender', shape: 'bird', // Wing shape
                color: '#d3d3d3', outline: '#a9a9a9', width: 50, height: 30,
                duration: 300, animation: 'slam', count: 2, spread: 20
            },
            { type: 'spriteShake', target: 'defender', duration: 400 }
        ]
    }
]);

AnimFramework.register('iron-tail', [
    { type: 'sfx', sound: 'steel' },
    { type: 'spriteMetallic', target: 'attacker', duration: 600, color: 'silver' },
    { type: 'spriteMove', target: 'attacker', preset: 'slam' },
    {
        type: 'parallel', steps: [
            { type: 'screenFx', class: 'fx-steel', duration: 400 },
            {
                type: 'overlay', target: 'defender', shape: 'fist', // Impact
                color: '#dcdcdc', outline: '#696969', width: 45, height: 45,
                duration: 400, animation: 'slam'
            },
            { type: 'spriteShake', target: 'defender', duration: 500 }
        ]
    }
]);

AnimFramework.register('meteor-mash', [
    { type: 'sfx', sound: 'charge' },
    {
        type: 'parallel', steps: [
            { type: 'spriteMetallic', target: 'attacker', duration: 700, color: 'silver' },
            { type: 'flash', color: '#87cefa', duration: 400, opacity: 0.5 },
            {
                type: 'formation', target: 'attacker', pattern: 'ring',
                shape: 'star', particleSize: 12, color: '#e0ffff', outline: '#b0c4de',
                duration: 600, stagger: 30
            }
        ]
    },
    { type: 'spriteMove', target: 'attacker', preset: 'charge' },
    { type: 'sfx', sound: 'damage' },
    {
        type: 'parallel', steps: [
            { type: 'screenFx', class: 'fx-steel', duration: 500 },
            {
                type: 'overlay', target: 'defender', shape: 'fist',
                color: '#fff', outline: '#708090', width: 50, height: 50,
                duration: 400, animation: 'slam'
            },
            { type: 'spriteShake', target: 'defender', duration: 500 }
        ]
    }
]);

AnimFramework.register('flash-cannon', [
    { type: 'sfx', sound: 'charge' },
    {
        type: 'parallel', steps: [
            { type: 'spriteMetallic', target: 'attacker', duration: 600, color: 'silver' },
            { type: 'flash', color: '#c0c0c0', duration: 300, opacity: 0.4 }
        ]
    },
    { type: 'sfx', sound: 'beam' },
    {
        type: 'beam', from: 'attacker', to: 'defender', duration: 500,
        width: 15, height: 15, beamStyles: {
            background: 'linear-gradient(to right, #fff, #dcdcdc, #a9a9a9)',
            borderRadius: '4px', boxShadow: '0 0 15px #c0c0c0'
        }
    },
    {
        type: 'parallel', steps: [
            { type: 'screenFx', class: 'fx-steel', duration: 400 },
            { type: 'spriteShake', target: 'defender', duration: 400 }
        ]
    }
]);

AnimFramework.register('iron-defense', [
    { type: 'sfx', sound: 'steel' },
    { type: 'spriteMetallic', target: 'attacker', duration: 1000, color: 'silver' },
    {
        type: 'overlay', target: 'attacker', shape: 'shield',
        color: '#c0c0c0', outline: '#696969', width: 60, height: 60,
        duration: 800, animation: 'contain'
    }
]);

AnimFramework.register('harden', [
    { type: 'sfx', sound: 'steel' },
    { type: 'spriteMetallic', target: 'attacker', duration: 800, color: 'silver' },
    { type: 'spriteMove', target: 'attacker', preset: 'shake', duration: 300 }
]);

AnimFramework.register('bullet-punch', [
    { type: 'sfx', sound: 'fighting' },
    { type: 'spriteMetallic', target: 'attacker', duration: 400, color: 'silver' },
    { type: 'spriteMove', target: 'attacker', preset: 'lunge', duration: 100 }, // Fast
    {
        type: 'parallel', steps: [
            {
                type: 'overlay', target: 'defender', shape: 'fist',
                color: '#dcdcdc', outline: '#a9a9a9', width: 30, height: 30,
                duration: 250, animation: 'slam'
            },
            { type: 'spriteShake', target: 'defender', duration: 250 }
        ]
    }
]);

AnimFramework.register('metal-sound', [
    { type: 'sfx', sound: 'steel' }, // Screechy metal sound
    {
        type: 'parallel', steps: [
            { type: 'spriteMetallic', target: 'attacker', duration: 600, color: 'silver' },
            {
                type: 'formation', target: 'defender', pattern: 'ring',
                shape: 'spiral', particleSize: 12, color: '#c0c0c0', outline: '#808080',
                duration: 800, stagger: 40
            },
            { type: 'wave', intensity: 3, duration: 800, speed: 150 }
        ]
    }
]);
