import TTBox from '../ttbox.mjs';
import StatBlock from './block.mjs';
import { createElement, chunks } from './../helpers.mjs';

export default class PlayerSpireBlock extends StatBlock {
    constructor({...args}={}) {
        super({id: 'playerspire', ...args});
    }
    init() {
        super.init();

        this.spire_traps_container = createElement('div', {
            id: `player-spire-traps`,
            parent: this.$content
        });

        this.spire_container = createElement('div', {
            id: `player-spire`,
            parent: this.$content
        });

        this.spire_upgrades_container = createElement('div', {
            id: `player-spire-upgrades`,
            parent: this.$content
        });


        this.spire_traps = this.traps.map((trap) => createElement('div', {
                id: `player-spire-trap-${trap.name.toLowerCase()}`,
                classList: ['player-spire-trap'],
                parent: this.spire_traps_container
            })
        );


        this.spire_upgrades = this.traps.map((trap) => createElement('div', {
                id: `player-spire-upgrade-${trap.name.toLowerCase()}`,
                classList: ['player-spire-upgrade'],
                parent: this.spire_upgrades_container
            })
        );

        
        this.spire = this.grid.map((cell) => createElement('div', {
                id: `player-spire-cell-${cell.id}`,
                classList: ['player-spire-cell'],
                parent: this.spire_container
            })
        );
        
        this.initialized = true;
    }
    update() {
        super.update();

        this.traps.forEach((trap, i) => {
            let $trap = this.spire_traps[i];
            let $upgrade = this.spire_upgrades[i];
            
            if (trap.locked) return;

            let cost = gameWindow.playerSpire.getTrapCost(trap.name);
            let trap_color = (gameWindow.playerSpire.runestones >= cost) ? trap.color : "grey";
            if (trap.isTower && trap.owned >= 10)
                color = "grey";
            
            $trap.style.backgroundColor = trap_color;
            $trap.innerHTML = `<span class='icomoon icon-${trap.icon}'></span>`;
            $trap.setAttribute('data-tooltip', `<div style='background-color: black; padding: 10px; display: flex; flex-direction: column;'><div>${trap.name} ${gameWindow.romanNumeral(trap.level)}</div><div>${trap.description}</div></div>`);

            
            if (!trap.upgrades || trap.upgrades.length < trap.level) return;

            let nextUpgrade = trap.upgrades[trap.level - 1];
            let upgrade_color = (nextUpgrade.cost > gameWindow.playerSpire.runestones || (game.global.highestLevelCleared + 1 < nextUpgrade.unlockAt)) ? "grey" : trap.color;

            $upgrade.style.backgroundColor = upgrade_color;
            $upgrade.innerHTML = `${gameWindow.romanNumeral(trap.level + 1)}`;
            $upgrade.setAttribute('data-tooltip', `<div style='background-color: black; padding: 10px; display: flex; flex-direction: column;'><div>${trap.name} ${gameWindow.romanNumeral(trap.level + 1)}</div><div>${nextUpgrade.description}</div></div>`);
        });
        
        
        this.grid.forEach((cell, i) => {
            let item = this.spire[i];
            item.style['background-image'] = '';
            let [name, value] = gameWindow.playerSpire.getSetTrapBgColor(cell.id).split(':');
            item.style[name] = value;
        });
    }

    get traps() {
        return Object.entries(gameWindow.playerSpireTraps).map(([name, trap]) => ({...trap, name: name }));
    }

    get grid() {
        let layout = [...gameWindow.playerSpire.layout].map((cell, i) => ({...cell, id: i}));
        let chunked = [...chunks(layout, 5)].map(chunk => chunk.reverse());
        return chunked.flat().reverse();
    }
}