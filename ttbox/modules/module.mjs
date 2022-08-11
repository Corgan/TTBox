export default class TTModule {
    constructor() {
        if(this.constructor.instance)
            return this.constructor.instance;
        this.running = false;
    }

    async start() {
        console.log(`Starting ${this.constructor.id}`);
        this.running = true;
    }

    async stop() {
        console.log(`Stopping ${this.constructor.id}`);
        this.running = false;
    }

    async update() {
    }
}