import TTBox from '../ttbox.mjs';
import StatBlock from './block.mjs';
import { createElement, chunks } from './../helpers.mjs';

export default class EqualityBlock extends StatBlock {
    static type = 'Equality';
    constructor({...args}={}) {
        super({id: 'equality', ...args});
    }
    init() {
        super.init();

        this.$equality_container = createElement('pre', {
            id: `equality`,
            parent: this.$content
        });
        
        this.initialized = true;
    }
    update() {
        super.update();

        //game.global.fightAttackCount
        //game.global.armyAttackCount
        //game.portal.Equality.scalingCount
        //game.global.soldierEnergyShield
        //game.global.soldierEnergyShieldMax

        // Trimp Health, game.global.soldierHealth
        // game.global.soldierHealthMax
        // Angelic Heal, (game.global.soldierHealth / 2)
        // Trimp Block, game.global.soldierCurrentBlock
        // var trimpAttack = calculateDamage(game.global.soldierCurrentAttack, false, true);

	    //var cellAttack = calculateDamage(cell.attack, false, false, false, cell);
        // Math.pow(game.portal.Equality.modifier, 2);

        if(game.global.universe == 2) {
            let cell = TTBox.loadedModules.utils.current;

            if(!cell)
                return;
            
            var attackFirst = !(game.global.challengeActive == "Glass" || game.global.challengeActive == "Slow" || ((((game.badGuys[cell.name].fast || cell.mutation == "Corruption") && game.global.challengeActive != "Nom") || game.global.voidBuff == "doubleAttack") && game.global.challengeActive != "Coordinate"));
            if (!attackFirst && game.global.challengeActive == "Exterminate" && game.challenges.Exterminate.experienced) attackFirst = true;
            if (game.global.challengeActive == "Duel"){
                if (game.challenges.Duel.enemyStacks < 10) attackFirst = false;
                else if (game.challenges.Duel.trimpStacks < 10 && !game.global.runningChallengeSquared) attackFirst = false;
            }
            if (game.global.challengeActive == "Smithless" && cell.ubersmith && !cell.failedUber) attackFirst = true;
            if (cell.u2Mutation && cell.u2Mutation.length) attackFirst = true;

            function hits(offset=0, max=false) {
                game.portal.Equality.disabledStackCount = parseInt(game.portal.Equality.disabledStackCount) + offset;
                let trimpHealth = Math.max(0, (max ? (game.global.soldierEnergyShieldMax * (gameWindow.Fluffy.isRewardActive("shieldlayer") + 1)) : (game.global.soldierEnergyShield * ((gameWindow.Fluffy.isRewardActive("shieldlayer") + 1) - game.global.shieldLayersUsed)))) + (max ? game.global.soldierHealthMax : game.global.soldierHealth);
                let cellMin = gameWindow.calculateDamage(cell.attack, false, false, false, cell, true)
                let cellMax = cellMin * 3;
                let hitsSurvived = trimpHealth / cellMax;
                return hitsSurvived;
            }

            function toKill() {
                let cellHealth = cell.maxHealth;
                let [trimpMin, trimpMax] = gameWindow.calculateDamage(game.global.soldierCurrentAttack, true, true).split('-');
                let hitsSurvived = cellHealth / trimpMin;
                return hitsSurvived;
            }

            

            let dontDie = false;//game.global.realBreedTime >= 1000;
            let burst = true;
            let hitsSurvived = hits(0, !dontDie);
            if(game.global.soldierHealth > 0) {
                if(!attackFirst || dontDie || burst) {
                    let hitsToSurvive = dontDie || burst ? 4 : 1;

                    //if(game.global.mapsActive && gameWindow.getCurrentMapObject() && gameWindow.getCurrentMapObject().voidBuff == "getCrit")
                        //hitsToSurvive *= 4;

                    while(hitsSurvived > hitsToSurvive && game.portal.Equality.disabledStackCount > 0) {
                        hitsSurvived = hits(-1, !dontDie);
                    }
                    while(hitsSurvived < hitsToSurvive && game.portal.Equality.disabledStackCount < gameWindow.getPerkLevel("Equality")) {
                        hitsSurvived = hits(1, !dontDie);
                    }
                } else {
                    game.portal.Equality.disabledStackCount = 0;
                }
            }
            gameWindow.manageEqualityStacks();

            let [min, max] = gameWindow.calculateDamage(game.global.soldierCurrentAttack, true, true).split('-');

            this.$equality_container.innerHTML = 
`${game.portal.Equality.disabledStackCount}
${gameWindow.prettify(hitsSurvived)}
${gameWindow.prettify(toKill())}
${game.global.realBreedTime}
${game.global.lastBreedTime}`;
        }
    }
}