import TTModule from './module.mjs';
import TTBox from './../ttbox.mjs';
import Events from './events.mjs';
import { createElement } from './../helpers.mjs';

// Base Classes
class BMaZVariable {
    static type = 'default';
    constructor({name, key, value, defaultValue, ...args}={}) {
        Object.defineProperty(this, '_value', { enumerable: false, writable: true });
        Object.defineProperty(this, '_update', { enumerable: false, writable: true, value: true });
        Object.defineProperty(this, '$el', { enumerable: false, writable: true, configurable: true });
        Object.defineProperty(this, '_listeners', { enumerable: false, writable: true, value: [] });

        

        this.name = name;
        this.key = key;
        this.defaultValue = defaultValue;

        // Let's load any extra params in before setting value, since value getter gets overridden by subclasses
        Object.entries(args).forEach(([k,v]) => this[k] = v);

        this.value = value === undefined ? this.defaultValue : value;
    }

    get value() { return this._value; }
    set value(value) { this._value = value; this._update = true; }

    on(type, fn) {
        if(this.$el) {
            this.$el.addEventListener(type, fn);
            this._listeners.push({
                type: type,
                fn: fn
            });
            return true;
        }
        return false;
    }

    save() {
        return {
            [this.key]: this.value
        }
    }

    render($parent) {
        if(!this.$el)
            this.$el = createElement('span', { text: this.value, parent: $parent });
        
        if(this._update) {
            this.$el.textContent = this.value;
            this._update = false;
        }
        return this.$el;
    }

    remove() {
        if(this.$el) {
            while(this._listeners.length > 0) {
                let listener = this._listeners.shift();
                this.$el.removeEventListener(listener.type, listener.fn);
            }
            this.$el.remove();
            this._update = true;
        }
    }
}

class BMaZBooleanVariable extends BMaZVariable {
    static type = 'boolean';
    constructor({...args}={}) {
        super(args);
    }

    get value() { return super.value; }
    set value(value) {
        super.value = !!value;
        if(this.$el) {
            let [ $title, $input ] = this.$el.children;
            $input.checked = super.value;
        }
    }

    render($parent) {
        if(!this.$el) {
            this.$el = createElement('div', {
                parent: $parent,
                classList: ['bmaz-variable', `bmaz-${this.key}`],
                children: [
                    createElement('span', { classList: ['bmaz-title'], text: this.name }),
                    createElement('input', { attributes: [['type', 'checkbox']], classList: ['bmaz-checkbox'] })
                ]
            })
            this.on('change', (event) => {
                let [ $title, $input ] = this.$el.children;
                this.value = $input.checked;
            });
        }
        
        if(this._update) {
            let [ $title, $input ] = this.$el.children;
            $input.checked = super.value;
            this._update = false;
        }
        return this.$el;
    }
}

class BMaZNumberVariable extends BMaZVariable {
    static type = 'number';
    constructor({ min=false, max=false, ...args}={}) {
        super(args);
        this.min = min;
        this.max = max;
    }

    get value() { return super.value; }
    set value(value) {
        value = parseInt(value);
        
        if(this.min)
            value = Math.max(this.min, value);
        if(this.max)
            value = Math.min(this.max, value);

        super.value = !isNaN(value) ? value : this.defaultValue || 0;
        if(this.$el) {
            let [ $title, $input ] = this.$el.children;
            $input.value = super.value;
        }
    }

    render($parent) {
        if(!this.$el) {
            this.$el = createElement('div', {
                parent: $parent,
                classList: ['bmaz-variable', `bmaz-${this.key}`],
                children: [
                    createElement('span', { classList: ['bmaz-title'], text: this.name }),
                    createElement('input', { attributes: [['type', 'number']], classList: ['bmaz-number'] })
                ]
            });
            this.on('change', (event) => {
                let [ $title, $input ] = this.$el.children;
                this.value = $input.value;
            });
        }
        
        if(this._update) {
            let [ $title, $input ] = this.$el.children;
            $input.value = super.value;
            this._update = false;
        }

        return this.$el;
    }
}

class BMaZTextVariable extends BMaZVariable {
    static type = 'text';
    constructor({...args}={}) {
        super(args);
    }

    get value() { return super.value; }
    set value(value) {
        super.value = value.toString();
        if(this.$el) {
            let [ $title, $input ] = this.$el.children;
            $input.value = super.value;
        }
    }

    render($parent) {
        if(!this.$el) {
            this.$el = createElement('div', {
                parent: $parent,
                classList: ['bmaz-variable', `bmaz-${this.key}`],
                children: [
                    createElement('span', { classList: ['bmaz-title'], text: this.name }),
                    createElement('input', { attributes: [['type', 'textbox']], classList: ['bmaz-text'] })
                ]
            })
            this.on('change', (event) => {
                let [ $title, $input ] = this.$el.children;
                this.value = $input.value;
            });
        }
        
        if(this._update) {
            let [ $title, $input ] = this.$el.children;
            $input.value = super.value;
            this._update = false;
        }
        return this.$el;
    }
}

class BMaZDropdownVariable extends BMaZVariable {
    static type = 'dropdown';
    constructor({...args}={}) {
        super(args);
    }

    get value() { return super.value; }
    set value(value) {
        let option = this.options?.find(option => option.value == value)
        if(!option)
            option = this.options?.length > 0 ? this.options[0] : { value: this.defaultValue };

        if(super.value != option.value)
            super.value = option.value;
        
        if(this.$el) {
            let [ $title, $input ] = this.$el.children;

            $input.children[0].textContent = option.name || option.value;
            $input.children[0].dataset.id = option.value;
        }
    }

    render($parent) {
        if(!this.$el) {
            let option = this.options.find(option => option.value == this.value);

            this.$el = createElement('div', {
                parent: $parent,
                classList: ['bmaz-variable', `bmaz-${this.key}`],
                children: [
                    createElement('span', { classList: ['bmaz-title'], text: this.name }),
                    createElement('div', {
                        classList:  ['bmaz-dropdown', 'dropdown'],
                        attributes: [['onclick', 'this.classList.toggle("open");']],
                        children: [
                            createElement('div', {
                                classList: ['dropdown-entry', 'dropdown-current'],
                                text: option.name || option.value,
                                attributes: [['data-id', option.value]]
                            }),
                            createElement('div', {
                                classList: ['dropdown-content'],
                                children: this.options.map(item => createElement('div', {
                                    classList: ['dropdown-entry'],
                                    text: item.name || item.value,
                                    attributes: [['data-id', item.value]]
                                }))
                            })
                        ]
                    })
                ]
            });

            this.on('click', (event) => {
                if(!event.target.classList.contains('dropdown-current')) {
                    this.value = event.target.dataset.id;
                }
            });
        }
        
        /*
        let [ $current, $entries ] = [...$el.children];
        if($current.getAttribute('data-id') != current.id) {
            $current.setAttribute('data-id', current.id);
            $current.textContent = current.name;
        }
        [...$entries.children].forEach(entry => {
            entry.classList.toggle('hide', entry.getAttribute('data-id') == current.id);
        });
        */
        
        if(this._update) {
            let [ $title, $input ] = this.$el.children;
            let option = this.options.find(option => option.value == super.value);

            $input.children[0].textContent = option.name || option.value;
            $input.children[0].dataset.id = option.value;
            this._update = false;
        }

        return this.$el;
    }
}

class Condition {
    static type = 'default';
    static registered = new Proxy([], {
        get(obj, prop) {
            if(prop in obj)
                return obj[prop];
            return obj.find(el => el.type == prop);
        },
        set(obj, prop, value) {
            if(value.prototype instanceof Condition || prop in obj)
                return Reflect.set(...arguments);
        }
    });

    constructor({...args}={}) {
        this.variables = new Proxy([], {
            get(obj, prop) {
                if(prop in obj)
                    return obj[prop];
                return obj.find(el => el.key == prop);
            },
            set(obj, prop, value) {
                if(value instanceof BMaZVariable || prop in obj)
                    return Reflect.set(...arguments);
            }
        });

        this.variables.push(new BMaZDropdownVariable({
            name: 'If',
            key: 'type',
            value: this.constructor.type,
            defaultValue: 'default',
            options: Condition.registered.map((value) => ({ name: value.display, value: value.type }))
        }));
    }

    activate(source) { }

    update(source) { }

    suspend(source) { }

    complete(source) { }

    get eligible() {
        return true;
    }

    save() {
        return {
            ...Object.assign({}, ...this.variables.map(variable => ({...variable.save()})))
        }
    }

    render($parent) {
        if(!this.$el)
            this.$el = createElement('div', { classList: ['bmaz-condition'], parent: $parent  })

        this.variables.forEach(variable => {
            variable.render(this.$el);
        });
        
        return this.$el;
    }

    remove() {
        this.variables.forEach(variable => variable.remove());
        if(this.$el) {
            this.$el.remove();
            this._update = true;
        }
    }
}

class Action {
    static type = 'default';
    static registered = new Proxy([], {
        get(obj, prop) {
            if(prop in obj)
                return obj[prop];
            return obj.find(el => el.type == prop);
        },
        set(obj, prop, value) {
            if(value.prototype instanceof Action || prop in obj)
                return Reflect.set(...arguments);
        }
    });
    constructor({...args}={}) {
        this.variables = new Proxy([], {
            get(obj, prop) {
                if(prop in obj)
                    return obj[prop];
                return obj.find(el => el.key == prop);
            },
            set(obj, prop, value) {
                if(value instanceof BMaZVariable || prop in obj)
                    return Reflect.set(...arguments);
            }
        });

        this.variables.push(new BMaZDropdownVariable({
            name: 'Then',
            key: 'type',
            value: this.constructor.type,
            defaultValue: 'default',
            options: Action.registered.map((value) => ({ name: value.display, value: value.type }))
        }));
    }

    activate(source) { }

    update(source) { }

    suspend(source) { }

    complete(source) { }

    save() {
        return {
            ...Object.assign({}, ...this.variables.map(variable => ({...variable.save()})))
        }
    }

    render($parent) {
        if(!this.$el)
            this.$el = createElement('div', { classList: ['bmaz-action'], parent: $parent  })

        this.variables.forEach(variable => {
            variable.render(this.$el);
        });
        
        return this.$el;
    }

    remove() {
        this.variables.forEach(variable => variable.remove());
        if(this.$el) {
            this.$el.remove();
            this._update = true;
        }
    }
}

class Completion {
    static type = 'default';
    static registered = new Proxy([], {
        get(obj, prop) {
            if(prop in obj)
                return obj[prop];
            return obj.find(el => el.type == prop);
        },
        set(obj, prop, value) {
            if(value.prototype instanceof Completion || prop in obj)
                return Reflect.set(...arguments);
        }
    });
    constructor({...args}={}) {
        this.variables = new Proxy([], {
            get(obj, prop) {
                if(prop in obj)
                    return obj[prop];
                return obj.find(el => el.key == prop);
            },
            set(obj, prop, value) {
                if(value instanceof BMaZVariable || prop in obj)
                    return Reflect.set(...arguments);
            }
        });

        this.variables.push(new BMaZDropdownVariable({
            name: 'Until',
            key: 'type',
            value: this.constructor.type,
            defaultValue: 'default',
            options: Completion.registered.map((value) => ({ name: value.display, value: value.type }))
        }));
    }

    activate(source) { }

    update(source) { }

    suspend(source) { }

    complete(source) { }

    get completed() {
        return true;
    }

    save() {
        return {
            ...Object.assign({}, ...this.variables.map(variable => ({...variable.save()})))
        }
    }

    render($parent) {
        if(!this.$el)
            this.$el = createElement('div', { classList: ['bmaz-completion'], parent: $parent  })

        this.variables.forEach(variable => {
            variable.render(this.$el);
        });
        
        return this.$el;
    }

    remove() {
        this.variables.forEach(variable => variable.remove());
        if(this.$el) {
            this.$el.remove();
            this._update = true;
        }
    }
}

// Conditions
class StacksCondition extends Condition {
    static type = 'stacks';
    static display = 'Stacks';
    static { Condition.registered.push(this); }
    constructor({name="", enemy=false, op="equal", amount=0, ...args}={}) {
        super({...args});
        this.variables.push(new BMaZBooleanVariable({ name: 'Enemy', key: 'enemy', value: enemy, defaultValue: false }));
        this.variables.push(new BMaZTextVariable({ name: 'Name', key: 'name', value: name, defaultValue: "" }));
        this.variables.push(new BMaZDropdownVariable({ name: 'Operator', key: 'op', value: op, defaultValue: "equal", options: [
            { name: '==', value: 'equal' },
            { name: '>', value: 'gt' },
            { name: '<', value: 'lt' }
        ]}));
        this.variables.push(new BMaZNumberVariable({ name: 'Amount', key: 'amount', value: amount, defaultValue: 0 }));
    }

    get eligible() {
        return false;
    }
}

class WorldCondition extends Condition {
    static type = 'world';
    static display = 'Zone';
    static { Condition.registered.push(this); }
    constructor({world=game.global.world, through=game.global.world, every=1, ...args}={}) {
        super({...args});
        this.variables.push(new BMaZNumberVariable({ name: 'Zone', key: 'world', value: world, min: 1, defaultValue: 1 }));
        this.variables.push(new BMaZNumberVariable({ name: 'Through', key: 'through', value: through, min: 1, defaultValue: 1 }));
        this.variables.push(new BMaZNumberVariable({ name: 'Every', key: 'every', value: every, min: 1, defaultValue: 1 }));
        this.last_completed = false;
    }

    complete(source) {
        super.complete(source);
        this.last_completed = `${gameWindow.getTotalPortals()}_${game.global.world}`;
    }

    get eligible() {
        return (
                this.variables.world.value <= game.global.world &&
                this.variables.through.value >= game.global.world &&
                ((game.global.world - this.variables.world.value) % this.variables.every.value) == 0
            ) &&
            this.last_completed != `${gameWindow.getTotalPortals()}_${game.global.world}`
    }
}

class CellCondition extends WorldCondition {
    static type = 'cell';
    static display = 'Cell';
    static { Condition.registered.push(this); }
    constructor({cell=game.global.lastClearedCell+2, ...args}={}) {
        super({...args});
        this.variables.push(new BMaZNumberVariable({ name: 'Cell', key: 'cell', value: cell, min: 1, max: 100, defaultValue: 1 }));
    }

    complete(source) {
        super.complete(source);
        this.last_completed = `${gameWindow.getTotalPortals()}_${game.global.world}_${game.global.lastClearedCell+2}`;
    }

    get eligible() {
        return this.variables.cell.value == game.global.lastClearedCell+2 &&
            (
                this.variables.world.value <= game.global.world &&
                this.variables.through.value >= game.global.world &&
                ((game.global.world - this.variables.world.value) % this.variables.every.value) == 0
            ) &&
            this.last_completed != `${gameWindow.getTotalPortals()}_${game.global.world}_${game.global.lastClearedCell+2}`
    }
}


// Actions
class MapAction extends Action {
    static type = 'cmap';
    static display = 'Run Crafted Map';

    static whitelisted = ["Mountain", "Forest", "Sea", "Depths", "Plentiful"];
    static { Action.registered.push(this); }

    constructor({biome="Random", difficulty=0, loot=0, size=0, offset=0, extra=0, specMod="0", perf=false, ...args}={}) {
        super({...args});

        Object.defineProperty(this, '_map', { enumerable: false, writable: true, value: false });

        // 0
        this.variables.push(new BMaZNumberVariable({ name: 'Offset', key: 'offset', max: 10, value: offset, defaultValue: 0 }));

        // 0, fa, lc, ssc, swc, smc, src, p, hc, lsc, lwc, lmc, lrc
        this.variables.push(new BMaZDropdownVariable({ name: 'Map Mod', key: 'specMod', value: specMod, defaultValue: '0', options: [
                { name: 'None', value: '0' },
                { name: 'Fast Attacks', value: 'fa' },
                { name: 'Large Cache', value: 'lc' },
                { name: 'Small Savory Cache', value: 'ssc' },
                { name: 'Small Wooden Cache', value: 'swc' },
                { name: 'Small Metal Cache', value: 'smc' },
                { name: 'Small Research Cache', value: 'src' },
                { name: 'Prestigious', value: 'p' },
                { name: 'Huge Cache', value: 'hc' },
                { name: 'Large Savory Cache', value: 'lsc' },
                { name: 'Large Wooden Cache', value: 'lwc' },
                { name: 'Large Metal Cache', value: 'lmc' },
                { name: 'Large Research Cache', value: 'lrc' },
            ]
        }));

        // Random, Mountain, Forest, Sea, Depths, Plentiful
        this.variables.push(new BMaZDropdownVariable({ name: 'Biome', key: 'biome', value: biome, defaultValue: 'Random', options: [
            { value: 'Random' },
            { value: 'Mountain' },
            { value: 'Forest' },
            { value: 'Sea' },
            { value: 'Depths' },
            { value: 'Plentiful' },
        ] }));

        // true/false
        this.variables.push(new BMaZBooleanVariable({ name: 'Perfect', key: 'perf', value: perf, defaultValue: true }));

        // 0-9
        this.variables.push(new BMaZNumberVariable({ name: 'Difficulty', key: 'difficulty', min: 0, max: 9, value: perf ? 9 : difficulty, defaultValue: 0 }));

        // 0-9
        this.variables.push(new BMaZNumberVariable({ name: 'Loot', key: 'loot', min: 0, max: 9, value: perf ? 9 : loot, defaultValue: 0 }));

        // 0-9
        this.variables.push(new BMaZNumberVariable({ name: 'Size', key: 'size', min: 0, max: 9, value: perf ? 9 : size, defaultValue: 0 }));
    }

    buy() {
        if(this.map)
            return this.map;
        
        if(!game.global.preMapsActive)
            gameWindow.mapsClicked(true);
        
        let offset = 0;
        let extra = 0;

        if(this.variables.offset.value > 0)
            this.extra = this.variables.offset.value;
        if(this.variables.offset.value < 0)
            this.offset = this.variables.offset.value;
        this.$offset.value = game.global.world + this.offset;
        this.$biome.value = this.biome;
        this.$loot.value = this.loot;
        this.$size.value = this.size;
        this.$difficulty.value = this.difficulty;
        this.$specMod.value = this.specMod;
        this.$extra.value = this.extra;
        this.$perf.dataset.checked = this.perf;
        
        let mapStatus = gameWindow.buyMap(); // -1 out of range; -2 too many maps; -3 can't afford;
        if(mapStatus == 1)
            return game.global.mapsOwnedArray[game.global.mapsOwnedArray.length - 1].id;
        return mapStatus;
    }

    get $offset() { return gameWindow.document.querySelector("#mapLevelInput"); }
    get $biome() { return gameWindow.document.querySelector("#biomeAdvMapsSelect"); }
    get $loot() { return gameWindow.document.querySelector("#lootAdvMapsRange"); }
    get $size() { return gameWindow.document.querySelector("#sizeAdvMapsRange"); }
    get $difficulty() { return gameWindow.document.querySelector("#difficultyAdvMapsRange"); }
    get $specMod() { return gameWindow.document.querySelector('#advSpecialSelect'); }
    get $perf() { return gameWindow.document.querySelector('#advPerfectCheckbox'); }
    get $extra() { return gameWindow.document.querySelector('#advExtraLevelSelect'); }

    get map() {
        if(!this._map) {
            let [ lootMin, lootMax ] = gameWindow.getMapMinMax('loot', this.variables.loot.value);
            let [ sizeMin, sizeMax ] = gameWindow.getMapMinMax('size', this.variables.size.value);
            let [ difficultyMin, difficultyMax ] = gameWindow.getMapMinMax('difficulty', this.variables.difficulty.value);


            let bestMap = false;
            let validMaps = game.global.mapsOwnedArray.filter(map => this.constructor.whitelisted.includes(map.location));
            
            for(const map of validMaps) {
                if(this.variables.specMod.value && map.bonus === undefined || this.variables.specMod.value != map.bonus)
                    continue;
                if(this.variables.biome.value == "Random" || this.variables.biome.value == map.location)
                    continue;
                if(map.level != (game.global.world + this.variables.offset.value + this.variables.extra.value))
                    continue;
                if(bestMap && map.loot < bestMap.loot)
                    continue;
                if(bestMap && map.size > bestMap.size)
                    continue;
                if(bestMap && map.difficulty > bestMap.difficulty)
                    continue;
                bestMap = map;
            }

            if(bestMap)
               this._map = bestMap;
        }

        return this._map;
    }

    activate() {
        let map = this.buy();
        if (typeof map === 'string'){
            gameWindow.selectMap(map);
            gameWindow.runMap();
            
            game.global.repeatMap = true;
            gameWindow.repeatClicked(true);
            game.options.menu.repeatUntil.enabled = 0;
            gameWindow.toggleSetting("repeatUntil", null, false, true);
            game.options.menu.exitTo.enabled = 1;
            gameWindow.toggleSetting("exitTo", null, false, true);
        }
        console.log(map);
    }

    complete() {
        this._map = false;
        game.global.repeatMap = false;
        gameWindow.repeatClicked(true);
        game.options.menu.exitTo.enabled = 1;
        gameWindow.toggleSetting("exitTo", null, false, true);
    }
}

class VoidMapAction extends Action {
    static type = 'vmap';
    static display = 'Run Void Map';
    static { Action.registered.push(this); }

    constructor({...args}={}) {
        super({...args});

        Object.defineProperty(this, '_map', { enumerable: false, writable: true, value: false });
    }

    get map() {
        if(!this._map) {
            let validMaps = game.global.mapsOwnedArray.filter(map => map.location == "Void");
            this._map = voidMaps[0];
        }

        return this._map;
    }

    activate() {
        
    }

    complete() {
        this._map = false;
    }
}
class BionicMapAction extends Action {
    static type = 'bwmap';
    static display = 'Run BW';
    static { Action.registered.push(this); }

    constructor({...args}={}) {
        super({...args});

        Object.defineProperty(this, '_map', { enumerable: false, writable: true, value: false });
    }

    get map() {
        if(!this._map) {
            let validMaps = game.global.mapsOwnedArray.filter(map => map.location == "Bionic");
            this._map = voidMaps[0];
        }

        return this._map;
    }

    activate() {
        
    }

    complete() {
        this._map = false;
    }
}

// Completions
class ForeverCompletion extends Completion {
    static type = 'forever';
    static display = 'Forever';
    static { Completion.registered.push(this); }
    constructor({bonus, ...args}={}) {
        super({...args});
    }

    get completed() {
        return false;
    }
}

class MapRepeatCompletion extends Completion {
    static type = 'maprepeat';
    static display = 'Map Completed';
    static { Completion.registered.push(this); }
    constructor({repeat, ...args}={}) {
        super({...args});
        this.variables.push(new BMaZNumberVariable({ name: 'Times', key: 'repeat', value: repeat, defaultValue: 10 }));
        this.runs = 0;
        this.suspended = false;
    }

    get completed() {
        return this.runs >= this.variables.repeat;
    }

    activate(source) {
        super.activate(source);
        if(this.suspended)
            this.runs = 0;
        this.suspended = false;
    }

    suspend(source) {
        super.suspend(source);
        this.suspended = true;
    }

    complete(source) {
        super.complete(source);
        this.runs = 0;
    }

    map_completed(map) {
        this.runs++;
        console.log(this.runs, this.repeat);
    }
}

class MapBonusCompletion extends Completion {
    static type = 'mapbonus';
    static display = 'Map Bonus';
    static { Completion.registered.push(this); }
    constructor({bonus, ...args}={}) {
        super({...args});
        this.variables.push(new BMaZNumberVariable({ name: 'Bonus', key: 'bonus', value: bonus, defaultValue: 10 }));
        this.suspended = false;
    }

    get completed() {
        return game.global.mapBonus >= this.variables.bonus.value;
    }
}

class ResourceCompletion extends Completion {
    static type = 'resource';
    static display = 'Resource';
    static { Completion.registered.push(this); }
    constructor({resource, owned, ...args}={}) {
        super({...args});
        this.variables.push(new BMaZTextVariable({ name: 'Resource', key: 'resource', value: resource, defaultValue: 'food' }));
        this.variables.push(new BMaZNumberVariable({ name: 'Owned', key: 'owned', value: owned, defaultValue: 0 }));
    }

    get completed() {
        return game.resources[this.resource.value].owned >= this.owned.value;
    }
}

class BuildingCompletion extends Completion {
    static type = 'building';
    static display = 'Building';
    static { Completion.registered.push(this); }
    constructor({building, owned, purchased=-1, ...args}={}) {
        super({...args});
        this.variables.push(new BMaZTextVariable({ name: 'Building', key: 'building', value: building, defaultValue: 'Trap' }));
        this.variables.push(new BMaZNumberVariable({ name: 'Owned', key: 'owned', value: owned, defaultValue: 0 }));
        this.variables.push(new BMaZNumberVariable({ name: 'Purchased', key: 'purchased', value: purchased, defaultValue: -1 }));
    }

    get completed() {
        return game.buildings[this.building.value].owned >= this.owned.value && (this.purchased.value > -1 ? game.buildings[this.building.value].purchased >= this.purchased.value : true);
    }
}

class JobCompletion extends Completion {
    static type = 'job';
    static display = 'Job';
    static { Completion.registered.push(this); }
    constructor({job, owned, ...args}={}) {
        super({...args});
        this.variables.push(new BMaZTextVariable({ name: 'Job', key: 'job', value: job, defaultValue: 'Farmer' }));
        this.variables.push(new BMaZNumberVariable({ name: 'Owned', key: 'owned', value: owned, defaultValue: 0 }));
    }

    get completed() {
        return game.jobs[this.job.value].owned >= this.owned.value;
    }
}

class UpgradeCompletion extends Completion {
    static type = 'upgrade';
    static display = 'Upgrade';
    static { Completion.registered.push(this); }
    constructor({upgrade, done, ...args}={}) {
        super({...args});
        this.variables.push(new BMaZTextVariable({ name: 'Upgrade', key: 'upgrade', value: upgrade, defaultValue: 'Dagadder' }));
        this.variables.push(new BMaZNumberVariable({ name: 'Done', key: 'done', value: done, defaultValue: 0 }));
    }

    get completed() {
        return game.upgrades[this.upgrade.value].done >= this.done.value;
    }
}

class RelicCompletion extends Completion {
    static type = 'relic';
    static display = 'Relic';
    static { Completion.registered.push(this); }
    constructor({relic, points, ...args}={}) {
        super({...args});
        this.variables.push(new BMaZTextVariable({ name: 'Relic', key: 'relic', value: relic, defaultValue: 'attack' }));
        this.variables.push(new BMaZNumberVariable({ name: 'Points', key: 'points', value: points, defaultValue: 0 }));
    }

    get completed() {
        return game.challenges.Archaeology.points[this.relic.value] >= this.points.value;
    }
}

class EquipmentCompletion extends Completion {
    static type = 'equipment';
    static display = 'Equipment';
    static { Completion.registered.push(this); }
    constructor({equipment, level, prestige=-1, ...args}={}) {
        super({...args});
        this.variables.push(new BMaZTextVariable({ name: 'Equipment', key: 'equipment', value: equipment, defaultValue: 'Dagger' }));
        this.variables.push(new BMaZNumberVariable({ name: 'Level', key: 'level', value: level, defaultValue: 0 }));
        this.variables.push(new BMaZNumberVariable({ name: 'Prestige', key: 'prestige', value: prestige, defaultValue: -1 }));
    }

    get completed() {
        return game.equipment[this.equipment.value].level >= this.level.value && this.prestige.value > -1 ? game.equipment[this.equipment.value].prestige >= this.prestige.value : true;
    }
}


// Row
class BMaZRow {
    constructor({enabled=true, priority=1, condition={type: 'default'}, action={type: 'default'}, completion={type: 'default'}, ...args}) {
        Object.defineProperty(this, '$el', { enumerable: false, writable: true, configurable: true });
        Object.defineProperty(this, '_condition', { enumerable: false, writable: true, configurable: true });
        Object.defineProperty(this, '_action', { enumerable: false, writable: true, configurable: true });
        Object.defineProperty(this, '_completion', { enumerable: false, writable: true, configurable: true });

        this.variables = new Proxy([], {
            get(obj, prop) {
                if(prop in obj)
                    return obj[prop];
                return obj.find(el => el.key == prop);
            },
            set(obj, prop, value) {
                if(value instanceof BMaZVariable || prop in obj)
                    return Reflect.set(...arguments);
            }
        });

        this.variables.push(new BMaZBooleanVariable({
            name: 'Enabled',
            key: 'enabled',
            value: enabled,
            defaultValue: true
        }));

        this.variables.push(new BMaZNumberVariable({
            name: 'Priority',
            key: 'priority',
            value: priority,
            defaultValue: true
        }));
        
        if(Condition.registered.find(c => c.type == condition.type))
            this.condition = new Condition.registered[condition.type](condition);
        else
            this.condition = new Condition(condition);

        if(Action.registered.find(a => a.type == action.type))
            this.action = new Action.registered[action.type](action);
        else
            this.action = new Action(action);

        if(Completion.registered.find(c => c.type == completion.type))
            this.completion = new Completion.registered[completion.type](completion);
        else
            this.completion = new Completion(completion);
    }

    set condition(condition) { this._condition = condition; }
    get condition() {
        if(this._condition.variables.type.value != this._condition.constructor.type && Condition.registered.find(c => c.type == this._condition.variables.type.value)) {
            let type = this._condition.variables.type.value;
            this._condition.remove();
            this._condition = new Condition.registered[type]();
        }
        return this._condition;
    }

    set action(action) { this._action = action; }
    get action() {
        if(this._action.variables.type.value != this._action.constructor.type && Action.registered.find(c => c.type == this._action.variables.type.value)) {
            let type = this._action.variables.type.value;
            this._action.remove();
            this._action = new Action.registered[type]();
        }
        return this._action;
    }

    set completion(completion) { this._completion = completion; }
    get completion() {
        if(this._completion.variables.type.value != this._completion.constructor.type && Completion.registered.find(c => c.type == this._completion.variables.type.value)) {
            let type = this._completion.variables.type.value;
            this._completion.remove();
            this._completion = new Completion.registered[type]();
        }
        return this._completion;
    }

    get eligible() {
        return this.condition.eligible;
    }

    get completed() {
        return this.completion.completed;
    }

    map_completed(map) {
        if(this.completion.map_completed)
            this.completion.map_completed(map);
    }

    activate(source) {
        this.condition.activate(source);
        this.action.activate(source);
        this.completion.activate(source);
    }

    suspend(source) {
        this.condition.suspend(source);
        this.action.suspend(source);
        this.completion.suspend(source);
    }

    complete(source) {
        this.condition.complete(source);
        this.action.complete(source);
        this.completion.complete(source);
    }

    update(source) {
        this.condition.update(source);
        this.action.update(source);
        this.completion.update(source);
    }

    save() {
        return {
            ...Object.assign({}, ...this.variables.map(variable => ({...variable.save()}))),
            condition: this.condition.save(),
            action: this.action.save(),
            completion: this.completion.save()
        }
    }

    render($parent) {
        if(!this.$el)
            this.$el = createElement('div', { classList: ['bmaz-row'], parent: $parent })

        this.variables.forEach(variable => {
            variable.render(this.$el);
        });

        this.condition.render(this.$el);
        this.action.render(this.$el);
        this.completion.render(this.$el);
        
        return this.$el;
    }

    remove() {
        this.variables.forEach(variable => variable.remove());
        this.condition.remove();
        this.action.remove();
        this.completion.remove();

        if(this.$el)
            this.$el.remove();
    }
}


// BMaZ
class BMaZ {
    constructor() {
        Object.defineProperty(this, '$el', { enumerable: false, writable: true, configurable: true });
        this.rows = [];
        this.current = false;
    }

    update(source='tick') {
        if(this.current)
            this.current.update(source);

        this.check(source);
    }

    check(source='tick') {
        if(this.current && (!this.current.eligible || this.current.completed)) {
            if(this.current.completed) {
               this.current.complete(source);
            } else {
                this.current.suspend(source);
            }
            this.current = false;
        }

        for(const row of this.rows) {
            if(!row.enabled)
                continue;
            if(!row.eligible)
                continue;
            if(row.completed)
                continue;
            if(this.current != row) {
                this.current = row;
                this.current.activate(source);
                return;
            }
        }
    }

    new_row({priority=this.rows.length+1, ...args}) {
        let row = new BMaZRow({
            priority: priority,
            ...args
        });

        this.rows.push(row);
        this.rows.sort((a,b) => a.priority - b.priority);

        return row;
    }

    remove_row(index) {
        if(this.rows[index] !== undefined) {
            let [row] = this.rows.splice(index, 1);
            row.remove();
        }
    }

    load(data) {
        if(data.rows && data.rows.length > 0)
            this.rows = data.rows.map(row => new BMaZRow(row));
    }

    save() {
        return {
            rows: this.rows.map(row => row.save())
        }
    }

    render($parent) {
        if(!this.$el)
            this.$el = createElement('div', { classList: ['bmaz-container'], parent: $parent })

        if(this.$el.children.length != this.rows.length) {
            this.$el.replaceChildren(...this.rows.map(row => row.render()));
        } else {
            this.rows.forEach(row => row.render());
        }
        
        return this.$el;
    }

    remove() {
        this.rows.forEach(row => row.remove());

        if(this.$el)
            this.$el.remove();
    }
}


// TTBox Module
export default class MapsModule extends TTModule {
    constructor() { super(); }

    static id = 'maps';
    static hook = false;
    static bmaz = new BMaZ();

    static async start() {
        await super.start(...arguments);
        
        if(!this.hooked) {
            this.hooked = true;
            this.hooks.push(Events.on('maz', 'pre', () => {
                this.bmaz.update('maz');
            }))
            this.hooks.push(Events.on('fight', 'pre', () => {
                this.bmaz.update('fight');
                if(game.global.mapsActive) {
                    let cellNum = game.global.lastClearedMapCell+1;
                    let cell = game.global.mapGridArray[cellNum];
                    let map = gameWindow.getCurrentMapObject();
                    if(cell.health <= 0 || !isFinite(cell.health)) {
                        if(cellNum == (game.global.mapGridArray.length - 1)) {
                            if(this.bmaz.current)
                                this.bmaz.current.map_completed(map);


                            // REPEAT MAP? game.global.repeatMap game.options.menu.repeatUntil game.global.switchToMaps game.global.preMapsActive
                            // EXIT TO WORLD? game.options.menu.exitTo.enabled
                        }

                        //console.log(`M${map.level} C${game.global.lastClearedMapCell+2} cleared`);
                    }
                } else {
                    let cellNum = game.global.lastClearedCell+1;
                    let cell = game.global.gridArray[cellNum];
                    if(cell.health <= 0 || !isFinite(cell.health)) {
                        //console.log(`Z${game.global.world} C${game.global.lastClearedCell+2} cleared`);
                    }
                }
            }))
        }

        let lsString = localStorage.getItem('TrimpToolbox-MapsModule-bmaz');
        this.bmaz.load(JSON.parse(lsString) || []);
        
        console.log(this.bmaz);
        console.log(this.bmaz.save());
    }

    static async stop() {
        await super.stop(...arguments);

        localStorage.setItem('TrimpToolbox-MapsModule-bmaz', JSON.stringify(this.bmaz.save()));

        this.bmaz.remove();
    }

    static async update() {
        await super.update(...arguments);

        this.bmaz.update();
        /*
            bonus: "lrc"
            clears: 0
            difficulty: 0.75
            id: "map31"
            level: 74
            location: "Plentiful"
            loot: 1.85
            name: "Eternal Gardens"
            noRecycle: false
            size: 20
        */

        /*
            biome: "Random"
            difficulty: 9
            extra: 2
            loot: 9
            offset: 0
            perf: true
            size: 9
            specMod: "p"
        */

        /*
            bwWorld: 125
            cell: 41
            check: true
            done: "377_71_41"
            exit: 2
            on: true
            preset: 7
            repeat: 1
            rx: 10
            through: 90
            times: 3
            until: 9
            world: 50
        */

        //game.global.mapRunCounter
        //game.global.mapCounterGoal
        let cell = game.global.lastClearedCell+2;
        let totalPortals = gameWindow.getTotalPortals();

        if (game.options.menu.mapAtZone.enabled && game.global.canMapAtZone) {
            let setZone = game.options.menu.mapAtZone.getSetZone();
            for (const option of setZone) {
                if (game.global.world < option.world || game.global.world > option.through) {
                    continue;
                }
                if (option.times === -1 && game.global.world !== option.world) {
                    continue;
                }
                if (option.times > 0 && (game.global.world - option.world) % option.times !== 0) {
                    continue;
                }
                if (option.cell === cell) {
                    //console.log(option.done === totalPortals + "_" + game.global.world + "_" + cell, {index: setZone.indexOf(option), ...option});
                    break;
                }
            }
        }
    }
}