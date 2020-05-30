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

      const items = actorData.items;
      data.talents = items.find(item => item.type === "talent");
      data.carrieres = items.filter(item => item.type === "carriere");
      data.relations = items.filter(item => item.type === "relation");
      data.etats = items.filter(item => item.type === "etat");
      data.modifications = items.filter(item => item.type === "modifications");
      data.equipements = items.filter(item => item.type === "equipement");
      data.logiciels = items.filter(item => item.type === "logiciel");
      data.historiques = items.filter(item => item.type === "historique");
  }
  }
  