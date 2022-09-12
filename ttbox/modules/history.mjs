import TTModule from './module.mjs';
import TTBox from './../ttbox.mjs';
import Events from './events.mjs';

class TimeLine {
    constructor() {
        this.events = [[]];
    }

    add(...data) {
        let next = this.events[0].length;
        this.events[0][next] = Date.now() / 1000;
        for(let i=0; i<data.length; i++) {
            if(this.events[i+1] === undefined)
                this.events[i+1] = [];
            this.events[i+1][next] = data[i];
        }
    }
}

export default class HistoryModule extends TTModule {
    constructor() { super(); }
    static id = 'history';
    
    static worldTimes = new TimeLine();
    static cellTimes = new TimeLine();

    static async start() {
        await super.start(...arguments);

        /*
        if(!this.hooked) {
            let lastCell = game.global.lastClearedCell;
            this.hooks.push(Events.on('world', 'pre', () => {
                let cellWorld = game.global.world+1;

                this.worldTimes.add(cellWorld);
            }));
            this.hooks.push(Events.on('battle', 'pre', () => {
                if(!game.global.mapsActive && lastCell != game.global.lastClearedCell) {
                    lastCell = game.global.lastClearedCell;
                    let cell = (((game.global.lastClearedCell+1) + 100) % 100) + 1;
                    let cellWorld = game.global.world;

                    this.cellTimes.add(cellWorld, cell);
                }
            }));
            this.hooked = true;
        }
        */
    }

    static async stop() {
        await super.stop(...arguments);
    }

    static async update() {
        await super.update(...arguments);
    }
}