/**
 * Extend the base Actor entity by defining a custom roll data structure
 * @extends {Actor}
 */
export class SolairesActor extends Actor {
    /**
     * Augment the basic actor data with additional dynamic data.
     * 
     * @param {Object} actorData The data for the actor
     * @returns {Object} The actors data
     */
    prepareData() {
      super.prepareData();
      const actorData = this.data;
      const data = actorData.data;
      const flags = actorData.flags;

      if(data.status.charPoints.value == null)
        data.status.charPoints.value = 3;

      if(data.status.charPoints.max == null)
        data.status.charPoints.max = 3;

      const items = actorData.items;
      data.traits = items.filter(item => item.type === "trait");
      data.careers = items.filter(item => item.type === "career");
      data.relations = items.filter(item => item.type === "relation");
      data.statuses = items.filter(item => item.type === "status");
      data.modifications = items.filter(item => item.type === "modification");
      data.equipments = items.filter(item => item.type === "equipment");
      data.softwares = items.filter(item => item.type === "softwares");
  }
}