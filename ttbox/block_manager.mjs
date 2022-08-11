import { createElement } from './helpers.mjs';
import DefaultConfig from './default_config.mjs';

export default class BlockManager {
    static types = {};
    static blocks = [];

    static ontop = false;
    static locked = false;
    static resizing = false;
    static dragging = false;

    static register(block) {
        if(!this.types[block.name])
            this.types[block.name] = block;
    }

    static new(data) {
        if(data.type && this.types[data.type]) {
            let block = new (this.types[data.type])(data);
            block.load(data);
            return block;
        } else {
            return false;
        }
    }

    static save() {
        let saveObj = {}

        saveObj.blocks = this.blocks.map(b => b.save());

        saveObj.ontop = this.ontop;
        saveObj.locked = this.locked;

        localStorage.setItem('TrimpToolbox-Configuration', JSON.stringify(saveObj))
    }

    static load() {
        let lsString = localStorage.getItem('TrimpToolbox-Configuration') || JSON.stringify(DefaultConfig);
        let saveObj = JSON.parse(lsString);
        
        saveObj.blocks.forEach(b => {
            let block = BlockManager.get(b.id);
            if(!block) {
                block = BlockManager.new(b);
                if(block)
                   this.blocks.push(block);
            } else {
                block.load(b);
            }
        });

        this.ontop = saveObj.ontop || false;
        this.locked = saveObj.locked || false;
    }

    static start() {
        this.load();

        this.$dev = document.getElementById("dev");
        this.$reload = document.getElementById("reload");
        this.$pin = document.getElementById("pin");
        this.$pause = document.getElementById("pause");
        this.$pauseAT = document.getElementById("pauseAT");
        this.$lock = document.getElementById("lock");


        this.$pin.classList.toggle('on', this.ontop);
        this.$pauseAT.classList.toggle('on', !gameWindow.getPageSetting("PauseScript"));

        gameWindow.swapClass('icon-', game.options.menu.pauseGame.enabled ? "icon-play4" : "icon-pause3", this.$pause);
        gameWindow.swapClass('icon-', this.locked ? "icon-lock" : "icon-lock-open", this.$lock);

        this.$dev.addEventListener('click', () => nw.Window.get().showDevTools());
        this.$reload.addEventListener('click', () => nw.Window.get().reload());
        this.$pin.addEventListener('click', () => {
            let win = nw.Window.get();
            this.ontop = !this.ontop;
            win.setAlwaysOnTop(this.ontop);
            this.$pin.classList.toggle('on', this.ontop);
        });
        this.$pauseAT.addEventListener('click', () => {
            gameWindow.settingChanged("PauseScript");
            this.$pauseAT.classList.toggle('on', !gameWindow.getPageSetting("PauseScript"));
        });
        this.$pause.addEventListener('click', () => {
            gameWindow.toggleSetting('pauseGame');
            gameWindow.swapClass('icon-', game.options.menu.pauseGame.enabled ? "icon-play4" : "icon-pause3", this.$pause);
        });
        this.$lock.addEventListener('click', () => {
            let win = nw.Window.get();
            this.locked = !this.locked;
            //win.setResizable(!this.locked); Setting resizable to true after being set to false doesn't seem to work?
            gameWindow.swapClass('icon-', this.locked ? "icon-lock" : "icon-lock-open", this.$lock);
            this.redraw();
        });

        
        let win = nw.Window.get();
        win.setAlwaysOnTop(this.ontop);
        win.setResizable(true);// !this.locked; Setting resizable to true after being set to false doesn't seem to work?


        this.blocks.forEach(block => (block.init(), block.update()));

        this.redraw();

        this.updateLoop = setInterval(this.blocks_update.bind(this), 250);
    }

    static blocks_update() {
        this.blocks.forEach(block => {
            try {
                block.update()
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
        
        BlockManager.save();
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