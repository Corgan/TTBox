import TTBox from '../ttbox.mjs';
import StatBlock from './block.mjs';
import { createElement } from './../helpers.mjs';
import Configuration from '../configuration.mjs';
import Events from '../modules/events.mjs';

export default class ChartBlock extends StatBlock {
    static type = 'Chart Block';
    constructor({text, ...args}={}) {
        super({id: 'chart', ...args});
    }
    worldTimes = [];
    cellTimes = [];
    init() {
        super.init();
        if(this.worldTimes.length == 0)
            this.worldTimes = [game.global.zoneStarted];
        if(this.cellTimes.length == 0)
            this.cellTimes = [Date.now()];

        if(!this.hooked) {
            this.hooks.push(Events.on('portal', 'post', () => {
                this.worldTimes = [];
            }))
            this.hooks.push(Events.on('world', 'pre', () => {
                this.worldTimes.unshift(Date.now());
                if(this.worldTimes.length > 15)
                    this.worldTimes.pop();
            }))
            this.hooks.push(Events.on('battle', 'pre', () => {
                if(!game.global.mapsActive)
                    this.cellTimes.unshift(Date.now());
                if(this.cellTimes.length > 15)
                    this.cellTimes.pop();
            }))
            this.hooked = true;
        }
        

        let world = game.global.world;
        let cell = game.global.lastClearedCell;
        

        if(!this.$worlds)
            this.$worlds = createElement('div', {
                id: `worlds-chart`,
                parent: this.$content
            });


        if(!this.worlds)
            this.worlds = new Chartist.LineChart(this.$worlds, {
                series: [[]],
            }, {
                showPoint: true,
                axisY: {
                    type: Chartist.AutoScaleAxis,
                    onlyInteger: true,
                    referenceValue: 15
                },
                axisX: {
                    type: Chartist.FixedScaleAxis,
                    ticks: [...this.worldTimes.map((_,i) => world - this.worldTimes.length + i), world]
                },
            });

        if(!this.$cells)
            this.$cells = createElement('div', {
                id: `cells-chart`,
                parent: this.$content
            });
        if(!this.cells)
            this.cells = new Chartist.LineChart(this.$cells, {
                series: [[]],
            }, {
                showPoint: true,
                axisY: {
                    type: Chartist.AutoScaleAxis,
                    onlyInteger: true,
                    referenceValue: 15
                },
                axisX: {
                    type: Chartist.FixedScaleAxis,
                    ticks: [...this.cellTimes.map((_,i) => cell - this.cellTimes.length + i), cell + 1],
                    labelInterpolationFnc: value => ((value + 100) % 100)
                },
            });
        this.initialized = true;
    }
    update() {
        super.update();

        let world = game.global.world;
        let cell = game.global.lastClearedCell;

        let worldData = [...this.worldTimes].reverse().map((worldTime, i, times) => {
            let worldEnd = times[i+1];
            let timeDiff = worldTime && worldEnd ? (worldEnd - worldTime) / 1000 : false;
            if(timeDiff === false)
                timeDiff = (Date.now() - worldTime) / 1000;

            return {
                x: world - (times.length-1) + i,
                y: +(timeDiff >= 100 ? Math.ceil(timeDiff) : timeDiff >= 10 ? timeDiff.toFixed(1) : timeDiff >= 0.01 ? timeDiff.toFixed(2) : 0)
            }
        });

        let cellData = [...this.cellTimes].reverse().map((worldTime, i, times) => {
            let worldEnd = times[i+1];
            let timeDiff = worldTime && worldEnd ? (worldEnd - worldTime) / 1000 : false;
            if(timeDiff === false)
                timeDiff = (Date.now() - worldTime) / 1000;
            return {
                x: cell - (times.length-1) + i,
                y: +(timeDiff >= 100 ? Math.ceil(timeDiff) : timeDiff >= 10 ? timeDiff.toFixed(1) : timeDiff >= 0.01 ? timeDiff.toFixed(2) : 0)
            }
        });

        let worldOptions = {
            axisX: {
                //low: world - this.worldTimes.length,
                //high: world,
                ticks: [...this.worldTimes.map((_,i) => world - (this.worldTimes.length-1) + i)]
            }
        }
        let cellOptions = {
            axisX: {
                //low: cell - this.cellTimes.length,
                //high: cell + 1,
                ticks: [...this.cellTimes.map((_,i) => cell - (this.cellTimes.length-1) + i)]
            }
        }

        console.log(worldData, worldOptions, cellData, cellOptions);
        this.worlds.update({ series: [worldData] }, worldOptions, true);
        this.cells.update({ series: [cellData] }, cellOptions, true);
    }
    save() {
        let ret = super.save();
        return ret;
    }
    load(data={}) {
        super.load(data);
    }
    random() {
        return Math.floor(Math.random() * (10 - -10 + 1)) + -10;
    }
}