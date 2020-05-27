/**
 * A simple and flexible system for world-building using an arbitrary collection of character and item attributes
 * Author: Atropos
 * Software License: GNU GPLv3
 */

// Import Modules
import { SolairesActor } from "./actor.js";
import { SolairesItemSheet } from "./item-sheet.js";
import { SolairesActorSheet } from "./actor-sheet.js";

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

Hooks.once("init", async function() {
  console.log(`Initializing Solaires System`);

	// Define custom Entity classes
  CONFIG.Actor.entityClass = SolairesActor;

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("solaires", SolairesActorSheet, { makeDefault: true });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("solaires", SolairesItemSheet, {makeDefault: true});

  // Register system settings
  game.settings.register("solaires", "macroShorthand", {
    name: "Shortened Macro Syntax",
    hint: "Enable a shortened macro syntax which allows referencing attributes directly, for example @str instead of @attributes.str.value. Disable this setting if you need the ability to reference the full attribute model, for example @attributes.str.label.",
    scope: "world",
    type: Boolean,
    default: true,
    config: true
  });
});
