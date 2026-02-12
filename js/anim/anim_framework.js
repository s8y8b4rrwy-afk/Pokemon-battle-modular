// ============================================================
// ANIMATION FRAMEWORK — Data-Driven Battle Animation Engine
// ============================================================
// Register animations as sequences of declarative steps.
// Each step is { type, ...params }. Steps run sequentially
// unless grouped with 'parallel'.
//
// Step Types:
//   sfx        — Play a sound effect     { sound }
//   cry        — Play a Pokémon cry      { cry }
//   wait       — Pause                   { ms }
//   screenFx   — Flash the scene         { class, duration }
//   spriteShake— Shake/flicker target    { target, duration, flipped? }
//   cssClass   — Toggle CSS class        { el/selector, class, duration }
//   move       — Translate an element    { el/selector, x, y, duration, easing }
//   spawn      — Create a temp DOM el    { parentSelector, className, styles, duration }
//   particles  — Burst of particles      { x, y, count, className, spread, duration }
//   beam       — Projectile from→to      { fromX, fromY, toX, toY, className, duration, width, height }
//   stream     — Continuous particle flow { from, to, count, interval, spread, travelTime, size, color, glow }
//   volley     — Rapid-fire projectiles   { from, to, count, interval, projectile: { width, height, styles } }
//   flash      — Full-scene flash        { color, duration, opacity }
//   callback   — Run arbitrary async fn  { fn }
//   parallel   — Run steps concurrently  { steps: [...] }
//
// Usage:
//   AnimFramework.register('flamethrower', [
//       { type: 'sfx', sound: 'fire' },
//       { type: 'screenFx', class: 'fx-fire', duration: 500 },
//       { type: 'spriteShake', target: 'defender', duration: 400 }
//   ]);
//
//   await AnimFramework.play('flamethrower', { attacker, defender, isPlayerAttacker });
// ============================================================

const AnimFramework = {

    // --- REGISTRY ---
    _registry: {},

    /**
     * Register a named animation sequence.
     * @param {string} name — Unique identifier (e.g. 'flamethrower', 'thunderbolt')
     * @param {Array} steps — Array of step objects
     */
    register(name, steps) {
        if (!Array.isArray(steps)) {
            console.error(`[AnimFramework] Steps must be an array for "${name}"`);
            return;
        }
        this._registry[name.toLowerCase()] = steps;
    },

    /**
     * Check if an animation is registered.
     * @param {string} name
     * @returns {boolean}
     */
    has(name) {
        return !!this._registry[name.toLowerCase()];
    },

    /**
     * List all registered animation names.
     * @returns {string[]}
     */
    list() {
        return Object.keys(this._registry);
    },

    /**
     * Play a registered animation by name.
     * @param {string} name — The animation identifier
     * @param {Object} ctx  — Context: { attacker, defender, isPlayerAttacker, scene?, fxContainer? }
     */
    async play(name, ctx = {}) {
        const steps = this._registry[name.toLowerCase()];
        if (!steps) {
            console.warn(`[AnimFramework] Animation "${name}" not found. Skipping.`);
            return;
        }

        // Build a rich context with resolved DOM elements
        const resolvedCtx = this._resolveContext(ctx);

        for (const step of steps) {
            await this._executeStep(step, resolvedCtx);
        }
    },

    // --- CONTEXT RESOLUTION ---
    _resolveContext(ctx) {
        const scene = ctx.scene || document.getElementById('scene');
        const fxContainer = ctx.fxContainer || document.getElementById('fx-container');

        const isPlayerAttacker = ctx.isPlayerAttacker ?? true;

        // Attacker/Defender sprite elements
        const attackerSprite = isPlayerAttacker
            ? document.getElementById('player-sprite')
            : document.getElementById('enemy-sprite');
        const defenderSprite = isPlayerAttacker
            ? document.getElementById('enemy-sprite')
            : document.getElementById('player-sprite');

        // Canonical positions (center of each sprite area)
        const attackerPos = isPlayerAttacker ? { x: 60, y: 150 } : { x: 230, y: 70 };
        const defenderPos = isPlayerAttacker ? { x: 230, y: 70 } : { x: 60, y: 150 };

        return {
            ...ctx,
            scene,
            fxContainer,
            attackerSprite,
            defenderSprite,
            attackerPos,
            defenderPos,
            isPlayerAttacker
        };
    },

    // --- STEP EXECUTOR ---
    async _executeStep(step, ctx) {
        switch (step.type) {

            case 'sfx':
                AudioEngine.playSfx(step.sound);
                if (step.wait) await wait(step.wait);
                break;

            case 'cry':
                if (step.cry) AudioEngine.playCry(step.cry);
                else if (step.target === 'attacker' && ctx.attacker?.cry) AudioEngine.playCry(ctx.attacker.cry);
                else if (step.target === 'defender' && ctx.defender?.cry) AudioEngine.playCry(ctx.defender.cry);
                if (step.wait) await wait(step.wait);
                break;

            case 'wait':
                await wait(step.ms || 200);
                break;

            case 'screenFx':
                this._doScreenFx(step, ctx);
                await wait(step.duration || 500);
                break;

            case 'spriteShake':
                await this._doSpriteShake(step, ctx);
                break;

            case 'cssClass': {
                const el = this._resolveElement(step.el || step.selector, ctx);
                if (el) {
                    el.classList.remove(step.class);
                    UI.forceReflow(el);
                    el.classList.add(step.class);
                    await wait(step.duration || 400);
                    if (!step.persist) el.classList.remove(step.class);
                }
                break;
            }

            case 'move':
                await this._doMove(step, ctx);
                break;

            case 'spawn':
                await this._doSpawn(step, ctx);
                break;

            case 'particles':
                this._doParticles(step, ctx);
                await wait(step.duration || 600);
                break;

            case 'beam':
                await this._doBeam(step, ctx);
                break;

            case 'stream':
                await this._doStream(step, ctx);
                break;

            case 'volley':
                await this._doVolley(step, ctx);
                break;

            case 'flash':
                await this._doFlash(step, ctx);
                break;

            case 'callback':
                if (typeof step.fn === 'function') await step.fn(ctx);
                break;

            case 'parallel':
                if (Array.isArray(step.steps)) {
                    await Promise.all(step.steps.map(s => this._executeStep(s, ctx)));
                }
                break;

            default:
                console.warn(`[AnimFramework] Unknown step type: "${step.type}"`);
        }
    },

    // --- ELEMENT RESOLUTION ---
    // Accepts: 'attacker', 'defender', 'scene', 'fxContainer', CSS selector, or direct element
    _resolveElement(ref, ctx) {
        if (!ref) return null;
        if (ref instanceof HTMLElement) return ref;
        if (ref === 'attacker') return ctx.attackerSprite;
        if (ref === 'defender') return ctx.defenderSprite;
        if (ref === 'scene') return ctx.scene;
        if (ref === 'fxContainer') return ctx.fxContainer;
        return document.querySelector(ref);
    },

    // Resolve a position that can be 'attacker', 'defender', or {x, y}
    _resolvePosition(pos, ctx) {
        if (!pos) return { x: 0, y: 0 };
        if (pos === 'attacker') return ctx.attackerPos;
        if (pos === 'defender') return ctx.defenderPos;
        return { x: pos.x || 0, y: pos.y || 0 };
    },

    // --- SCREEN FX ---
    _doScreenFx(step, ctx) {
        const scene = ctx.scene;
        scene.classList.remove(step.class);
        UI.forceReflow(scene);
        scene.classList.add(step.class);
        setTimeout(() => scene.classList.remove(step.class), step.duration || 500);
    },

    // --- SPRITE SHAKE ---
    async _doSpriteShake(step, ctx) {
        const sprite = (step.target === 'attacker') ? ctx.attackerSprite : ctx.defenderSprite;
        if (!sprite) return;

        const isInvisible = step.skipIfInvisible && sprite.style.opacity === '0';
        if (isInvisible) {
            await wait(step.duration || 400);
            return;
        }

        const isFlipped = sprite.classList.contains('sub-back');
        const hitClass = (step.flipped || isFlipped) ? 'anim-hit-flipped' : 'anim-hit';

        sprite.classList.remove('anim-hit', 'anim-hit-flipped');
        UI.forceReflow(sprite);
        sprite.classList.add(hitClass);

        await wait(step.duration || 400);
        sprite.classList.remove(hitClass);
    },

    // --- MOVE (Translate) ---
    async _doMove(step, ctx) {
        const el = this._resolveElement(step.el || step.selector, ctx);
        if (!el) return;

        const duration = step.duration || 300;
        const easing = step.easing || 'ease-out';

        el.style.transition = `transform ${duration}ms ${easing}`;
        el.style.transform = `translate(${step.x || 0}px, ${step.y || 0}px)`;

        await wait(duration);

        if (step.reset) {
            el.style.transform = '';
            el.style.transition = '';
        }
    },

    // --- SPAWN (Temporary DOM element) ---
    async _doSpawn(step, ctx) {
        const parent = this._resolveElement(step.parent || 'fxContainer', ctx);
        if (!parent) return;

        const el = document.createElement(step.tag || 'div');
        el.className = step.className || '';

        // Apply inline styles
        if (step.styles) {
            Object.assign(el.style, step.styles);
        }

        // Apply text content
        if (step.text) el.textContent = step.text;

        parent.appendChild(el);

        const duration = step.duration || 600;
        setTimeout(() => el.remove(), duration);

        await wait(step.waitAfter || duration);
    },

    // --- PARTICLES ---
    _doParticles(step, ctx) {
        const parent = this._resolveElement(step.parent || 'scene', ctx);
        if (!parent) return;

        const pos = this._resolvePosition(step.position || step, ctx);
        const count = step.count || 8;
        const spread = step.spread || 40;
        const duration = step.duration || 600;
        const className = step.className || 'smoke-particle';

        for (let i = 0; i < count; i++) {
            const p = document.createElement('div');
            p.className = className;

            const angle = (i / count) * 2 * Math.PI;
            const velocity = spread + Math.random() * (spread * 0.4);
            const tx = Math.cos(angle) * velocity;
            const ty = Math.sin(angle) * velocity;

            p.style.left = pos.x + 'px';
            p.style.top = pos.y + 'px';
            p.style.setProperty('--tx', tx + 'px');
            p.style.setProperty('--ty', ty + 'px');
            p.style.imageRendering = 'pixelated';

            // Override styles
            if (step.particleStyles) {
                Object.assign(p.style, step.particleStyles);
            }

            parent.appendChild(p);
            setTimeout(() => p.remove(), duration);
        }
    },

    // --- BEAM (Projectile from → to) ---
    async _doBeam(step, ctx) {
        const parent = this._resolveElement(step.parent || 'fxContainer', ctx);
        if (!parent) return;

        const from = this._resolvePosition(step.from || 'attacker', ctx);
        const to = this._resolvePosition(step.to || 'defender', ctx);
        const duration = step.duration || 400;
        const width = step.width || 6;
        const height = step.height || 6;

        const beam = document.createElement('div');
        beam.className = step.className || 'beam-projectile';

        // Calculate angle
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);

        Object.assign(beam.style, {
            position: 'absolute',
            left: from.x + 'px',
            top: from.y + 'px',
            width: width + 'px',
            height: height + 'px',
            transform: `rotate(${angle}deg)`,
            transition: `left ${duration}ms linear, top ${duration}ms linear`,
            zIndex: '30',
            pointerEvents: 'none',
            ...(step.beamStyles || {})
        });

        parent.appendChild(beam);

        // Trigger the movement after a frame
        requestAnimationFrame(() => {
            beam.style.left = to.x + 'px';
            beam.style.top = to.y + 'px';
        });

        await wait(duration);
        beam.remove();
    },

    // --- FLASH (Full-scene color flash) ---
    async _doFlash(step, ctx) {
        const parent = this._resolveElement(step.parent || 'fxContainer', ctx);
        if (!parent) return;

        const duration = step.duration || 300;
        const color = step.color || 'white';
        const opacity = step.opacity ?? 0.8;

        const flash = document.createElement('div');
        Object.assign(flash.style, {
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            background: color,
            opacity: String(opacity),
            pointerEvents: 'none',
            zIndex: '500',
            transition: `opacity ${duration * 0.6}ms ease-out`
        });

        parent.appendChild(flash);

        // Fade out
        await wait(duration * 0.4);
        flash.style.opacity = '0';
        await wait(duration * 0.6);
        flash.remove();
    },

    // --- STREAM (Continuous particle flow from → to) ---
    // 8-bit style: square pixels, hard outlines, optional size scaling.
    // scaleStart/scaleEnd let particles grow during travel (e.g. fire flames).
    async _doStream(step, ctx) {
        const parent = this._resolveElement(step.parent || 'fxContainer', ctx);
        if (!parent) return;

        const from = this._resolvePosition(step.from || 'attacker', ctx);
        const to = this._resolvePosition(step.to || 'defender', ctx);

        const count = step.count || 15;
        const interval = step.interval || 35;
        const spread = step.spread || 12;
        const travelTime = step.travelTime || 400;
        const size = step.size || 6;
        const color = step.color || '#ff4500';
        const outline = step.outline || null;       // Hard pixel outline color
        const fade = step.fade !== false;
        const scaleStart = step.scaleStart || 1;    // Starting scale multiplier
        const scaleEnd = step.scaleEnd || 1;        // Ending scale multiplier

        // Direction vector
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Perpendicular vector for spread
        const perpX = -dy / dist;
        const perpY = dx / dist;

        for (let i = 0; i < count; i++) {
            const p = document.createElement('div');

            const offset = (Math.random() - 0.5) * 2 * spread;
            const startX = from.x + perpX * offset;
            const startY = from.y + perpY * offset;

            const endOffset = (Math.random() - 0.5) * spread * 0.6;
            const endX = to.x + perpX * endOffset;
            const endY = to.y + perpY * endOffset;

            // Slight size variance
            const pSize = size + (Math.random() - 0.5) * (size * 0.4);

            // Build 8-bit outline shadow (hard 1px border, no blur)
            const shadow = outline
                ? `1px 0 0 ${outline}, -1px 0 0 ${outline}, 0 1px 0 ${outline}, 0 -1px 0 ${outline}`
                : 'none';

            // Transition includes transform for scaling
            const hasScale = scaleStart !== scaleEnd;
            let transition = `left ${travelTime}ms linear, top ${travelTime}ms linear`;
            if (hasScale) transition += `, transform ${travelTime}ms linear`;
            if (fade) transition += `, opacity ${travelTime}ms ease-in`;

            Object.assign(p.style, {
                position: 'absolute',
                left: startX + 'px',
                top: startY + 'px',
                width: pSize + 'px',
                height: pSize + 'px',
                borderRadius: '0',           // 8-bit: square pixels
                background: color,
                boxShadow: shadow,
                opacity: '1',
                pointerEvents: 'none',
                zIndex: '25',
                imageRendering: 'pixelated',
                transform: `scale(${scaleStart})`,
                transition: transition,
                ...(step.particleStyles || {})
            });

            parent.appendChild(p);

            requestAnimationFrame(() => {
                p.style.left = endX + 'px';
                p.style.top = endY + 'px';
                if (hasScale) p.style.transform = `scale(${scaleEnd})`;
                if (fade) p.style.opacity = '0.2';
            });

            setTimeout(() => p.remove(), travelTime + 50);
            if (i < count - 1) await wait(interval);
        }

        await wait(travelTime);
    },

    // --- VOLLEY (Rapid-fire projectiles from → to) ---
    // 8-bit style: hard-edged pixel projectiles fired in succession.
    async _doVolley(step, ctx) {
        const parent = this._resolveElement(step.parent || 'fxContainer', ctx);
        if (!parent) return;

        const from = this._resolvePosition(step.from || 'attacker', ctx);
        const to = this._resolvePosition(step.to || 'defender', ctx);

        const count = step.count || 5;
        const interval = step.interval || 100;
        const travelTime = step.travelTime || 250;
        const projectile = step.projectile || {};
        const width = projectile.width || 8;
        const height = projectile.height || 4;

        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);

        for (let i = 0; i < count; i++) {
            const offsetX = (Math.random() - 0.5) * 10;
            const offsetY = (Math.random() - 0.5) * 10;

            const p = document.createElement('div');
            Object.assign(p.style, {
                position: 'absolute',
                left: (from.x + offsetX) + 'px',
                top: (from.y + offsetY) + 'px',
                width: width + 'px',
                height: height + 'px',
                transform: `rotate(${angle}deg)`,
                transition: `left ${travelTime}ms linear, top ${travelTime}ms linear`,
                zIndex: '30',
                pointerEvents: 'none',
                borderRadius: '0',
                imageRendering: 'pixelated',
                ...(projectile.styles || {})
            });

            parent.appendChild(p);

            requestAnimationFrame(() => {
                p.style.left = (to.x + offsetX) + 'px';
                p.style.top = (to.y + offsetY) + 'px';
            });

            setTimeout(() => p.remove(), travelTime + 50);
            if (i < count - 1) await wait(interval);
        }

        await wait(travelTime);
    }
};
