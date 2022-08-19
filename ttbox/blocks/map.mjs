import TTBox from '../ttbox.mjs';
import StatBlock from './block.mjs';
import { createElement, chunks } from './../helpers.mjs';
import Events from '../modules/events.mjs';

export default class MapBlock extends StatBlock {
    static type = 'Map Grid';
    constructor({...args}={}) {
        super({id: 'map', ...args});
    }
    static hooked = false;
    cellTimes = [];
    startTime = game.global.mapStarted;
    init() {
        super.init();

        if(!this.hooked) {
            this.hooks.push(Events.on('world', 'pre', () => {}))
            
            this.hooks.push(Events.on('battle', 'pre', () => {
                if(game.global.lastClearedMapCell == -1 && game.global.mapGridArray.length > 0 && game.global.mapsActive) {
                    this.cellTimes = [];
                    this.startTime = game.global.mapStarted;
                    this.$map.forEach($cell => $cell.dataset.id = -1);
                }
                else if(!this.cellTimes[game.global.lastClearedMapCell] && game.global.mapGridArray.length > 0 && game.global.mapsActive)
                    this.cellTimes[game.global.lastClearedMapCell] = Date.now();
            }))
            this.hooked = true;
        }

        if(!this.$container)
            this.$container = createElement('div', {
                id: `map-grid`,
                parent: this.$content
            });

        
        if(!this.$map)
            this.$map = this.grid.map((cell) => createElement('div', {
                    id: `map-cell-${cell.id}`,
                    classList: ['cell'],
                    parent: this.$container,
                    children: [
                        createElement('div', {
                            classList: ['timer']
                        }),
                        createElement('div', {
                            classList: ['glyph'],
                            children: [
                            ]
                        })
                    ]
                })
            );
        
        this.initialized = true;
    }
    update() {
        super.update();

        let cellCount = this.grid.length;
        let rowCount = 10;
        let columnCount = 10;

		if (cellCount == 150) {
			rowCount = 10;
			columnCount = 15;
		} else {
            columnCount = Math.floor(Math.sqrt(cellCount));
            if (cellCount % columnCount === 0) rowCount = cellCount / columnCount;
            else rowCount = ((cellCount - (columnCount * columnCount)) > columnCount) ? columnCount + 2 : columnCount + 1;
        }

        this.$container.style.gridTemplateColumns = `repeat(${columnCount}, 1fr)`;
        this.$container.style.gridTemplateRows = `repeat(${rowCount}, 1fr)`;

        let max = Math.max(this.grid.length, this.$map.length);

        for(let i=0; i<max; i++) {
            let cell = this.grid[i];
            let $cell = this.$map[i];

            if(!$cell) {
                $cell = createElement('div', {
                    id: `map-cell-${cell.id}`,
                    classList: ['cell'],
                    parent: this.$container,
                    children: [
                        createElement('div', {
                            classList: ['timer']
                        }),
                        createElement('div', {
                            classList: ['glyph'],
                            children: [
                            ]
                        })
                    ]
                });
                this.$map.push($cell);
            }

            let [ $timer, $icons ] = [...$cell.children];

            if(!cell) {
                $cell.classList.add('hide');
            } else {
                $cell.classList.remove('hide');

                let column = (cell.id % columnCount);
                let row = rowCount - Math.floor(cell.id / columnCount);

                $cell.style.gridRowStart = row;
                $cell.style.gridRowEnd = row+1;
                $cell.style.gridColumnStart = column+1;
                $cell.style.gridColumnEnd = column+2;
            }
        }
        
        this.grid.forEach((cell, i) => {
            let $cell = this.$map[i];
            let [ $timer, $icons ] = [...$cell.children];
            let id = game.global.lastClearedMapCell+1;

            if($cell.dataset.id != cell.id || $cell.classList.contains('current') || (cell.id <= id && $cell.classList.contains('not-beaten')) || (cell.id >= id && $cell.classList.contains('beaten'))) {
                var classes = ["cell"];
                classes.push(cell.id >= id ? "not-beaten" : "beaten");

                if(id == cell.id) {
                    classes.push("current");
                } else {
                    if(cell.mutation)
                        classes.push(cell.mutation.toLowerCase());
                    
                    if(cell.vm)
                        classes.push(cell.vm.toLowerCase());
                }
                $cell.className = classes.join(" ");


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
        let layout = [...game.global.mapGridArray].map((cell, i) => ({...cell, id: i})).reverse();
        let chunked = [...chunks(layout, 10)].map(chunk => chunk.reverse());
        return chunked.flat();//.reverse();
    }
}