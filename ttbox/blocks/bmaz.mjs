import TTBox from '../ttbox.mjs';
import StatBlock from './block.mjs';
import { createElement, chunks } from './../helpers.mjs';
import MapsModule from '../modules/maps.mjs';

export default class BMaZBlock extends StatBlock {
    static type = 'BMaZ';
    constructor({...args}={}) {
        super({id: 'bmaz', ...args});
    }
    init() {
        super.init();

        if(!this.$bmaz)
            this.$bmaz = MapsModule.bmaz.render(this.$content);

        console.log(MapsModule.bmaz);
        
        this.initialized = true;
    }
    update() {
        super.update();

        MapsModule.bmaz.render();
    }
}