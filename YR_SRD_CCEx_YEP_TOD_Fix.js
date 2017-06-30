/*:
* @plugindesc Compatibility Fix SRD_SummonCore and YEP_TurnOrderDisplay
* @author Yorae Rasante
* @help
* YEP_TurnOrderDisplay is on version 1.02
* SRD_CharacterCreatorEx is on version 1.01
*/

if(Imported.YEP_X_TurnOrderDisplay && Imported["SumRndmDde Character Creator EX"]) {
	_Window_TurnOrderIcon_drawActorFace = Window_TurnOrderIcon.prototype.drawActorFace;
	Window_TurnOrderIcon.prototype.drawActorFace = function() {
		if(this.battler().hasSetImage()) {
			this.drawCustomFace(this.battler(), 4, 4, this.contents.width - 8, this.contents.height - 8);
		} else {
			_Window_TurnOrderIcon_drawActorFace.apply(this, arguments);
		}
	};
}