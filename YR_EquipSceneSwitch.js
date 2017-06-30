/*:
 * @plugindesc Allows to turn on a switch when exiting Equip screen.
 * @author Yorae Rasante
 
 * @param Close Equip Scene Switch Id
 * @desc ID of the switch to turn on.
 * @default 0
 */
 
(function() {
 
parameters = PluginManager.parameters('YR_EquipSceneSwitch');
YR_Switch = Number(parameters['Close Equip Scene Switch Id'] || '');
 
YR_ESS_Equip_Terminate = Scene_Equip.prototype.terminate;
Scene_Equip.prototype.terminate = function() {
    if (YR_Switch > 0) $gameSwitches.setValue(YR_Switch, true);;
    YR_ESS_Equip_Terminate.call(this);
};
 
})();