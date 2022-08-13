export default class TTModule {
    constructor() { if(this.constructor) return this.constructor; }
    
    static id = 'module';
    static running = false;

    static async start() {
        console.log(`Starting ${this.id}`);
        this.running = true;
    }

    static async stop() {
        console.log(`Stopping ${this.id}`);
        this.running = false;
    }

    static async update() {
    }
}