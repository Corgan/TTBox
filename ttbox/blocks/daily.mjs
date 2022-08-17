import TTBox from '../ttbox.mjs';
import StatBlock from './block.mjs';
import { createElement } from './../helpers.mjs';

export default class DailyBlock extends StatBlock {
    static namtypee = 'Daily Status';
    constructor({...args}={}) {
        super({id: 'daily', ...args});
    }
    init() {
        super.init();
        if(!this.$week)
            this.$week = this.dailies.map((day, i) => createElement('div', {
                classList: ['noselect',  'lowPad', 'dailyTop', (day.done ? 'colorGrey' : 'colorSuccess')],
                id: `daily-${i}`,
                parent: this.$content
            }));
        
        this.initialized = true;
    }
    update() {
        super.update();
        this.dailies.forEach((day, i) => {
            let item = this.$week[i];
            let update = false;
            if(!item.getAttribute('data-value'))
                update = true;
            if((item.getAttribute('data-value') == "true") != day.done)
                update = true;
            if(i == ((gameWindow.getDailyTimeString(0, false, true) + 1) % 7))
                update = true;
            if((item.getAttribute('data-active') == "true") != day.active)
                update = true;

            if(update) {
                let sub = day.done ? 'DONE' : `${gameWindow.prettify(day.he)}%`;
                if(i == ((gameWindow.getDailyTimeString(0, false, true) + 1) % 7))
                    sub = gameWindow.updateDailyClock(true);
                let color = 'colorSuccess';
                if(day.done)
                    color = 'colorGrey';
                if(day.active) {
                    sub = 'ACTIVE';
                    color = 'colorWarning';
                }
                gameWindow.swapClass('color', color, item);
                item.innerHTML = `${day.abbr}<br/>${sub}`;
                item.setAttribute('data-value', day.done);
                item.setAttribute('data-active', day.active);
                item.setAttribute('data-tooltip', day.tt)
            }
        });
    }
    get dailies() {
        let today = gameWindow.getDailyTimeString(0, false, true);
        return [...Array(7).keys()].map(i => {
            var day = (today * -1) + i;
            if (day > 0)
                day = (i - today) - 7;

            return {
                active: game.global.challengeActive == 'Daily' && gameWindow.getDailyTimeString(day) == game.global.dailyChallenge.seed,
                tt: '<ul><li>'+Object.entries(gameWindow.getDailyChallenge(day, true)).filter(([k,v]) => k!='seed').map(([k,v]) => gameWindow.dailyModifiers[k].description(v.strength)).join('</li><li>')+'</li></ul>',
                done: (game.global.recentDailies.indexOf(gameWindow.getDailyTimeString(day)) != -1),
                abbr: gameWindow.dayOfWeek(gameWindow.getDailyTimeString(day, false, true)).charAt(0),
                he: gameWindow.getDailyHeliumValue(gameWindow.countDailyWeight(gameWindow.getDailyChallenge(day, true))),
            }
        })
    }
}