import BlockManager from './block_manager.mjs';
import { createElement } from './helpers.mjs';

const GRID_SIZE = 5;
const GRID_GAP = 5;

export default class EventManager {
    constructor() { return this.constructor; }
    static start(tt) {
        this.tt = tt;
        this.dragging = false;
        document.body.addEventListener('dragstart', this.handle_event, true);
        document.body.addEventListener('dragover', this.handle_event, true);
        document.body.addEventListener('drop', this.handle_event, true);
        document.body.addEventListener('mouseup', this.handle_event, true);
        document.body.addEventListener('mouseover', this.handle_event, true);
        document.body.addEventListener('mouseenter', this.handle_event, true);
        document.body.addEventListener('mouseout', this.handle_event, true);
        document.body.addEventListener('mousemove', this.handle_event, true);
        document.body.addEventListener('mousedown', this.handle_event, true);
    }

    static handle_event(event) {
        if(event.type == "mouseout") {
            if((event.toElement == null || event.toElement == document.documentElement) && event.fromElement.id == "content") {
                if(this.dragging)
                    this.dragging.dragging = false;
                if(this.resizing)
                    this.resizing.resizing = false;
                this.dragging = false;
                this.resizing = false;
                this.direction = false;
                BlockManager.resizing = false;
                BlockManager.dragging = false;
            }
        }

        if(event.target.classList.contains('resizer')) {
            if(event.type == "mousedown") {
                let stat = event.composedPath().find(n => n.classList && n.classList.contains('stat'));
                this.resizing = BlockManager.get(stat.id);
                this.resizing.resizing = true;
                let [ _, direction ] = [...event.target.classList];
                this.direction = direction;
                BlockManager.resizing = true;
                BlockManager.direction = direction;
            }
        }

        if(event.type == "mouseup" && this.resizing) {
            this.resizing.resizing = false;
            this.resizing = false;
            this.direction = false;
            BlockManager.resizing = false;
            BlockManager.direction = false;
            BlockManager.redraw();
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
                this.dragging = BlockManager.get(stat.parentNode.id);
                this.dragging.dragging = true;
                this.dragging.z = BlockManager.top() + 1;
                BlockManager.dragging = true;


                const rect = stat.getBoundingClientRect();

                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;

                EventManager.offsetX = x;
                EventManager.offsetY = y;
            }
        }

        if(event.type == "mousemove" && this.dragging) {
            let { type, target } = event;
            if(event.x == 0 && event.y == 0)
                return;

            let x = event.clientX - EventManager.offsetX;
            let y = event.clientY - EventManager.offsetY;

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
            BlockManager.dragging = false;
            BlockManager.redraw();
        }
        
        if(event.type == "mousedown") {
            let stat = event.composedPath().find(el => el.classList && el.classList.contains('stat'));
            if(stat && !document.body.classList.contains('locked')) {
                BlockManager.get(stat.id).z = BlockManager.top() + 1;
                BlockManager.redraw();
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
            BlockManager.handle_list_reorder(event, true);
        }

        if(event.type == "dragover") {
            BlockManager.handle_list_reorder(event, false);
        }

        if(event.target.getAttribute('data-tooltip')) {
            if(event.type == "mouseover")
                EventManager.showTT(event);
            if(event.type == "mouseout")
                EventManager.hideTT(event);
            if(event.type == "mousemove")
                EventManager.moveTT(event);
        }
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