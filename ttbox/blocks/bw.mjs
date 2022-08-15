import TTBox from '../ttbox.mjs';
import StatBlock from './block.mjs';
import { createElement } from './../helpers.mjs';

export default class BionicMapBlock extends StatBlock {
    constructor({...args}={}) {
        super({id: 'bw', ...args});
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
                    text: "BW"
                }),
                createElement('span', {
                    classList: ['items'],
                    text: "Items"
                })
            ]
        })

        this.maps = [...Array(4).keys()].map(i => createElement('div', {
            classList: ['key-value'],
            id: `map-level-${i}`,
            parent: this.$content,
            children: [
                createElement('span', {
                    classList: ['level']
                }),
                createElement('span', {
                    classList: ['items'],
                })
            ]
        }));
    }
    update() {
        super.update();
        this.bw.forEach((v, i) => {
            let item = this.maps[i];
            item.classList.toggle('hide', v <= 0 || game.global.world + 10 == ((game.global.bionicOwned - 2 + i) * 15 + 110));
            if(item.getAttribute('data-value') != v) {
                item.children[0].textContent = `${((game.global.bionicOwned - 2 + i) * 15 + 110)}`;
                item.setAttribute('data-value', v);
                item.children[1].textContent = v;
            }
        });
    }
    get bw() {
        return [...Array(4).keys()].map(i => Object.entries(game.mapUnlocks)
            .map(([k,v]) => v)
            .filter((v) => v.prestige)
            .map(v => Math.floor((((game.global.bionicOwned - 2 + i) * 15 + 110) - v.last) / 5)).map(v => Math.max(0, v)).reduce((a,b) => a+b));
    }
}