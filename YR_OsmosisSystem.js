var Imported = Imported || {};
Imported.YR_OsmosisSystem = true;

var YR = YR || {};
YR.OS = YR.OS || {};


/*:
 * @plugindesc 1.03 Allows your actors to be able to learn skills
 * by seeing them used by allies or enemies.
 * @author Yorae Rasante
 *
 * @param Learn State
 * @desc State under which actor can learn skills.
 * @default 2
 *
 * @param Learn from Allies
 * @desc Is able to learn from allies.
 * @default true
 *
 * @param Learn from Enemies
 * @desc Is able to learn from enemies.
 * @default true
 *
 * @param Learn Text
 * @desc Text to show when learns a new skill.
 * @default %1 learned %2!
 *
 * @param Aftermath Top Text
 * @desc This is the text at the top of Aftermath Window.
 * For when using Yanfly's Aftermath Plugin.
 * @default Skills Learned From Others
 *
 * @help
 * A system to learn skills by seeing others doing them enough,
 * as long as under the right State (default is 2, standard guard)
 * Developer's choice of learning from allies, enemies or both.
 *
 * There is already a screen for when using YEP_VictoryAftermath
 * The name to put in the plugin's victory order is OS
 *
 * Notetags: 
 * 
 * Skills:
 * <OS: x>
 * x is the number of times the skill needs to be seen
 *
 * <AS: x>
 * <AS: x, x, x>
 * <AS: x to x>
 * Another Skill.
 * When skill is seen, the skills set as AS also count as seen
 * x are the numbers of the skills that also count as seen.
 * x to x is a range of Another Skills.
 * notetags can be repeated and used in combination
 * 
 * Actors and Classes:
 * <OS Learn Skills: x>
 * <OS Learn Skills: x, x, x>
 * <OS Learn Skills: x to x>
 * x are the numbers of the skills said actor/class can learn.
 * x to x is a range of learnable skills.
 * notetags can be repeated and used in combination
 */

YR.parameters = PluginManager.parameters('YR_OsmosisSystem');
YR.OS.learnState = Number(YR.parameters['Learn State'] || 2);
YR.OS.learnAlly = eval(YR.parameters['Learn from Allies']);
YR.OS.learnEnemy = eval(YR.parameters['Learn from Enemies']);
YR.OS.learnText = String(YR.parameters['Learn Text'] || '');
YR.OS.aftTopText = String(YR.parameters['Aftermath Top Text'] || '');

YR.OS.learnTextData = [];

YR_OS_DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
YR_OS_DatabaseLoaded = false;

DataManager.isDatabaseLoaded = function() {
    if (!YR_OS_DataManager_isDatabaseLoaded.call(this)) return false;
    if (!YR_OS_DatabaseLoaded) {
        DataManager.readNotetags_ActOS($dataActors);
        DataManager.readNotetags_ActOS($dataClasses);
        DataManager.readNotetags_SkOS($dataSkills);
        YR_OS_DatabaseLoaded = true;
    }
		return true;
};

DataManager.readNotetags_SkOS = function(group) {
    var note1 = /<(?:OP):[ ](\d+)>/i;
    var note2 = /<(?:AS):[ ]*(\d+(?:\s*,\s*\d+)*)>/i;
    var note3 = /<(?:AS):[ ](\d+)[ ](?:THROUGH|to)[ ](\d+)>/i;
 
       for (var n = 1; n < group.length; n++) {
            var obj = group[n];
            var notedata = obj.note.split(/[\r\n]+/);

            obj.oP = 0;
            obj.aS = [];

            for (var i = 0; i < notedata.length; i++) {
                var line = notedata[i];
                if (line.match(note1)) {
                    var oPNeeded  = Number(RegExp.$1);
                    obj.oP = oPNeeded;
                    obj.aS = obj.aS.concat(obj.id);
                }
                if (line.match(note2)) {
                    var list = JSON.parse('[' + RegExp.$1.match(/\d+/g) + ']');
                    obj.aS = obj.aS.concat(list);
                }
                if (line.match(note3)) {
                    var range = YR.getRange(parseInt(RegExp.$1), parseInt(RegExp.$2));
                     obj.aS = obj.aS.concat(range);
                }
            }
      }
};

DataManager.readNotetags_ActOS = function(group) {
    var note1 = /<(?:OS LEARN SKILLS):[ ]*(\d+(?:\s*,\s*\d+)*)>/i;
    var note2 = /<(?:OS LEARN SKILLS):[ ](\d+)[ ](?:THROUGH|to)[ ](\d+)>/i;

      for (var n = 1; n < group.length; n++) {
            var obj = group[n];
            var notedata = obj.note.split(/[\r\n]+/);

            obj.osLearnSkills = [];

            for (var i = 0; i < notedata.length; i++) {
                var line = notedata[i];
                if (line.match(note1)) {
                    var list = JSON.parse('[' + RegExp.$1.match(/\d+/g) + ']');
                    obj.osLearnSkills = obj.osLearnSkills.concat(list);
                }
                if (line.match(note2)) {
                    var range = YR.getRange(parseInt(RegExp.$1), parseInt(RegExp.$2));
                     obj.osLearnSkills = obj.osLearnSkills.concat(range);
                }
            }
      }
};

YR.getRange = function(n, m) {
    var result = [];
    for (var i = n; i <= m; ++i) result.push(i);
    return result;
};

//=============================================================================
// Game_Actor
//=============================================================================

YR_OS_Game_Actor_initMembers = Game_Actor.prototype.initMembers;
Game_Actor.prototype.initMembers = function() {
    YR_OS_Game_Actor_initMembers.call(this);
    this._oP = {};
    this._oPNewSkill = [];
};

YR_OS_Game_Actor_setup = Game_Actor.prototype.setup;
Game_Actor.prototype.setup = function(actorId) {
    YR_OS_Game_Actor_setup.call(this, actorId);
    this.initOPSetup();
};

Game_Actor.prototype.initOPSetup = function() {
    for (var i = 1; i < $dataSkills.length; i++) {
        this._oP[i] = 0;
    }
};

Game_Actor.prototype.oPNeeded = function(skill) {
    return skill.oP;
};

Game_Actor.prototype.oPCheckMastery = function(skillId) {
    var oPNeeded = this.oPNeeded($dataSkills[skillId]);
    if (!this._oP[skillId]) {
        this._oP[skillId] = 0;
    }

    var checkSkillPrev = this._skills.contains(skillId);

    if (this.oSIsMastered(skillId)) {
        this._oP[skillId] = oPNeeded;
        this.learnSkill(skillId);
    }

    if ($gameParty.inBattle()) {
        if (this._skills.contains(skillId) && !checkSkillPrev) {
            if (!this._oPNewSkill.contains(skillId)) {
                this._oPNewSkill.push(skillId);
            }
        }
    }
};

Game_Actor.prototype.gainOP = function(skillId, value) {
    var total = value;
    if (!this.OSCantLearnSkill($dataSkills[skillId])) {
        this._oP[skillId] += total;
        this.oPCheckMastery(skillId);
    }
};

Game_Actor.prototype.oPNewSkill = function() {
    return this._oPNewSkill;
};

Game_Actor.prototype.oSIsMastered = function(skillId) {
    var opNeeded = this.oPNeeded($dataSkills[skillId]);
    return (this._oP[skillId] >= opNeeded && opNeeded > 0) || this._skills.contains(skillId);
};

YR_OS_Game_Actor_forgetSkill = Game_Actor.prototype.forgetSkill;
Game_Actor.prototype.forgetSkill = function(skillId) {
    YR_OS_Game_Actor_forgetSkill.call(this, skillId);
    this.oSForgetSkill(skillId);
};

Game_Actor.prototype.oSForgetSkill = function(skillId) {
    this._oP[skillId] = 0;
};

Game_Actor.prototype.oPRate = function(skill) {
    if (this.oSIsMastered(skill.id)) return 1;
    return this._oP[skill.id] / this.oPNeeded(skill);
};

Game_Actor.prototype.OSCantLearnSkill = function(skill) {
    if (!skill) return false;
    if (this.actor().osLearnSkills) {
        if (!this.actor().osLearnSkills.contains(skill.id)) var actorCant = true;
    }
    if (this.currentClass().osLearnSkills) {
        if (!this.currentClass().osLearnSkills.contains(skill.id)) var classCant = true;
    }
    if (actorCant && classCant) {
        return true;
    }
    return false;
};

//=============================================================================
// Game_Actor
//=============================================================================

YR_OS_Game_Actor_useItem = Game_Actor.prototype.useItem;
Game_Actor.prototype.useItem = function(item) {
    YR_OS_Game_Actor_useItem.call(this, item);
    if (!$gameParty.inBattle()) return;
    if (YR.OS.learnAlly) {
        $gameParty.battleMembers().forEach(function(actor) {
            if (item.aS.length > 0) {
                for (var n = 0; n < item.aS.length; n++) {
                    var skill = $dataSkills[item.aS[n]];
                    if (DataManager.isSkill(skill) && !actor.OSCantLearnSkill(skill) && !actor._skills.contains(skill.id) && actor.isStateAffected(YR.OS.learnState)) {
                        actor.gainOP(skill.id, 1);
                        if (actor.oSIsMastered(skill.id)) YR.OS.learnTextData = [actor, skill];
                    }
                }
            }
        })
    }
};

YR_OS_Game_Battler_onBattleStart = Game_Battler.prototype.onBattleStart;
Game_Battler.prototype.onBattleStart = function() {
    YR_OS_Game_Battler_onBattleStart.call(this);
    this._oPNewSkill = [];
};

//=============================================================================
// Game_Enemy
//=============================================================================

YR_OS_Game_Enemy_useItem = Game_Enemy.prototype.useItem;
Game_Enemy.prototype.useItem = function(item) {
    YR_OS_Game_Enemy_useItem.call(this, item);
    if (!$gameParty.inBattle()) return;
    if (YR.OS.learnEnemy) {
        $gameParty.battleMembers().forEach(function(actor) {
            if (item.aS.length > 0) {
                for (var n = 0; n < item.aS.length; n++) {
                    var skill = $dataSkills[item.aS[n]];
                    if (DataManager.isSkill(skill) && !actor.OSCantLearnSkill(skill) && !actor._skills.contains(skill.id) && actor.isStateAffected(YR.OS.learnState)) {
                        actor.gainOP(skill.id, 1);
                        if (actor.oSIsMastered(skill.id)) YR.OS.learnTextData = [actor, skill];
                    }
                }
            }
        })
    }
};

//=============================================================================
// Game_Action
//=============================================================================

YR_OS_Game_Action_Apply = Game_Action.prototype.apply;
Game_Action.prototype.apply = function(target) {
    YR_OS_Game_Action_Apply.call(this, target);
    if (YR.OS.learnTextData.length > 0) {
        this.displayLearnText();
        YR.OS.learnTextData = []
    }
};

Game_Action.prototype.displayLearnText = function() {
    if (!$gameParty.inBattle()) return;
    var scene = SceneManager._scene;
    var fmt = YR.OS.learnText;
    if (fmt === '') return;
    var actor = YR.OS.learnTextData[0];
    var skill = YR.OS.learnTextData[1];
    var text = fmt.format(actor.name(), ('\\i[' + skill.iconIndex + ']' + skill.name));
    if (!scene._logWindow) return;
    var win = scene._logWindow;
    win._lines.push(text);
    if (!Imported.YEP_BattleEngineCore) var frames = 0;
    var frames = 60;
    if (frames > 0) BattleManager._actionList.push(['WAIT', [frames]]);
    win.refresh();
};

//=============================================================================
// BattleManager
//=============================================================================

YR_OS_BattleManager_displayRewards = BattleManager.displayRewards;
BattleManager.displayRewards = function() {
    YR_OS_BattleManager_displayRewards.call(this);
    this.oSDisplayNewMastery();
};

BattleManager.oSDisplayNewMastery = function() {
    var anyNewSkill = $gameParty.members().some(function(actor) {
        return actor.oPNewSkill().length > 0;
    });
    if (!anyNewSkill) return;
    $gameMessage.newPage();
    $gameParty.members().forEach(function(actor) {
              var newSkills = actor.oPNewSkill();
        newSkills.forEach(function(skillId) {
            $gameMessage.add(TextManager.obtainSkill.format($dataSkills[skillId].name));
        });
        });
};

//=============================================================================
// Window_VictoryOP
//=============================================================================

if (Imported.YEP_VictoryAftermath) {

function Window_VictoryOP() {
    this.initialize.apply(this, arguments);
}

Window_VictoryOP.prototype = Object.create(Window_VictoryExp.prototype);
Window_VictoryOP.prototype.constructor = Window_VictoryOP;

Window_VictoryOP.prototype.drawActorGauge = function(actor, index) {
    this.clearGaugeRect(index);
    var rect = this.gaugeRect(index);
    this.changeTextColor(this.normalColor());
    this.drawActorName(actor, rect.x + 2, rect.y);
    this.drawGainedSkills(actor, rect);
};

Window_VictoryOP.prototype.maxItems = function() {
    var numbactors = 0;
    $gameParty.battleMembers().forEach(function(actor)
    {
        if (actor.oPNewSkill().length > 0)
            numbactors += 1;
    }, this);
    return numbactors;
};

Window_VictoryOP.prototype.drawGainedSkills = function(actor, rect) {
    if (actor.oPNewSkill().length <= 0) return;
    var wy = rect.y;

    for (var i = 0; i < actor.oPNewSkill().length; ++i) {
        if (wy + this.lineHeight() > rect.y + rect.height) break;
        var skillId = actor.oPNewSkill()[i];
        var skill = $dataSkills[skillId];
        if (!skill) continue;
        var text = '\\i[' + skill.iconIndex + ']' + skill.name;
        text = TextManager.obtainSkill.format(text);
        var ww = this.textWidthEx(text);
        var wx = rect.x + (rect.width - ww) / 2;
        this.drawTextEx(text, wx, wy);
        wy += this.lineHeight();
    }
};

//=============================================================================
// Scene_Battle
//=============================================================================

YR_OS_Scene_Battle_addCustomVictorySteps =
    Scene_Battle.prototype.addCustomVictorySteps;
Scene_Battle.prototype.addCustomVictorySteps = function(array) {
    array = YR_OS_Scene_Battle_addCustomVictorySteps.call(this, array);
    if (!array.contains('OS')) array.push('OS');
    return array;
};

YR_OS_Scene_Battle_updateVictorySteps =
    Scene_Battle.prototype.updateVictorySteps;
Scene_Battle.prototype.updateVictorySteps = function() {
    YR_OS_Scene_Battle_updateVictorySteps.call(this);
    if (this.isVictoryStep('OS')) this.updateVictoryOP();
};

Scene_Battle.prototype.updateVictoryOP = function() {
    if (!this._VictoryOPWindow) {
            if (this.meetOSConditions()) this.CreateVictoryOP();
            else this.processNextVictoryStep();
    } else if (this._VictoryOPWindow.isReady()) {
      if (this.victoryTriggerContinue()) this.FinishVictoryOP();
    }
};

Scene_Battle.prototype.meetOSConditions = function() {
    var result = false;
    $gameParty.battleMembers().forEach(function(actor)
    {
        if (actor.oPNewSkill().length > 0)
            result = true;
    }, this);
    return result;
}

Scene_Battle.prototype.CreateVictoryOP = function() {
    this._victoryTitleWindow.refresh(YR.OS.aftTopText);
    this._VictoryOPWindow = new Window_VictoryOP();
    this.addWindow(this._VictoryOPWindow);
    this._VictoryOPWindow.open();
};

Scene_Battle.prototype.FinishVictoryOP = function() {
    SoundManager.playOk();
    this._VictoryOPWindow.close();
    this.processNextVictoryStep();
};

}; // Imported.YEP_VictoryAftermath


//=============================================================================
// Window_SkillList
//=============================================================================

Window_SkillList.prototype.isEnabled = function(item) {
    return this._actor && this._actor.canUse(item) && this._actor.isLearnedSkill(item.id);
};


Window_SkillList.prototype.makeItemList = function() {
    if (this._actor) {
        this._data = this._actor.skills().filter(function(item) {
            return this.includes(item);
        }, this);
        if (!$gameParty.inBattle()) {
            var OSSkills = [];
            for (var i = 0; i < Object.keys(this._actor._oP).length; ++i) {
                if (this._actor._oP[i] > 0 && !this._actor.isLearnedSkill(i) && this.includes($dataSkills[i])) {
                    OSSkills.push($dataSkills[i]);
                }
            }
            this._data = this._data.concat(OSSkills);
        }
    } else {
        this._data = [];
    }
};

YR_OS_drawSkillCost = Window_SkillList.prototype.drawSkillCost
Window_SkillList.prototype.drawSkillCost = function(skill, x, y, width) {
    if (this._actor.isLearnedSkill(skill.id)) {
        YR_OS_drawSkillCost.call(this, skill, x, y, width);
    }
    else {this.drawOPGauge(skill, x, y, width);}
};

Window_SkillList.prototype.drawOPGauge = function(ability, x, y, width) {
    this.changePaintOpacity(true);

    var iconWidth = Window_Base._iconWidth + 4;
    var offsetX = Math.max(Math.ceil(this.textWidth(ability.name)) + iconWidth, width/2);
    var color1 = this.textColor(6);
    var color2 = this.textColor(14);
    var rate =  this._actor.oPRate(ability);
    this.drawGauge(x + offsetX, y, width - 2 - offsetX, rate, color1, color2);
    this.DrawOPNumbers(ability, x + offsetX, y, width - 2 - offsetX);
};

Window_SkillList.prototype.DrawOPNumbers = function(ability, x, y, width) {
    var baseOP = this._actor._oP[ability.id];
    var maxOP = this._actor.oPNeeded(ability);
    var text = baseOP + "/" + maxOP;
    this.drawText(text, x, y, width, 'right');
};