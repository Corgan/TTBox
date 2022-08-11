import BlockManager from '../block_manager.mjs';
import StatBlock from './block.mjs';
import { createElement } from './../helpers.mjs';

export default class VoidsBlock extends StatBlock {
    static {
        BlockManager.register(this);
    }
    constructor({...args}={}) {
        super({id: 'voids', ...args});
    }
    init() {
        super.init();
        this.$header = createElement('div', {
            classList: ['key-value'],
            id: `void-header`,
            parent: this.$content,
            children: [
                createElement('span', {
                    classList: ['prefix'],
                    text: "Prefix"
                }),
                createElement('span', {
                    classList: ['suffix'],
                    text: "Suffix"
                }),
                createElement('span', {
                    classList: ['stack'],
                    text: "Stacks"
                }),
                createElement('span', {
                    classList: ['he'],
                    text: "He"
                })
            ]
        });

        this.$vm_container = createElement('div', {
            classList: ['map-container'],
            parent: this.$content,
        });

        this.$vms = this.names.map((name, i) => createElement('div', {
            classList: ['key-value'],
            id: `void-vm-${name.toLowerCase().replace(' ', '-')}`,
            parent: this.$vm_container,
            children: [
                createElement('span', {
                    classList: ['prefix'],
                    text: `${name.split(' ')[0]}`
                }),
                createElement('span', {
                    classList: ['suffix'],
                    text: `${name.split(' ')[1]}`
                }),
                createElement('span', {
                    classList: ['stack']
                }),
                createElement('span', {
                    classList: ['he']
                })
            ]
        }));

        this.$total = createElement('div', {
            classList: ['key-value'],
            id: `void-vm-total`,
            parent: this.$content,
            children: [
                createElement('span', {
                    classList: ['prefix'],
                    text: `Total`
                }),
                createElement('span', {
                    classList: ['suffix']
                }),
                createElement('span', {
                    classList: ['stack']
                }),
                createElement('span', {
                    classList: ['he']
                })
            ]
        })
    }
    update() {
        super.update();

        let world = gameWindow.getPageSetting && gameWindow.getPageSetting('VoidMaps') > 0 && gameWindow.getPageSetting('VoidMaps') >= game.global.world ? gameWindow.getPageSetting('VoidMaps') : game.global.world;
        //world = game.global.world;

        this.$header.children[3].textContent = `He @ ${world}`;

        let totals = {
            he: 0,
            stacks: 0
        };

        this.maps.map((map) => (this.$vm_container.removeChild(map.$el), map))
            .sort((a, b) => (b && b.stacked || 0) - (a && a.stacked || 0))
            .forEach((map) => this.$vm_container.appendChild(map.$el));

        this.maps.forEach((map) => {
            let [ prefix, suffix, stack, he ] = map.$el.children;
            stack.textContent = map.stacked != undefined ? map.stacked ? map.stacked+1 : 1 : 0;
            //map.$el.classList.toggle('hide', !map || map.stacked == 0);
            let helium = 0;
            if(map.stacked != undefined) {
                helium += this.helium_from_cthulimp(world);
                totals.stacks += 1;
                if(map.stacked > 0) {
                    helium += this.helium_from_cthulimp(world, true, map.stacked);
                    totals.stacks += map.stacked;
                }
                totals.he += helium;
            }
            he.textContent = gameWindow.prettify(helium);
        });

        this.$total.children[2].textContent = gameWindow.prettify(totals.stacks);
        this.$total.children[3].textContent = gameWindow.prettify(totals.he);
    }


    helium_from_cthulimp(world, fromFluffy, fluffyCount) {
        var baseAmt = world >= 60 ? 10 : 2;

        if (world > gameWindow.mutations.Magma.start())
            baseAmt *= 3;
        if (game.global.challengeActive == "Domination")
            baseAmt *= 3;

        var percentage = 1;
        var rewardPercent = 1;
        if (game.global.universe == 1 && world >= gameWindow.mutations.Corruption.start(true)) {
            rewardPercent = 2;
            percentage = (game.global.challengeActive == "Corrupted") ? 0.075 : 0.15;

            var corrCount = gameWindow.mutations.Corruption.cellCount();
            if (gameWindow.mutations.Healthy.active()) corrCount -= gameWindow.mutations.Healthy.cellCount();
            percentage *= corrCount;
            if (gameWindow.mutations.Healthy.active()){
                var healthyValue = (game.talents.healthStrength2.purchased) ? 0.65 : 0.45;
                baseAmt *= ((gameWindow.mutations.Healthy.cellCount() * healthyValue) + percentage + 1);
            } else {
                baseAmt *= (percentage + 1);
            }
        }
        if (game.talents.voidSpecial.purchased){
            baseAmt *= ((gameWindow.getLastPortal() * 0.0025) + 1);
        }

        var fluffyBonus = 1;
        if (fromFluffy){
            var maxFloof = gameWindow.Fluffy.getVoidStackCount() - 1;
            var countFloof = (fluffyCount > maxFloof) ? maxFloof : fluffyCount;
            if (game.talents.voidMastery.purchased){
                fluffyBonus = Math.pow(1.5, countFloof);
            }
            else{
                fluffyBonus = (1 + (0.5 * countFloof));
            }
            baseAmt *= fluffyBonus;
            baseAmt *= fluffyCount;
        }
        if (game.talents.scry2.purchased && game.global.canScryCache) baseAmt *= 1.5;
        
        let amt = 0;
        if (!game.global.runningChallengeSquared) {
            let level = gameWindow.scaleLootLevel(99, world);

            level = Math.round((level - 1900) / 100);
            level *= 1.35;
            if (level < 0) level = 0;
            amt += baseAmt * Math.pow(1.23, Math.sqrt(level));
            amt += baseAmt * level;

            if (gameWindow.getPerkLevel("Looting")) amt += (amt * gameWindow.getPerkLevel("Looting") * game.portal.Looting.modifier);
            if (gameWindow.getPerkLevel("Looting_II")) amt *= (1 + (gameWindow.getPerkLevel("Looting_II") * game.portal.Looting_II.modifier));
            amt *= gameWindow.alchObj.getRadonMult();

            if (gameWindow.getPerkLevel("Greed")) amt *= game.portal.Greed.getMult();
            if (game.global.challengeActive == "Quagmire") amt *= game.challenges.Quagmire.getLootMult();
            var spireRowBonus = (game.talents.stillRowing.purchased) ? 0.03 : 0.02;
            if (game.global.spireRows > 0) amt *= 1 + (game.global.spireRows * spireRowBonus);
            if (game.global.totalSquaredReward > 0) amt *= ((game.global.totalSquaredReward / 1000) + 1);
            if (game.global.mayhemCompletions > 0) amt *= game.challenges.Mayhem.getTrimpMult();
            if (gameWindow.autoBattle.bonuses.Radon.level > 0 && game.global.universe == 2) amt *= autoBattle.bonuses.Radon.getMult();
            if (game.global.pandCompletions > 0) amt *= game.challenges.Pandemonium.getTrimpMult();
            if (game.global.challengeActive == "Archaeology"){
                amt *= game.challenges.Archaeology.getStatMult("radon");
            }
            if (game.global.challengeActive == "Insanity"){
                amt *= game.challenges.Insanity.getLootMult();
            }
            if (game.global.challengeActive == "Nurture"){
                amt *= game.challenges.Nurture.getRadonMult();
            }
            if (game.global.challengeActive == "Hypothermia"){
                amt *= game.challenges.Hypothermia.getRadonMult();
            }
            if (game.global.challengeActive == "Toxicity"){
                var toxMult = (game.challenges.Toxicity.lootMult * game.challenges.Toxicity.stacks) / 100;
                amt *= (1 + toxMult);
            }
            if (game.global.challengeActive == "Lead" && ((game.global.world % 2) == 1)) amt *= 2;

            if (game.singleRunBonuses.heliumy.owned) amt *= 1.25;
            if (gameWindow.getSLevel() >= 5) amt *= Math.pow(1.005, world);
            if (game.goldenUpgrades.Helium.currentBonus > 0) amt *= 1 + game.goldenUpgrades.Helium.currentBonus;
            if (gameWindow.playerSpireTraps.Condenser.owned) amt *= (1 + (gameWindow.playerSpireTraps.Condenser.getWorldBonus() / 100));
            if (game.global.challengeActive == "Quest" && game.challenges.Quest.questComplete) amt *= 2;
            var fluffyBonus = gameWindow.Fluffy.isRewardActive("helium");
            amt += (amt * (fluffyBonus * 0.25));
            if (gameWindow.Fluffy.isRewardActive("radortle")){
                amt *= gameWindow.Fluffy.getRadortleMult();
            }
            if (game.jobs.Meteorologist.vestedHires > 0) amt *= game.jobs.Meteorologist.getMult();
            if (game.global.universe == 2 && game.global.glassDone && world > 175){
                var glassMult = Math.pow(1.1, world - 175);
                amt *= glassMult;
            }
            if (game.global.universe == 2 && world >= 201){
                amt *= 400;
                if (gameWindow.u2Mutations.tree.AllRadon.purchased) amt *= 1.5;
            }
            if (rewardPercent > 0) amt *= rewardPercent;
            amt = Math.floor(amt);
        }

        return amt;
    }
    
    prefixes = ['Deadly', 'Poisonous', 'Heinous', 'Destructive'];
    suffixes = ['Nightmare', 'Void', 'Descent', 'Pit'];
    names = this.suffixes.flatMap(suffix => this.prefixes.map(prefix => `${prefix} ${suffix}`));
    get maps() {
        return this.names.map(name => {
            let map = game.global.mapsOwnedArray.find(owned => owned.name == name) || { name: name };
            let $el = this.$vms.find(node => node.id == `void-vm-${name.toLowerCase().replace(' ', '-')}`) || false;
            return {
                ...map,
                $el: $el
            }
        });
    }
}