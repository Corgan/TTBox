import TTModule from './module.mjs';
import TTBox from './../ttbox.mjs';
import Events from './events.mjs';

export default class SavesModule extends TTModule {
    constructor() { super(); }

    static id = 'saves';
    static saves = [];

    static async start() {
        await super.start(...arguments);

        let lsString = localStorage.getItem('TrimpToolbox-SavesModule-saves');
        this.saves = JSON.parse(lsString) || [];

        if(!this.hooked) {
            let lastCell = game.global.lastClearedCell;
            this.hooks.push(Events.on('world', 'post', () => {
                let universe = game.global.universe;
                let portal = game.global.totalRadPortals;
                let world = game.global.world;
                let save = gameWindow.save(true);
                this.saves.push({
                    universe: universe,
                    portal: portal,
                    world: world,
                    save: save
                });
                if(this.saves.length > 50)
                    this.saves = this.saves.slice(-50);
            }));
            this.hooked = true;
        }
    }

    static async stop() {
        await super.stop(...arguments);
        localStorage.setItem('TrimpToolbox-SavesModule-saves', JSON.stringify(this.saves));
        console.log(this.saves);
    }

    static async update() {
        await super.update(...arguments);
    }
}