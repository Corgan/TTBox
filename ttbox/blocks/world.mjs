import TTBox from '../ttbox.mjs';
import StatBlock from './block.mjs';
import { createElement, chunks } from './../helpers.mjs';

export default class WorldBlock extends StatBlock {
    static type = 'World Grid';
    constructor({...args}={}) {
        super({id: 'world', ...args});
    }
    init() {
        super.init();

        if(!this.$container)
            this.$container = createElement('div', {
                id: `world-grid`,
                parent: this.$content
            });

        
        if(!this.$world)
            this.$world = this.grid.map((cell) => createElement('div', {
                    id: `world-cell-${cell.id}`,
                    classList: ['world-cell'],
                    parent: this.$container
                })
            );
        
        this.initialized = true;
    }
    update() {
        super.update();
        this.$container.classList.toggle("liquid", game.global.gridArray[0].name == "Liquimp");
        this.$container.classList.toggle("spire", game.global.spireActive);
        
        this.grid.forEach((cell, i) => {
            let item = this.$world[i];
			var classes = ["battleCell"];
            classes.push(cell.id > game.global.lastClearedCell ? "cellColorNotBeaten" : "cellColorBeaten");

            if(game.global.lastClearedCell+1 == cell.id) {
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
        let layout = [...game.global.gridArray].map((cell, i) => ({...cell, id: i}));
        let chunked = [...chunks(layout, 10)].map(chunk => chunk.reverse());
        return chunked.flat().reverse();
    }
}