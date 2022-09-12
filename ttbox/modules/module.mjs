export default class TTModule {
    constructor() { if(this.constructor) return this.constructor; }
    
    static id = 'module';
    static running = false;
    static hooked = false;
    static hooks = [];

    static async start() {
        console.log(`Starting ${this.id}`);
        this.running = true;
    }

    static async stop() {
        console.log(`Stopping ${this.id}`);

        this.hooks.forEach(hook => {
            hook.remove();
        });

        this.hooked = false;
        this.hooks = [];

        this.running = false;
    }

    static async update() {
    }
}