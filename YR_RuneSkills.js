var Imported = Imported || {};
Imported.YR_RuneSkills = true;

var YR = YR || {};
YR.RS = YR.RS || {};

/*:
 * @plugindesc 1.02 Allows your actors to use skills through
 * a combination of "Rune" skills.
 * @author Yorae Rasante, based on work by mjshi
 *
 * @param ----- Runes -----
 * @desc 
 * @default 
 *
 * @param Rune Skill Type
 * @desc Skill Type of the skills to appear as Runes
 * @default 3
 *
 * @param Show Rune Names
 * @desc Show only icon of runes or icon + name
 * @default false
 *
 * @param Show Rune Combination
 * @desc Show resulting combination before casting
 * @default true
 *
 * @param Hide Unknown Combinations
 * @desc If Show Rune Combination, hide them if not cast yet
 * @default true
 *
 * @param Allow Rune Failure
 * @desc Allow combinations of runes that do not result in skills
 * @default true
 *
 * @param Rune Failure Result
 * @desc Skill in failures. ID, FirstRune, LastRune, RandomRuneUsed/RandomUsed, RandomRuneSkill/RandomSkill, Any/AnySkill
 * @default 7
 * 
 * @param Unknown MP Value
 * @desc The string used when the result is unknown (randomized)
 * @default ???
 *
 * @param Order of Runes
 * @desc Makes it so the order the runes are applied gives a different skill as result
 * @default true
 *
 * @param Learn Used Skills
 * @desc Makes it so when the skill is used the character learns it
 * @default true
 *
 * @param Minimum Runes
 * @desc Minimum number of runes allowed to be used
 * @default 2
 *
 * @param Maximum Runes
 * @desc Maximum number of runes allowed to be used
 * @default 5
 *
 * @param 
 * @desc 
 * @default 
 *
 * @param --- Appearence ---
 * @desc 
 * @default 
 *
 * @param -- Selection Box --
 * @desc 
 * @default 
 *
 * @param Selection Box X
 * @desc X position of Chosen Selection Box
 * @default (Graphics.width - this._runeSelect.width) / 2
 *
 * @param Selection Box Y
 * @desc Y position of Chosen Selection Box
 * @default this._chosenRunes.y + this._chosenRunes.height
 *
 * @param Selection Box Width
 * @desc Width of Chosen Selection Box
 * @default YR.RS.RuneNameShow ? Graphics.width / 2 : ((this._runeSelect.itemHeight() * this._runeSelect.maxCols()) + (this._runeSelect.spacing() * (this._runeSelect.maxCols() -1)) + this._runeSelect.padding * 2)
 *
 * @param Selection Box Height
 * @desc Height of Chosen Selection Box
 * @default Math.min(this._runeSelect.fittingHeight(this._runeSelect._data.length / this._runeSelect.maxCols())+ this._runeSelect.padding, Graphics.boxHeight - (this._chosenRunes.y + this._chosenRunes.height + this._statusWindow.height))
 *
 * @param Selection Columns
 * @desc Number of columns the Rune Selection Box has
 * @default 2
 *
 * @param Selection Confirm Text
 * @desc Text to confirm the Runes selection
 * @default Ok
 *
 * @param -- Chosen Runes Box --
 * @desc 
 * @default 
 *
 * @param Chosen Runes Box X
 * @desc X position of Chosen Runes Box
 * @default (Graphics.width - this._chosenRunes.width) / 2
 *
 * @param Chosen Runes Box Y
 * @desc Y position of Chosen Runes Box
 * @default YR.RS.RuneHelpShow ? this._helpWindow.y + this._helpWindow.height : 0
 *
 * @param Chosen Runes Box Width
 * @desc Width of Chosen Runes Box
 * @default Graphics.width / 2
 *
 * @param Chosen Runes Box Height
 * @desc Height of Chosen Runes Box
 * @default this._chosenRunes.fittingHeight(2)
 *
 * @param Chosen Runes Icon Spacing
 * @desc Spacing of the chosen runes
 * @default 12
 *
 * @param -- Help Runes Box --
 * @desc 
 * @default 
 *
 * @param Show Help Box
 * @desc Let the Help Box be visible to show Rune Combination Skills
 * @default true
 *
 * @param Help Box Unknown
 * @desc Text for unknown rune combination
 * @default 
 *
 * @help
 * A system to use skills by combining smaller "Rune" skills.
 * Based on the system of the same name by mjshi
 * And by "based" I mean it is an edit of it.
 * A bit heavy of an edit, but still one.
 *
 * The "runes" are not actually items, but skills of the skill type set.
 * I removed mjshi's cost parameters to make it easier to be compatible
 * with YEP_SkillCore, but if anyone wants I can add it again.
 *
 * The SkillType and FailureSkills can be more than one ID.
 * In the case of FailureSkills, they are chosen randomly.
 *
 * I believe the explanations on the Plugin Parameters should be enough
 * but I need to give one warning!
 *
 * WARNING!
 * While you can use this._chosenRunes to get the Choice Box sizes,
 * using this._runesSelected to get the Selection Box for anything
 * but itself will probably not work.
 * That is because I wanted it to be dynamic, able to change size
 * depending on the actor using it.
 *
 * Skill Notetags:
 * <RuneCost: x> or <Rune Cost: x>
 * In case you want a rune to be used as if it costs more runes.
 * Like a bigger or more energy-heavy rune.
 *
 * <Runes: x, x>
 * The rune combination to cast this skill
 * In case of same combination for multiple skills, the one with lower
 * ID will be the one cast.
 *
 * <Not Rune Fail>
 * If you set the FailureSkill to be anything but IDs, this removes
 * this skill from the pool.
 *
 *
 * Actor Notetag:
 * <Start Runes Max: x>
 * Starting maximum of runes this actor can use.
 *
 * <Runes Max Level x: y>
 * After this level, maximum of runes this actor can use is this one.
 *
 *
 * Class Notetags:
 * <Runes Max Level x: y>
 * After this level, maximum of runes this actor can use is this one.
 * If used, will overwrite Actor.
 *
 * <Runes Max: +x>
 * <Runes Max: -x>
 * Change the maximum amount of runes an actor can use in this class.
 *
 *
 * Weapon, Armor, State Notetags:
 * <Runes Max: +x>
 * <Runes Max: -x> 
 * Change the maximum amount of runes an actor can use.
 *
 *
 * Plugin Commands:
 * IncreaseRuneMax x y
 * Actor x can use y more runes
 *
 * DecreaseRuneMax
 * Actor x can use y less runes, down to minimum.
 *
 */

YR.parameters = PluginManager.parameters('YR_RuneSkills');
YR.RS.RuneSType = String(YR.parameters['Rune Skill Type']);
YR.RS.RuneNameShow = eval(String(YR.parameters['Show Rune Names']));
YR.RS.RuneCombShow = eval(String(YR.parameters['Show Rune Combination']));
YR.RS.RuneCombUnkHide = eval(String(YR.parameters['Hide Unknown Combinations']));
YR.RS.RuneFailAllow = eval(String(YR.parameters['Allow Rune Failure']));
YR.RS.RuneFailResult = String(YR.parameters['Rune Failure Result']);
YR.RS.RuneUnkMp = String(YR.parameters['Unknown MP Value']);
YR.RS.RuneOrder = eval(String(YR.parameters['Order of Runes']));
YR.RS.RuneLearnSkill = eval(String(YR.parameters['Learn Used Skills']));
YR.RS.RuneMin = String(YR.parameters['Minimum Runes']);
YR.RS.RuneMax = String(YR.parameters['Maximum Runes']);
YR.RS.RuneChosIconSpacing = Number(YR.parameters['Chosen Runes Icon Spacing']);
YR.RS.RuneHelpShow = eval(String(YR.parameters['Show Help Box']));
YR.RS.RuneSelCol = String(YR.parameters['Selection Columns']);
YR.RS.RuneSelConfText = String(YR.parameters['Selection Confirm Text']);
YR.RS.RuneHelpUnk = String(YR.parameters['Help Box Unknown']);
YR.RS.RuneChosHeight = String(YR.parameters['Chosen Runes Box Height']);
YR.RS.RuneChosWidth = String(YR.parameters['Chosen Runes Box Width']);
YR.RS.RuneChosPosX = String(YR.parameters['Chosen Runes Box X']);
YR.RS.RuneChosPosY = String(YR.parameters['Chosen Runes Box Y']);
YR.RS.RuneSelHeight = String(YR.parameters['Selection Box Height']);
YR.RS.RuneSelWidth = String(YR.parameters['Selection Box Width']);
YR.RS.RuneSelPosX = String(YR.parameters['Selection Box X']);
YR.RS.RuneSelPosY = String(YR.parameters['Selection Box Y']);

YR.RS.RuneSTypeCheck = function(check) {
    var sTypes = YR.RS.RuneSType.split(/,[ ]*/);
    for (i = 0; i < sTypes.length; i++) {
        if (check == Number(sTypes[i])) return true;
    }
    return false;
}

YR.RS.RuneSkills = [];
YR.RS.RuneSkillsUsed = [];
YR.RS.RuneSkillsSeen = [];

//=============================================================================
// Reading Notetags
//=============================================================================

YR_RS_DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
YR_RS_DatabaseLoaded = false;

DataManager.isDatabaseLoaded = function() {
    if (!YR_RS_DataManager_isDatabaseLoaded.call(this)) return false;
    if (!YR_RS_DatabaseLoaded) {
        DataManager.readNotetags_skillsRS($dataSkills);
        DataManager.readNotetags_startRunesRS($dataActors);
        DataManager.readNotetags_runesMaxLvlRS($dataActors);
        DataManager.readNotetags_runesMaxLvlRS($dataClasses);
        DataManager.readNotetags_runesMaxChangeRS($dataClasses);
        DataManager.readNotetags_runesMaxChangeRS($dataWeapons);
        DataManager.readNotetags_runesMaxChangeRS($dataArmors);
        DataManager.readNotetags_runesMaxChangeRS($dataStates);
        YR_RS_DatabaseLoaded = true;
    }
		return true;
};

DataManager.readNotetags_skillsRS = function(group) {
	var note1 = /<(?:NOTRUNEFAIL|NOT RUNE FAIL)>/i;
    var note2 = /<(?:RUNE|RUNES):[ ]*(\d+(?:\s*,\s*\d+)*)>/i;
    var note3 = /<(?:RUNECOST|RUNE COST):[ ](\d+)>/i;
 
       for (var n = 1; n < group.length; n++) {
            var obj = group[n];
            var notedata = obj.note.split(/[\r\n]+/);

            obj.notRuneFail = false;
            YR.RS.RuneSkills[obj.id] = [];
            obj.runeCost = 1;

            for (var i = 0; i < notedata.length; i++) {
                var line = notedata[i];
                if (line.match(note1)) {
                    obj.notRuneFail = true;
                }
                if (line.match(note2)) {
                    var list = JSON.parse('[' + RegExp.$1.match(/\d+/g) + ']');
                    YR.RS.RuneSkills[obj.id].push(list);
                }
                if (line.match(note3)) {
                    var runeValue = Number(RegExp.$1);
                    runeValue.clamp(1, eval(YR.RS.RuneMax));
                    obj.runeCost = runeValue;
                }
            }
      }
};

DataManager.readNotetags_startRunesRS = function(group) {
    var note = /<(?:START RUNE MAX|START RUNES MAX):[ ](\d+)>/i;
 
       for (var n = 1; n < group.length; n++) {
            var obj = group[n];
            var notedata = obj.note.split(/[\r\n]+/);

            obj.RuneStartMax = eval(YR.RS.RuneMax);

            for (var i = 0; i < notedata.length; i++) {
                var line = notedata[i];
                if (line.match(note)) {
                    obj.RuneStartMax = Number(RegExp.$1);
                }
            }
      }
};

DataManager.readNotetags_runesMaxLvlRS = function(group) {
    var note = /<(?:RUNE MAX LEVEL|RUNES MAX LEVEL)[ ](\d+)[ ]*:[ ](\d+)>/i;
 
       for (var n = 1; n < group.length; n++) {
            var obj = group[n];
            var notedata = obj.note.split(/[\r\n]+/);

            obj.RuneMaxLevel = [];
            var j = 0;

            for (var i = 0; i < notedata.length; i++) {
                var line = notedata[i];
                if (line.match(note)) {
                    obj.RuneMaxLevel[j] = [Number(RegExp.$1), Number(RegExp.$2)];
                    j ++;
                }
            }
            obj.RuneMaxLevel.sort(function (a, b) {return a[0] - b[0]});
      }
};

DataManager.readNotetags_runesMaxChangeRS = function(group) {
    var note = /<(?:RUNE MAX|RUNES MAX):[ ]([\+\-]\d+)>/i;
 
       for (var n = 1; n < group.length; n++) {
            var obj = group[n];
            var notedata = obj.note.split(/[\r\n]+/);

            obj.runeMaxEdit = 0;

            for (var i = 0; i < notedata.length; i++) {
                var line = notedata[i];
                if (line.match(note)) {
                    obj.runeMaxEdit += parseInt(RegExp.$1);
                }
            }
      }
};

//=============================================================================
// Editing Save Files (so RuneSkillsSeen is saved)
//=============================================================================

YR_RS_DMMakeSaveContents = DataManager.makeSaveContents;
DataManager.makeSaveContents = function() {
	var contents = YR_RS_DMMakeSaveContents.call(this);
    contents.RSSeen	= YR.RS.RuneSkillsSeen;
    return contents;
};

YR_RS_DMExtractSaveContents = DataManager.extractSaveContents;
DataManager.extractSaveContents = function(contents) {
	YR_RS_DMExtractSaveContents.call(this, contents);
    YR.RS.RuneSkillsSeen = contents.RSSeen;
};

//=============================================================================
// Editing Game_Actor
//=============================================================================

Game_Actor.prototype.runesMax = function() {
	if (this._runesMaxSet !== undefined) return this._runesMaxSet;
	var value = this.actor().RuneStartMax;
	var levelMax = this.actor().RuneMaxLevel;
	for (var i = 0; i < levelMax.length; i++) {
		if (this._level >= levelMax[i][0]) {
            value = levelMax[i][1];
        } else {
            break;
        }
	}
    var levelMax = this.currentClass().RuneMaxLevel;
    for (var i = 0; i < levelMax.length; i++) {
        if (this._level >= levelMax[i][0]) {
            value = levelMax[i][1];
        } else {
            break;
        }
    }
    value += this.currentClass().runeMaxEdit;
    var equips = this.equips();
    for (var i = 0; i < equips.length; ++i) {
        if (equips[i]) value += equips[i].runeMaxEdit;
    }
    var states = this.states();
    for (var i = 0; i < states.length; ++i) {
        if (states[i]) value += states[i].runeMaxEdit;
    }
    value += this.getRuneMaxPlus();
	this._runesMaxSet = value.clamp(eval(YR.RS.RuneMin), eval(YR.RS.RuneMax));
	return this._runesMaxSet;
}

Game_Actor.prototype.clearRuneMaxPlus = function() {
    this._runeMaxPlus = 0;
};

Game_Actor.prototype.getRuneMaxPlus = function() {
    if (this._runeMaxPlus === undefined) {
      this.clearRuneMaxPlus();
    }
    return this._runeMaxPlus;
};

Game_Actor.prototype.setRuneMaxPlus = function(value) {
    if (this._runeMaxPlus === undefined) {
      this.clearRuneMaxPlus();
    }
    this._runeMaxPlus = value;
    this.refresh();
};

Game_Actor.prototype.increaseRuneMax = function(value) {
    value += this.getRuneMaxPlus();
    this.setRuneMaxPlus(value);
};

Game_Actor.prototype.decreaseRuneMax = function(value) {
    value -= this.getRuneMaxPlus();
    this.setRuneMaxPlus(value);
};

//=============================================================================
// Editing Add and Remove State
//=============================================================================

YR_RS_GBaddState = Game_Battler.prototype.addState;
Game_Battler.prototype.addState = function(stateId) {
    this._runesMaxSet = undefined;
    YR_RS_GBaddState.call(this, stateId);
};

YR_RS_GBremoveState = Game_Battler.prototype.removeState;
Game_Battler.prototype.removeState = function(stateId) {
    this._runesMaxSet = undefined;
    YR_RS_GBremoveState.call(this, stateId);
};

//=============================================================================
// Creating Window_RunesChosen
// Also where it checks for skills of results
//=============================================================================

function Window_RunesChosen() {
    this.initialize.apply(this, arguments);
};

Window_RunesChosen.prototype = Object.create(Window_SkillList.prototype);
Window_RunesChosen.prototype.constructor = Window_RunesSelect;

Window_RunesChosen.prototype.initialize = function() {
    this._runes = [];
    Window_Base.prototype.initialize.call(this, 0, 0, 0, 0);
    this.hide();
};

Window_RunesChosen.prototype.addRune = function(skill_id) {
    if (!skill_id) {return}
    this._lastSkill = skill_id;
    this._runes.push(skill_id);
    this.refresh();
};

Window_RunesChosen.prototype.removeRune = function() {
    this._runes.pop();
    this.refresh();
};

Window_RunesChosen.prototype.data = function() {
    return this._runes;
};

Window_RunesChosen.prototype.drawRunes = function() {
    var resultingSkill = this.getResultingSkill();
    var nameSize = 0;
    var costSize = 0;
    if (resultingSkill > 0) {
        nameSize = Window_Base._iconWidth + 4 + this.textWidth($dataSkills[resultingSkill].name);
        if (this._actor.skillTpCost($dataSkills[resultingSkill]) > 0 || this._actor.skillMpCost($dataSkills[resultingSkill]) > 0 ||
            (Imported.YEP_SkillCore && (this._actor.skillHpCost($dataSkills[resultingSkill]) > 0 || $dataSkills[resultingSkill].customCostText !== ''))) {
            if (Imported.YEP_SkillCore) {
                costSize += -this.drawTpCost($dataSkills[resultingSkill], 0, 0, 0);
                costSize += -this.drawMpCost($dataSkills[resultingSkill], 0, 0, 0);
                costSize += -this.drawHpCost($dataSkills[resultingSkill], 0, 0, 0);
                costSize += -this.drawCustomDisplayCost($dataSkills[resultingSkill], 0, 0, 0);
            } else costSize += this.costWidth;
        }
    } else if (YR.RS.RuneFailAllow && this.getFailureResult() > 0) {
        costSize += this.textWidth(YR.RS.RuneUnkMp);
    }

    var x = 0
    if (this._runes.length > 0) x = (this.contents.width - (this._runes.length * Window_Base._iconWidth +
                                    (this._runes.length - 1) * YR.RS.RuneChosIconSpacing)) / 2;

    var y = 0
    if (this._runes.length > 0) y = (this.contents.height - Window_Base._iconHeight) / 2;
    y -= this.lineHeight() / 2;

    for (var i = 0; i < this._runes.length; i++) {
        var skill = $dataSkills[this._runes[i]];
        this.drawIcon(skill.iconIndex, x, y);
        if (i < (this._runes.length - 1)) x += Window_Base._iconWidth + YR.RS.RuneChosIconSpacing;
    }
    if (!YR.RS.RuneCombUnkHide || YR.RS.RuneSkillsSeen[resultingSkill] === true) {
        if (resultingSkill > 0 && YR.RS.RuneCombShow) {
            y += this.lineHeight();
            x = (this.contents.width - nameSize) /2;
            if (costSize > 0) x -= (costSize + this.textWidth(' ()')) /2;
            this.drawItemName($dataSkills[resultingSkill], x, y, nameSize);
            if (costSize > 0) {
                x += nameSize;
                this.drawText(' (', x, y, this.textWidth(' ('), 'center');
                x += this.textWidth(' (');
                this.drawSkillCost($dataSkills[resultingSkill], x, y, costSize);
                x += costSize;
                this.drawText(')', x, y, this.textWidth(')'), 'center');            
            }
        } else if (resultingSkill > 0) {
            y += this.lineHeight();
            x = (this.contents.width - costSize) /2;
            this.drawSkillCost($dataSkills[resultingSkill], x, y, costSize);
        }
    } if ((YR.RS.RuneCombUnkHide && !YR.RS.RuneSkillsSeen[resultingSkill]) || (YR.RS.RuneFailAllow && this.getFailureResult() > 0)) {
        y += this.lineHeight();
        x = (this.contents.width - this.textWidth(YR.RS.RuneUnkMp)) /2;
        this.drawText(YR.RS.RuneUnkMp, x, y, this.textWidth(YR.RS.RuneUnkMp), 'center');
    }
};

Window_RunesChosen.prototype.refresh = function() {
    if (this.contents) {
        this.contents.clear();
        this.drawRunes();
    }
};

Window_RunesChosen.prototype.getResultingSkill = function() {
    for (var i = 1; i < YR.RS.RuneSkills.length; i++) {
        for (var j = 0; j < YR.RS.RuneSkills[i].length; j++) {
            if (YR.RS.RuneOrder) {
                if (YR.RS.RuneSkills[i][j].equals(this._runes)) return i;
            } else {
                var runeSkill = YR.RS.RuneSkills[i][j].sort(function (a, b) {return a[0] - b[0]});
                var setRunes = this._runes.sort(function (a, b) {return a[0] - b[0]});
                if (runeSkill.equals(setRunes)) return i;
            }
        }
    }
    return 0;
};

Window_RunesChosen.prototype.getFailureResult = function() {
    var failureType = YR.RS.RuneFailResult.toLowerCase();
    var failureSkill = 0;
    if (failureType === 'firstrune') {
        for (i = 0; i < this._runes.length; i++) {
            if (!$dataSkills[this._runes[i]].notRuneFail) {
                failureSkill = this._runes[i];
                break;
            }
        }
    } else if (failureType === 'lastrune') {
        for (i = (this._runes.length - 1); i >= 0; i--) {
           if (!$dataSkills[this._runes[i]].notRuneFail) {
                failureSkill = this._runes[i];
                break;
            }
        }
    } else if (failureType === 'randomruneused' || failureType === 'randomused') {
        var failurePool = [];
        for (var i = 0; i < this._runes.length; i++) {
            if (!$dataSkills[this._runes[i]].notRuneFail) failurePool.push(this._runes[i]);
        }
        if (failurePool.length > 0) failureSkill = failurePool[Math.randomInt(failurePool.length)];
    } else if (failureType === 'randomruneskill' || failureType === 'randomskill') {
        var failurePool = [];
        for (var i = 1; i < YR.RS.RuneSkills.length; i++) {
            if (YR.RS.RuneSkills[i].length > 0 && !$dataSkills[i].notRuneFail) failurePool.push(i);
        }
        if (failurePool.length > 0) failureSkill = failurePool[Math.randomInt(failurePool.length)];
    } else if (failureType === 'any' || failureType === 'anyskill') {
        var failurePool = [];
        for (i = 1; i < $dataSkills.length; i++)
            if (!$dataSkills[i].notRuneFail) failurePool.push(i);
        if (failurePool.length > 0) failureSkill = failurePool[Math.randomInt(failurePool.length)];
    } else {
            var failurePool = failureType.split(/,[ ]*/);
            if (failurePool.length > 0) failureSkill = Number(failurePool[Math.randomInt(failurePool.length)]);
    }
    return failureSkill;
}

//=============================================================================
// Creating Window_RunesSelect
//=============================================================================

function Window_RunesSelect() {
    this.initialize.apply(this, arguments);
}

Window_RunesSelect.prototype = Object.create(Window_SkillList.prototype);
Window_RunesSelect.prototype.constructor = Window_RunesSelect;

Window_RunesSelect.prototype.initialize = function(chosenRunes_window) {
    Window_SkillList.prototype.initialize.call(this,
        0, 0, 0, 0);
    this._chosenRunes = chosenRunes_window;
    this.hide();
    this.deactivate();
};

Window_RunesSelect.prototype.show = function() {
    this.selectLast();
    if (YR.RS.RuneHelpShow) this.showHelpWindow();
    Window_SkillList.prototype.show.call(this);
};

Window_RunesSelect.prototype.hide = function() {
    this.hideHelpWindow();
    Window_SkillList.prototype.hide.call(this);
};

Window_RunesSelect.prototype.maxCols = function() {
    return eval(YR.RS.RuneSelCol);
};

Window_RunesSelect.prototype.makeItemList = function() {
    if (this._actor) {
        this._data = this._actor.skills().filter(function(item) {
            return this.includes(item);
        }, this);
        for (var i = 0; i < this.maxCols(); i++) {this._data.unshift('')}
    } else {
        this._data = [];
    }
};

Window_RunesSelect.prototype.getChosenRuneCost = function() {
    var value = 0;
    for (i = 0; i < this._chosenRunes._runes.length; i++) {
        value += $dataSkills[this._chosenRunes._runes[i]].runeCost;
    }
    return value;
};

Window_SkillList.prototype.isCurrentItemEnabled = function() {
    if (DataManager.isSkill(this._data[this.index()])) return this.isEnabled(this._data[this.index()]);
    else if (this.index() === 0) return this.isEnabled(0);
    else return false;
};

Window_RunesSelect.prototype.isEnabled = function(item) {
    if (DataManager.isSkill(item)) {
        return (this._actor && (this.getChosenRuneCost() + item.runeCost) <= this._actor.runesMax());
    } else if (item === 0) {
        var result = (this._actor && this.getChosenRuneCost() >= eval(YR.RS.RuneMin) && this.getChosenRuneCost() <= this._actor.runesMax());
        if (result === true && this._chosenRunes.getResultingSkill() > 0)
            return (this._actor.canPaySkillCost($dataSkills[this._chosenRunes.getResultingSkill()]));
        else if (result === true && YR.RS.RuneFailAllow && this._chosenRunes.getFailureResult() > 0)
            return true;
    }
    return false;
};

Window_RunesSelect.prototype.drawItem = function(index) {
    if (index >= this.maxCols()) {
        var skill = this._data[index];
        if (skill) {
            var rect = this.itemRect(index);
            rect.width -= this.textPadding();
            this.changePaintOpacity(this.isEnabled(skill));
            if (YR.RS.RuneNameShow) this.drawItemName(skill, rect.x, rect.y, rect.width);
            else this.drawIcon(skill.iconIndex, rect.x + ((rect.height - Window_Base._iconWidth)/2), rect.y + ((rect.height - Window_Base._iconHeight)/2));
            this.changePaintOpacity(1);
        }
    } else if (index === 0) {
            var rect = this.itemRectForText(index);
            this.resetTextColor();
            this.changePaintOpacity(this.isEnabled(index));
            this.drawText(YR.RS.RuneSelConfText, rect.x, rect.y, rect.width, 'center');
    } else return;
};

Window_RunesSelect.prototype.itemWidth = function() {
    if (YR.RS.RuneNameShow) return Math.floor((this.width - this.padding * 2 +
                       this.spacing()) / this.maxCols() - this.spacing());
    else  return this.itemHeight();
};

Window_RunesSelect.prototype.setHelpWindowItem = function(item) {
    resultingSkill = this._chosenRunes.getResultingSkill();
   if (this._helpWindow) {
        if (this.index() !== 0) {
            this._helpWindow.setItem(item);
        }
        else if (resultingSkill > 0) {
            if ((!YR.RS.RuneCombUnkHide || YR.RS.RuneSkillsSeen[resultingSkill] === true) && YR.RS.RuneCombShow)
                this._helpWindow.setItem($dataSkills[resultingSkill]);
            else this._helpWindow.setText(YR.RS.RuneHelpUnk);
        }
        else if (YR.RS.RuneFailAllow) this._helpWindow.setText(YR.RS.RuneHelpUnk);
    }
};

//=============================================================================
// Changing Scene_Battle
//=============================================================================

YR_RS_SBcreateAllWindows = Scene_Battle.prototype.createAllWindows;
Scene_Battle.prototype.createAllWindows = function() {
    YR_RS_SBcreateAllWindows.call(this);
    this.createRuneWindows();
};

YR_RS_SBisAnyInputWindowActive = Scene_Battle.prototype.isAnyInputWindowActive;
Scene_Battle.prototype.isAnyInputWindowActive = function() {
    return (YR_RS_SBisAnyInputWindowActive.call(this) || this._runeSelect.active);
};

Scene_Battle.prototype.createRuneWindows = function() {
    this._chosenRunes = new Window_RunesChosen(this._chosenRunes);
    this._chosenRunes.height = eval(YR.RS.RuneChosHeight);
    this._chosenRunes.width = eval(YR.RS.RuneChosWidth);
    this._chosenRunes.x = eval(YR.RS.RuneChosPosX);
    this._chosenRunes.y = eval(YR.RS.RuneChosPosY);
    this._chosenRunes.createContents();
    this.addWindow(this._chosenRunes);
    this._chosenRunes.deactivate();

    this._runeSelect = new Window_RunesSelect(this._chosenRunes);
    this._runeSelect.setHandler('ok',     this.onRuneOk.bind(this));
    this._runeSelect.setHandler('cancel', this.onRuneCancel.bind(this));
    if (YR.RS.RuneHelpShow) this._runeSelect.setHelpWindow(this._helpWindow);
    this.addWindow(this._runeSelect);
};

YR_RS_SBcommandSkill = Scene_Battle.prototype.commandSkill;
Scene_Battle.prototype.commandSkill = function() {
    if (YR.RS.RuneSTypeCheck(this._actorCommandWindow.currentExt())) {
        this._runeSelect._actor = BattleManager.actor();
        this._runeSelect.setStypeId(this._actorCommandWindow.currentExt());
        this._runeSelect.makeItemList();
        this._runeSelect.height = eval(YR.RS.RuneSelHeight);
        this._runeSelect.width = eval(YR.RS.RuneSelWidth);
        this._runeSelect.x = eval(YR.RS.RuneSelPosX);
        this._runeSelect.y = eval(YR.RS.RuneSelPosY);
        this._runeSelect.createContents();
        this._runeSelect.refresh();
        this._runeSelect.show();
        this._runeSelect.activate();

        this._chosenRunes._runes = [];
        this._chosenRunes._actor = BattleManager.actor();
        this._chosenRunes.refresh();
        this._chosenRunes.show();
    } else {YR_RS_SBcommandSkill.call(this)}
};

Scene_Battle.prototype.onRuneOk = function() {
    if (this._runeSelect.index() >= this._runeSelect.maxCols()) {
        var skill = this._runeSelect.item();
        this._chosenRunes.addRune(skill.id);
        this._runeSelect.deactivate();
        this._runeSelect.refresh();
        this._runeSelect.activate();
    } else {
        if (this._runeSelect.index() === 0) {
            this.onRuneExecute();
        }
    }
};

Scene_Battle.prototype.onRuneCancel = function() {
    if (this._chosenRunes._runes.length === 0) {
        this._runeSelect.deactivate();
        this._runeSelect.refresh();
        this.hideRuneWindows();
        this._actorCommandWindow.activate();
    } else {
        this._chosenRunes.removeRune();
        this._runeSelect.deactivate();
        this._runeSelect.refresh();
        this._runeSelect.activate();
    }
};

Scene_Battle.prototype.onRuneExecute = function() {
    var skill = this._chosenRunes.getResultingSkill();
    var skillFailure = false;
    if (skill === 0 && (YR.RS.RuneFailAllow && this._chosenRunes.getFailureResult() > 0)) {
        skill = this._chosenRunes.getFailureResult();
        skillFailure = true;
    }
    if (skill > 0) {
        var action = BattleManager.inputtingAction();
        action.setSkill(skill);
        BattleManager.actor().setLastBattleSkill(skill);
        BattleManager.actor().skillFailure = skillFailure;
    }
    this._tempRunes = this._chosenRunes._runes;
    this._skillId = skill;
    this._runeSelect.deactivate();
    this.hideRuneWindows();
    if (skill > 0) {
        if ([0, 1, 7, 9].contains($dataSkills[skill].scope) ||
            (Imported.YEP_TargetCore && ['ENEMY ROW', 'ALLY ROW'].contains($dataSkills[skill].scope))) this.onSelectAction();
        else this.selectNextCommand();
    }
    else this.selectNextCommand();
};

Scene_Battle.prototype.hideRuneWindows = function() {
    this._chosenRunes._runes = [];
    this._chosenRunes.refresh();
    this._chosenRunes.hide();
    this._runeSelect.hide();
    this._runeSelect.deactivate();
};

YR_RS_SBselectNextCommand = Scene_Battle.prototype.selectNextCommand;
Scene_Battle.prototype.selectNextCommand = function() {
    if (YR.RS.RuneSTypeCheck(this._actorCommandWindow.currentExt()) && BattleManager.actor()) {
        YR.RS.RuneSkillsUsed[this._skillId] = YR.RS.RuneSkillsUsed[this._skillId] || [];
        YR.RS.RuneSkillsUsed[this._skillId].push(BattleManager.actor()._actorId);
    }
    YR_RS_SBselectNextCommand.call(this)
};

YR_RS_SBonEnemyCancel = Scene_Battle.prototype.onEnemyCancel;
Scene_Battle.prototype.onEnemyCancel = function() {
    if (YR.RS.RuneSTypeCheck(this._actorCommandWindow.currentExt())) {
        this._enemyWindow.hide();
        this._chosenRunes._runes = this._tempRunes;
        this._chosenRunes.refresh();
        this._chosenRunes.show();
        this._runeSelect.show();
        this._runeSelect.activate();
    } else {YR_RS_SBonEnemyCancel.call(this)}
};

YR_RS_SBonActorCancel = Scene_Battle.prototype.onActorCancel;
Scene_Battle.prototype.onActorCancel = function() {
    if (YR.RS.RuneSTypeCheck(this._actorCommandWindow.currentExt())) {
        this._actorWindow.hide();
        this._chosenRunes._runes = this._tempRunes;
        this._chosenRunes.refresh();
        this._chosenRunes.show();
        this._runeSelect.show();
        this._runeSelect.activate();
    } else {YR_RS_SBonActorCancel.call(this)}
};

//=============================================================================
// Changing BattleManager
//=============================================================================

YR_RS_BMstartAction = BattleManager.startAction;
BattleManager.startAction = function() {
    var subject = this._subject;
    var action = subject.currentAction();
    if (subject.isActor() && DataManager.isSkill(action.item()) && YR.RS.RuneSkillsUsed[action.item().id] &&
        YR.RS.RuneSkillsUsed[action.item().id].contains(subject._actorId) && !subject.skillFailure) {
        YR.RS.RuneSkillsSeen[action.item().id] = true;
        if (YR.RS.RuneLearnSkill && !subject.isLearnedSkill(action.item().id)) subject.learnSkill(action.item().id);
    }
    YR_RS_BMstartAction.call(this);
};

YR_RS_BMupdateTurnEnd = BattleManager.updateTurnEnd;
BattleManager.updateTurnEnd = function() {
    YR.RS.RuneSkillsUsed = [];
    YR_RS_BMupdateTurnEnd.call(this);
};

YR_RS_BMendBattle = BattleManager.endBattle;
BattleManager.endBattle = function(result) {
    YR.RS.RuneSkillsUsed = [];
    YR_RS_BMendBattle.call(this, result);
};

//=============================================================================
// Adding Plugin Commands to Game_Interpreter
//=============================================================================

YR_RS_GIpluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
  YR_RS_GIpluginCommand.call(this, command, args);
  if (command === 'IncreaseRuneMax') {
    var actorId = parseInt(args[0]);
    var value = parseInt(args[2]);
    $gameActors.actor(actorId).increaseRuneMax(value);
  } else if (command === 'DecreaseRuneMax') {
    var actorId = parseInt(args[0]);
    var value = parseInt(args[2]);
    $gameActors.actor(actorId).decreaseRuneMax(value);
  }
};