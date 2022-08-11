import BlockManager from '../block_manager.mjs';
import { createElement } from './../helpers.mjs';

export default class StatBlock {
    constructor({id='block', title="Stat Block", h=1, w=1, x=1, y=1, z=1, ...args}) {
        this.$el = createElement('div', {
            id: id,
            classList: ['stat'],
            parent: document.getElementById('content')
        });

        this.$title = createElement('div', {
            classList: ['stat-title'],
            parent: this.$el,
            children: [
                createElement('div', {
                    classList: ['left']
                }),
                createElement('div', {
                    classList: ['center'],
                    children: [
                        createElement('span', {
                            text: title,
                        }),
                    ]
                }),
                createElement('div', {
                    classList: ['right'],
                    children: [
                        createElement('span', {
                            classList: ['title-collapse', 'icon-eye2'],
                            attributes: [
                                ['onclick', `BlockManager.get("${id}").toggle();`]
                            ]
                        })
                    ]
                }),
            ]
        });

        this.$content = createElement('div', {
            classList: ['stat-content'],
            parent: this.$el
        });

        this.$resizers = createElement('div', {
            classList: ['resizers'],
            parent: this.$el,
            children: [
                createElement('div', { classList: ['resizer', 'top-left'] }),
                createElement('div', { classList: ['resizer', 'top'] }),
                createElement('div', { classList: ['resizer', 'top-right'] }),
                createElement('div', { classList: ['resizer', 'right'] }),
                createElement('div', { classList: ['resizer', 'bottom-right'] }),
                createElement('div', { classList: ['resizer', 'bottom'] }),
                createElement('div', { classList: ['resizer', 'bottom-left'] }),
                createElement('div', { classList: ['resizer', 'left'] })
            ]
        });

        this.id = id;
        this.title = title;
        this.collapsed = false;
        this.dragging = false;
        this.resizing = false;
        this.predragX = x;
        this.predragY = y;
        this.h = h;
        this.w = w;
        this.x = x;
        this.y = y;
        this.z = z || 0;
    }
    init() {
        this.redraw();
    }
    update() {
        
    }
    save() {
        let ret = {};
        ret.id = this.id;
        ret.title = this.title;
        ret.x = this.x;
        ret.y = this.y;
        ret.w = this.w;
        ret.h = this.h;
        ret.z = this.z;
        ret.collapsed = this.collapsed;
        ret.type = this.constructor.name;
        return ret;
    }
    load(data) {
        this.id = data.id;
        this.title = data.title;
        this.x = data.x;
        this.y = data.y;
        this.w = data.w;
        this.h = data.h;
        this.z = data.z;
        this.collapsed = data.collapsed;
    }
    redraw() {
        this.$el.style.gridRowStart = this.y;
        this.$el.style.gridRowEnd = this.y + (this.collapsed ? 3 : this.h);
        this.$el.style.gridColumnStart = this.x;
        this.$el.style.gridColumnEnd = this.x + this.w;
        this.$el.style.zIndex = this.z;

        this.$el.classList.toggle('dragging', this.dragging);
        this.$el.classList.toggle('resizing', this.resizing);
        if(this.resizing) {
            gameWindow.swapClass('direction', 'direction-' + BlockManager.direction, this.$el);
        } else {
            gameWindow.swapClass('direction', 'direction-none', this.$el);
        }

        this.$el.classList.toggle('collapsed', this.collapsed);
        if(this.collapsed) {
            let $collapse = this.$title.querySelector('.title-collapse');
            this.$content.classList.add('hide');
            $collapse.classList.remove('icon-eye2');
            $collapse.classList.add('icon-eye-blocked');
        } else {
            let $collapse = this.$title.querySelector('.title-collapse');
            this.$content.classList.remove('hide');
            $collapse.classList.remove('icon-eye-blocked');
            $collapse.classList.add('icon-eye2');
        }
    }
    move(x, y) {
        if(x == this.x && y == this.y)
            return;
        if(BlockManager.locked)
            return;
            
        this.x = Math.max(1, x);
        this.y = Math.max(1, y);

        BlockManager.redraw();
    }
    resize(h, w, x=this.x, y=this.y) {
        if(h == this.h && w == this.w && x == this.x && y == this.y)
            return;
        if(this.collapsed || BlockManager.locked)
            return;

        this.x = Math.max(1, x);
        this.y = Math.max(1, y);

        this.h = Math.max(1, h);
        this.w = Math.max(1, w);

        BlockManager.redraw();
    }
    toggle(e) {
        let $collapse = this.$title.querySelector('.title-collapse');
        if(this.collapsed) {
            this.collapsed = false;
        } else {
            this.collapsed = true;
        }
        BlockManager.redraw();
    }
}