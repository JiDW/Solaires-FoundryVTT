import { SOLAIRES_CFG } from "./config.js";
/**
 * Extends Dialog class
 * Add custom event handler
 */
export class SolairesDialog extends Dialog {
    constructor(dialogData, options) {
        super(dialogData, options);
    }

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);

        html.find(".dialog-buttonCustom").click(ev => {
            let id = ev.currentTarget.getAttribute("data-button");
            let type = ev.currentTarget.parentElement.classList.contains("buttons-significance") ? "significance" : "difficulty";
            if (type == "difficulty") {
                html.find('.dialog-sum-difficulty-value').val(SOLAIRES_CFG.DIFFICULTY[id]);
            } else {
                html.find('.dialog-sum-significance-value').val(SOLAIRES_CFG.SIGNIFICANCE[id]);
            }
        });
    }
}