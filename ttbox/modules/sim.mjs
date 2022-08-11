import TTModule from './module.mjs';

export default class SimulatorModule extends TTModule {
    static id = 'sim';
    static instance = new this();

    constructor() {
        super(...arguments);
        if(this.constructor.instance)
            return this.constructor.instance;
    }

    async start() {
        await super.start(...arguments);
    }

    async stop() {
        await super.stop(...arguments);
    }

    async update() {
        await super.update(...arguments);
    }


    enemyAt({
        mapsActive,
        spireActive,
        challengeActive,
        
        world,
        level,

        name="Chimp",
        corrupted=false,
        empowerment=false,
        mutation=false,

        location,
        size,
        difficulty,
        loot
    }) {
        let enemy = {};

        /* Base */
        enemy.health = enemy.baseHealth = game.global.getEnemyHealth(level, name);
        enemy.attack = enemy.baseAttack = game.global.getEnemyAttack(level, name);

        /* Mutation */
        if(mutations[mutation]) {
            if(mutations[mutation].attack)
                enemy.attack = enemy.baseAttack = mutations[mutation].attack(level, name);
            if(mutations[mutation].health)
                enemy.health = enemy.baseHealth = mutations[mutation].health(level, name);
        }

        /* Spire */
        if(spireActive) {
            let spireNum = Math.floor((world - 100) / 100);
            let spireStats = this.getSpireStats(spireNum, level, name);

			enemy.preSpireAttack = enemy.attack;
			enemy.preSpireHealth = enemy.health;

			enemy.attack = spireStats.attack;
			enemy.health = spireStats.health;
        }


        /* Corrupted */
		if (corrupted == "corruptStrong") enemy.attack *= 2;
		if (corrupted == "healthyStrong") enemy.attack *= 2.5;
		if (corrupted == "corruptTough") enemy.health *= 5;
		if (corrupted == "healthyTough") enemy.health *= 7.5;


        /* Empowered (Poison/Wind/Ice) */
		if (empowerment){
			if (mutation != "Corruption"){
				enemy.health = mutations.Corruption.health(level, name);
				enemy.attack = mutations.Corruption.attack(level, name);
			}
			enemy.health *= 4;
			enemy.attack *= 1.2;
		}

        /* Oblit / Erad */
		if (challengeActive == "Obliterated" || challengeActive == "Eradicated"){
			var oblitMult = (challengeActive == "Eradicated") ? game.challenges.Eradicated.scaleModifier : 1e12;
			var zoneModifier = Math.floor(world / game.challenges[challengeActive].zoneScaleFreq);
			oblitMult *= Math.pow(game.challenges[challengeActive].zoneScaling, zoneModifier);
			enemy.health *= oblitMult;
			enemy.attack *= oblitMult;
		}

		/* Daily*/
        /*
        if (challengeActive == "Daily") {
			if (typeof game.global.dailyChallenge.badHealth !== 'undefined'){
				cell.health *= dailyModifiers.badHealth.getMult(game.global.dailyChallenge.badHealth.strength);
			}
			if (typeof game.global.dailyChallenge.badMapHealth !== 'undefined' && game.global.mapsActive){
				cell.health *= dailyModifiers.badMapHealth.getMult(game.global.dailyChallenge.badMapHealth.strength);
			}
			if (typeof game.global.dailyChallenge.empower !== 'undefined'){
				if (!game.global.mapsActive)
					cell.health *= dailyModifiers.empower.getMult(game.global.dailyChallenge.empower.strength, game.global.dailyChallenge.empower.stacks);
				updateDailyStacks("empower");
			}
		}
        */

        /* Life */
		if (challengeActive == "Life") {
			enemy.health *= 11;
			enemy.attack *= 6;
		}

        /* Coordinate */
		if (challengeActive == "Coordinate") cell.health *= TTBox.instance.modules.utils.badCoordLevel(world);

        /* Maps */
        if (mapsActive) {
            enemy.attack *= difficulty;
            enemy.health *= difficulty;
			if (world >= TTBox.instance.modules.utils.corruptionStart({ ignoreCorrupted: true, ...arguments[0] })) {
				if (TTBox.instance.modules.utils.magmaActive(...arguments) && location == "Void"){
					enemy.attack *= (mutations.Corruption.statScale(3)).toFixed(1);
					enemy.health *= (mutations.Corruption.statScale(10)).toFixed(1);
				}
				else if (location == "Void" || TTBox.instance.modules.utils.magmaActive(...arguments)){
					enemy.attack *= (mutations.Corruption.statScale(3) / 2).toFixed(1);
					enemy.health *= (mutations.Corruption.statScale(10) / 2).toFixed(1);
				}
			}
        }

        /* Mediate */
		if (game.global.challengeActive == "Meditate")
            enemy.health *= 2;

        /* Toxicity */
		if (game.global.challengeActive == "Toxicity") {
			enemy.attack *= 5;
			enemy.health *= 2;
		}

        /* Balance */
		if (challengeActive == "Balance") {
			enemy.attack *= (mapsActive) ? 2.35 : 1.17;
			enemy.health *= 2;
		}
        
        /* Unbalance */
		if (challengeActive == "Unbalance") {
			enemy.health *= (mapsActive) ? 2 : 3;
			enemy.attack *= 1.5;
		}
        
        /* Lead */
		if (challengeActive == "Lead" && (game.challenges.Lead.stacks > 0))
            enemy.health *= (1 + (Math.min(game.challenges.Lead.stacks, 200) * 0.04));
        
        /* Domination */
		if (challengeActive == "Domination") {
			if ((mapsActive && size == level + 1) || (!mapsActive && level == 99)) {
				enemy.attack *= 2.5;
				enemy.health *= 7.5;
			} else {
				enemy.attack *= 0.1;
				enemy.health *= 0.1;
			}
		}
        
        /* Quest */
		if (challengeActive == "Quest")
			enemy.health *= game.challenges.Quest.getHealthMult();
        
        /* Revenge */
		if (challengeActive == "Revenge" && world % 2 == 0)
			enemy.health *= 10;
        
        /* Mayhem */
		if (challengeActive == "Mayhem") {
			var mayhemMult = game.challenges.Mayhem.getEnemyMult();
			enemy.health *= mayhemMult;
			enemy.attack *= mayhemMult;
		}
        
        /* Exterminate */
		if (challengeActive == "Exterminate") {
			var extMult = game.challenges.Exterminate.getSwarmMult();
			enemy.health *= extMult;
			enemy.attack *= extMult;
		}
        
        /* Hypothermia */
		if (challengeActive == "Hypothermia") {
			var hypMult = game.challenges.Hypothermia.getEnemyMult();
			enemy.health *= hypMult;
			enemy.attack *= hypMult;
		}
        
        /* Experience */
		if (challengeActive == "Experience") {
			var xpMult = game.challenges.Experience.getEnemyMult();
			enemy.health *= xpMult;
			enemy.attack *= xpMult;
		}
        
        /* Duel */
		if (challengeActive == "Duel" && enemyStacks < 20)
            enemy.health *= game.challenges.Duel.healthMult;


        /* Improb/Omni */
        if (name == 'Improbability' || name == "Omnipotrimp") {
            if (world >= TTBox.instance.modules.utils.corruptionStart({ ignoreCorrupted: true, ...arguments[0] })) {
                if (spireActive) {
                    enemy.origHealth *= mutations.Corruption.statScale(10);
                    enemy.origAttack *= mutations.Corruption.statScale(3);
                } else {
                    enemy.health *= mutations.Corruption.statScale(10);
                    enemy.attack *= mutations.Corruption.statScale(3);
                }
            }
        }

		if (challengeActive == "Nurture"){
			enemy.health *= mapsActive ? 10 : 2;
			enemy.health *= game.buildings.Laboratory.getEnemyMult();
		}

		if (challengeActive == "Alchemy") {
			var statMult = alchObj.getEnemyStats(mapsActive, mapsActive && location == "Void") + 1;
			enemy.attack *= statMult;
			enemy.health *= statMult;
		}

		if (((challengeActive == "Mayhem" && level == 99 && !mapsActive) || challengeActive == "Pandemonium")) {
			enemy.preMayhemHealth = enemy.health;
			if (level == 99 && !mapsActive) enemy.health *= game.challenges[challengeActive].getBossMult();
			else enemy.health *= game.challenges.Pandemonium.getPandMult();
		}

		if (challengeActive == "Storm" && !mapsActive) {
			enemy.health *= game.challenges.Storm.getHealthMult();
			enemy.attack *= game.challenges.Storm.getAttackMult();
		}

		if (challengeActive == "Glass") {
			game.challenges.Glass.cellStartHealth = enemy.health;
			enemy.health *= game.challenges.Glass.healthMult();
		}

        return enemy;
    }

    /*
    let magmaStart = 
    
		start: function (){
			if (game.global.universe == 2) return 9999;
			if (game.global.challengeActive == "Eradicated") return 1;
			return 230;
		},
		active: function (){
			if (game.global.universe != 1) return false;
			return (game.global.canMagma && game.global.world >= this.start());
		},
    */

    get grid() {
        return game.global.gridArray.map(cell => {
            return this.enemyAt({
                world: game.global.world,
                ...cell,
                mapsActive: true,
                difficulty: 1
            })
        });
    };
    

    get attackGrid() {
        return game.global.gridArray.map(cell => {
            return this.calcBadGuyDmg(null, this.getEnemyAttack(game.global.world, cell.level, cell.name, 1.0, cell.corrupted != undefined), true, true);
        });
    };

    get healthGrid() {
        return game.global.gridArray.map(cell => {
            return this.calcBadGuyHealth(null, this.getEnemyMaxHealth(game.global.world, cell.level, cell.name, 1.0, cell.corrupted != undefined), true, true);
        });
    };

    get minAttack() { return Math.min(...this.attackGrid); }
    get avgAttack() { return [...this.attackGrid].reduce((p,c,i) => p + c, 0) / game.global.gridArray.length; }
    get maxAttack() { return Math.max(...this.attackGrid); }

    get minHealth() { return Math.min(...this.healthGrid); }
    get avgHealth() { return [...this.healthGrid].reduce((p,c,i) => p + c, 0) / game.global.gridArray.length; }
    get maxHealth() { return Math.max(...this.healthGrid); }




    getCorruptScale(a) {
        if(a == "attack")
            return mutations.Corruption.statScale(3);
        if(a == "health")
            return mutations.Corruption.statScale(10);
        return 0;
    }

    getEnemyAttack(a,b,c="Grimp",d,e){var f=0;return f+=50*Math.sqrt(a)*Math.pow(3.27,a/2),f-=10,1==a?(f*=0.35,f=0.2*f+0.75*f*(b/100)):2==a?(f*=0.5,f=0.32*f+0.68*f*(b/100)):60>a?f=0.375*f+0.7*f*(b/100):(f=0.4*f+0.9*f*(b/100),f*=Math.pow(1.15,a-59)),60>a&&(f*=0.85),d&&(f*=d),f*=e?this.getCorruptScale("attack"):game.badGuys[c].attack,Math.floor(f)}
    getEnemyMaxHealth(a,b=30,c="Grimp",d,e){var f=0;return f+=130*Math.sqrt(a)*Math.pow(3.265,a/2),f-=110,1==a||2==a&&10>b?(f*=0.6,f=0.25*f+0.72*f*(b/100)):60>a?f=0.4*f+0.4*f*(b/110):(f=0.5*f+0.8*f*(b/100),f*=Math.pow(1.1,a-59)),60>a&&(f*=0.75),d&&(f*=d),f*=e?this.getCorruptScale("health"):game.badGuys[c].health,Math.floor(f)}


    getSpireStats(spireNum=1, cell, name) {
        let stats = {};

        let mod = {
            attack: 1.17 + ((spireNum - 1) / 100) * 8,
            health: 1.14 + ((spireNum - 1) / 100) * 2,
        }
        
        stats.attack = game.global.getEnemyAttack(100, null, true);
        stats.health = game.global.getEnemyHealth(100, null, true) * 2;

        stats.attack *= Math.pow(mod.attack, cell);
        stats.health *= Math.pow(mod.health, cell);

        stats.attack *= game.badGuys[name].attack;
        stats.health *= game.badGuys[name].health;

        return stats;
    };

    modSpireAttack(world, cell, name) {
        var enemy = name ? name : game.global.gridArray[cell].name;
        var base = game.global.getEnemyAttack(cell, enemy, false);
        var mod = 1.17;
        var spireNum = Math.floor((game.global.world - 100) / 100);
        if (spireNum > 1) {
            var modRaiser = 0;
            modRaiser += ((spireNum - 1) / 100);
            modRaiser *= 8;
            mod += modRaiser;
        }
        base *= Math.pow(mod, cell);
        base *= game.badGuys[enemy].attack;
        return base;
    }

    modSpireHealth(spireNum=1) {
        //var spireNum = Math.floor((game.global.world - 100) / 100);
        let base = 1;
        let mod = 1.14;

        mod += ((spireNum - 1) / 100) * 2;

        base *= Math.pow(mod, cell);
        base *= game.badGuys[enemy].health;
        return base;
    }

    calcDailyAttackMod(number) {
        if (game.global.challengeActive == "Daily") {
            if (typeof game.global.dailyChallenge.badStrength !== 'undefined') {
                number *= dailyModifiers.badStrength.getMult(game.global.dailyChallenge.badStrength.strength);
            }
            if (typeof game.global.dailyChallenge.badMapStrength !== 'undefined' && game.global.mapsActive) {
                number *= dailyModifiers.badMapStrength.getMult(game.global.dailyChallenge.badMapStrength.strength);
            }
            if (typeof game.global.dailyChallenge.bloodthirst !== 'undefined') {
                number *= dailyModifiers.bloodthirst.getMult(game.global.dailyChallenge.bloodthirst.strength, game.global.dailyChallenge.bloodthirst.stacks);
            }
        }
        return number;
    }

    calcBadGuyDmg(enemy, attack, daily, maxormin, disableFlucts) {
        var number;
        if (enemy)
            number = enemy.attack;
        else
            number = attack;
        var fluctuation = .2;
        var maxFluct = -1;
        var minFluct = -1;

        if (!enemy && game.global.challengeActive) {
            if (game.global.challengeActive == "Coordinate") {
                number *= getBadCoordLevel();
            } else if (game.global.challengeActive == "Meditate") {
                number *= 1.5;
            } else if (enemy && game.global.challengeActive == "Nom" && typeof enemy.nomStacks !== 'undefined') {
                number *= Math.pow(1.25, enemy.nomStacks);
            } else if (game.global.challengeActive == "Watch") {
                number *= 1.25;
            } else if (game.global.challengeActive == "Lead") {
                number *= (1 + (game.challenges.Lead.stacks * 0.04));
            } else if (game.global.challengeActive == "Scientist" && getScientistLevel() == 5) {
                number *= 10;
            } else if (game.global.challengeActive == "Corrupted") {
                number *= 3;
            } else if (game.global.challengeActive == "Domination") {
                if (game.global.lastClearedCell == 98) {
                    number *= 2.5;
                } else number *= 0.1;
            } else if (game.global.challengeActive == "Obliterated" || game.global.challengeActive == "Eradicated") {
                var oblitMult = (game.global.challengeActive == "Eradicated") ? game.challenges.Eradicated.scaleModifier : 1e12;
                var zoneModifier = Math.floor(game.global.world / game.challenges[game.global.challengeActive].zoneScaleFreq);
                oblitMult *= Math.pow(game.challenges[game.global.challengeActive].zoneScaling, zoneModifier);
                number *= oblitMult;
            }
            if (daily)
                number = this.calcDailyAttackMod(number);
        }
        if (!enemy && game.global.usingShriek) {
            number *= game.mapUnlocks.roboTrimp.getShriekValue();
        }

        if (game.global.spireActive) {
            number = calcSpire(99, game.global.gridArray[99].name, 'attack');
        }

        if (!disableFlucts) {
            if (minFluct > 1) minFluct = 1;
            if (maxFluct == -1) maxFluct = fluctuation;
            if (minFluct == -1) minFluct = fluctuation;
            var min = Math.floor(number * (1 - minFluct));
            var max = Math.ceil(number + (number * maxFluct));
            return maxormin ? max : min;
        } else
            return number;
    }

    calcBadGuyHealth(enemy, health, daily) {
        var number;
        if (enemy)
            number = enemy.health;
        else
            number = health;

        if (game.global.challengeActive == "Obliterated" || game.global.challengeActive == "Eradicated") {
            var oblitMult = (game.global.challengeActive == "Eradicated") ? game.challenges.Eradicated.scaleModifier : 1e12;
            var zoneModifier = Math.floor(game.global.world / game.challenges[game.global.challengeActive].zoneScaleFreq);
            oblitMult *= Math.pow(game.challenges[game.global.challengeActive].zoneScaling, zoneModifier);
            number *= oblitMult;
        }
        if (game.global.challengeActive == "Coordinate") {
            number *= getBadCoordLevel();
        }
        if (game.global.challengeActive == "Toxicity") {
            number *= 2;
        }
        if (game.global.challengeActive == 'Lead') {
            number *= (1 + (game.challenges.Lead.stacks * 0.04));
        }
        if (game.global.challengeActive == 'Balance') {
            number *= 2;
        }
        if (game.global.challengeActive == 'Meditate') {
            number *= 2;
        }
        if (game.global.challengeActive == 'Life') {
            number *= 10;
        }
        if (game.global.challengeActive == "Domination") {
            if (game.global.lastClearedCell == 98) {
                number *= 7.5;
            } else number *= 0.1;
        }
        if (game.global.spireActive) {
            number = calcSpire(99, game.global.gridArray[99].name, 'health');
        }
        return number;
    }
}