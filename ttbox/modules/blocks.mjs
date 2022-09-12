import TTBox from './../ttbox.mjs';
import TTModule from './module.mjs';
import StatBlock from '../blocks/block.mjs';

import { createElement } from './../helpers.mjs';
import DefaultConfig from './../default_config.mjs';


export default class Blocks extends TTModule {
    constructor() { super(); }
    static id = 'blocks';
    static running = false;

    static loadable = [
        'bw', 'c2s', 'chart', 'daily', 'heirlooms', 'info', 'maps', 'playerspire', 'text', 'voids', 'world', 'map', 'universe'
    ];
    static lookup = {};
    static reverseLookup = {};
    static byClass = {};
    
    static types = {};
    static blocks = [];

    static loaded = false;
    static ontop = false;
    static locked = false;
    static resizing = false;
    static dragging = false;

    static async loadAll() {
        await this.loadable.reduce(async (promise, current, i) => {
            await promise;
            await this.register(current);
        }, Promise.resolve());
        this.loaded = false;
    }

    static async register(block) {
        if(!this.lookup[block] && this.loadable.includes(block)) {
            let { default: importedModule } = await import(`./../blocks/${block}.mjs`);

            if(importedModule && importedModule.name) {
                this.lookup[block] = importedModule.name;
                this.byClass[importedModule.name] = importedModule;
                this.reverseLookup[importedModule.name] = block;
            }
            
            this.types[this.lookup[block]] = importedModule;
        }
    }

    static new(data={}) {
        let block;
        if(data.type && this.types[data.type]) {
            block = new (this.types[data.type])(data);
        } else {
            block = new StatBlock(data);
        }
        block.init();
        this.blocks.push(block);
        block.update_config();
        return block;
    }

    static delete(id, force=false) {
        if(!id || typeof id != "string" || (!force && this.locked))
            return;

        let idx = this.blocks.findIndex(block => block.id == id);
        let [ block ] = this.blocks.splice(idx, 1);
        block.delete();
        this.redraw();
    }

    static change_type(id, type) {
        let block = this.get(id);
        let old = block.save();
        this.delete(id, true);
        block = this.new({...old, type: type});
        block.configuring = true;
        block.update_config();
        Blocks.redraw();
        return block;
    }

    static save(store=true) {
        if(!this.loaded) return;
        let saveObj = {}

        saveObj.blocks = this.blocks.map(b => b.save());

        saveObj.ontop = this.ontop;
        saveObj.locked = this.locked;

        if(store)
            localStorage.setItem('TrimpToolbox-Configuration', JSON.stringify(saveObj));
        return saveObj;
    }

    static async load(override=false, reset=false) {
        let lsString = localStorage.getItem('TrimpToolbox-Configuration');
        let lString = (!reset && lsString) || JSON.stringify(DefaultConfig);
        let saveObj = override || JSON.parse(lString);

        if(!this.loaded)
            await this.loadAll();
        
        saveObj.blocks.forEach(b => {
            let block = this.get(b.id);
            if(!block || block.constructor.name != b.type) {
                block = this.new(b);
            } else {
                block.load(b);
                block.update_config();
            }
        });

        this.ontop = saveObj.ontop || false;
        this.locked = saveObj.locked || false;

        this.loaded = true;
        this.redraw();
    }

    static async start() {
        await super.start(...arguments);
        await this.load();

        this.$dev = document.getElementById("dev");
        this.$reload = document.getElementById("reload");
        this.$pin = document.getElementById("pin");
        this.$pause = document.getElementById("pause");
        this.$pauseAT = document.getElementById("pauseAT");
        this.$lock = document.getElementById("lock");
        this.$add = document.getElementById("add");


        this.$pin.classList.toggle('on', this.ontop);
        if(gameWindow.getPageSetting) {
            this.$pauseAT.classList.toggle('on', !gameWindow.getPageSetting("PauseScript"));
            this.$pauseAT.addEventListener('click', () => {
                gameWindow.settingChanged("PauseScript");
                this.$pauseAT.classList.toggle('on', !gameWindow.getPageSetting("PauseScript"));
            });
        } else {
            this.$pauseAT.classList.add('hide');
        }

        gameWindow.swapClass('icon-', game.options.menu.pauseGame.enabled ? "icon-play4" : "icon-pause3", this.$pause);
        gameWindow.swapClass('icon-', this.locked ? "icon-lock" : "icon-lock-open", this.$lock);

        this.$dev.addEventListener('click', () => nw.Window.get().showDevTools());
        this.$reload.addEventListener('click', () => nw.Window.get().reload());
        this.$pin.addEventListener('click', () => {
            let win = nw.Window.get();
            this.ontop = !this.ontop;
            this.save();
            win.setAlwaysOnTop(this.ontop);
            this.$pin.classList.toggle('on', this.ontop);
        });
        this.$pause.addEventListener('click', () => {
            gameWindow.toggleSetting('pauseGame');
            gameWindow.swapClass('icon-', game.options.menu.pauseGame.enabled ? "icon-play4" : "icon-pause3", this.$pause);
        });
        this.$lock.addEventListener('click', () => {
            let win = nw.Window.get();
            this.locked = !this.locked;
            this.save();
            //win.setResizable(!this.locked); Setting resizable to true after being set to false doesn't seem to work?
            gameWindow.swapClass('icon-', this.locked ? "icon-lock" : "icon-lock-open", this.$lock);
            this.redraw();
        });
        this.$add.addEventListener('click', () => Blocks.new());

        
        let win = nw.Window.get();
        win.setAlwaysOnTop(this.ontop);
        win.setResizable(true);// !this.locked; Setting resizable to true after being set to false doesn't seem to work?


        this.blocks.forEach(block => block.update());

        this.redraw();

        //this.updateLoop = setInterval(this.blocks_update.bind(this), 250);
    }

    static async stop() {
        await super.stop(...arguments);
    }

    static async update() {
        await super.update(...arguments);
        this.blocks.forEach(block => {
            try {
                block.update(...arguments);
            } catch(e) {
                console.log(e);
            }
        });
    }

    static redraw() {
        document.body.classList.toggle('resizing', this.resizing);
        document.body.classList.toggle('dragging', this.dragging);
        document.body.classList.toggle('locked', this.locked);
        if(this.resizing) {
            gameWindow.swapClass('direction', 'direction-' + this.direction, document.body);
        } else {
            gameWindow.swapClass('direction', 'direction-none', document.body);
        }
        this.blocks.forEach(block => block.redraw());

        this.save();
    }

    static get(id) {
        return this.blocks.find(block => block.id == id);
    }

    static at(x, y, ignore=[]) {
        let block = this.blocks.find(block => !ignore.includes(block) && block.x <= x && block.x + block.w > x && block.y <= y && block.y + block.h > y);
        return block;
    }

    static under(block) {
        let column = this.blocks.filter(b => block.id != b.id && !((block.x >= b.x + b.w && block.x + block.w > b.x + b.w) || (block.x < b.x && block.x + block.w <= b.x)));
        let row = column.filter(b => (block.y <= b.y + b.h) && block.y + block.h > b.y);
        return row;
    }

    static top() {
        let sorted = this.blocks.sort((a,b) => a.z - b.z);
        sorted.forEach((v,i) => v.z = i);
        return Math.max(...sorted.map(b => b.z));
    }
}