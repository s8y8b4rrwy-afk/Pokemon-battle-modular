const BattleAnims = {
    // --- CORE ANIMATION HELPERS ---
    async triggerHitAnim(target, moveType = 'normal') {
        const isPlayer = (target === Battle.p);
        const sprite = isPlayer ? document.getElementById('player-sprite') : document.getElementById('enemy-sprite');
        const isInvisible = !!target.volatiles.invulnerable;

        // 1. Audio
        const sfx = (moveType === 'paralysis') ? 'electric' : (['burn', 'poison'].includes(moveType) ? 'damage' : moveType);
        if (SFX_LIB[sfx] || ['fire', 'water', 'ice', 'grass', 'electric', 'psychic'].includes(sfx)) AudioEngine.playSfx(sfx);
        else AudioEngine.playSfx('damage');

        if (['fire', 'water', 'ice', 'grass', 'electric', 'psychic'].includes(moveType)) {
            const scene = document.getElementById('scene');
            scene.classList.remove(`fx-${moveType}`);
            UI.forceReflow(scene);
            scene.classList.add(`fx-${moveType}`);
            setTimeout(() => scene.classList.remove(`fx-${moveType}`), 600);
        }

        // 2. Sprite Shake
        if (!isInvisible) {
            const isFlipped = sprite.classList.contains('sub-back');
            const hitClass = isFlipped ? 'anim-hit-flipped' : 'anim-hit';

            sprite.classList.remove('anim-hit', 'anim-hit-flipped');
            UI.forceReflow(sprite);
            sprite.classList.add(hitClass);

            await wait(400);
            sprite.classList.remove(hitClass);
        } else {
            await wait(200);
        }
    },

    async performVisualSwap(mon, targetSrc, isDoll, isPlayerOverride = null) {
        const isPlayer = (isPlayerOverride !== null) ? isPlayerOverride : (mon === Battle.p);
        const sprite = isPlayer ? document.getElementById('player-sprite') : document.getElementById('enemy-sprite');

        const x = isPlayer ? 60 : 230;
        const y = isPlayer ? 150 : 70;

        AudioEngine.playSfx('ball');
        UI.spawnSmoke(x, y);

        sprite.style.opacity = 0;
        await wait(100);

        sprite.src = targetSrc;

        if (isPlayer && isDoll) sprite.classList.add('sub-back');
        else sprite.classList.remove('sub-back');

        sprite.style.opacity = 1;

        sprite.classList.remove('anim-enter');
        UI.forceReflow(sprite);
        sprite.classList.add('anim-enter');

        setTimeout(() => {
            sprite.classList.remove('anim-enter');
        }, 600);

        await wait(200);
    },

    async triggerRageAnim(cry) {
        document.getElementById('scene').classList.add('anim-violent');
        if (cry) AudioEngine.playCry(cry);
        AudioEngine.playSfx('rumble');
        await wait(500);
        document.getElementById('scene').classList.remove('anim-violent');
    },

    async animateSwap(oldMon, newMon, cb) {
        const sprite = document.getElementById('player-sprite');
        AudioEngine.playSfx('ball');
        sprite.classList.add('anim-return');
        await wait(400);
        sprite.src = newMon.backSprite;
        sprite.classList.remove('anim-return');
        sprite.classList.add('anim-enter');
        AudioEngine.playSfx('ball');
        UI.spawnSmoke(60, 150);
        if (newMon.cry) AudioEngine.playCry(newMon.cry);
        await wait(600);
        sprite.classList.remove('anim-enter');
        if (cb) cb();
    }
};
