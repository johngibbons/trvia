import { entryRankChangeSelector } from "./entries-selector";
import { ScenarioBuilder } from "../testUtils/factories";
import { fromJS } from "immutable";

describe("entryRankChangeSelector", () => {
  let scenario;
  let ids;

  beforeEach(() => {
    const builder = new ScenarioBuilder()
      .withGame({ id: "game1", name: "Test Game" }, 3, 5)
      .withGroup("game1", { id: "group1", name: "Test Group" })
      .withEntry("group1", { name: "Entry A" }, "all-first")
      .withEntry("group1", { name: "Entry B" }, "all-last")
      .withEntry("group1", { name: "Entry C" }, "random");

    scenario = builder.build();
    ids = builder.getIds();
  });

  describe("when previousRanks is null or undefined", () => {
    it("should return null when previousRanks is null", () => {
      const state = {
        ...scenario,
        ui: scenario.ui.set("previousRanks", null),
      };

      const result = entryRankChangeSelector(state, ids.entryIds[0]);

      expect(result).toBeNull();
    });

    it("should return null when previousRanks is undefined", () => {
      const state = {
        ...scenario,
        ui: scenario.ui.delete("previousRanks"),
      };

      const result = entryRankChangeSelector(state, ids.entryIds[0]);

      expect(result).toBeNull();
    });

    it("should return null when ui.previousRanks doesn't exist", () => {
      const state = {
        ...scenario,
        ui: scenario.ui.set("previousRanks", undefined),
      };

      const result = entryRankChangeSelector(state, ids.entryIds[0]);

      expect(result).toBeNull();
    });
  });

  describe("when entry is not in previousRanks", () => {
    it("should return null when entry ID is missing from previousRanks", () => {
      const state = {
        ...scenario,
        ui: scenario.ui.set(
          "previousRanks",
          fromJS({
            [ids.entryIds[0]]: 1,
            // entryIds[1] is missing
            [ids.entryIds[2]]: 3,
          })
        ),
      };

      const result = entryRankChangeSelector(state, ids.entryIds[1]);

      expect(result).toBeNull();
    });

    it("should return null when previousRanks is empty", () => {
      const state = {
        ...scenario,
        ui: scenario.ui.set("previousRanks", fromJS({})),
      };

      const result = entryRankChangeSelector(state, ids.entryIds[0]);

      expect(result).toBeNull();
    });
  });

  describe("when entry moved up in rank", () => {
    it("should return 'up' when rank improved (lower number)", () => {
      // Score the first category so Entry A gets a point
      const categoryId = ids.categoryIds[0];
      const nomineeId = ids.nomineeIds[0]; // First nominee

      const state = {
        ...scenario,
        categories: scenario.categories.setIn([categoryId, "correctAnswer"], nomineeId),
        ui: scenario.ui.set(
          "previousRanks",
          fromJS({
            [ids.entryIds[0]]: 2, // Was rank 2
            [ids.entryIds[1]]: 3,
            [ids.entryIds[2]]: 1,
          })
        ),
      };

      // Entry A picked first nominee, so now has 1 point and should be rank 1
      const result = entryRankChangeSelector(state, ids.entryIds[0]);

      expect(result).toBe("up");
    });

    it("should return 'up' when moving from last place to middle", () => {
      const categoryId = ids.categoryIds[0];
      const lastNomineeId = ids.nomineeIds[ids.nomineeIds.length - 1];

      const state = {
        ...scenario,
        categories: scenario.categories.setIn([categoryId, "correctAnswer"], lastNomineeId),
        ui: scenario.ui.set(
          "previousRanks",
          fromJS({
            [ids.entryIds[0]]: 1,
            [ids.entryIds[1]]: 3, // Was last
            [ids.entryIds[2]]: 2,
          })
        ),
      };

      // Entry B picked last nominee, so now has 1 point and moves up
      const result = entryRankChangeSelector(state, ids.entryIds[1]);

      expect(result).toBe("up");
    });
  });

  describe("when entry moved down in rank", () => {
    it("should return 'down' when rank worsened (higher number)", () => {
      // Create a controlled scenario with only 2 entries
      const builderForDown = new ScenarioBuilder()
        .withGame({ id: "game1", name: "Test Game" }, 1, 5)
        .withGroup("game1", { id: "group1", name: "Test Group" })
        .withEntry("group1", { name: "Winner" }, "all-first")
        .withEntry("group1", { name: "Loser" }, "all-last");

      const downScenario = builderForDown.build();
      const downIds = builderForDown.getIds();

      const categoryId = downIds.categoryIds[0];
      const nomineeId = downIds.nomineeIds[0]; // First nominee

      const state = {
        ...downScenario,
        categories: downScenario.categories.setIn([categoryId, "correctAnswer"], nomineeId),
        ui: downScenario.ui.set(
          "previousRanks",
          fromJS({
            [downIds.entryIds[0]]: 1, // Was tied for 1st
            [downIds.entryIds[1]]: 1, // Was tied for 1st
          })
        ),
      };

      // Winner got the point, Loser didn't, so Loser drops to rank 2
      const result = entryRankChangeSelector(state, downIds.entryIds[1]);

      expect(result).toBe("down");
    });

    it("should return 'down' when moving from first to last", () => {
      // Create controlled scenario
      const builderForDown = new ScenarioBuilder()
        .withGame({ id: "game1", name: "Test Game" }, 1, 5)
        .withGroup("game1", { id: "group1", name: "Test Group" })
        .withEntry("group1", { name: "Winner" }, "all-first")
        .withEntry("group1", { name: "Loser" }, "all-last");

      const downScenario = builderForDown.build();
      const downIds = builderForDown.getIds();

      const categoryId = downIds.categoryIds[0];
      const nomineeId = downIds.nomineeIds[0];

      const state = {
        ...downScenario,
        categories: downScenario.categories.setIn([categoryId, "correctAnswer"], nomineeId),
        ui: downScenario.ui.set(
          "previousRanks",
          fromJS({
            [downIds.entryIds[0]]: 2, // Was 2nd
            [downIds.entryIds[1]]: 1, // Was 1st, will drop to 2nd
          })
        ),
      };

      // Loser was first but didn't get this point, Winner did, so Loser drops
      const result = entryRankChangeSelector(state, downIds.entryIds[1]);

      expect(result).toBe("down");
    });
  });

  describe("when entry stayed at same rank", () => {
    it("should return 'same' when rank unchanged", () => {
      const categoryId = ids.categoryIds[0];
      const nomineeId = ids.nomineeIds[0];

      const state = {
        ...scenario,
        categories: scenario.categories.setIn([categoryId, "correctAnswer"], nomineeId),
        ui: scenario.ui.set(
          "previousRanks",
          fromJS({
            [ids.entryIds[0]]: 1, // Stays at 1
            [ids.entryIds[1]]: 2,
            [ids.entryIds[2]]: 3,
          })
        ),
      };

      // Entry A got the point and stays at rank 1
      const result = entryRankChangeSelector(state, ids.entryIds[0]);

      expect(result).toBe("same");
    });

    it("should return 'same' when tied entries remain tied", () => {
      // Create a controlled scenario where both entries pick the same
      const builderWithSamePicks = new ScenarioBuilder()
        .withGame({ id: "game1", name: "Test Game" }, 1, 5)
        .withGroup("game1", { id: "group1", name: "Test Group" })
        .withEntry("group1", { name: "Entry A" }, "all-first")
        .withEntry("group1", { name: "Entry B" }, "all-first"); // Same as A

      const tiedScenario = builderWithSamePicks.build();
      const tiedIds = builderWithSamePicks.getIds();

      const categoryId = tiedIds.categoryIds[0];
      const nomineeId = tiedIds.nomineeIds[0];

      const stateWithSamePicks = {
        ...tiedScenario,
        categories: tiedScenario.categories.setIn([categoryId, "correctAnswer"], nomineeId),
        ui: tiedScenario.ui.set(
          "previousRanks",
          fromJS({
            [tiedIds.entryIds[0]]: 1,
            [tiedIds.entryIds[1]]: 1,
          })
        ),
      };

      // Both A and B picked first nominee, both get the point, both stay at rank 1
      const resultA = entryRankChangeSelector(stateWithSamePicks, tiedIds.entryIds[0]);
      const resultB = entryRankChangeSelector(stateWithSamePicks, tiedIds.entryIds[1]);

      expect(resultA).toBe("same");
      expect(resultB).toBe("same");
    });
  });

  describe("edge cases", () => {
    it("should handle entry not found in state", () => {
      const state = {
        ...scenario,
        ui: scenario.ui.set(
          "previousRanks",
          fromJS({
            "non-existent-entry": 1,
          })
        ),
      };

      const result = entryRankChangeSelector(state, "non-existent-entry");

      expect(result).toBeNull();
    });

    it("should handle group not found", () => {
      const state = {
        ...scenario,
        groups: scenario.groups.clear(), // Remove all groups
        ui: scenario.ui.set(
          "previousRanks",
          fromJS({
            [ids.entryIds[0]]: 1,
          })
        ),
      };

      const result = entryRankChangeSelector(state, ids.entryIds[0]);

      expect(result).toBeNull();
    });

    it("should correctly handle rank changes with multiple categories scored", () => {
      // Create a controlled scenario
      const builderMulti = new ScenarioBuilder()
        .withGame({ id: "game1", name: "Test Game" }, 2, 5)
        .withGroup("game1", { id: "group1", name: "Test Group" })
        .withEntry("group1", { name: "Entry A" }, "all-first")
        .withEntry("group1", { name: "Entry B" }, "all-last");

      const multiScenario = builderMulti.build();
      const multiIds = builderMulti.getIds();

      // Score two categories with first nominee (Entry A gets both)
      const category1Id = multiIds.categoryIds[0];
      const category2Id = multiIds.categoryIds[1];
      const nominee1Id = multiIds.nomineeIds[0];
      const nominee2Id = multiIds.nomineeIds[5]; // Nominee from second category (also first)

      const state = {
        ...multiScenario,
        categories: multiScenario.categories
          .setIn([category1Id, "correctAnswer"], nominee1Id)
          .setIn([category2Id, "correctAnswer"], nominee2Id),
        ui: multiScenario.ui.set(
          "previousRanks",
          fromJS({
            [multiIds.entryIds[0]]: 1, // Was rank 1 with 1 point
            [multiIds.entryIds[1]]: 2, // Was rank 2 with 0 points
          })
        ),
      };

      // Entry A picked first nominee for both categories → now has 2 points, stays rank 1
      const resultA = entryRankChangeSelector(state, multiIds.entryIds[0]);
      expect(resultA).toBe("same");
    });
  });

  describe("performance and memoization", () => {
    it("should not recalculate ranks unnecessarily", () => {
      // This test verifies the selector doesn't cause performance issues
      // by recalculating ranks on every call

      const state = {
        ...scenario,
        ui: scenario.ui.set(
          "previousRanks",
          fromJS({
            [ids.entryIds[0]]: 1,
            [ids.entryIds[1]]: 2,
            [ids.entryIds[2]]: 3,
          })
        ),
      };

      // Call multiple times - should be fast
      const start = Date.now();
      for (let i = 0; i < 100; i++) {
        entryRankChangeSelector(state, ids.entryIds[0]);
      }
      const duration = Date.now() - start;

      // Should complete quickly (under 100ms for 100 iterations)
      expect(duration).toBeLessThan(100);
    });
  });
});
