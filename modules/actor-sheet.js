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
      height: 600,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "psychologie" }],
      dragDrop: [{ dragSelector: ".item-list .item", dropSelector: null }]
    });
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    const data = super.getData();
    data.dtypes = ["String", "Number", "Boolean"];
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
    html.find('.item-ajouter').click(ev => {
      ev.preventDefault();
      let header = ev.currentTarget,
      data = duplicate(header.dataset);

      data["img"] = "systems/solaires/images/blank.png";
      data["name"] = `${game.i18n.localize("SOLAIRES.Item.Nouveau")} ${data.type.capitalize()}`;
      this.actor.createEmbeddedEntity("OwnedItem", data).then(item => this.actor.getOwnedItem(item._id).sheet.render(true));
    });

    // Increase item value
    html.find('.item-valeur').mousedown(ev => {
      const li = $(ev.currentTarget).parents(".item");
      let item = duplicate(this.actor.getEmbeddedEntity("OwnedItem", li.data("itemId")));
      switch (ev.button)
      {
        case 0:
          if (ev.ctrlKey)
            item.data.valeur += 10;
          else
            item.data.valeur++;

          break;
        case 2:
          if (ev.ctrlKey)
            item.data.valeur -= 10;
          else
            item.data.valeur--;

          if (item.data.valeur < 0)
            item.data.valeur = 0;
          break;
      }
      this.actor.updateEmbeddedEntity("OwnedItem", item);
    });

    // Delete Inventory Item
    html.find('.item-post').click(ev => {
      let itemId = $(ev.currentTarget).parents(".item").data("itemId");
      const item = this.actor.items.find(i => i.data._id == itemId)
      item.postItem();
    });
  }

  /* -------------------------------------------- */

  /** @override */
  setPosition(options = {}) {
    const position = super.setPosition(options);
    const sheetBody = this.element.find(".sheet-body");
    const bodyHeight = position.height - 300;
    sheetBody.css("height", bodyHeight);
    return position;
  }
}
