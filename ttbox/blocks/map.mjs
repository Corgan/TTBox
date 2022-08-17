import TTBox from '../ttbox.mjs';
import StatBlock from './block.mjs';
import { createElement, chunks } from './../helpers.mjs';

export default class MapBlock extends StatBlock {
    static type = 'Map Grid';
    constructor({...args}={}) {
        super({id: 'map', ...args});
    }
    init() {
        super.init();

        if(!this.$container)
            this.$container = createElement('div', {
                id: `map-grid`,
                parent: this.$content
            });

        
        if(!this.$map)
            this.$map = this.grid.map((cell) => createElement('div', {
                    id: `map-cell-${cell.id}`,
                    classList: ['map-cell'],
                    parent: this.$container
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
                    classList: ['map-cell'],
                    parent: this.$container
                });
                this.$map.push($cell);
            }

            if(!cell) {
                $cell.classList.add('hide');
            } else {
                $cell.classList.remove('hide');

                var classes = ["battleCell"];
                classes.push(cell.id > game.global.lastClearedMapCell ? "cellColorNotBeaten" : "cellColorBeaten");
    
                if(game.global.lastClearedMapCell+1 == cell.id) {
                    classes.push("cellColorCurrent");
                } else {
                }
                $cell.className = classes.join(" ");

                let column = (cell.id % columnCount);
                let row = rowCount - Math.floor(cell.id / columnCount);

                $cell.style.gridRowStart = row;
                $cell.style.gridRowEnd = row+1;
                $cell.style.gridColumnStart = column+1;
                $cell.style.gridColumnEnd = column+2;
            }
        }
        
        this.grid.forEach((cell, i) => {
            let item = this.$map[i];
			var classes = ["battleCell"];
            classes.push(cell.id > game.global.lastClearedMapCell ? "cellColorNotBeaten" : "cellColorBeaten");

            if(game.global.lastClearedMapCell+1 == cell.id) {
                classes.push("cellColorCurrent");
            } else {
                if(cell.mutation)
                    classes.push(cell.mutation);
                
                if(cell.vm)
                    classes.push(cell.vm);
                
                if(cell.empowerment)
                    classes.push("empoweredCell" + cell.empowerment);
                
                if(game.global.spireActive)
                    classes.push("spireCell");
            }
            item.className = classes.join(" ");


            item.dataset.tooltip = `<pre>${JSON.stringify(cell, null, 2)}</pre>`;
        });
    }

    get grid() {
        let layout = [...game.global.mapGridArray].map((cell, i) => ({...cell, id: i})).reverse();
        let chunked = [...chunks(layout, 10)].map(chunk => chunk.reverse());
        return chunked.flat();//.reverse();
    }
}