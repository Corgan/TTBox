import TTModule from './module.mjs';

export default class MapsModule extends TTModule {
    constructor() { if(this.constructor) return this.constructor; }

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