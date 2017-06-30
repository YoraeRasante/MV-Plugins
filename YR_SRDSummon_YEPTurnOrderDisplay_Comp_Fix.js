/*:
* @plugindesc Compatibility Fix SRD_SummonCore and YEP_TurnOrderDisplay
* @author Yorae Rasante
* @help
* YEP_TurnOrderDisplay is on version 1.02
* SRD_SummonCore is on version 1.05
*
* The function Scene_Battle.prototype.createTurnOrderDisplay was overwritten
*/

Scene_Battle.prototype.createTurnOrderDisplay = function() {
  this._turnOrderDisplay = [];
  var length = $gameTroop.members().length;
  for (var i = 0; i < length; ++i) {
    this._turnOrderDisplay.push(new Window_TurnOrderIcon($gameTroop, i));
  }
  var length = $gameParty.maxBattleMembers() + $gameParty.maxSummonMembers();
  for (var i = 0; i < length; ++i) {
    this._turnOrderDisplay.push(new Window_TurnOrderIcon($gameParty, i));
  }
  var length = this._turnOrderDisplay.length;
  for (var i = 0; i < length; ++i) {
    var win = this._turnOrderDisplay[i];
    this.setupTurnOrderDisplayWindow(win);
  }
};