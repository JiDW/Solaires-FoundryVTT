/**
 * Classe de gestion des items Solaires
 * Basée en partie sur WFRP4e par Moo Man
 */

import { SolairesUtility } from "./utility.js";

export class SolairesItem extends Item
{
  // Upon creation, assign a blank image if item is new (not duplicated) instead of mystery-man default
  static async create(data, options)
  {
    if (!data.img)
      data.img = "systems/solaires/icons/blank.png";
    super.create(data, options);
  }

  /**
   * Posts this item to chat.
   * 
   * postItem() prepares this item's chat data to post it to chat, setting up 
   * the image if it exists, as well as setting flags so drag+drop works.
   * 
   */
  postItem()
  {
    let chatData = duplicate(this.data);

    // Don't post any image for the item (which would leave a large gap) if the default image is used
    if (chatData.img.includes("/blank.png"))
      chatData.img = null;

    renderTemplate('systems/solaires/templates/chat/post-item.html', chatData).then(html =>
    {
      let chatOptions = SolairesUtility.chatDataSetup(html)
      // Setup drag and drop data
      chatOptions["flags.transfer"] = JSON.stringify(
      {
        data: this.data,
        postedItem: true
      })
      ChatMessage.create(chatOptions);
    });
  }
}