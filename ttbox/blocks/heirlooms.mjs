import TTBox from '../ttbox.mjs';
import StatBlock from './block.mjs';
import { createElement } from './../helpers.mjs';

export default class HeirloomsBlock extends StatBlock {
    constructor({...args}={}) {
        super({id: 'heirlooms', ...args});
    }
    init() {
        super.init();

        this.Equipped = createElement('div', {
            id: `heirlooms-equipped`,
            parent: this.$content
        });

        this.Shield = createElement('div', {
            id: `heirlooms-shield`,
            classList: ['heirloom'],
            parent: this.Equipped
        });
        this.Core = createElement('div', {
            id: `heirlooms-core`,
            classList: ['heirloom'],
            parent: this.Equipped
        });
        this.Staff = createElement('div', {
            id: `heirlooms-staff`,
            classList: ['heirloom'],
            parent: this.Equipped
        });

        this.Carried = createElement('div', {
            id: `heirlooms-carried`,
            parent: this.$content
        });

        this.Extra = createElement('div', {
            id: `heirlooms-extra`,
            parent: this.$content
        });
        
        this.initialized = true;
    }
    update_icon(icon, heirloom, loc, idx=-1) {
        let h_icon = gameWindow.getHeirloomIcon(heirloom);

        icon.className = "";

        //icon.classList.toggle("animated", game.options.menu.showHeirloomAnimations.enabled); // WE LEAK MEMORY??????????????
        icon.classList.add("heirloom");
        icon.classList.add("heirloomThing");
        icon.classList.add(...h_icon.split(' '));
        icon.classList.add("heirloomRare"+heirloom.rarity);
        icon.setAttribute('data-id', heirloom.id);
        icon.setAttribute('data-tooltip', gameWindow.displaySelectedHeirloom(false, 0, true, loc, idx));
    }
    update() {
        super.update();
        if(this.Shield.getAttribute('data-id') != game.global.ShieldEquipped.id) {
            this.update_icon(this.Shield, game.global.ShieldEquipped, "ShieldEquipped");
        }
        if(this.Staff.getAttribute('data-id') != game.global.StaffEquipped.id) {
            this.update_icon(this.Staff, game.global.StaffEquipped, "StaffEquipped");
        }
        if(this.Core.getAttribute('data-id') != game.global.CoreEquipped.id) {
            this.update_icon(this.Core, game.global.CoreEquipped, "CoreEquipped");
        }
        
        if(this.Carried.children.length != game.global.heirloomsCarried.length) {
            let len = Math.max(game.global.heirloomsCarried.length, this.Carried.children.length);
            for(let i=0; i<len; i++) {
                let heirloom = game.global.heirloomsCarried[i];
                let icon = this.Carried.children[i];

                if(icon)
                    icon.classList.toggle('hide', !heirloom);

                if(!icon && heirloom) {
                    createElement('div', {
                        parent: this.Carried
                    })
                }
            }
        }

        game.global.heirloomsCarried.forEach(function(heirloom, i) {
            let el = this.Carried.children[i];
            if(el.getAttribute('data-id') != heirloom.id)
                this.update_icon(el, heirloom, "heirloomsCarried", i);
        }.bind(this))

        if(this.Extra.children.length != game.global.heirloomsExtra.length) {
            let len = Math.max(game.global.heirloomsExtra.length, this.Extra.children.length);
            for(let i=0; i<len; i++) {
                let heirloom = game.global.heirloomsExtra[i];
                let icon = this.Extra.children[i];

                if(icon)
                    icon.classList.toggle('hide', !heirloom);

                if(!icon && heirloom) {
                    createElement('div', {
                        parent: this.Extra
                    })
                }
            }
        }

        game.global.heirloomsExtra.forEach(function(heirloom, i) {
            let el = this.Extra.children[i];
            if(el.getAttribute('data-id') != heirloom.id)
                this.update_icon(el, heirloom, "heirloomsExtra", i);
        }.bind(this))
    }
}