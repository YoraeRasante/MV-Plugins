/*:
 * @plugindesc Allows to call a common event when loading game.
 * @author Yorae Rasante

 * @param Common Event
 * @desc ID of the common event to call.
 * @default 0
 */

(function() {

parameters = PluginManager.parameters('YR_LoadCallCE');
YR_Event = Number(parameters['Common Event'] || '');

YR_LCE_onAfterLoad = Game_System.prototype.onAfterLoad;
Game_System.prototype.onAfterLoad = function() {
    YR_LCE_onAfterLoad.call(this);
    if (YR_Event > 0) $gameTemp.reserveCommonEvent(YR_Event);
};

})();