import TTBox from '../ttbox.mjs';
import StatBlock from './block.mjs';
import { createElement } from './../helpers.mjs';
import Configuration from '../configuration.mjs';
import Events from '../modules/events.mjs';
import uPlot from 'https://leeoniya.github.io/uPlot/dist/uPlot.esm.js';


export default class ChartBlock extends StatBlock {
    static type = 'Chart Block';
    constructor({text, ...args}={}) {
        super({id: 'chart', ...args});
    }
    init() {
        super.init();

        if(!this.$worlds)
            this.$worlds = createElement('div', {
                id: `worlds-chart`,
                parent: this.$content
            });


        if(!this.worlds) {
            console.log(TTBox.get('history').cellTimes.events);
            this.worlds = new uPlot({
                title: "World",
                width: 500,
                height: 200,
                legend: {
                    show: false
                },
                cursor: {
                    drag: {
                        setScale: false,
                    }
                },
                select: {
                    show: false,
                },
                scales: {
                    "W": {
                      auto: false,
                      range: [1, 800],
                    },
                    "C": {
                      auto: false,
                      range: [1, 100],
                    }
                },
                series: [
                    {},
                    {
                        label: "test",
                        value: (u, v) => v == null ? "-" : v,
                        stroke: "red",
                        width: 1,
                        scale: "W",
                    },
                    {
                        label: "test2",
                        value: (u, v) => v == null ? "-" : v,
                        stroke: "green",
                        width: 1,
                        scale: "C",
                    }
                ],
                axes: [
                    {
                        stroke: "white",
                    },
                    {
                        scale: "W",
                        stroke: "white",
                        grid: {show: false},
                    },
                    {
                        scale: "C",
                        stroke: "white",
                        grid: {show: false},
                    }
                ],
  scales: {
    "%": {
      auto: false,
      range: [0, 100],
    }
  },
            }, TTBox.get('history').cellTimes.events, this.$worlds);
        }

        //console.log(plugins.tooltip()(this.worlds));

        //if(!this.$cells)
        //    this.$cells = createElement('div', {
        //        id: `cells-chart`,
        //        parent: this.$content
        //    });
        //if(!this.cells)
        //    this.cells = new uPlot(this.$cells, {
        //        series: [[]],
        //    });
        //this.update_chart(0, 'world');
        //this.update_chart(0, 'cells');

        this.initialized = true;
    }
    update(tick) {
        super.update(...arguments);
    
        //console.log(this.worldTimes);
        //console.log(this.cellTimes);
        //this.update_chart(0, 'world')
        //this.cells.update();
            this.worlds.setData(TTBox.get('history').cellTimes.events);
    }
    update_chart(tick=0, chart, ...args) {  
        if(chart == 'world') {
            //let world = game.global.world;
            //let lastWorld = game.global.world - 1;
            //let lastWorldIdx = (lastWorld > 0 ? lastWorld : game.global.lastPortal) - 1;

        }

        if(chart == 'cells') {
            //let lastCell = ((game.global.lastClearedCell + 100) % 100) + 1;
            //let lastCellWorld = lastCell == 100 ? game.global.world - 1 : game.global.world;

            //let cell = (((game.global.lastClearedCell+1) + 100) % 100) + 1;
            //let cellWorld = game.global.world;

            //let cellData = this.cellTimes.window;
            //this.cells.update({ series: [cellData], labels: [...cellData.map((_) => _.x)] });
        }
    }
    save() {
        let ret = super.save();
        return ret;
    }
    load(data={}) {
        super.load(data);
    }
}