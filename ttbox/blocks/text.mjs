import BlockManager from '../block_manager.mjs';
import StatBlock from './block.mjs';
import { createElement } from './../helpers.mjs';

export default class TextBlock extends StatBlock {
    static {
        BlockManager.register(this);
    }
    constructor({text, ...args}={}) {
        super({id: 'text', ...args});
        this.text = text;
    }
    init() {
        super.init();
        this.textDiv = createElement('span', {
            parent: this.$content
        });
    }
    update() {
        super.update();
        if(this.textDiv.getAttribute('data-value') != this.text) {
            this.textDiv.setAttribute('data-value', this.text);
            this.textDiv.textContent = this.text;
        }
    }
    save() {
        let ret = super.save();
        ret.text = this.text;
        return ret;
    }
    load(data) {
        super.load(data);
        this.text = data.text;
    }
    change_text(text) {
        this.text = text;
    }
}