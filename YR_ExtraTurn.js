//==============================================================================
// YR_ExtraTurn.js
//==============================================================================

/*:
 * @plugindesc Gives fast enough battlers an extra turn
 * @author Yorae Rasante
 *
 * @param Extra Turn Enemies
 * @desc Do enemies get Extra Turns.
 * @default true
 *
 * @help At every turn, if the battler is at least twice as fast as the
 * fastest opponent, that battler gains an extra turn.
 * This extra turn does not count for anything but getting an extra action.
 * It is based on Breath of Fire 3
*/

var Imported = Imported || {};
Imported.YR_ExtraTurn = true;

var YR = YR || {};
YR.ExT = YR.ExT || {};

YR.parameters = PluginManager.parameters('YR_ExtraTurn');
YR.ExT.exTEn = eval(YR.parameters['Extra Turn Enemies']);

YR.ExT.extraTurn = false;

BattleManager.enemy_agi_max = function() {
  var agi = 0;
  $gameTroop.members().forEach(function findMaxAgi (enemy) {
    if (!enemy.isAlive()) {return;}
    if (enemy.agi > agi) {agi = enemy.agi}
  });
  return agi;
}

BattleManager.party_agi_max = function() {
  var agi = 0;
  $gameParty.members().forEach(function findMaxAgi (actor) {
    if (!actor.isAlive()) {return;}
    if (actor.agi > agi) {agi = actor.agi}
  });
  return agi;
}

BattleManager.selectNextCommand = function() {
  do {
    if (!this.actor() || !this.actor().selectNextCommand()) {
      this.changeActor(this._actorIndex + 1, 'waiting');
      if (this._actorIndex >= $gameParty.size()) {
        this.startTurn();
        break;
      }
    }
  } while (!this.actor().canInput() || (YR.ExT.extraTurn && !(this.actor().agi >= this.enemy_agi_max() * 2)));
};

BattleManager.selectPreviousCommand = function() {
  do {
    if (!this.actor() || !this.actor().selectPreviousCommand()) {
      this.changeActor(this._actorIndex - 1, 'undecided');
      if (this._actorIndex < 0) {
        return;
      }
    }
  } while (!this.actor().canInput() || (YR.ExT.extraTurn && !(this.actor().agi >= this.enemy_agi_max() * 2)));
};

BattleManager.startInput = function() {
  this._phase = 'input';
  if (!YR.ExT.extraTurn) {$gameTroop.makeActions();}
  else {$gameTroop.clearActions();}
  $gameParty.makeActions();
  this.clearActor();
  if (this._surprise || !$gameParty.canInput()) {
    this.startTurn();
  }
};

YR_extraturn_increaseturn = Game_Troop.prototype.increaseTurn;
Game_Troop.prototype.increaseTurn = function() {
  if (!YR.ExT.extraTurn) YR_extraturn_increaseturn.call(this);
};

BattleManager.makeActionOrders = function() {
  var battlers = [];
  var speedsters = [];
  var enemyExT = YR.ExT.exTEn;
  if (YR.ExT.extraTurn) {
    $gameParty.members().forEach(function(actor) {
      if (actor.agi >= BattleManager.enemy_agi_max() * 2) {speedsters.push(actor)}
    })

    $gameTroop.members().forEach(function(enemy) {
      if (enemyExT && (enemy.agi >= BattleManager.party_agi_max() * 2)) {speedsters.push(enemy)}
    })

    battlers = battlers.concat(speedsters);
  }
  else {
    if (!this._surprise) {
      battlers = battlers.concat($gameParty.members());
    }
    if (!this._preemptive) {
      battlers = battlers.concat($gameTroop.members());
    }
  }
  battlers.forEach(function(battler) {
      battler.makeSpeed();
  });
  battlers.sort(function(a, b) {
    return b.speed() - a.speed();
  });
  this._actionBattlers = battlers;
};

BattleManager.endTurn = function() {
  this._phase = 'turnEnd';
  this._preemptive = false;
  this._surprise = false;
  this.allBattleMembers().forEach(function(battler) {
    if (YR.ExT.extraTurn) {battler.onTurnEnd();}
    this.refreshStatus();
    if (YR.ExT.extraTurn) {this._logWindow.displayAutoAffectedStatus(battler);}
    this._logWindow.displayRegeneration(battler);
  }, this);
  YR.ExT.extraTurn ? (YR.ExT.extraTurn = false) : (YR.ExT.extraTurn = true);
};

YR_extraturn_start = Scene_Battle.prototype.start;
Scene_Battle.prototype.start = function() {
  YR.ExT.extraTurn = false;
  YR_extraturn_start.call(this);
};

YR_extraTurn_startPartyCommandSelection = Scene_Battle.prototype.startPartyCommandSelection;
Scene_Battle.prototype.startPartyCommandSelection = function() {
  if (YR.ExT.extraTurn) {this.selectNextCommand();}
  else {
    YR_extraTurn_startPartyCommandSelection.call(this);
  }
};