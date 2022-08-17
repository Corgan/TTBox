import TTBox from '../ttbox.mjs';
import StatBlock from './block.mjs';
import { createElement } from './../helpers.mjs';
import Configuration from '../configuration.mjs';

export default class TextBlock extends StatBlock {
    static type = 'Text Block';
    constructor({text, ...args}={}) {
        super({id: 'text', ...args});
        this.text = text;
    }
    init() {
        super.init();
        this.text = this.text || "";
        if(!this.$text)
            this.$text = createElement('span', {
                parent: this.$content
            });
        
        this.initialized = true;
    }
    update() {
        super.update();
        if(this.$text.getAttribute('data-value') != this.text) {
            this.$text.setAttribute('data-value', this.text);
            this.$text.textContent = this.text;
        }
    }
    save() {
        let ret = super.save();
        ret.text = this.text || "";
        return ret;
    }
    load(data={}) {
        super.load(data);
        this.text = data.text || "";
    }
    update_config() {
        super.update_config();
        
        let $children = [...this.$config.children];

        let $text = $children.find(el => el.classList.contains('config-text'));
        if(!$text)
            $text = createElement('div', {
                parent: this.$config,
                classList: ['config', 'config-text'],
                attributes: [['data-config', 'text']],
                children: [
                    createElement('span', {
                        text: "Text"
                    }),
                    Configuration.render_text('text', this, this.text)
                ]
            });
    }
}