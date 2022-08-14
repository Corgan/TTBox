import BlockManager from '../block_manager.mjs';
import { createElement } from './../helpers.mjs';

export default class StatBlock {
    static blacklist = ['collapsed', 'dragging', 'resizing', 'configuring', 'h', 'w', 'x', 'y', 'z']
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
                        }),
                        createElement('span', {
                            classList: ['title-configure', 'icon-tools'],
                            attributes: [
                                ['onclick', `BlockManager.get("${id}").configure();`]
                            ]
                        })
                    ]
                })
            ]
        });

        this.$content = createElement('div', {
            classList: ['stat-content'],
            parent: this.$el
        });

        this.$config = createElement('div', {
            classList: ['stat-config'],
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
        this.configuring = false;
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
        ret.id = this.id || "block_" + Math.floor(Math.random()*1000);
        ret.title = this.title || "Stat Block";
        ret.x = this.x || 1;
        ret.y = this.y || 1;
        ret.w = this.w || 10;
        ret.h = this.h || 10;
        ret.z = this.z || 0;
        ret.collapsed = this.collapsed || false;
        ret.type = this.constructor.name;
        return ret;
    }
    load(data) {
        this.id = data.id || "block_" + Math.floor(Math.random()*1000);
        this.title = data.title || "Stat Block";
        this.x = data.x || 1;
        this.y = data.y || 1;
        this.w = data.w || 10;
        this.h = data.h || 10;
        this.z = data.z || 0;
        this.collapsed = data.collapsed || false;
    }
    redraw() {
        this.$el.style.gridRowStart = this.y;
        this.$el.style.gridRowEnd = this.y + (this.collapsed ? 3 : this.h);
        this.$el.style.gridColumnStart = this.x;
        this.$el.style.gridColumnEnd = this.x + this.w;
        this.$el.style.zIndex = this.z;

        this.$el.classList.toggle('dragging', this.dragging);
        this.$el.classList.toggle('resizing', this.resizing);
        this.$el.classList.toggle('configuring', this.configuring);
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
        if(this.collapsed) {
            this.collapsed = false;
        } else {
            this.collapsed = true;
        }
        BlockManager.redraw();
    }
    update_config() {
        let $children = [...this.$config.children];
        let $id = $children.find(el => el.classList.contains('config-id'));
        if(!$id)
            $id = createElement('div', {
                parent: this.$config,
                classList: ['config', 'config-id'],
                attributes: [['data-config', 'id']],
                children: [
                    createElement('span', {
                        text: "ID"
                    }),
                    createElement('input', {
                        attributes: [['type', 'text'], ['value', this.id]]
                    })
                ]
            });

        let $title = $children.find(el => el.classList.contains('config-title'));
        if(!$title)
            $title = createElement('div', {
                parent: this.$config,
                classList: ['config', 'config-title'],
                attributes: [['data-config', 'title']],
                children: [
                    createElement('span', {
                        text: "Title"
                    }),
                    createElement('input', {
                        attributes: [['type', 'text'], ['value', this.title]],
                        parent: this.$config
                    })
                ]
            });
    }
    configure(e, bool=!this.configuring) {
        if(!this.collapsed) {
            this.configuring = bool;
            this.update_config();
        }
        BlockManager.redraw();
    }
}