import TTModule from './module.mjs';
import TTBox from './../ttbox.mjs';

export default class MapsModule extends TTModule {
    constructor() { super(); }

    static id = 'maps';

    static async start() {
        await super.start(...arguments);
    }

    static async stop() {
        await super.stop(...arguments);
    }

    static async update() {
        await super.update(...arguments);
    }
}