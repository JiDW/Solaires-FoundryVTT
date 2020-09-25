import { SOLAIRES_CFG } from "./config.js";
/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class SolairesActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["solaires", "sheet", "actor"],
      template: "systems/solaires/templates/actor-sheet.html",
      width: 600,
      height: 650,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "psychologie" }],
      dragDrop: [{ dragSelector: ".item-list .item", dropSelector: null }]
    });
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    const data = super.getData();
    data.dtypes = ["String", "Number", "Boolean"];
    data.Roles = SOLAIRES_CFG.ROLES;
    data.SpiritNatureTypes = SOLAIRES_CFG.SPIRITNATURETYPES;
    data.Sheaths = SOLAIRES_CFG.SHEATHS;
    data.RolesValue = data.actor.data.identity ? data.actor.data.identity.roles.split(","):"";
    return data;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Update Inventory Item
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.getOwnedItem(li.data("itemId"));
      item.sheet.render(true);
    });

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      this.actor.deleteOwnedItem(li.data("itemId"));
      li.slideUp(200, () => this.render(false));
    });

    // Create Inventory Item
    html.find('.item-add').click(ev => {
      ev.preventDefault();
      let header = ev.currentTarget,
        data = duplicate(header.dataset);

      data["img"] = "systems/solaires/images/blank.png";
      data["name"] = `${game.i18n.localize("SOLAIRES.Item.New")} ${data.type.capitalize()}`;
      this.actor.createEmbeddedEntity("OwnedItem", data).then(item => this.actor.getOwnedItem(item._id).sheet.render(true));
    });

    // Increase item value
    html.find('.item-value').mousedown(ev => {
      const li = $(ev.currentTarget).parents(".item");
      let item = duplicate(this.actor.getEmbeddedEntity("OwnedItem", li.data("itemId")));
      switch (ev.button) {
        case 0:
          if (ev.ctrlKey)
            item.data.value += 10;
          else
            item.data.value++;

          break;
        case 2:
          if (ev.ctrlKey)
            item.data.value -= 10;
          else
            item.data.value--;

          if (item.data.value < 0)
            item.data.value = 0;
          break;
      }
      this.actor.updateEmbeddedEntity("OwnedItem", item);
    });

    // Delete Inventory Item
    html.find('.item-post').click(ev => {
      let itemId = $(ev.currentTarget).parents(".item").data("itemId");
      const item = this.actor.items.find(i => i.data._id == itemId);
      item.postItem();
    });

    html.find('.item-name').click(ev => {
      let itemId = $(ev.currentTarget).parents(".item").data("itemId");
      let item = this.actor.items.find(i => i.data._id == itemId);
      if (game.user.isGM && game.solaires.pendingAction)
        game.solaires.pendingAction.setItem(item);
      else {
        game.socket.emit("system.solaires", {
          type: "setItem",
          payload: {
            idItem: itemId,
            idActor: this.actor._id
          }
        })
      }
    });

    //Activate "Chosen" plugin for selectbox
    $(".select-role").chosen({ max_selected_options: 3, width: "100%" });

    // change charpoints value
    html.find('.header-charpoints-point').mousedown(ev => {
      let val = this.actor.data.data.status.charPoints.value;
      let target = "data.status.charPoints.value";
      if($(ev.currentTarget).hasClass("header-charpoints-max"))
      {
        val = this.actor.data.data.status.charPoints.max;
        target = "data.status.charPoints.max";
      }

      switch (ev.button) {
        case 0:
          if (ev.ctrlKey)
            val += 10;
          else
            val++;

          break;
        case 2:
          if (ev.ctrlKey)
            val -= 10;
          else
            val--;

          if (val < 0)
            val = 0;
          break;
      }

      this.actor.update({[target]: val});
    });
  }

  /* -------------------------------------------- */

  /** @override */
  setPosition(options = {}) {
    const position = super.setPosition(options);
    const sheetBody = this.element.find(".sheet-body");
    const bodyHeight = position.height - 205;
    sheetBody.css("height", bodyHeight);
    return position;
  }

  /** @override */
  _onChangeInput(event) {
    if(event.currentTarget.hasAttribute("multiple")){
      let val = $(event.currentTarget).val();
      val = val.join(',');
      let fakeEvent = new Event('change',{ bubbles: true });
      $(event.currentTarget).siblings('input[type="hidden"]').val(val)[0].dispatchEvent(fakeEvent);
    }
    else
      super._onChangeInput(event);
  }

  /** @override */
  _createEditor(target, editorOptions, initialContent) {
    editorOptions.content_css = "systems/solaires/styles/mce.css";
    return super._createEditor(target, editorOptions, initialContent);
  }
}
