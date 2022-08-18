import TTBox from '../ttbox.mjs';
import TTModule from './module.mjs';
import Blocks from './blocks.mjs';

import { createElement, getTT } from './../helpers.mjs';

const GRID_SIZE = 5;
const GRID_GAP = 5;

export default class Events extends TTModule {
    constructor() { super(); }
    static id = 'events';
    static running = false;
    static offsetX = 0;
    static offsetY = 0;
    static dragging = false;
    static resizing = false;
    static direction = false;
    static focused = false;

    static async start() {
        await super.start(...arguments);
        Events.tt = await getTT();

        document.body.addEventListener('dragstart', Events.handle_mouse_event, true);
        document.body.addEventListener('dragover', Events.handle_mouse_event, true);
        document.body.addEventListener('drop', Events.handle_mouse_event, true);
        document.body.addEventListener('mouseup', Events.handle_mouse_event, true);
        document.body.addEventListener('mouseover', Events.handle_mouse_event, true);
        document.body.addEventListener('mouseenter', Events.handle_mouse_event, true);
        document.body.addEventListener('mouseout', Events.handle_mouse_event, true);
        document.body.addEventListener('mousemove', Events.handle_mouse_event, true);
        document.body.addEventListener('mousedown', Events.handle_mouse_event, true);

        nw.Window.get().on('focus', () => Events.focused = true);
        nw.Window.get().on('blur', () => Events.focused = false);

        this.hook(gameWindow, 'startFight', 'fight');
        this.hook(gameWindow, 'nextWorld', 'world');
        this.hook(gameWindow, 'battle', 'battle');

        Events.tt.window.location.reload();
    }

    static async stop() {
        await super.stop(...arguments);

        Object.values(this.hooks).forEach(hook => {
            hook.obj[hook.method] = hook.original;
            delete hook.obj;
            delete hook.method;
            delete hook.original;
        });
    }

    static onHandlers = {};

    static on(event, type, cb) {
        if(!this.onHandlers[event])
            this.onHandlers[event] = {};
        if(!this.onHandlers[event][type])
            this.onHandlers[event][type] = [];
        this.onHandlers[event][type].push(cb);
    }

    static trigger(event, type, args=[], ret) {
        if(this.onHandlers[event] && this.onHandlers[event][type])
            this.onHandlers[event][type].forEach(handler => handler(...args, ret));
    }

    static hooks = {};
    static hook(obj, method, event) {
        if(typeof obj[method] == 'function') {
            if(typeof this.hooks[event] == 'undefined') {
                this.hooks[event] = {};
                this.hooks[event].original = obj[method];
                this.hooks[event].obj = obj;
                this.hooks[event].method = method;

                obj[method] = (...args) => {
                    try {
                        this.trigger(event, 'pre', [...args]);
                    } catch(e) {
                        console.log(`error in pre hooked function ${method}`, e);
                    }

                    let ret = this.hooks[event].original.call(obj, ...args);

                    try {
                        this.trigger(event, 'post', [...args], ret);
                    } catch(e) {
                        console.log(`error in post hooked function ${method}`, e);
                    }

                    return ret;
                }
            }
        }
    }

    static handle_mouse_event(event) {
        if(event.type == "mouseout") {
            if((event.toElement == null || event.toElement == document.documentElement) && event.fromElement.id == "content") {
                if(Events.dragging)
                    Events.dragging.dragging = false;
                if(Events.resizing)
                    Events.resizing.resizing = false;
                Events.dragging = false;
                Events.resizing = false;
                Events.direction = false;
                Blocks.resizing = false;
                Blocks.dragging = false;
            }
        }

        if(event.target.classList.contains('resizer')) {
            if(event.type == "mousedown") {
                let stat = event.composedPath().find(n => n.classList && n.classList.contains('stat'));
                Events.resizing = Blocks.get(stat.id);
                Events.resizing.resizing = true;
                let [ _, direction ] = [...event.target.classList];
                Events.direction = direction;
                Blocks.resizing = true;
                Blocks.direction = direction;
            }
        }

        if(event.type == "mouseup" && Events.resizing) {
            Events.resizing.resizing = false;
            Events.resizing = false;
            Events.direction = false;
            Blocks.resizing = false;
            Blocks.direction = false;
            Blocks.redraw();
        }

        if(event.type == "mousemove" && Events.resizing) {
            let { type, target } = event;
            if(event.x == 0 && event.y == 0)
                return;

            let x = event.x;
            let y = event.y;

            y -= content.offsetTop;

            x = Math.max(0, x);
            y = Math.max(0, y);

            let gridX = Math.round(x/(GRID_SIZE + GRID_GAP));
            let gridY = Math.round(y/(GRID_SIZE + GRID_GAP));

            let { x: oX, y: oY, h: oH, w: oW } = Events.resizing;
            let { x: nX, y: nY, h: nH, w: nW } = Events.resizing;

            if((Events.direction == "top" || Events.direction == "top-left" || Events.direction == "top-right") && gridY > 0) {
                nY = gridY;
                nH = oH + (oY - nY);
            }

            if(Events.direction == "bottom" || Events.direction == "bottom-left" || Events.direction == "bottom-right") {
                nH = gridY - oY + 1;
            }

            if((Events.direction == "left" || Events.direction == "top-left" || Events.direction == "bottom-left") && gridX > 0) {
                nX = gridX;
                nW = oW + (oX - nX);
            }

            if(Events.direction == "right" || Events.direction == "top-right" || Events.direction == "bottom-right") {
                nW = gridX - oX + 1;
            }

            Events.resizing.resize(nH, nW, nX, nY);
        }

        if(event.type == "mousedown") {
            let stat = event.composedPath().find(n => n.classList && n.classList.contains('stat-title'));
            if(stat && !document.body.classList.contains('locked')) {
                Events.dragging = Blocks.get(stat.parentNode.id);
                Events.dragging.dragging = true;
                Events.dragging.z = Blocks.top() + 1;
                Blocks.dragging = true;


                const rect = stat.getBoundingClientRect();

                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;

                Events.offsetX = x;
                Events.offsetY = y;
                
            }
        }

        if(event.type == "mousemove" && Events.dragging) {
            let { type, target } = event;
            if(event.x == 0 && event.y == 0)
                return;

            let x = event.clientX - Events.offsetX;
            let y = event.clientY - Events.offsetY;

            y -= content.offsetTop;

            x = Math.max(0, x);
            y = Math.max(0, y);

            let gridX = Math.round(x/(GRID_SIZE + GRID_GAP));
            let gridY = Math.round(y/(GRID_SIZE + GRID_GAP));
            
            Events.dragging.move(gridX, gridY);
        }

        if(event.type == "mouseup" && Events.dragging) {
            Events.dragging.dragging = false;
            Events.dragging = false;
            Blocks.dragging = false;
            Blocks.redraw();
        }
        
        if(event.type == "mousedown") {
            let stat = event.composedPath().find(el => el.classList && el.classList.contains('stat'));
            if(stat && !document.body.classList.contains('locked')) {
                Blocks.get(stat.id).z = Blocks.top() + 1;
                Blocks.redraw();
            }

            let dropdowns = document.querySelectorAll('.dropdown.open');
            [...dropdowns].forEach(dropdown => {
                if(!dropdown.contains(event.target))
                    dropdown.classList.remove('open')
            });
        }

        if(event.type == "dragstart" && event.target.classList && event.target.classList.contains('draggable')) {
            let $list = event.composedPath().find(el => el.classList && el.classList.contains('list'));
            let $list_item = event.composedPath().find(el => el.classList && el.classList.contains('list-item'));
            $list_item.classList.add('dragging');
            [...$list.children].forEach((item, i) => {
                item.dataset.idx = i;
            });
        }

        if(event.type == "drop") {
            Events.handle_list_reorder(event, true);
        }

        if(event.type == "dragover") {
            Events.handle_list_reorder(event, false);
        }

        if(event.type == "mouseover" || event.type == "mouseout" || event.type == "mousemove") {
            let tooltip = event.composedPath().find(el => el && el.dataset && el.dataset.tooltip);
            if(event.type == "mouseover" && tooltip)
                Events.showTT(tooltip.dataset.tooltip);
            if(event.type == "mousemove" && tooltip)
                Events.moveTT(event.screenX, event.screenY);
            if((event.type == "mouseover" || event.type == "mouseout") && !tooltip)
                Events.hideTT();
        }
    }

    static handle_text_update(event) {
        let entry = event.target;
        
        let stat = event.composedPath().find(el => el.classList && el.classList.contains('stat'));
        let config = event.composedPath().find(el => el.classList && el.classList.contains('config'));
        let list_item = event.composedPath().find(el => el.classList && el.classList.contains('list-item'));
        let list = event.composedPath().find(el => el.classList && el.classList.contains('list'));

        //console.log(stat.id, config.dataset.config, entry.value);

        Events.handle_config_update(stat.id, config.dataset.config, entry.value);
    }

    static handle_dropdown_update(event) {
        let entry = event.target;
        
        let stat = event.composedPath().find(el => el.classList && el.classList.contains('stat'));
        let config = event.composedPath().find(el => el.classList && el.classList.contains('config'));
        let list_item = event.composedPath().find(el => el.classList && el.classList.contains('list-item'));
        let list = event.composedPath().find(el => el.classList && el.classList.contains('list'));

        Events.handle_config_update(stat.id, config.getAttribute('data-config'), entry.getAttribute('data-id'), list && [...list.children].indexOf(list_item));
    }

    static handle_list_add(event) {
        let entry = event.target;
        
        let stat = event.composedPath().find(el => el.classList && el.classList.contains('stat'));
        let config = event.composedPath().find(el => el.classList && el.classList.contains('config'));
        let list_item = event.composedPath().find(el => el.classList && el.classList.contains('list-item'));
        let list = event.composedPath().find(el => el.classList && el.classList.contains('list'));

        let options = Blocks.get(stat.id).constructor[config.getAttribute('data-config')];
        let cfg = Blocks.get(stat.id)[config.getAttribute('data-config')];
        if(options.length > 0) {
            let def = options[0].id;
            cfg.push(def);
        }

        Events.handle_config_update(stat.id, config.getAttribute('data-config'), cfg);
    }

    static handle_list_delete(event) {
        let entry = event.target;
        
        let stat = event.composedPath().find(el => el.classList && el.classList.contains('stat'));
        let config = event.composedPath().find(el => el.classList && el.classList.contains('config'));
        let list_item = event.composedPath().find(el => el.classList && el.classList.contains('list-item'));
        let list = event.composedPath().find(el => el.classList && el.classList.contains('list'));

        let cfg = Blocks.get(stat.id)[config.getAttribute('data-config')];

        cfg.splice([...list.children].indexOf(list_item), 1);

        Events.handle_config_update(stat.id, config.getAttribute('data-config'), cfg);
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

                    let cfg = Blocks.get(stat.id)[config.getAttribute('data-config')];

                    let new_list = [...$list.children].filter($el => !$el.classList.contains('hide')).map($el => {
                        let [ $draggable, $dropdown, $delete ] = [...$el.children];
                        let [ $current, $entries ] = [...$dropdown.children];
                        return $current.dataset.id;
                    });
                    Events.handle_config_update(stat.id, config.getAttribute('data-config'), new_list);
                }
            }
            if(drop)
                $dragging_item.classList.remove('dragging');
        }
    }

    static handle_config_update(id, prop, value, idx=-1) {
        let block = Blocks.get(id);
        if(prop == 'type') { // special case here :)
            block = Blocks.change_type(id, value);
        } else {
            block.update_property(prop, value, idx);
        }
        block.update_config();
    }

    static hideDebounce = false;

    static showTT(html) {
        if(!Events.tt.window.showTT)
            return;
        if(this.hideDebounce)
            clearTimeout(this.hideDebounce);
        Events.tt.window.showTT(html);
    }

    static hideTT() {
        if(!Events.tt.window.hideTT)
            return;
        if(this.hideDebounce)
            clearTimeout(this.hideDebounce);

        this.hideDebounce = setTimeout(() => Events.tt.window.hideTT(), 25);
    }

    static moveTT(x, y) {
        if(!Events.tt.window.moveTT)
            return;
        Events.tt.window.moveTT(x + 8, y + 8);
    }
}