import TTBox from '../ttbox.mjs';
import StatBlock from './block.mjs';
import { createElement, chunks } from './../helpers.mjs';

export default class UniverseBlock extends StatBlock {
    static type = 'Universe Grid';
    constructor({...args}={}) {
        super({id: 'universe', ...args});
    }
    init() {
        super.init();

        if(!this.$container)
            this.$container = createElement('div', {
                id: `universe-grid`,
                parent: this.$content
            });

        
        if(!this.$universe)
            this.$universe = this.grid.map((cell, i) => createElement('div', {
                    id: `universe-cell-${i}`,
                    classList: ['universe-cell'],
                    children: [
                        createElement('div', {
                            classList: ['universe-cell-mutation'],
                            children: [
                                createElement('div', {
                                    classList: ['universe-cell-corruption']
                                }),
                                createElement('div', {
                                    classList: ['universe-cell-healthy']
                                }),
                                createElement('div', {
                                    classList: ['universe-cell-magma']
                                })
                            ]
                        }),
                        createElement('div', {
                            classList: ['universe-cell-icons'],
                            children: [
                                createElement('div', {
                                    classList: ['cell-icon', 'cell-icon-ice', 'icon-certificate']
                                }),
                                createElement('div', {
                                    classList: ['cell-icon', 'cell-icon-wind', 'icon-air']
                                }),
                                createElement('div', {
                                    classList: ['cell-icon', 'cell-icon-poison', 'icon-flask']
                                }),
                                createElement('div', {
                                    classList: ['cell-icon', 'cell-icon-spire', 'icon-connection']
                                })
                            ]
                        })
                    ],
                    parent: this.$container
                })
            );
        
        this.initialized = true;
    }
    update() {
        super.update();
        //this.$container.classList.toggle("liquid", game.global.gridArray[0].name == "Liquimp");
        //this.$container.classList.toggle("spire", game.global.spireActive);
        
        this.grid.forEach((cell, i) => {
            let $cell = this.$universe[i];

            let [ $mutation ] = [...$cell.children];
            let [ $corruption, $healthy, $magma ] = [...$mutation.children];

            let id = game.global.world;
			var classes = ["universe-cell"];
            classes.push(cell.id >= id ? "not-beaten" : "beaten");

            let showMagma = false;
            let corruptCellCount = showMagma ? 100 : 80;

            let magmaCount = showMagma ? 20 : 0;
            let healthyCount = this.constructor.getHealthyCount(cell.id, Math.ceil(Math.max(0, cell.id-200) / 100));
            let corruptionCount = this.constructor.getCorruptionCount(cell.id) - healthyCount;

            let magmaPct = (magmaCount / corruptCellCount) * 100;
            let healthyPct = (healthyCount / corruptCellCount) * 100;
            let corruptionPct = (corruptionCount / corruptCellCount) * 100;
            let natureType = this.constructor.getNatureType(cell.id);
            let liqZone = this.constructor.getLiq();

            if(natureType)
                classes.push(natureType);
            if(cell.id == id)
                classes.push("current");
            if(cell.id == game.global.highestLevelCleared)
                classes.push("highest");
            if(cell.id > 100 && cell.id % 100 == 0)
                classes.push('spire');
            if(cell.id <= liqZone && !(cell.id > 100 && cell.id % 100 == 0))
                classes.push('liquid');
            if(cell.id >= gameWindow.getObsidianStart()) {
                classes.push('obsidian');
            } else {
                if(corruptionCount > 0 || healthyCount > 0 || magmaCount > 0) {
                    $mutation.style.opacity = 1;
                } else {
                    $mutation.style.opacity = 0;
                }
                if(corruptionCount > 0) {
                    $corruption.style.width = `${corruptionPct}%`;
                } else {
                    $corruption.style.width = 0;
                    $corruption.style.border = `none`;
                }

                if(healthyCount > 0) {
                    $healthy.style.width = `${healthyPct}%`;
                    $healthy.style.borderLeft = `1px solid black`;
                } else {
                    $healthy.style.width = 0;
                    $healthy.style.border = `none`;
                }
                
                if(magmaCount > 0) {
                    $magma.style.width = `${magmaPct}%`;
                    $magma.style.borderLeft = `1px solid black`;
                } else {
                    $magma.style.width = 0;
                    $magma.style.border = `none`;
                }
            }
            
            // else {
            //    if(cell.mutation)
            //        classes.push(cell.mutation);
            //    
            //    if(cell.vm)
            //        classes.push(cell.vm);
            //    
            //    if(cell.empowerment)
            //        classes.push("empoweredCell" + cell.empowerment);
            //    
            //    if(game.global.spireActive)
            //        classes.push("spireCell");
            //}
            $cell.dataset.id = cell.id;
            $cell.className = classes.join(" ");


            let tt = {
                ...cell,
                natureType: natureType,
                magmaCount: magmaCount,
                healthyCount: healthyCount,
                corruptionCount: corruptionCount
            }
            $cell.dataset.tooltip = `<pre>${JSON.stringify(tt, null, 2)}</pre>`;
        });
    }

    static getNatureType(world) {
        let nature = ["poison", "wind", "ice"];
        let start = gameWindow.getNatureStartZone();
        if(world < start)
            return false;
        let type = Math.floor((world - start) / 5) % nature.length;
        return nature[type];
    }

    static getLiq() {
        let totalSpires = game.global.spiresCompleted;
        if (game.talents.liquification.purchased) totalSpires++;
        if (game.talents.liquification2.purchased) totalSpires++;
        if (game.talents.liquification3.purchased) totalSpires+=2;

        totalSpires += (gameWindow.Fluffy.isRewardActive("liquid") * 0.5);
        return Math.floor((totalSpires / 20) * (gameWindow.getHighestLevelCleared(false, true) + 1));
    }

    static getMagmaCount(world) {
        return world >= gameWindow.mutations.Magma.start() ? gameWindow.mutations.Magma.singlePathMaxSize : 0;
    }

    static getCorruptionCount(world) {
        return Math.max(0, Math.min(80, Math.floor((world - gameWindow.mutations.Corruption.start()) / 3) + 2))
    }

    static getHealthyCount(world, spireClears=0) {
        if (spireClears < 2)
            return 0;
        
        let spireOffset = spireClears * 100;
        if (world > spireOffset + 199) 
            world = spireOffset + 199;
        var possible = Math.floor((world - 300) / 15) + 2;
        if (game.talents.healthStrength2.purchased) possible += spireClears;

        return Math.max(0, Math.min(80, possible));
    }
    get grid() {
        let subworld = Math.floor((game.global.world) / 100);
        if(game.global.world % 100 == 0)
            subworld -= 1;
        let layout = [...new Array(100)].map((_, i) => ({id: (subworld*100)+i+1}));
        //let target = game.global.highestLevelCleared;
        //target = gameWindow.getObsidianStart();
        //let count = Math.ceil(target / 15) * 15;
        //let layout = [...new Array(count)].map((_, i) => ({id: i+1}));
        let chunked = [...chunks(layout, 5)].map(chunk => chunk.reverse());
        return chunked.flat().reverse();
    }
}