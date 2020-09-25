/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class SolairesItemSheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["solaires", "sheet", "item"],
      template: "systems/solaires/templates/item-sheet.html",
      width: 520,
      height: 200,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
    });
  }
  /** @override */
  _createEditor(target, editorOptions, initialContent) {
    editorOptions.content_css = "systems/solaires/styles/mce.css";
    return super._createEditor(target, editorOptions, initialContent);
  }
}
