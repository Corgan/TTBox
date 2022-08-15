export default class TTBox {
    static running = false;
    static tick = 0;
    static modules = {};

    constructor() {
        if(this.constructor)
            return this.constructor;
    }

    static modules = [
        'blocks',
        'events',
        //'sim',
        //'utils',
        //'maps',
    ];
    static loadedModules = [];

    static {
        (async () => {
            await this.modules.reduce(async (promise, current, i) => {
                await promise;
                return this.loadModule(current);
            }, Promise.resolve());
            await this.start();
        })();
    };

    static async loop() {
        await this.update();
        
        await new Promise(resolve => setTimeout(resolve, 100)); // 100ms between updates

        if(this.running)
            requestAnimationFrame(async () => await this.loop());
    }

    /* MODULES */
    static async loadModule(module) {
        if(this.loadedModules[module])
            return this.loadedModules[module];

        try {
            let { default: importedModule } = await import(`./modules/${module}.mjs`);
            if(importedModule)
                this.loadedModules[module] = new importedModule();
        } catch(e) {
            this.loadedModules[module] = false;
            console.log(`Error loading module ${module}`);
            console.log(e);
        }

        if(this.loadedModules[module] && this.running)
            this.loadedModules[module].start();
        
        return this.loadedModules[module];
    }

    static async reloadModule(module) {
        if(this.loadedModules[module]) {
            delete this.loadedModules[module]; // This kills the module
            this.loadedModules[module] = undefined;
        }

        return this.loadModule(module);
    }

    static get(module) {
        if(this.loadedModules[module]) {
            return this.loadedModules[module]; 
        } else {
            return false;
        }
    }


    /* STATE CONTROL */
    static async start() {
        if(!this.running) {
            this.running = true;
            let modules = Object.values(this.loadedModules);

            await modules.reduce(async (p, mod) => {
                await p;
                
                if(!mod.running) {
                    try {
                        return mod.start(...arguments);
                    } catch(e) {
                        console.log(`Error in ${mod.id}.start`, e);
                    }
                }
            }, Promise.resolve());

            requestAnimationFrame(async () => await this.loop());
        }
    }

    static async stop() {
        if(this.running) {
            this.running = false;
            let modules = Object.values(this.loadedModules);

            await modules.reduce(async (p, mod) => {
                await p;
                
                if(mod.running) {
                    try {
                        return mod.stop(...arguments);
                    } catch(e) {
                        console.log(`Error in ${mod.id}.stop`, e);
                    }
                }
            }, Promise.resolve());
        }
    }

    static async update() {
        if(this.running) {
            this.tick++;
            let modules = Object.values(this.loadedModules);
            await modules.reduce(async (p, mod) => {
                await p;

                if(mod.running) {
                    try {
                        return mod.update(...arguments);
                    } catch(e) {
                        console.log(`Error in ${mod.id}.update`, e);
                        return Promise.reject();
                    }
                }
            }, Promise.resolve());
        }
    }
}