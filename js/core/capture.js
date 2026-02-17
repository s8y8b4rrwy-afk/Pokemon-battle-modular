const CaptureManager = {
    async attemptCatch(battle, ballKey) {
        const ballData = ITEMS[ballKey];
        const enemy = battle.e;

        // 1. CHECK BOSS/RAGE DEFLECTION
        // 1. CHECK BOSS/RAGE/LUCKY DEFLECTION
        if (enemy.isLucky && ballKey !== 'masterball') {
            AudioEngine.playSfx('throw');
            await sleep(500);
            AudioEngine.playSfx('clank');
            document.getElementById('enemy-sprite').classList.add('anim-deflect');
            await sleep(300);
            document.getElementById('enemy-sprite').classList.remove('anim-deflect');
            await UI.typeText("It's too lucky to\nbe caught!");
            return 'CONTINUE';
        }

        if (enemy.isBoss && ballKey !== 'masterball') {
            let deflectChance = (enemy.rageLevel || 0) * GAME_BALANCE.RAGE_DEFLECT_CHANCE;

            if (enemy.rageLevel > 0 && Math.random() < deflectChance) {
                AudioEngine.playSfx('throw');

                // Short deflect animation
                await sleep(500);
                AudioEngine.playSfx('clank');
                document.getElementById('enemy-sprite').classList.add('anim-deflect');
                await sleep(300);
                document.getElementById('enemy-sprite').classList.remove('anim-deflect');

                await UI.typeText("The BOSS deflected\nthe Ball!");
                return 'CONTINUE';
            }
        }

        AudioEngine.playSfx('throw');

        const ball = document.createElement('div');
        ball.className = `pokeball-anim ${ballData.css}`;
        ball.style.animation = "captureThrow 0.6s ease-out forwards";
        document.getElementById('scene').appendChild(ball);

        await sleep(ANIM.THROW_ANIM);

        const eSprite = document.getElementById('enemy-sprite');
        eSprite.style.transition = 'transform 0.4s, filter 0.4s';
        eSprite.style.filter = 'brightness(0) invert(1)';
        eSprite.style.transform = 'scale(0)';

        UI.spawnSmoke(230, 70);
        AudioEngine.playSfx('catch_success');
        ball.style.animation = "captureShake 1.0s ease-in-out infinite";

        const catchRate = ballData.rate * GAME_BALANCE.CATCH_RATE_MODIFIER;
        let catchProb = ((3 * enemy.maxHp - 2 * enemy.currentHp) / (3 * enemy.maxHp)) * catchRate;
        if (ballKey === 'pokeball') catchProb *= 0.5;
        const isCaught = Math.random() < catchProb;

        let shakes = 0;
        const maxShakes = 3;

        while (shakes < maxShakes) {
            await sleep(ANIM.CATCH_SHAKE_DELAY);
            shakes++;
            AudioEngine.playSfx('catch_click');
            if (!isCaught && Math.random() > 0.5) break;
        }

        if (isCaught && shakes === maxShakes) {
            AudioEngine.playSfx('swoosh');
            document.getElementById('enemy-hud').classList.remove('hud-active');

            AudioEngine.playSfx('heal');

            ball.style.animation = 'none';
            ball.style.transform = 'translate(215px, -100px)';
            ball.classList.add('pokeball-caught');

            Game.state = 'CAUGHT_ANIM';
            await UI.typeText(`Gotcha!\n${enemy.name} was caught!`);
            const scene = document.getElementById('scene');
            if (scene.contains(ball)) scene.removeChild(ball);

            enemy.rageLevel = 0;
            enemy.failedCatches = 0;
            enemy.currentHp = Math.min(enemy.maxHp, enemy.currentHp + Math.floor(enemy.maxHp * 0.2));

            Game.party.push(enemy);

            if (Game.party.length > 6) {
                Game.state = 'OVERFLOW';
                await UI.typeText(`Party is full!\nSelect PKMN to release.`);
                await sleep(ANIM.OVERFLOW_WARNING);

                await new Promise(resolve => {
                    Battle.userInputPromise = resolve;
                    Game.openParty(true);
                });
                Battle.userInputPromise = null;

                Game.handleWin(true);
            }
            else {
                await UI.typeText(`${enemy.name} was added\nto the party!`);
                Game.handleWin(true);
            }
            return 'STOP_BATTLE';
        } else {
            ball.style.display = 'none';
            eSprite.style.filter = 'none';
            eSprite.style.transform = 'scale(1)';

            UI.spawnSmoke(230, 70);
            AudioEngine.playSfx('ball');

            if (enemy.cry) AudioEngine.playCry(enemy.cry);

            enemy.failedCatches++;
            let gainedRage = false;

            const rageProb = GAME_BALANCE.RAGE_TRIGGER_CHANCE + (enemy.failedCatches * 0.1);

            if (Math.random() < rageProb) {
                enemy.rageLevel = Math.min(3, (enemy.rageLevel || 0) + 1);
                UI.updateHUD(enemy, 'enemy');
                gainedRage = true;
            }

            await UI.typeText(`Shoot! It was so close!`);
            const scene = document.getElementById('scene');
            if (scene.contains(ball)) scene.removeChild(ball);

            if (gainedRage) {
                await battle.triggerRageAnim(enemy.cry);
                await UI.typeText("It's getting aggressive!");
            }
            return 'CONTINUE';
        }
    }
};
