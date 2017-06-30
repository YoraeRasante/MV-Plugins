//=============================================================================
 /*:
 * @plugindesc v1.01 Extension to YEP_ElementCore
 * Javascript code for setting Element Rates
 * @author Yorae Rasante
 *
 * @help
 * Version 1.01
 * Use javascript to set element rate
 *   <Element x Code>
 *    formula
 *    formula
 *   </Element Code>
 *
 *   <Element name Code>
 *    formula
 *    formula
 *   </Element Code>
 *
 *   This changes the Force Element x Rate/Force Element name Rate notetags.
 *   Thus, use only one of them for the same element per code.
 *   value = the battler's element rate for that element.
 *   
 *   IMPORTANT:
 *   100% rate is value = 1.
 *   If you are going to use percentage, don't forget to divide by 100 after.
 */
//=============================================================================
 
var Imported = Imported || {};
Imported.YR_X_ElementalRateCode = true;

var YR = YR || {};
YR.ERC = YR.ERC || {};

if (Imported.YEP_ElementCore) {

YR.ERC.DataManager_processElementNotetags2 = DataManager.processElementNotetags2;
DataManager.processElementNotetags2 = function(group) {
  var noteERC1 = /<ELEMENT[ ](\d+)[ ]CODE>/i;
  var noteERC2 = /<ELEMENT[ ](.*)[ ]CODE>/i;
  var noteERC3 = /<\/(?:ELEMENT CODE)>/i;

  YR.ERC.DataManager_processElementNotetags2.call(this, group);
  for (var n = 1; n < group.length; n++) {
    var obj = group[n];
    var notedata = obj.note.split(/[\r\n]+/);

    var elementalRateMode = false;
    var elementalRateId = 0;
    var evalLine = '';
    obj.elementalRateCode = [];
    obj.elementalRateCustom = false;

    for (var i = 0; i < notedata.length; i++) {
      var line = notedata[i];
      if (line.match(noteERC1)) {
        var elementId = parseInt(RegExp.$1);
        elementalRateMode = true;
        elementalRateId = elementId;
        evalLine = '';
        obj.elementalRateCustom = true;
      } else if (line.match(noteERC2)) {
        var name = String(RegExp.$1).toUpperCase().trim();
        if (Yanfly.ElementIdRef[name]) {
          var id = Yanfly.ElementIdRef[name];
          elementalRateMode = true;
          elementalRateId = id;
          evalLine = '';
          obj.elementalRateCustom = true;
        }
      } else if (line.match(noteERC3)) {
        elementalRateMode = false;
        obj.elementalRateCode[elementalRateId] = evalLine;
      } else if (elementalRateMode) {
        evalLine = evalLine + line + '\n';
      }
    }
  }
};

YR.ERC.GBB_elementRate = Game_BattlerBase.prototype.elementRate;
Game_BattlerBase.prototype.elementRate = function(elementId) {
  if (this.elementalRateCustom === false) YR.ERC.GBB_elementRate.call(this, elementId);
  var result = Yanfly.Ele.Game_BtlrBase_elementRate.call(this, elementId);
  if (this.isAbsorbElement(elementId) && result > 0) {
    result = Math.min(result - 2.0, -0.01);
  }
  rate = this.forcedElementRate(elementId);
  if (rate !== undefined) return rate;
  return result;
};

YR.ERC.GBB_getObjElementForcedRate = Game_BattlerBase.prototype.getObjElementForcedRate;
Game_BattlerBase.prototype.getObjElementForcedRate = function(obj, elementId, rate) {
  if (rate === undefined) rate = Yanfly.Ele.Game_BtlrBase_elementRate.call(this, elementId);
  if (!obj) return undefined;
  if (obj.elementalRateCustom === true) {
    if (obj.elementalRateCode[elementId] !== '') return this.evalElementalRateCode(obj, elementId, rate);
  }
  YR.ERC.GBB_getObjElementForcedRate.call(this, obj, elementId);
};

Game_BattlerBase.prototype.evalElementalRateCode = function(obj, elementId, rate) {
  try {
  var a = this;
  var user = this;
  var subject = this;
  var b = this;
  var target = this;
  var s = $gameSwitches._data;
  var v = $gameVariables._data;
  var code = obj.elementalRateCode[elementId];
  var value = rate;
  eval(code);
  return value;
  } catch (e) {
    Yanfly.Util.displayError(e, code, 'ELEMENTAL RATE CODE ERROR');
    return 0;
  }
}

Game_Battler.prototype.forcedElementRate = function(elementId, elemRate) {
  if (elemRate === undefined) rate = Yanfly.Ele.Game_BtlrBase_elementRate.call(this, elementId);
  var length = this.states().length;
  for (var i = 0; i < length; ++i) {
    var state = this.states()[i];
    var rate = this.getObjElementForcedRate(state, elementId, elemRate);
    if (rate !== undefined) return rate;
  }
  return undefined;
};

YR.ERC.GA_forcedElementRate = Game_Enemy.prototype.forcedElementRate;
Game_Actor.prototype.forcedElementRate = function(elementId) {
  if (this.elementalRateCustom === false) YR.ERC.GA_forcedElementRate(this, elementId);
  var rate = this.getObjElementForcedRate(this.actor(), elementId);
  var rate2 = this.getObjElementForcedRate(this.currentClass(), elementId, rate);
  if (rate2 !== undefined) {
    rate = rate2;
  }
  var length = this.equips().length;
  for (var i = 0; i < length; ++i) {
    var equip = this.equips()[i];
    rate2 = this.getObjElementForcedRate(equip, elementId, rate);
    if (rate2 !== undefined) {
      rate = rate2;
    }
  }
  rate2 = Game_Battler.prototype.forcedElementRate.call(this, elementId);
  if (rate2 !== undefined) {
    rate = rate2;
  }
  return rate;
};

YR.ERC.GE_forcedElementRate = Game_Enemy.prototype.forcedElementRate;
Game_Enemy.prototype.forcedElementRate = function(elementId) {
  if (this.elementalRateCustom === false) YR.ERC.GE_forcedElementRate(this, elementId);
  var rate = this.getObjElementForcedRate(this.enemy(), elementId);
  var rate2 = Game_Battler.prototype.forcedElementRate.call(this, elementId, rate);
  if (rate2 !== undefined) {
    rate = rate2;
  }
  return rate;
};

};

Yanfly.Util = Yanfly.Util || {};

Yanfly.Util.displayError = function(e, code, message) {
  console.log(message);
  console.log(code || 'NON-EXISTENT');
  console.error(e);
  if (Utils.isNwjs() && Utils.isOptionValid('test')) {
    if (!require('nw.gui').Window.get().isDevToolsOpen()) {
      require('nw.gui').Window.get().showDevTools();
    }
  }
};