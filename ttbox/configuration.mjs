import { createElement } from "./helpers.mjs";

export default class Configuration {
    constructor() { if(this.constructor) return this.constructor; }

    static render_property(id, block, current, $el) {
        if(typeof block.constructor[id] == 'object' && Array.isArray(block.constructor[id])) {
            return this.render_dropdown(id, block, current, block.constructor[id], $el)
        }
        if(typeof block.constructor[id] == 'undefined') {
            return this.render_text(id, block, current, $el)
        }
    }

    static render_text(id, block, current, $el) {
        if(!$el)
            $el = createElement('input', {
                attributes: [['type', 'text'], ['value', current], ['onchange', 'TTEvents.handle_text_update(event);']]
            });
        return $el;
    }

    static render_dropdown(id, block, current, options, $el) {
        if(!$el)
            $el = createElement('div', {
                classList:  ['dropdown'],
                attributes: [['onclick', 'this.classList.toggle("open");']],
                children: [
                    createElement('div', {
                        classList: ['dropdown-entry'],
                        text: current.name,
                        attributes: [['data-id', current.id]]
                    }),
                    createElement('div', {
                        classList: ['dropdown-content'],
                        children: options.map(item => createElement('div', {
                            classList: ['dropdown-entry'],
                            text: item.name,
                            attributes: [['data-id', item.id], ['onclick', 'TTEvents.handle_dropdown_update(event);']]
                        }))
                    })
                ]
            });
        
        let [ $current, $entries ] = [...$el.children];
        if($current.getAttribute('data-id') != current.id) {
            $current.setAttribute('data-id', current.id);
            $current.textContent = current.name;
        }
        [...$entries.children].forEach(entry => {
            entry.classList.toggle('hide', entry.getAttribute('data-id') == current.id);
        });
        
        return $el;
    }
    
    static render_list(id, name, block, $el) {
        if(!$el)
            $el = createElement('div', {
                classList: ['config', 'config-'+id],
                attributes: [['data-config', id]],
                children: [
                    createElement('span', {
                        text: name
                    }),
                    createElement('div', {
                        classList: ['list-container'],
                        children: [
                            createElement('div', {
                                classList: ['list']
                            }),
                            createElement('div', {
                                classList: ['add'],
                                attributes: [['onclick', 'TTEvents.handle_list_add(event);']],
                                children: [
                                    createElement('span', { classList: ['icon-plus'] })
                                ]
                            })
                        ]
                    })
                ]
            });

        let [ $label, $list_container ] = [...$el.children];
        let [ $list_ul, $add_list ] = [...$list_container.children];

        let max = Math.max($list_ul.children.length, block[id].length);
        let items = block[id].map(p => block.constructor[id].find(pr => pr.id == p));

        for(let i=0; i<max; i++) {
            let $item = $list_ul.children[i];
            if(!$item) {
                $item = createElement('div', {
                    classList: ['list-item'],
                    children: [
                        createElement('div', {
                            classList: ['draggable'],
                            attributes: [['draggable', true]],
                            children: [
                                createElement('span', { classList: ['icon-menu'] })
                            ]
                        }),
                        Configuration.render_property(id, block, items[i]),
                        createElement('div', {
                            classList: ['delete'],
                            children: [
                                createElement('span', { classList: ['icon-minus'] })
                            ],
                            attributes: [['onclick', 'TTEvents.handle_list_delete(event);']]
                        })
                    ],
                    parent: $list_ul
                });
            }

            let item = items[i];
            if(!item) {
                $item.classList.add('hide');
            } else {
                $item.classList.remove('hide');
                let [ $draggable, $property, $delete ] = [...$item.children];
                $property = Configuration.render_property(id, block, item, $property);
            }
        }

        return $el;
    }
}