import { SolairesUtility } from "./utility.js";
/**
 * Solaires Action class
 * Is in charge of dealing with an action and its messages
 */
export class SolairesAction {
    /**
     * @param {ChatMessage} message 
     * @param {Number} difficulty 
     */
    constructor(difficulty = 0, significance = 0, message = null, item1 = null, item2 = null, state = SolairesAction.STATUS.EMPTY) {
        this.message = message;
        this.item1 = item1;
        this.item2 = item2;
        this.difficulty = difficulty;
        this.significance = significance;
        this.state = state;
    }

    static STATUS = {
        EMPTY: -1,
        PREPARE: 0,
        READY: 1,
        ACK: 2,
        PENDING: 3,
        DONE: 4
    }

    get total() {
        return this.difficulty + this.significance;
    }

    /**
     * Returns default ChatMessage datas
     */
    get defaultCardData() {
        return {
            Difficulty: this.difficulty,
            Significance: this.significance,
            Total: this.total,
            ActionScore: this.total,
            Display1: {
                Item: "none",
                Placeholder: "block"
            },
            Display2: {
                Item: "none",
                Placeholder: "block"
            },
            Unresolved:this.state != SolairesAction.STATUS.DONE
        };
    }

    /**
     * Check the action status before a change is supposed to happen to the action
     */
    checkActionStatus() {
        if (this.state >= SolairesAction.STATUS.DONE)
            return;
        if (this.state == SolairesAction.STATUS.ACK)
            SolairesAction.updateGMAck(false);
    }

    /**
     * Set an item to item1 or item2 slot and update the message card
     * @param {SolairesItem} item 
     */
    setItem(item) {
        this.checkActionStatus();
        if (this.item1 === null && this.item2 != item) {
            this.item1 = item;
        }
        else if (this.item1 != item) {
            this.item2 = item;
        }
        else {
            return;
        }
        this.updateChatCard();
        this.saveAction();
    }

    /**
     * Remove an item from an ongoing action
     * @param {Number} slot 
     */
    removeItem(slot) {
        this.checkActionStatus();
        if (slot === 1)
            this.item1 = null;
        else
            this.item2 = null;
        this.updateChatCard();
        this.saveAction();
    }

    /**
     * Change the "GM ackowledge" checkmark of an action
     * @param {Boolean} ack 
     */
    static updateGMAck(ack) {
        if(ack)
            document.querySelector('.checkMark').classList.replace("fa-question-circle", "fa-check-circle");
        else
            document.querySelector('.checkMark').classList.replace("fa-check-circle", "fa-question-circle");

        if (game.user.isGM) {
            game.socket.emit("system.solaires", {
                type: "updateGMAck",
                payload: {
                    ack: ack
                }
            });
        }
    }

    /**
     * Create a ChatMessage when an action begins
     */
    createChatCard() {
        let data = this.defaultCardData;
        renderTemplate("systems/solaires/templates/chat/begin-action.html", data).then(html => {
            let chatOptions = SolairesUtility.chatDataSetup(html);
            ChatMessage.create(chatOptions).then(msg => {
                this.message = msg;
                this.state = SolairesAction.STATUS.PREPARE;
                this.saveAction();
            });
        });
    }

    /**
     * Update the ChatMessage with the current data on the action
     */
    updateChatCard() {
        let data = this.defaultCardData;
        let actionScore = data.Total;
        if (this.item1) {
            data.Display1 = {
                Item: "flex",
                Placeholder: "none"
            };
            data.Item1 = {
                img: this.item1.img,
                name: this.item1.name,
                value: this.item1.data.data.value,
                actorName: this.item1.actor.name
            };
            actionScore += this.item1.data.data.value;
        }

        if (this.item2) {
            data.Display2 = {
                Item: "flex",
                Placeholder: "none"
            }
            data.Item2 = {
                img: this.item2.img,
                name: this.item2.name,
                value: this.item2.data.data.value,
                actorName: this.item2.actor.name
            };
            actionScore += this.item2.data.data.value;
        }

        data.ActionScore = actionScore;

        renderTemplate("systems/solaires/templates/chat/begin-action.html", data).then(html => {
            this.message.update({
                content: html
            }).then(newMsg => {
                this.message = newMsg;
                if(this.state == SolairesAction.STATUS.DONE)
                    game.solaires.pendingAction = null;
            });
        });
    }

    /**
     * Save an ongoing action on the GM computer for a future reload
     */
    saveAction() {
        if (game.user.isGM) {
            localStorage.setItem('pendingAction', this.toJSON());
        }
    }

    /** 
     * Clean the "begin" message after an action has been resolved
     */
    cleanAction(){
        this.state = SolairesAction.STATUS.DONE;
        this.updateChatCard();
        SolairesAction.deleteSave();
    }

    static deleteSave() {
        localStorage.removeItem('pendingAction');
    }

    /**
     * Returns raw data that are needed to deserialize a SolairesAction from a string
     */
    toJSON() {
        return JSON.stringify({
            message: this.message ? this.message.id : null,
            item1: this.item1 ? this.item1.id : null,
            actor1: this.item1 ? this.item1.actor.id : null,
            item2: this.item2 ? this.item2.id : null,
            actor2: this.item2 ? this.item2.actor.id : null,
            difficulty: this.difficulty,
            significance: this.significance,
            state: this.state
        });
    }

    /**
     * Deserialize a JSON string into a SolairesAction object
     * @param {String} json 
     */
    static fromJSON(json) {
        let data = JSON.parse(json);
        let item1 = null, item2 = null;

        let message = game.messages.get(data.message);
        if (!message) {
            SolairesAction.deleteSave();
            return null;
        }

        if (data.item1)
            item1 = game.actors.get(data.actor1).items.get(data.item1);
        if (data.item2)
            item2 = game.actors.get(data.actor2).items.get(data.item2);

        return new SolairesAction(data.difficulty, data.significance, message, item1, item2, data.state);
    }

    /**
     * Create a RollMessage and resolve the action
     * @param {Number} actionScore 
     */
    static resolveAction(actionScore){
        let data = {
            HasRoll: actionScore > 0 && actionScore < 6,
            ActionScore: actionScore
        };

        let result = actionScore >= 6;
        let roll = null;
        if(data.HasRoll){
            roll = new Roll(`3d6cs<=${actionScore}`).roll();
            data.SuccessCount = parseInt(roll.result,10);
            data.Rolls = roll.dice[0].results.map(obj => {
                return {value:obj.result,class:obj.success ? "resolve-action-roll-success":"resolve-action-roll-failed"};
            });
            result = data.SuccessCount >= 2;
        }

        if(result){
            data.ClassActionResult = "resolve-action-success";
            data.TextActionResult = `<i class="fas fa-check"></i> ${game.i18n.localize("SOLAIRES.Chat.ResultSuccess")}`;
        }
        else {
            data.ClassActionResult = "resolve-action-failed";
            data.TextActionResult = `<i class="fas fa-times"></i> ${game.i18n.localize("SOLAIRES.Chat.ResultFailed")}`;
        }

        renderTemplate("systems/solaires/templates/chat/resolve-action.html", data).then(html => {
            let chatOptions = SolairesUtility.chatDataSetup(html, null, data.HasRoll);
            chatOptions.roll = roll;
            ChatMessage.create(chatOptions).then(msg => {
                if(game.user.isGM)
                    game.solaires.pendingAction.cleanAction();
                else{
                    game.socket.emit("system.solaires", {
                        type: "cleanAction"
                    });
                }
            });
        });
    }
}