import { createElement } from './helpers.mjs';
import DefaultConfig from './default_config.mjs';
import EventManager from './event_manager.mjs';

export default class BlockManager {
    constructor() { return this.constructor; }
    static types = {};
    static blocks = [];

    static ontop = false;
    static locked = false;
    static resizing = false;
    static dragging = false;

    static register(block) {
        if(!BlockManager.types[block.name])
        BlockManager.types[block.name] = block;
    }

    static new(data) {
        if(data.type && BlockManager.types[data.type]) {
            let block = new (BlockManager.types[data.type])(data);
            block.load(data);
            block.update_config();
            return block;
        } else {
            return false;
        }
    }

    static save() {
        let saveObj = {}

        saveObj.blocks = BlockManager.blocks.map(b => b.save());

        saveObj.ontop = BlockManager.ontop;
        saveObj.locked = BlockManager.locked;

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
                BlockManager.blocks.push(block);
            } else {
                block.load(b);
                block.update_config();
            }
        });

        BlockManager.ontop = saveObj.ontop || false;
        BlockManager.locked = saveObj.locked || false;
    }

    static start() {
        BlockManager.load();

        BlockManager.$dev = document.getElementById("dev");
        BlockManager.$reload = document.getElementById("reload");
        BlockManager.$pin = document.getElementById("pin");
        BlockManager.$pause = document.getElementById("pause");
        BlockManager.$pauseAT = document.getElementById("pauseAT");
        BlockManager.$lock = document.getElementById("lock");


        BlockManager.$pin.classList.toggle('on', BlockManager.ontop);
        if(gameWindow.getPageSetting) {
            BlockManager.$pauseAT.classList.toggle('on', !gameWindow.getPageSetting("PauseScript"));
            BlockManager.$pauseAT.addEventListener('click', () => {
                gameWindow.settingChanged("PauseScript");
                BlockManager.$pauseAT.classList.toggle('on', !gameWindow.getPageSetting("PauseScript"));
            });
        } else {
            BlockManager.$pauseAT.classList.add('hide');
        }

        gameWindow.swapClass('icon-', game.options.menu.pauseGame.enabled ? "icon-play4" : "icon-pause3", BlockManager.$pause);
        gameWindow.swapClass('icon-', BlockManager.locked ? "icon-lock" : "icon-lock-open", BlockManager.$lock);

        BlockManager.$dev.addEventListener('click', () => nw.Window.get().showDevTools());
        BlockManager.$reload.addEventListener('click', () => nw.Window.get().reload());
        BlockManager.$pin.addEventListener('click', () => {
            let win = nw.Window.get();
            BlockManager.ontop = !BlockManager.ontop;
            win.setAlwaysOnTop(BlockManager.ontop);
            BlockManager.$pin.classList.toggle('on', BlockManager.ontop);
        });
        BlockManager.$pause.addEventListener('click', () => {
            gameWindow.toggleSetting('pauseGame');
            gameWindow.swapClass('icon-', game.options.menu.pauseGame.enabled ? "icon-play4" : "icon-pause3", BlockManager.$pause);
        });
        BlockManager.$lock.addEventListener('click', () => {
            let win = nw.Window.get();
            BlockManager.locked = !BlockManager.locked;
            //win.setResizable(!this.locked); Setting resizable to true after being set to false doesn't seem to work?
            gameWindow.swapClass('icon-', BlockManager.locked ? "icon-lock" : "icon-lock-open", BlockManager.$lock);
            BlockManager.redraw();
        });

        
        let win = nw.Window.get();
        win.setAlwaysOnTop(BlockManager.ontop);
        win.setResizable(true);// !this.locked; Setting resizable to true after being set to false doesn't seem to work?


        BlockManager.blocks.forEach(block => (block.init(), block.update()));

        BlockManager.redraw();

        BlockManager.updateLoop = setInterval(BlockManager.blocks_update.bind(BlockManager), 250);
    }

    static blocks_update() {
        BlockManager.blocks.forEach(block => {
            try {
                block.update()
            } catch(e) {
                console.log(e);
            }
        });
    }

    static redraw() {
        document.body.classList.toggle('resizing', BlockManager.resizing);
        document.body.classList.toggle('dragging', BlockManager.dragging);
        document.body.classList.toggle('locked', BlockManager.locked);
        if(BlockManager.resizing) {
            gameWindow.swapClass('direction', 'direction-' + BlockManager.direction, document.body);
        } else {
            gameWindow.swapClass('direction', 'direction-none', document.body);
        }
        BlockManager.blocks.forEach(block => block.redraw());
        
        BlockManager.save();
    }

    static get(id) {
        return BlockManager.blocks.find(block => block.id == id);
    }

    static at(x, y, ignore=[]) {
        let block = BlockManager.blocks.find(block => !ignore.includes(block) && block.x <= x && block.x + block.w > x && block.y <= y && block.y + block.h > y);
        return block;
    }

    static under(block) {
        let column = BlockManager.blocks.filter(b => block.id != b.id && !((block.x >= b.x + b.w && block.x + block.w > b.x + b.w) || (block.x < b.x && block.x + block.w <= b.x)));
        let row = column.filter(b => (block.y <= b.y + b.h) && block.y + block.h > b.y);
        return row;
    }

    static top() {
        let sorted = BlockManager.blocks.sort((a,b) => a.z - b.z);
        sorted.forEach((v,i) => v.z = i);
        return Math.max(...sorted.map(b => b.z));
    }

    static handle_list_update(event) {
        let entry = event.target;
        
        let stat = event.composedPath().find(el => el.classList && el.classList.contains('stat'));
        let config = event.composedPath().find(el => el.classList && el.classList.contains('config'));
        let list_item = event.composedPath().find(el => el.classList && el.classList.contains('list-item'));
        let list = event.composedPath().find(el => el.classList && el.classList.contains('list'));

        BlockManager.handle_config_update(stat.id, config.getAttribute('data-config'), entry.getAttribute('data-id'), [...list.children].indexOf(list_item));
    }

    static handle_list_add(event) {
        let entry = event.target;
        
        let stat = event.composedPath().find(el => el.classList && el.classList.contains('stat'));
        let config = event.composedPath().find(el => el.classList && el.classList.contains('config'));
        let list_item = event.composedPath().find(el => el.classList && el.classList.contains('list-item'));
        let list = event.composedPath().find(el => el.classList && el.classList.contains('list'));

        let options = BlockManager.get(stat.id).constructor[config.getAttribute('data-config')];
        let cfg = BlockManager.get(stat.id)[config.getAttribute('data-config')];
        if(options.length > 0) {
            let def = options[0].id;
            cfg.push(def);
        }

        BlockManager.handle_config_update(stat.id, config.getAttribute('data-config'), cfg);
    }

    static handle_list_delete(event) {
        let entry = event.target;
        
        let stat = event.composedPath().find(el => el.classList && el.classList.contains('stat'));
        let config = event.composedPath().find(el => el.classList && el.classList.contains('config'));
        let list_item = event.composedPath().find(el => el.classList && el.classList.contains('list-item'));
        let list = event.composedPath().find(el => el.classList && el.classList.contains('list'));

        let cfg = BlockManager.get(stat.id)[config.getAttribute('data-config')];

        cfg.splice([...list.children].indexOf(list_item), 1);

        BlockManager.handle_config_update(stat.id, config.getAttribute('data-config'), cfg);
    }

    static handle_list_reorder(event, drop=false) {
        let $list = event.composedPath().find(el => el.classList && el.classList.contains('list'));
        if($list) {
            event.preventDefault();
            let $list_item = event.composedPath().find(el => el.classList && el.classList.contains('list-item'));
            let $dragging_item = [...$list.children].find(el => el.classList && el.classList.contains('list-item') && el.classList.contains('dragging'));
            if($dragging_item && $list_item) {
                let from = [...$list.children].indexOf($dragging_item);
                let to = [...$list.children].indexOf($list_item);
                if(from > to)
                    $dragging_item.after($list_item);
                else
                    $dragging_item.before($list_item);
                if(drop) {
                    let stat = event.composedPath().find(el => el.classList && el.classList.contains('stat'));
                    let config = event.composedPath().find(el => el.classList && el.classList.contains('config'));

                    let cfg = BlockManager.get(stat.id)[config.getAttribute('data-config')];

                    let new_list = [...$list.children].filter($el => !$el.classList.contains('hide')).map($el => {
                        let [ $draggable, $dropdown, $delete ] = [...$el.children];
                        let [ $current, $entries ] = [...$dropdown.children];
                        return $current.dataset.id;
                    });
                    BlockManager.handle_config_update(stat.id, config.getAttribute('data-config'), new_list);
                }
            }
            if(drop)
                $dragging_item.classList.remove('dragging');
        }
    }

    static handle_config_update(id, prop, value, idx=-1) {
        let block = BlockManager.get(id);
        if(block[prop]) {
            if(idx > -1 && block[prop][idx])
                block[prop][idx] = value;
            else
                block[prop] = value;
        }
        block.update_config();
    }
}