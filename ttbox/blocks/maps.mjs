import TTBox from '../ttbox.mjs';
import StatBlock from './block.mjs';
import { createElement } from './../helpers.mjs';

export default class MapsBlock extends StatBlock {
    constructor({...args}={}) {
        super({id: 'maps', ...args});
    }
    init() {
        super.init();
        createElement('div', {
            classList: ['key-value'],
            id: `map-level-header`,
            parent: this.$content,
            children: [
                createElement('span', {
                    classList: ['level'],
                    text: "Map Level"
                }),
                createElement('span', {
                    classList: ['items'],
                    text: "Items"
                }),
                createElement('span', {
                    classList: ['frags'],
                    text: "Fragments"
                })
            ]
        });

        this.maps = [...Array(21).keys()].map(i => createElement('div', {
            classList: ['key-value', 'hide'],
            id: `map-level-${i}`,
            parent: this.$content,
            children: [
                createElement('span', {
                    classList: ['level'],
                    text: `${i - 10 > 0 ? '+'+(i-10) : (i-10)}`
                }),
                createElement('span', {
                    classList: ['items']
                }),
                createElement('span', {
                    classList: ['frags', 'mapExtraNoAfford']
                })
            ]
        }));
    }
    update() {
        super.update();
        this.prestiges.forEach((v, i) => {
            let item = this.maps[i];
            item.classList.toggle('hide', v <= 0);

            if(item.getAttribute('data-value') != v) {
                item.setAttribute('data-value', v);
                item.children[1].textContent = v;
                if(v > 0) {
                    gameWindow.swapClass('mapExtra', this.fragment_class(i-10), item.children[2]);
                    item.children[2].textContent = gameWindow.prettify(this.map_cost(i - 10));
                }
            }
        });
    }
    fragment_class(i) {
        let $mlInput = gameWindow.document.getElementById("mapLevelInput");
        let old = parseInt($mlInput.value, 10);
        $mlInput.value = game.global.world;
        let className = (gameWindow.affordMaxLevelsPerfect(i)) ? "mapExtraAfford1" : ((gameWindow.affordMaxLevelsCheap(i) ? "mapExtraAfford2" : "mapExtraNoAfford"));
        
        $mlInput.value = old;
        return className;
    }
    map_cost(i) {
        let $mlInput = gameWindow.document.getElementById("mapLevelInput");
        let old = parseInt($mlInput.value, 10);
        $mlInput.value = game.global.world;
        let cost = gameWindow.updateMapCost(true, 10 * i);

        $mlInput.value = old;
        return cost;
    }
    get prestiges() {
        // One Day check for Sci 4
        // getSLevel() >= 4 && game.global.challengeActive != "Mapology" && (Math.ceil(game.mapUnlocks[cell.special].last / 5) % 2 == 1)
        return [...Array(21).keys()].map(i => Object.entries(game.mapUnlocks)
            .map(([k,v]) => v)
            .filter((v) => v.prestige)
            .map(v => Math.floor(((game.global.world + i - 10) - v.last) / 5)).map(v => Math.max(0, v)).reduce((a,b) => a+b))
    }
}