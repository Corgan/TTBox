import TTBox from '../ttbox.mjs';
import StatBlock from './block.mjs';
import { createElement, chunks } from './../helpers.mjs';
import Events from '../modules/events.mjs';

export default class WorldBlock extends StatBlock {
    static type = 'World Grid';
    constructor({...args}={}) {
        super({id: 'world', ...args});
    }
    static hooked = false;
    cellTimes = [];
    startTime = game.global.zoneStarted;
    init() {
        super.init();

        if(!this.hooked) {
            this.hooks.push(Events.on('world', 'pre', () => {
                if(!game.global.mapsActive) {
                    this.cellTimes = [];
                    this.startTime = Date.now();
                }
                this.$world.forEach($cell => $cell.dataset.id = -1);
            }))
            
            this.hooks.push(Events.on('battle', 'pre', () => {
                if(!this.cellTimes[game.global.lastClearedCell] && !game.global.mapsActive)
                    this.cellTimes[game.global.lastClearedCell] = Date.now();
            }))
            this.hooked = true;
        }

        if(!this.$container)
            this.$container = createElement('div', {
                id: `world-grid`,
                parent: this.$content
            });

        
        if(!this.$world)
            this.$world = this.grid.map((cell) => createElement('div', {
                    id: `world-cell-${cell.id}`,
                    classList: ['cell'],
                    parent: this.$container,
                    children: [
                        createElement('div', {
                            classList: ['timer']
                        }),
                        createElement('div', {
                            classList: ['glyphs'],
                            children: [
                                createElement('div', {
                                    classList: ['glyph', 'ice', 'icon-certificate']
                                }),
                                createElement('div', {
                                    classList: ['glyph', 'wind', 'icon-air']
                                }),
                                createElement('div', {
                                    classList: ['glyph', 'poison', 'icon-flask']
                                })
                            ]
                        })
                    ]
                })
            );
        
        this.initialized = true;
    }
    update() {
        super.update();
        this.$container.classList.toggle("liquid", game.global.gridArray && game.global.gridArray.length > 0 && game.global.gridArray[0].name == "Liquimp");
        this.$container.classList.toggle("spire", game.global.spireActive);
        
        this.grid.forEach((cell, i) => {
            let $cell = this.$world[i];
            let [ $timer, $icons ] = [...$cell.children];
            let id = game.global.lastClearedCell+1;


            if($cell.dataset.id != cell.id || $cell.classList.contains('current') || (cell.id <= id && $cell.classList.contains('not-beaten')) || (cell.id >= id && $cell.classList.contains('beaten'))) {

                var classes = ['cell'];
                classes.push(cell.id >= id ? "not-beaten" : "beaten");

                if(id == cell.id) {
                    classes.push("current");
                } else {
                    if(cell.mutation)
                        classes.push(cell.mutation.toLowerCase());
                    
                    if(cell.vm)
                        classes.push(cell.vm.toLowerCase());
                    
                    if(cell.empowerment)
                        classes.push(cell.empowerment.toLowerCase());
                    
                    if(game.global.spireActive)
                        classes.push('spire');
                }
                $cell.className = classes.join(" ");

                // Fix for loading in the middle of a zone?
                //if(id == cell.id && !this.cellTimes[cell.id-1])
                //    this.cellTimes[cell.id-1] = game.global.zoneStarted;

                let worldTime = this.cellTimes[cell.id];
                let prevWorldTime = cell.id > 0 ? this.cellTimes[cell.id-1] : this.startTime;
                let timeDiff = worldTime && prevWorldTime ? (worldTime - prevWorldTime) / 1000 : false;
                if(timeDiff == false && prevWorldTime && id == cell.id)
                    timeDiff = (Date.now() - prevWorldTime) / 1000;

                if(timeDiff !== false)
                    $timer.innerText = timeDiff >= 1000 ? Math.floor(timeDiff / 60) + 'm' : timeDiff >= 100 ? Math.ceil(timeDiff) : timeDiff >= 10 ? timeDiff.toFixed(1) : timeDiff >= 0.01 ? timeDiff.toFixed(2) : 0;
                else $timer.innerHTML = '';

                let tt = {
                    ...cell,
                    worldTime: worldTime,
                    clearTime: timeDiff
                }
                $cell.dataset.id = cell.id;
                $cell.dataset.tooltip = `<pre>${JSON.stringify(tt, null, 2)}</pre>`;
            }
        });
    }

    get grid() {
        let layout = [...game.global.gridArray].map((cell, i) => ({...cell, id: i}));
        let chunked = [...chunks(layout, 10)].map(chunk => chunk.reverse());
        return chunked.flat().reverse();
    }
}