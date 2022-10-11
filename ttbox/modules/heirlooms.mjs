import TTModule from './module.mjs';
import TTBox from './../ttbox.mjs';
import Events from './events.mjs';

export default class HeirloomsModule extends TTModule {
    constructor() { super(); }

    static id = 'heirlooms';

    static async start() {
        await super.start(...arguments);
    }

    static async stop() {
        await super.stop(...arguments);
    }

    static async update() {
        await super.update(...arguments);

        let mapsActive = game.global.mapsActive;
        let portal = gameWindow.getTotalPortals();
        let world = game.global.world;
        let cell = game.global.lastClearedCell+2;

        let mapObj = gameWindow.getCurrentMapObject()
        
       // console.log(mapsActive ? mapObj : false, portal, world, cell);
    }
}