import TTModule from './module.mjs';
import TTBox from './../ttbox.mjs';

export default class UtilsModule extends TTModule {
    constructor() { super(); }
    static id = 'utils';

    static async start() {
        await super.start(...arguments);
    }

    static async stop() {
        await super.stop(...arguments);
    }

    static async update() {
        await super.update(...arguments);
    }

    static get hze() {
        return game.global.universe == 2 ? game.global.highestRadonLevelCleared : game.global.highestLevelCleared;
    }

    static badCoordLevel(world) {
        let amt = 1;
        for (var x = 0; x < world - 1; x++) {
            amt = Math.ceil(amt * 1.25);
        }
        return amt;
    }

    static corruptionStart({challengeActive=game.global.challengeActive, headstart=0, ignoreCorrupted=false, runningChallengeSquared=game.global.runningChallengeSquared}) {
        if(challengeActive == "Eradicated") return 1;
        if(challengeActive == "Corrupted") return 60;
        if(runningChallengeSquared)
            return 181;
        switch(headstart) {
            case 3:
                return 151;
            case 2:
                return 166;
            case 1:
                return 151;
            case 0:
                return 181;
        }
    }

    static magmaStart({ challengeActive=game.global.challengeActive }) {
        if(challengeActive == "Eradicated")
            return 1;
        return 230;
    }

    static magmaActive({ world=game.global.world, challengeActive=game.global.challengeActive, canMagma=game.global.canMagma }) {
        return (canMagma && world >= this.magmaStart(...arguments));
    }
}