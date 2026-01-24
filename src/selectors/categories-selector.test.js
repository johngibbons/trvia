import Category from "../models/Category";
import Game from "../models/Game";
import Entry from "../models/Entry";
import Group from "../models/Group";
import {
  givenCategorySelector,
  currentCategorySelector,
  entryCategoriesSelector,
  entryScoreSelector,
  gameTotalPossibleSelector,
} from "./categories-selector";
import { Map, is } from "immutable";
import { ScenarioBuilder } from "../testUtils/factories";

describe("categories selector", () => {
  it("should return entry categories", () => {
    const builder = new ScenarioBuilder()
      .withGame({ id: "game1" }, 3, 5)
      .withGroup("game1", { id: "group1" })
      .withEntry("group1", { name: "Test" }, "all-first")
      .withCurrentUser({ id: "user1" });

    const ids = builder.getIds();
    const scenario = builder.build();
    const entryId = ids.entryIds[0];
    const props = { routeParams: { id: entryId } };

    const result = entryCategoriesSelector(scenario, props);

    // Should return the 3 categories associated with the game
    expect(result.count()).toEqual(3);
  });

  describe("entryScoreSelector", () => {
    it("should return entry score based on correct selections", () => {
      const builder = new ScenarioBuilder()
        .withGame({ id: "game1" }, 3, 5)
        .withGroup("game1", { id: "group1" })
        .withEntry("group1", { name: "Test" }, "all-first")
        .withGameInProgress("game1", 2) // 2 categories answered
        .withCurrentUser({ id: "user1" });

      const ids = builder.getIds();
      const scenario = builder.build();
      const entryId = ids.entryIds[0];
      const props = { routeParams: { id: entryId } };

      // Entry selected "all-first" and first nominees are marked as correct
      // Score should be 2 (1 point per correct answer in default values)
      const score = entryScoreSelector(scenario, props);
      expect(score).toEqual(2);
    });

    it("should return 0 when no categories answered", () => {
      const builder = new ScenarioBuilder()
        .withGame({ id: "game1" }, 3, 5)
        .withGroup("game1", { id: "group1" })
        .withEntry("group1", { name: "Test" }, "all-first")
        .withCurrentUser({ id: "user1" });

      const ids = builder.getIds();
      const scenario = builder.build();
      const entryId = ids.entryIds[0];
      const props = { routeParams: { id: entryId } };

      const score = entryScoreSelector(scenario, props);
      expect(score).toEqual(0);
    });

    it("should return 0 when entry has no selections", () => {
      const builder = new ScenarioBuilder()
        .withGame({ id: "game1" }, 3, 5)
        .withGroup("game1", { id: "group1" })
        .withEntry("group1", { name: "Test" }, "empty")
        .withGameInProgress("game1", 2)
        .withCurrentUser({ id: "user1" });

      const ids = builder.getIds();
      const scenario = builder.build();
      const entryId = ids.entryIds[0];
      const props = { routeParams: { id: entryId } };

      const score = entryScoreSelector(scenario, props);
      expect(score).toEqual(0);
    });
  });

  describe("gameTotalPossibleSelector", () => {
    it("should return sum of all category point values", () => {
      const builder = new ScenarioBuilder()
        .withGame({ id: "game1" }, 3, 5) // 3 categories
        .withGroup("game1", { id: "group1" })
        .withEntry("group1", { name: "Test" }, "all-first")
        .withCurrentUser({ id: "user1" });

      const ids = builder.getIds();
      const scenario = builder.build();
      const entryId = ids.entryIds[0];
      const props = { routeParams: { id: entryId } };

      // Default group values are 1 point per category, so 3 categories = 3 total
      const totalPossible = gameTotalPossibleSelector(scenario, props);
      expect(totalPossible).toEqual(3);
    });

    it("should return sum with custom point values", () => {
      const builder = new ScenarioBuilder()
        .withGame({ id: "game1" }, 3, 5)
        .withGroup("game1", { id: "group1" })
        .withEntry("group1", { name: "Test" }, "all-first")
        .withCurrentUser({ id: "user1" });

      const ids = builder.getIds();
      const categoryIds = ids.gameCategories["game1"];

      // Set custom values: 5, 10, 15 points
      const customValues = {
        [categoryIds[0]]: 5,
        [categoryIds[1]]: 10,
        [categoryIds[2]]: 15,
      };
      builder.withGroupValues("group1", customValues);

      const scenario = builder.build();
      const entryId = ids.entryIds[0];
      const props = { routeParams: { id: entryId } };

      const totalPossible = gameTotalPossibleSelector(scenario, props);
      expect(totalPossible).toEqual(30);
    });

    it("should return 0 when group is not found", () => {
      const builder = new ScenarioBuilder()
        .withGame({ id: "game1" }, 3, 5)
        .withGroup("game1", { id: "group1" })
        .withEntry("group1", { name: "Test" }, "all-first")
        .withCurrentUser({ id: "user1" });

      const ids = builder.getIds();
      const scenario = builder.build();
      const entryId = ids.entryIds[0];

      // Point entry to a non-existent group
      const entry = scenario.entries.get(entryId);
      const updatedEntry = entry.set("group", "nonexistent-group");
      scenario.entries = scenario.entries.set(entryId, updatedEntry);

      const props = { routeParams: { id: entryId } };

      const totalPossible = gameTotalPossibleSelector(scenario, props);
      expect(totalPossible).toEqual(0);
    });

    it("should return 0 when entry is not found", () => {
      const scenario = new ScenarioBuilder()
        .withCurrentUser({ id: "user1" })
        .build();

      const props = { routeParams: { id: "nonexistent-entry" } };

      const totalPossible = gameTotalPossibleSelector(scenario, props);
      expect(totalPossible).toEqual(0);
    });
  });

  it("should select category from props", () => {
    const category = new Category({ id: "category1" });
    const props = { category };
    expect(givenCategorySelector(undefined, props)).toEqual(category);
  });

  it("should select current category", () => {
    const categories = new Map()
      .set("category1", new Category({ id: "category1" }))
      .set("category2", new Category({ id: "category2" }));
    const state = {
      categories,
    };
    const props = { category: { id: "category1" } };

    expect(currentCategorySelector(state, props)).toEqual(
      categories.get("category1")
    );
  });
});
