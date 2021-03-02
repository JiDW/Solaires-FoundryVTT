export class SolairesUtility
{
/**
   * Helper function to set up chat data (set roll mode and content).
   * From WFRP4e system
   * Author: Moo Man
   * 
   * @param {String} content 
   * @param {String} modeOverride 
   * @param {Boolean} isRoll 
   */
  static chatDataSetup(content, modeOverride, isRoll = false, forceWhisper)
  {
    let chatData = {
      user: game.user._id,
      rollMode: modeOverride || game.settings.get("core", "rollMode"),
      content: content
    };

    if (["gmroll", "blindroll"].includes(chatData.rollMode)) chatData["whisper"] = ChatMessage.getWhisperIDs("GM");
    if (chatData.rollMode === "blindroll") chatData["blind"] = true;
    else if (chatData.rollMode === "selfroll") chatData["whisper"] = [game.user];

    if ( forceWhisper ) { // Final force !
      chatData["speaker"] = ChatMessage.getSpeaker();
      chatData["whisper"] = ChatMessage.getWhisperRecipients(forceWhisper);
    }

    if(isRoll)
      chatData.type = CONST.CHAT_MESSAGE_TYPES.ROLL;

    return chatData;
  }
}