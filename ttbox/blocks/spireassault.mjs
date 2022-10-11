import TTBox from '../ttbox.mjs';
import StatBlock from './block.mjs';
import { createElement, chunks } from './../helpers.mjs';

export default class SpireAssaultBlock extends StatBlock {
    static type = 'Spire Assault';
    constructor({...args}={}) {
        super({id: 'spireassault', ...args});
    }
    init() {
        super.init();

        this.$spire_stats_container = createElement('pre', {
            id: `spire-assault-stats`,
            parent: this.$content
        });

        this.$spire_assault_container = createElement('pre', {
            id: `spire-assault`,
            parent: this.$content
        });

        this.$spire_items_container = createElement('pre', {
            id: `spire-assault-items`,
            parent: this.$content
        });


        /*
        this.$spire_traps = this.traps.map((trap) => createElement('div', {
                id: `player-spire-trap-${trap.name.toLowerCase()}`,
                classList: ['player-spire-trap'],
                parent: this.$spire_traps_container
            })
        );


        this.$spire_upgrades = this.traps.map((trap) => createElement('div', {
                id: `player-spire-upgrade-${trap.name.toLowerCase()}`,
                classList: ['player-spire-upgrade'],
                parent: this.$spire_upgrades_container
            })
        );

        
        this.$spire = this.grid.map((cell) => createElement('div', {
                id: `player-spire-cell-${cell.id}`,
                classList: ['player-spire-cell'],
                parent: this.$spire_container
            })
        );
        */
        
        this.initialized = true;
    }
    update() {
        super.update();

        this.$spire_items_container.innerHTML = ``;
    }

    get total_fights() {
        return gameWindow.autoBattle.sessionEnemiesKilled + gameWindow.autoBattle.sessionTrimpsKilled;
    }

    get wr() {
        let totalFights = this.total_fights();
        return (totalFights > 0) ? gameWindow.autoBattle.sessionEnemiesKilled / totalFights : 0
    }

    get dustPs() {
        return gameWindow.autoBattle.getDustPs();
    }
}