import TTBox from '../ttbox.mjs';
import TTModule from './module.mjs';

import { createElement, getTT } from './../helpers.mjs';

const GRID_SIZE = 5;
const GRID_GAP = 5;

export default class Events extends TTModule {
    constructor() { super(); }
    static id = 'events';
    static running = false;
    static async start() {
        await super.start(...arguments);
        this.tt = await getTT();
        this.dragging = false;
        this.resizing = false;
        this.direction = false;

        document.body.addEventListener('dragstart', this.handle_mouse_event, true);
        document.body.addEventListener('dragover', this.handle_mouse_event, true);
        document.body.addEventListener('drop', this.handle_mouse_event, true);
        document.body.addEventListener('mouseup', this.handle_mouse_event, true);
        document.body.addEventListener('mouseover', this.handle_mouse_event, true);
        document.body.addEventListener('mouseenter', this.handle_mouse_event, true);
        document.body.addEventListener('mouseout', this.handle_mouse_event, true);
        document.body.addEventListener('mousemove', this.handle_mouse_event, true);
        document.body.addEventListener('mousedown', this.handle_mouse_event, true);

        this.tt.window.location.reload();
    }

    static handle_mouse_event(event) {
        if(event.type == "mouseout") {
            if((event.toElement == null || event.toElement == document.documentElement) && event.fromElement.id == "content") {
                if(this.dragging)
                    this.dragging.dragging = false;
                if(this.resizing)
                    this.resizing.resizing = false;
                this.dragging = false;
                this.resizing = false;
                this.direction = false;
                TTBox.get('blocks').resizing = false;
                TTBox.get('blocks').dragging = false;
            }
        }

        if(event.target.classList.contains('resizer')) {
            if(event.type == "mousedown") {
                let stat = event.composedPath().find(n => n.classList && n.classList.contains('stat'));
                this.resizing = TTBox.get('blocks').get(stat.id);
                this.resizing.resizing = true;
                let [ _, direction ] = [...event.target.classList];
                this.direction = direction;
                TTBox.get('blocks').resizing = true;
                TTBox.get('blocks').direction = direction;
            }
        }

        if(event.type == "mouseup" && this.resizing) {
            this.resizing.resizing = false;
            this.resizing = false;
            this.direction = false;
            TTBox.get('blocks').resizing = false;
            TTBox.get('blocks').direction = false;
            TTBox.get('blocks').redraw();
        }

        if(event.type == "mousemove" && this.resizing) {
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

            let { x: oX, y: oY, h: oH, w: oW } = this.resizing;
            let { x: nX, y: nY, h: nH, w: nW } = this.resizing;

            if((this.direction == "top" || this.direction == "top-left" || this.direction == "top-right") && gridY > 0) {
                nY = gridY;
                nH = oH + (oY - nY);
            }

            if(this.direction == "bottom" || this.direction == "bottom-left" || this.direction == "bottom-right") {
                nH = gridY - oY + 1;
            }

            if((this.direction == "left" || this.direction == "top-left" || this.direction == "bottom-left") && gridX > 0) {
                nX = gridX;
                nW = oW + (oX - nX);
            }

            if(this.direction == "right" || this.direction == "top-right" || this.direction == "bottom-right") {
                nW = gridX - oX + 1;
            }

            this.resizing.resize(nH, nW, nX, nY);
        }

        if(event.type == "mousedown") {
            let stat = event.composedPath().find(n => n.classList && n.classList.contains('stat-title'));
            if(stat && !document.body.classList.contains('locked')) {
                this.dragging = TTBox.get('blocks').get(stat.parentNode.id);
                this.dragging.dragging = true;
                this.dragging.z = TTBox.get('blocks').top() + 1;
                TTBox.get('blocks').dragging = true;


                const rect = stat.getBoundingClientRect();

                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;

                TTBox.get('events').offsetX = x;
                TTBox.get('events').offsetY = y;
            }
        }

        if(event.type == "mousemove" && this.dragging) {
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

            this.dragging.move(gridX, gridY);
        }

        if(event.type == "mouseup" && this.dragging) {
            this.dragging.dragging = false;
            this.dragging = false;
            TTBox.get('blocks').dragging = false;
            TTBox.get('blocks').redraw();
        }
        
        if(event.type == "mousedown") {
            let stat = event.composedPath().find(el => el.classList && el.classList.contains('stat'));
            if(stat && !document.body.classList.contains('locked')) {
                TTBox.get('blocks').get(stat.id).z = TTBox.get('blocks').top() + 1;
                TTBox.get('blocks').redraw();
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
            TTBox.get('blocks').handle_list_reorder(event, true);
        }

        if(event.type == "dragover") {
            TTBox.get('blocks').handle_list_reorder(event, false);
        }

        if(event.target.getAttribute('data-tooltip')) {
            if(event.type == "mouseover")
                TTBox.get('events').showTT(event);
            if(event.type == "mouseout")
                TTBox.get('events').hideTT(event);
            if(event.type == "mousemove")
                TTBox.get('events').moveTT(event);
        }
    }

    static handle_list_update(event) {
        let entry = event.target;
        
        let stat = event.composedPath().find(el => el.classList && el.classList.contains('stat'));
        let config = event.composedPath().find(el => el.classList && el.classList.contains('config'));
        let list_item = event.composedPath().find(el => el.classList && el.classList.contains('list-item'));
        let list = event.composedPath().find(el => el.classList && el.classList.contains('list'));

        TTBox.get('events').handle_config_update(stat.id, config.getAttribute('data-config'), entry.getAttribute('data-id'), [...list.children].indexOf(list_item));
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

        TTBox.get('events').handle_config_update(stat.id, config.getAttribute('data-config'), cfg);
    }

    static handle_list_delete(event) {
        let entry = event.target;
        
        let stat = event.composedPath().find(el => el.classList && el.classList.contains('stat'));
        let config = event.composedPath().find(el => el.classList && el.classList.contains('config'));
        let list_item = event.composedPath().find(el => el.classList && el.classList.contains('list-item'));
        let list = event.composedPath().find(el => el.classList && el.classList.contains('list'));

        let cfg = Blocks.get(stat.id)[config.getAttribute('data-config')];

        cfg.splice([...list.children].indexOf(list_item), 1);

        TTBox.get('events').handle_config_update(stat.id, config.getAttribute('data-config'), cfg);
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
                    TTBox.get('events').handle_config_update(stat.id, config.getAttribute('data-config'), new_list);
                }
            }
            if(drop)
                $dragging_item.classList.remove('dragging');
        }
    }

    static handle_config_update(id, prop, value, idx=-1) {
        let block = Blocks.get(id);
        if(block[prop]) {
            if(idx > -1 && block[prop][idx])
                block[prop][idx] = value;
            else
                block[prop] = value;
        }
        block.update_config();
    }

    static showTT(event) {
        if(!this.tt.window.showTT)
            return;
        let html = event.target.getAttribute('data-tooltip');
        this.tt.window.showTT(html);
    }

    static hideTT(event) {
        if(!this.tt.window.hideTT)
            return;
        this.tt.window.hideTT();
    }

    static moveTT(event) {
        if(!this.tt.window.moveTT)
            return;
        let { x, y, screenX, screenY } = event;
        let { height, width } = this.tt;
        this.tt.window.moveTT(screenX + 8, screenY + 8);
    }
}