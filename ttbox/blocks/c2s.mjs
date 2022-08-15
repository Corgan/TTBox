import TTBox from '../ttbox.mjs';
import StatBlock from './block.mjs';
import { createElement } from './../helpers.mjs';

export default class Challenge2Block extends StatBlock {
    constructor({...args}={}) {
        super({id: 'c2s', ...args});
    }
    init() {
        super.init();
        this.$header = createElement('div', {
            classList: ['key-value'],
            id: `c2s-header`,
            parent: this.$content,
            children: [
                createElement('span', {
                    classList: ['name'],
                    text: "Challenge"
                }),
                createElement('span', {
                    classList: ['hze'],
                    text: "HZE"
                }),
                createElement('span', {
                    classList: ['bonus'],
                    text: "Bonus %"
                })
            ]
        })

        this.$challenges = Object.entries(game.c2).map(([c2, hze], i) => createElement('div', {
            classList: ['key-value'],
            id: `c2s-entry-${i}`,
            parent: this.$content,
            children: [
                createElement('span', {
                    classList: ['name']
                }),
                createElement('span', {
                    classList: ['hze'],
                }),
                createElement('span', {
                    classList: ['bonus'],
                })
            ]
        }));
    }
    update() {
        super.update();
        Object.entries(game.c2).forEach(([c2, hze], i) => {
            let $item = this.$challenges[i];
            let [ $name, $hze, $bonus ] = [...$item.children];
            $name.textContent = c2;
            $hze.textContent = hze;
            $bonus.textContent = gameWindow.getIndividualSquaredReward(c2);
        });
    }
    get bw() {
        return [...Array(4).keys()].map(i => Object.entries(game.mapUnlocks)
            .map(([k,v]) => v)
            .filter((v) => v.prestige)
            .map(v => Math.floor((((game.global.bionicOwned - 2 + i) * 15 + 110) - v.last) / 5)).map(v => Math.max(0, v)).reduce((a,b) => a+b));
    }
}