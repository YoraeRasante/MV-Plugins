//=============================================================================
 /*:
 * @plugindesc Equip Weapon x when got Armor y to equip
 * @author Yorae Rasante
 *
 * @help
 * Version 1.1
 * On Weapon: <Dequip As Armor: x>
 * Set armor for weapon to turn back into
 *
 * On Armor: <Equip As Weapon: x>
 *           <Equip As Weapon: x, x, x>
 *           <Equip As Weapon: x to x>
 * Set weapons for armor to turn into
 * Warning: More than one weapon makes it be chosen from a random pool.
 */
//=============================================================================
 
var YR = YR || {};
 
(function() {
 
YR_EAAW_DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
YR_EAAW_DatabaseLoaded = false;
 
DataManager.isDatabaseLoaded = function() {
    if (!YR_EAAW_DataManager_isDatabaseLoaded.call(this)) return false;
    if (!YR_EAAW_DatabaseLoaded) {
        DataManager.readNotetags1($dataWeapons);
        DataManager.readNotetags2($dataArmors);
        YR_EAAW_DatabaseLoaded = true;
    }
        return true;
};
 
DataManager.readNotetags1 = function(group) {
    var note = /<(?:DEQUIP AS ARMOR):[ ](\d+)>/i;
  
       for (var n = 1; n < group.length; n++) {
            var obj = group[n];
            var notedata = obj.note.split(/[\r\n]+/);
 
        obj._daa = 0;
 
            for (var i = 0; i < notedata.length; i++) {
                var line = notedata[i];
                if (line.match(note)) {
                    var dequipA  = Number(RegExp.$1);
                    obj._daa = dequipA;
                }
            }
      }
};
 
DataManager.readNotetags2 = function(group) {
    var note1 = /<(?:EQUIP AS WEAPON):[ ]*(\d+(?:\s*,\s*\d+)*)>/i;
    var note2 = /<(?:EQUIP AS WEAPON):[ ](\d+)[ ](?:THROUGH|to)[ ](\d+)>/i;
  
       for (var n = 1; n < group.length; n++) {
            var obj = group[n];
            var notedata = obj.note.split(/[\r\n]+/);
 
        obj._eaw = [];
 
            for (var i = 0; i < notedata.length; i++) {
                var line = notedata[i];
                if (line.match(note1)) {
                    var equipW  = JSON.parse('[' + RegExp.$1.match(/\d+/g) + ']');
                    obj._eaw = obj._eaw.concat(equipW);
                }
                if (line.match(note2)) {
                    var range = YR.getRange(parseInt(RegExp.$1), parseInt(RegExp.$2));
                    obj._eaw = obj._eaw.concat(equipW);
                }
            }
      }
};
 
YR_EAAW_EquipItemRefresh = Window_EquipItem.prototype.refresh;
Window_EquipItem.prototype.refresh = function() {
    if (this._slotId === 0 || (this._slotId === 1 && this._actor.isDualWield())) {
        Object.keys($gameParty._armors).forEach(function (armor) {
            var eaw = $dataArmors[armor]._eaw;
            if (eaw.length > 0) {
            	reaw = YR.getRandomElement(eaw);
                var n = $gameParty.numItems($dataArmors[armor]);
                $gameParty.gainItem($dataWeapons[reaw], n, false);
                $gameParty.gainItem($dataArmors[armor], (0 - n), false);
            }
        });
    } else {
        Object.keys($gameParty._weapons).forEach(function (weapon) {
            var daa = $dataWeapons[weapon]._daa;
            if (daa > 0) {
                var n = $gameParty.numItems($dataWeapons[weapon]);
                $gameParty.gainItem($dataWeapons[weapon], (0 - n), false);
                $gameParty.gainItem($dataArmors[daa], n, false);
            }
        });
    }
    YR_EAAW_EquipItemRefresh.call(this);
};

YR_EAAW_Command319 = Game_Interpreter.prototype.command319;
Game_Interpreter.prototype.command319 = function() {
    YR_EAAW_Command319.call(this);
    Object.keys($gameParty._weapons).forEach(function (weapon) {
        var daa = $dataWeapons[weapon]._daa;
        if (daa > 0) {
            var n = $gameParty.numItems($dataWeapons[weapon]);
            $gameParty.gainItem($dataWeapons[weapon], (0 - n), false);
            $gameParty.gainItem($dataArmors[daa], n, false);
        }
    });
    return true;
};

YR.getRandomElement = function(array) {
    var value = array[Math.floor(Math.random() * array.length)];
    return value;
};
 
})();