import TTBox from '../ttbox.mjs';
import StatBlock from './block.mjs';
import Configuration from '../configuration.mjs';
import { createElement } from './../helpers.mjs';

export default class InfoBlock extends StatBlock {
    static type = 'Info Block';
    constructor({...args}={}) {
        super({id: 'info', ...args});
        let { props } = args;
        if(props)
            this.props = props;
    }
    init() {
        super.init();
        this.props = this.props || [];
        
        this.initialized = true;
    }
    update() {
        super.update();

        let max = Math.max(this.$content.children.length, this.props.length);

        for(let i=0; i<max; i++) {
            let id = this.props[i];
            let $el = this.$content.children[i];
            let prop = this.constructor.props.find(p => p.id == id);

            if(!$el) {
                $el = createElement('div', {
                    classList: ['key-value'],
                    id: `${this.id}-${prop.id}`,
                    parent: this.$content,
                    children: [
                        createElement('span', {
                            classList: ['name'],
                            text: `${prop.name}`
                        }),
                        createElement('span', {
                            classList: ['value'],
                            text: prop.fn()
                        })
                    ]
                })
            } else {
                if(!prop) {
                    $el.classList.add('hide');
                } else {
                    $el.classList.remove('hide');
                    let [ $name, $value ] = [...$el.children];
                    let v = prop.fn();
                    if($el.id != `${this.id}-${prop.id}`)
                        $el.id = `${this.id}-${prop.id}`;
                    if($name.textContent != prop.name)
                        $name.textContent = prop.name;
                    if($value.textContent != v) {
                        $value.textContent = v;
                    }
                }
            }
        };
    }
    save() {
        let ret = super.save();
        ret.props = this.props || [];
        return ret;
    }
    load(data={}) {
        super.load(data);
        this.props = data.props = [];
    }
    update_config() {
        super.update_config();

        let $children = [...this.$config.children];

        let $props = $children.find(el => el.classList.contains('config-props'));
        if(!$props)
            this.$config.appendChild(Configuration.render_list('props', "Props", this, $props));
        $props = Configuration.render_list('props', "Props", this, $props);
    }
    static props = [
        { id: "hze", name: "HZE", fn: () => game.global.highestLevelCleared },
        { id: "liq", name: "Liq", fn: () => {
            let totalSpires = game.global.spiresCompleted;
            if (game.talents.liquification.purchased) totalSpires++;
            if (game.talents.liquification2.purchased) totalSpires++;
            if (game.talents.liquification3.purchased) totalSpires+=2;

            totalSpires += (gameWindow.Fluffy.isRewardActive("liquid") * 0.5);
            return Math.floor((totalSpires / 20) * (gameWindow.getHighestLevelCleared(false, true) + 1));
        }},
        { id: "t-he", name: "Total He", fn: () => gameWindow.prettify(game.global.totalHeliumEarned) },
        { id: "nu", name: "Nu", fn: () => gameWindow.prettify(game.global.nullifium) },
        { id: "spent", name: "Spent He", fn: () => gameWindow.prettify(gameWindow.countHeliumSpent(false, true)) },
        { id: "ss", name: "SS", fn: () => gameWindow.prettify(gameWindow.playerSpire.spirestones) },
        { id: "avail", name: "Avail He", fn: () => gameWindow.prettify(game.global.totalHeliumEarned - gameWindow.countHeliumSpent(false, true) - game.resources.helium.owned) },
        { id: "magmite", name: "MI", fn: () => game.global.magmite },
        { id: "c2", name: "C2%", fn: () => game.global.totalSquaredReward },
        { id: "bones", name: "Bones", fn: () => game.global.b },
        { id: "achieve", name: "Ach%", fn: () => game.global.achievementBonus },
        { id: "fluffy", name: "Fluffy", fn: () => `E${game.global.fluffyPrestige}L${gameWindow.Fluffy.currentLevel} - ${Math.ceil(gameWindow.Fluffy.getExp().slice(1).reduce((a,b) => a/b)*100)}%` },
        { id: "de", name: "DE", fn: () => gameWindow.prettify(game.global.essence) },
        { id: "next-talent", name: "Next Mastery", fn: () => gameWindow.prettify(gameWindow.getNextTalentCost()) },
        { id: "rtime", name: "Run Time", fn: () => gameWindow.formatSecondsAsClock(((gameWindow.getGameTime() - game.global.portalTime)/1000), 1)},
        { id: "zone", name: "Zone", fn: () => game.global.world },
        { id: "ztime", name: "Zone Time", fn: () => gameWindow.formatSecondsAsClock(((gameWindow.getZoneSeconds())), 1)},
        { id: "cell", name: "Cell", fn: () => (game.global.mapsActive ? (game.global.lastClearedMapCell+2) + "@M"+game.global.mapsOwnedArray[gameWindow.getMapIndex(game.global.currentMapId)].level : (game.global.lastClearedCell+2)) },
        { id: "mtime", name: "Map Time", fn: () => gameWindow.formatSecondsAsClock(((gameWindow.getGameTime() - (game.global.mapsActive ? game.global.mapStarted : gameWindow.getGameTime()))/1000), 1)},
        { id: "r-he", name: "He", fn: () => gameWindow.prettify(game.resources.helium.owned) },
        { id: "vms", name: "VMs", fn: () => `${gameWindow.countStackedVoidMaps()} (${game.global.totalVoidMaps})` },
        { id: "fluffxp", name: "XP", fn: () => {
            let fluffyInfo = gameWindow.Fluffy.getExp();
            let remainingXp = fluffyInfo[2] - fluffyInfo[1];
            let xpReward = gameWindow.Fluffy.getExpReward();
            return `${gameWindow.prettify(xpReward)} (${((xpReward/remainingXp)*100).toFixed(2)}%)` 
        }},
        { id: "scry-left", name: "Scry Left", fn: () => gameWindow.countRemainingEssenceDrops() },
        { id: "de-drop", name: "DE Drop", fn: () => gameWindow.prettify(gameWindow.calculateScryingReward()) },
        { id: "zone-emp", name: "Zone Emp", fn: () => gameWindow.getEmpowerment() + " (" + (((5 - ((game.global.world - 1) % 5)) + (game.global.world - 1)) - game.global.world) + " left)" },
        { id: "uber-emp", name: "Enlight", fn: () => gameWindow.getUberEmpowerment() || "None" },
        { id: "population", name: "Pop", fn: () => gameWindow.prettify(game.resources.trimps.realMax()) },
        { id: "breed-time", name: "Breed Timer", fn: () => ((game.jobs.Amalgamator.owned > 0) ? Math.floor((new Date().getTime() - game.global.lastSoldierSentAt) / 1000) : Math.floor(game.global.lastBreedTime / 1000)) + 's' },
        { id: "gator-next", name: "Next Gator", fn: () => gameWindow.prettify(game.jobs.Amalgamator.getTriggerThresh() * game.resources.trimps.getCurrentSend()) },
        { id: "gators", name: "Gators", fn: () => gameWindow.prettify(game.jobs.Amalgamator.owned) },
        { id: "gator-ratio", name: "Pop Ratio", fn: () => gameWindow.prettify(game.resources.trimps.realMax() / game.resources.trimps.getCurrentSend()) },
        { id: "scry-cells", name: "Scry Cells", fn: () => [...new Array(100).keys()].map(x => gameWindow.getRandomIntSeeded(game.global.scrySeed + (x + 1) - (game.global.lastClearedCell + 2), 0, 100)).map((x, i) => x <= 52 && x >= 50 ? i : 0).filter(Boolean).join(', ') },
        { id: "fluff-dmg", name: "Fluff %", fn: () => gameWindow.prettify((gameWindow.Fluffy.getDamageModifier() - 1) * 100) },
        { id: "golden-helium", name: "Golden Helium", fn: () => `${game.goldenUpgrades.Helium.purchasedAt.length} (${Math.round(game.goldenUpgrades.Helium.currentBonus * 100)}%)` },
        { id: "golden-battle", name: "Golden Battle", fn: () => `${game.goldenUpgrades.Battle.purchasedAt.length} (${Math.round(game.goldenUpgrades.Battle.currentBonus * 100)}%)` },
        { id: "golden-void", name: "Golden Void", fn: () => `${game.goldenUpgrades.Void.purchasedAt.length} (${Math.round(game.goldenUpgrades.Void.currentBonus * 100)}%)` },
        { id: "run-xp", name: "Run XP", fn: () => {
            if(!gameWindow.getPageSetting)
                return 'Requires AT';

            let minZone = 300;
            if (gameWindow.getPerkLevel("Classy"))
                minZone -= Math.floor(gameWindow.getPerkLevel("Classy") * game.portal.Classy.modifier);
            let portalZone = gameWindow.getPageSetting('AutoPortal') != 'Off' && gameWindow.getPageSetting('CustomAutoPortal');

            let endXpZone = gameWindow.getPageSetting('maxExpZone');
            let endRunZone = (() => {
                let pageSetting = gameWindow.getPageSetting('finishExpOnBw');
                pageSetting = pageSetting < 125 ? 125 : pageSetting;
                pageSetting = pageSetting != -1 ? (Math.floor((pageSetting - 125) / 15) * 15) + 125 : -1;
                return pageSetting;
            })();

            let numWonders = gameWindow.getPageSetting('wondersAmount');
            let startWonders = endXpZone - ((numWonders - 1) * 5);


            let xpFromZone = (zone, count) => {
                var reward = (gameWindow.Fluffy.baseExp + (gameWindow.getPerkLevel("Curious") * game.portal.Curious.modifier))
                reward *= Math.pow(gameWindow.Fluffy.expGrowth, zone)
                reward *= (1 + (gameWindow.getPerkLevel("Cunning") * game.portal.Cunning.modifier));
                reward *= gameWindow.Fluffy.specialExpModifier;

                if (game.talents.fluffyExp.purchased)
                    reward *= 1 + (0.25 * gameWindow.Fluffy.getCurrentPrestige());

                if (gameWindow.playerSpireTraps.Knowledge.owned)
                    reward *= (1 + (gameWindow.playerSpireTraps.Knowledge.getWorldBonus() / 100));

                if (gameWindow.autoBattle.oneTimers.Battlescruff.owned && game.global.universe == 2) 
                    reward *= (1 + ((gameWindow.autoBattle.maxEnemyLevel - 1) / 50));
                
                if (game.global.universe == 2 && gameWindow.u2Mutations.tree.Scruffy.purchased)
                    reward *= 1.3;
                
                if (count)
                    reward *= count;

                if (gameWindow.getHeirloomBonus("Staff", "FluffyExp") > 0)
                    reward *= (1 + (gameWindow.getHeirloomBonus("Staff", "FluffyExp") / 100));
                
                if (game.global.challengeActive == "Daily")
                    reward *= (1 + (gameWindow.getDailyHeliumValue(gameWindow.countDailyWeight()) / 100));

                if (gameWindow.getUberEmpowerment() == "Ice")
                    reward *= (1 + (game.empowerments.Ice.getLevel() * 0.0025));

                return reward;
            }

            let xpMult = (wonders, extraTiers=0) => {
                return (wonders * 0.05) + (extraTiers * 0.5);
            }

            if(!portalZone)
                portalZone = game.global.world;
            let xp = 0;
            let wonderCount = 0;
            for(let i=minZone; i<=portalZone; i++) {
                let zone = i - minZone;
                if(game.global.challengeActive == "Experience" && i >= startWonders && i <= endXpZone && i % 5 == 0) {
                    xp += xpFromZone(zone, 3);
                    wonderCount++;
                }

                if(i > 300 && i % 100 == 0) {
                    xp += xpFromZone(zone, 2);
                }
                
                xp += xpFromZone(zone);
            }

            if(game.global.challengeActive == "Experience" && endRunZone >= 605)
                xp *= xpMult(wonderCount, Math.min(7, Math.max(0, Math.floor((endRunZone - 605) / 15))));

            return gameWindow.prettify(xp);
        }},
        { id: "mmm-bonus", name: "MMM Bonus", fn: () => {
            var max = 120;
            var timeOnZone = Math.floor((gameWindow.getGameTime() - game.global.zoneStarted) / 60000);
            if (game.talents.magmamancer.purchased) timeOnZone += 5;
            if (game.talents.stillMagmamancer.purchased){
                timeOnZone = Math.floor(timeOnZone + game.global.spireRows);
                var extraMax = game.global.spireRows * 0.5;
                max = Math.floor((extraMax + max) / 10) * 10;
            }
            return gameWindow.prettify((game.jobs.Magmamancer.getBonusPercent() - 1) * 100) + '%';
        }},
        { id: "mmm-timer", name: "MMM Timer", fn: () => {
            var max = 120;
            var timeOnZone = Math.floor((gameWindow.getGameTime() - game.global.zoneStarted) / 60000);
            if (game.talents.magmamancer.purchased) timeOnZone += 5;
            if (game.talents.stillMagmamancer.purchased){
                timeOnZone = Math.floor(timeOnZone + game.global.spireRows);
                var extraMax = game.global.spireRows * 0.5;
                max = Math.floor((extraMax + max) / 10) * 10;
            }

            if (timeOnZone >= max)
                return gameWindow.prettify(max) + 'm';
            else{
                var remaining = 10 - (timeOnZone % 10);
                return `${timeOnZone}m (${gameWindow.prettify(remaining)}m)`;
            }
        }}
    ]
}