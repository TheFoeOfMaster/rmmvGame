// Add to the js/plugins folder and remember to save the project after adding
// the plugin or changing any parameters used by the plugin.

/*:
 * @plugindesc Version 0.0.1 - 16-10-2017 - A simple plugin that adds Active Turn Battles, Combo Attacks, and an energy mechanic to the battle system.  For faster development the built in Tp values are used as energy.
 * @author kts9408@gmail.com || http://steamcommunity.com/id/Empty_Clip11/
 * 
 * @param ATB Gauge Color 1
 * @desc Hex value for the color of the ATB Gauge
 * @default #e23926
 * 
 * @param ATB Gauge Color 2
 * @desc Hex value for the color of the ATB Gauge
 * @default #3ded5a
 * 
 * @param ATB Gauge Color 3
 * @desc Hex value for the color of the ATB Gauge
 * @default #f2c500
 * 
 * @param ATB Gauge Transparency
 * @desc Float value representing the transparency 0.0 - 1.0 (0 being transparent)
 * @default 1.0
 * 
 * @param TP Max Value
 * @desc Integer value representing the Max amount of TP (EP) an actor can have
 * @default 5
 * 
 * @help
 *  TODO: Add a help file to explain basic usage.
 * 
 **/

/*var Imported = Imported || {};
Imported.battlePlugin = true;
*/
// Main Plugin body
(function() {

    // Plugin Properties
    parameters = PluginManager.parameters('battlePlugin');
    var _atbGaugeTransparency = Number(parameters['ATB Gauge Transparency'] || 1.0); //TODO: Not Implemented.
    var _tpGaugeColor1 = String(parameters['TP Gauge Color 1'] || '#a4abb5');
    var _tpGaugeColor2 = String(parameters['TP Gauge Color 2'] || '#4286f4');

    var _atbGaugeColor1 = String(parameters['ATB Gauge Color 1'] || '#e23926');
    var _atbGaugeColor2 = String(parameters['ATB Gauge Color 2'] || '#3ded5a');
    var _atbGaugeColor3 = String(parameters['ATB Gauge Color 3'] || '#f2c500');
    var _gaugeAreaWidth = Number(parameters['Gauge Area Size'] || 480);
    var _tpMax = Number(parameters['TP Max Value'] || 5);
    var _agiWeight = Number(parameters['Agility Coefficent'] || 1.0);
    var _atbMax = Number(parameters['ATB Max Value'] || 1000);
    var _atbGaugeWidth = Number(parameters['ATB Gauge Width'] || 80);
    var _last = 0.0;
    var _now = 0.0;
    var _turnOrder;

    // Plugin Methods

    /**************************************************************************
     * UI Functions
     *************************************************************************/
    /**
     * Overrides the default width of the gauge area on the battle windows
     * @return Number containing the new width.
     */

    Window_BattleStatus.prototype.gaugeAreaWidth = function() {
        return _gaugeAreaWidth;
    };

    Window_BattleStatus.prototype.atbGaugeWidth = function() {
        return _atbGaugeWidth;
    };

    Window_BattleStatus.prototype.atbGaugeColor1 = function() {
        return _atbGaugeColor1;
    };

    Window_BattleStatus.prototype.atbGaugeColor2 = function() {
        return _atbGaugeColor2;
    };

    Window_BattleStatus.prototype.atbGaugeColor3 = function() {
        return _atbGaugeColor3;
    };

    Window_Base.prototype.tpGaugeColor1 = function(actor) {
        return (_tpGaugeColor1 || actor.elementColor1());
    };

    Window_Base.prototype.tpGaugeColor2 = function(actor) {
        return (_tpGaugeColor2 || actor.elementColor2());
    };

    /**
     * Overrides the default parent call to draw the status gauges on the battle window.
     **/
    Window_BattleStatus.prototype.drawGaugeAreaWithTp = function(rect, actor) {
        this.drawActorHp(actor, rect.x + 0, rect.y, 108);
        this.drawActorMp(actor, rect.x + 123, rect.y, 96);
        this.drawActorTp(actor, rect.x + 234, rect.y, 96);
    };

    /**
     *  Overrides the default drawing of the actors name and icon on the battle window.
     *  The ATB guage will be drawn behind the actors name with transparency.
     */
    Window_BattleStatus.prototype.drawBasicArea = function(rect, actor) {

        this.drawActorName(actor, rect.x + 0, rect.y, 150);
        this.drawActorIcons(actor, rect.x + 156, rect.y, rect.width - 156);
        this.drawActorAtb(actor, rect.x, rect.y, this.atbGaugeWidth());
    };


    /**
     * Draws the Actor's ATB Gauge
     * 
     */
    Window_BattleStatus.prototype.drawActorAtb = function(actor, x, y, width) {

        var rate = actor.calcInitiative() / _atbMax;
        var color = (rate < 0.99) ? this.atbGaugeColor1() : this.atbGaugeColor2();
        console.log(this.atbGaugeColor1());
        console.log(this.atbGaugeColor2());
        // TODO: rate is how full the bar is (0 empty 1 full)
        rate = (isNaN(rate)) ? 0 : rate;
        this.drawGauge(x, y, width, rate, color, color);
    };


    /**
     * Overrides the default TP gauge with an orb counter style graphic.
     * @param actor - an actor object containing the status information
     * @param x - the x coordinate of the gauge
     * @param y - the y coordinate of the gauge
     * @param width - the width of the gauge
     **/
    Window_Base.prototype.drawActorTp = function(actor, x, y, width) {
        width = width || 96;
        var color1 = this.tpGaugeColor1();
        var color2 = this.tpGaugeColor2();
        var c;

        this.changeTextColor(this.systemColor());
        this.drawText(TextManager.tpA, x, y, 44);
        this.changeTextColor(this.tpColor(actor));
        this.drawText(actor.tp, x + width - 64, y, 64, 'right');

        y += this.lineHeight() - 8;

        for (var i = 0; i < actor.maxTp(); i++) {
            c = (actor.tp > i) ? color2 : color1;
            this.contents.fillRect(x + (i * 12), y, 10, 10, c);
        }


    };



    /*************************************************************************
     * Elemental Power Functions
     ************************************************************************/

    /**
     * Overrides the default maximum value for TP to whatever is passed in as
     * a parameter (default 5).
     */
    Game_BattlerBase.prototype.maxTp = function() {
        return _tpMax;
    };

    Game_BattlerBase.prototype.maxAtb = function() {
        return _atbMax;
    };

    Game_Battler.prototype.initTp = function() {
        this.setTp(0);
    };

    Game_Battler.prototype.onDamage = function(value) {
        this.removeStatesByDamage();
    };


    /**
     * Add additional properties to the Game_BattlerBase prototype for the added
     * plugin functionality.
     */
    Object.defineProperties(Game_BattlerBase.prototype, {
        elementColor1: {
            writable: true,
            value: 0,
            configurable: true,
            enumerable: true
        },
        elementColor2: {
            writable: true,
            value: 0,
            configurable: true,
            enumerable: true
        }
    });


    /*************************************************************************
     * ATB System Functions
     *************************************************************************/

    Object.defineProperties(Game_BattlerBase.prototype, {
        atb: {
            writable: true,
            value: 0,
            configurable: true,
            enumerable: true
        }

    });

    Game_Battler.prototype.onBattleStart = function() {
        this.setActionState('undecided');
        this.clearMotion();
        // this.calcInitiative();

        if (BattleManager._surprise && this.isEnemy() && this.isAppeared()) {
            this.atb += _atbMax;
        } else if (BattleManager._preemptive && this.isActor()) {
            this.atb += _atbMax;
        }

        if (!this.isPreserveTp()) {
            this.initTp();
        }
    };
    /**
     * Calculates an actors ATB Rate (in atb/sec) *Only Base rate is calc*
     */
    Game_Battler.prototype.calcAtbRate = function() {
        // TODO: Include other factors such as buffs
        return (this.agi * _agiWeight * 0.001);
    };

    /**
     * Calculates an actors initial ATB value at the beginning of a battle.
     * initiative roll + agi modifier
     */
    Game_Battler.prototype.calcInitiative = function() {
        this.atb = (Math.random() * _atbMax) + (this.agi * _agiWeight);
        return this.atb;
    };


})();