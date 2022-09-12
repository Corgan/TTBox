import TTBox from '../ttbox.mjs';
import Blocks from '../modules/blocks.mjs';
import { createElement } from './../helpers.mjs';
import Configuration from '../configuration.mjs';

export default class StatBlock {
    static type = 'Stat Block';
    static blacklist = ['collapsed', 'dragging', 'resizing', 'configuring', 'h', 'w', 'x', 'y', 'z']
    constructor({id='block_'+Math.floor(Math.random()*1000), title="Stat Block", h=10, w=15, x=1, y=1, z=999, ...args}) {
        this.id = id;
        this.title = title;
        this.collapsed = false;
        this.dragging = false;
        this.resizing = false;
        this.configuring = false;
        this.initialized = false;
        this.h = h;
        this.w = w;
        this.x = x;
        this.y = y;
        this.z = z || 0;
        this.hooked = false;
        this.hooks = [];
    }
    init() {
        if(!this.$el)
            this.$el = createElement('div', {
                id: this.id,
                classList: ['stat', Blocks.reverseLookup[this.constructor.name]],
                parent: document.getElementById('content')
            });

        if(!this.$title)
            this.$title = createElement('div', {
                classList: ['stat-title'],
                parent: this.$el,
                children: [
                    createElement('div', {
                        classList: ['left'],
                        children: [
                            createElement('span', {
                                classList: ['title-collapse', 'icon-eye2'],
                                attributes: [
                                    ['onclick', `TTBlocks.get("${this.id}").toggle();`]
                                ]
                            })
                        ]
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
                                classList: ['title-configure', 'icon-tools'],
                                attributes: [
                                    ['onclick', `TTBlocks.get("${this.id}").configure();`]
                                ]
                            }),
                            createElement('span', {
                                classList: ['title-configure', 'icon-cancel-circle'],
                                attributes: [
                                    ['onclick', `TTBlocks.delete("${this.id}");`]
                                ]
                            })
                        ]
                    })
                ]
            });

        if(!this.$content)
            this.$content = createElement('div', {
                classList: ['stat-content'],
                parent: this.$el
            });

        if(!this.$config)
            this.$config = createElement('div', {
                classList: ['stat-config'],
                parent: this.$el
            });

        if(!this.$resizers)
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

        this.redraw();
    }
    update() {
        
    }
    delete() {
        this.$el.innerHTML = '';
        document.getElementById('content').removeChild(this.$el);
        this.hooks.forEach(hook => {
            hook.remove();
        });
        Object.keys(this).forEach(key => delete this[key]);
        this.load();
        this.dragging = false;
        this.resizing = false;
        this.configuring = false;
        this.initialized = false;
        this.hooked = false;
        this.hooks = [];
    }
    save() {
        let ret = {};
        ret.id = this.id || "block_" + Math.floor(Math.random()*1000);
        ret.title = this.title || "Stat Block";
        ret.x = this.x || 1;
        ret.y = this.y || 1;
        ret.w = this.w || 15;
        ret.h = this.h || 10;
        ret.z = this.z || 0;
        ret.collapsed = this.collapsed || false;
        ret.type = this.constructor.name;
        return ret;
    }
    load(data={}) {
        this.id = data.id || this.id || "block_" + Math.floor(Math.random()*1000);
        this.title = data.title || this.title || "Stat Block";
        this.x = data.x || this.x || 1;
        this.y = data.y || this.y || 1;
        this.w = data.w || this.w || 15;
        this.h = data.h || this.h || 10;
        this.z = data.z || this.z || 0;
        this.collapsed = data.collapsed || this.collapsed || false;
    }
    redraw() {
        this.$el.style.gridRowStart = this.y;
        this.$el.style.gridRowEnd = this.y + (this.collapsed ? 3 : this.h);
        this.$el.style.gridColumnStart = this.x;
        this.$el.style.gridColumnEnd = this.x + this.w;
        this.$el.style.zIndex = this.z;

        let [ $left, $center, $right, ] = [...this.$title.children];
        let [ $title ] = [...$center.children];
        $title.textContent = this.title;

        this.$el.classList.toggle('dragging', this.dragging);
        this.$el.classList.toggle('resizing', this.resizing);
        this.$el.classList.toggle('configuring', this.configuring);
        if(this.resizing) {
            gameWindow.swapClass('direction', 'direction-' + Blocks.direction, this.$el);
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
        if(Blocks.locked)
            return;
            
        this.x = Math.max(1, x);
        this.y = Math.max(1, y);

        Blocks.redraw();
    }
    resize(h, w, x=this.x, y=this.y) {
        if(h == this.h && w == this.w && x == this.x && y == this.y)
            return;
        if(this.collapsed || Blocks.locked)
            return;

        this.x = Math.max(1, x);
        this.y = Math.max(1, y);

        this.h = Math.max(1, h);
        this.w = Math.max(1, w);

        Blocks.redraw();
    }
    toggle(e) {
        if(this.collapsed) {
            this.collapsed = false;
        } else {
            this.collapsed = true;
        }
        Blocks.redraw();
    }

    update_property(prop, value, idx=-1) {
        if(prop == 'id') {
            let updated = { ...this.save(), id: value };
            this.delete();
            this.configuring = true;
            this.load(updated);
            this.init();
            this.update_config();
            this.redraw();
            return true;
        }

        if(this[prop] !== undefined) {
            if(idx > -1 && this[prop][idx])
                this[prop][idx] = value;
            else
                this[prop] = value;
            this.update_config();
            this.redraw();
            return true;
        }

        return false;
    }
    update_config() {
        let $children = [...this.$config.children];
        let $type = $children.find(el => el.classList.contains('config-type'));
        let options = [...Object.values(Blocks.lookup)].map(block => ({ id: block, name: Blocks.byClass[block].type }));
        if(!$type)
            $type = createElement('div', {
                parent: this.$config,
                classList: ['config', 'config-type'],
                attributes: [['data-config', 'type']],
                children: [
                    createElement('span', {
                        text: "Type"
                    }),
                    Configuration.render_dropdown('type', this, options.find(option => option.id == this.constructor.name) || { id: 'StatBlock', name: "Stat Block" }, options)
                ]
            });

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
                    Configuration.render_text('id', this, this.id)
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
                    Configuration.render_text('title', this, this.title)
                ]
            });
    }
    configure(e, bool=!this.configuring) {
        if(!this.collapsed) {
            this.configuring = bool;
            this.update_config();
        }
        Blocks.redraw();
    }
}