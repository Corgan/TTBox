import TTModule from './module.mjs';

export default class UtilsModule extends TTModule {
    static id = 'utils';
    static instance = new this();

    constructor() {
        super(...arguments);
        if(this.constructor.instance)
            return this.constructor.instance;
    }

    async start() {
        await super.start(...arguments);
    }

    async stop() {
        await super.stop(...arguments);
    }

    async update() {
        await super.update(...arguments);
    }

    badCoordLevel(world) {
        let amt = 1;
        for (var x = 0; x < world - 1; x++) {
            amt = Math.ceil(amt * 1.25);
        }
        return amt;
    }

    corruptionStart({challengeActive=game.global.challengeActive, headstart=0, ignoreCorrupted=false, runningChallengeSquared=game.global.runningChallengeSquared}) {
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

    magmaStart({ challengeActive=game.global.challengeActive }) {
        if(challengeActive == "Eradicated")
            return 1;
        return 230;
    }

    magmaActive({ world=game.global.world, challengeActive=game.global.challengeActive, canMagma=game.global.canMagma }) {
        return (canMagma && world >= this.magmaStart(...arguments));
    }
}