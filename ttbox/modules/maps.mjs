import TTModule from './module.mjs';

export default class MapsModule extends TTModule {
    static id = 'maps';
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
}