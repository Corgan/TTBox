class TTBox {
    static { window.TTBox = this; };
    
    static script = document.getElementById('TTBox-Script');

    static modules = [
        //'sim',
        //'utils',
        //'maps',
    ];

    static {
        (async () => {
            await this.modules.reduce(async (promise, current, i) => {
                await promise;
                return this.loadModule(current);
            }, Promise.resolve());
            //await this.start();
        })();
    };

    static async loop() {
        await this.update();
        
        await new Promise(resolve => setTimeout(resolve, 100)); // 100ms between updates

        if(this.running)
            requestAnimationFrame(async () => await this.loop());
    }

    static async reload() {
        let src = this.script.src.split('?')[0];
        this.script.parentNode.removeChild(this.script);

        var script = document.createElement('script');
        script.id = 'TTBox-Script';
        script.src = `${src}?version=${Number((new Date()))}`;
        script.type = 'module';
        script.setAttribute('crossorigin', 'anonymous');
        document.head.appendChild(script);
        this.script = script;
    }

    static running = false;
    static tick = 0;
    static modules = {};

    constructor() {
        if(this.constructor)
            return this.constructor;
    }


    /* MODULES */
    static async loadModule(module) {
        if(this.modules[module])
            return this.modules[module];

        try {
            let { default: importedModule } = await import(`./modules/${module}.mjs?version=${Number((new Date()))}`);
            if(importedModule)
                this.modules[module] = new importedModule();
        } catch(e) {
            this.modules[module] = false;
            console.log(`Error loading module ${module}`);
            console.log(e);
        }

        if(this.modules[module] && this.running)
            this.modules[module].start();
        
        return this.modules[module];
    }

    static async reloadModule(module) {
        if(this.modules[module]) {
            delete this.modules[module]; // This kills the module
            this.modules[module] = undefined;
        }

        return this.loadModule(module);
    }


    /* STATE CONTROL */
    static async start() {
        if(!this.running) {
            this.running = true;
            let modules = Object.values(this.modules);

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

            requestAnimationFrame(async () => await this.constructor.loop());
        }
    }

    static async stop() {
        if(this.running) {
            this.running = false;
            let modules = Object.values(this.modules);

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
            let modules = Object.values(this.modules);
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