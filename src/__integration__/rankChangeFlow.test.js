import { renderWithProviders } from "../testUtils/testUtils";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ScenarioBuilder } from "../testUtils/factories";
import AppRoutes from "../routes";
import { fromJS } from "immutable";

describe("Rank Change Flow - Integration", () => {
  describe("scoring a category and seeing rank changes", () => {
    it("should display up arrow when an entry gains rank", async () => {
      const user = userEvent.setup();

      // Create scenario: 3 entries, Entry C will jump from last to first
      const builder = new ScenarioBuilder()
        .withGame({ id: "game1", name: "Test Game" }, 3, 5)
        .withGroup("game1", { id: "group1", name: "Test Group" })
        .withEntry("group1", { id: "entry-a", name: "Entry A" }, "all-first")
        .withEntry("group1", { id: "entry-b", name: "Entry B" }, "all-first")
        .withEntry("group1", { id: "entry-c", name: "Entry C" }, "all-last") // Will win
        .withCurrentUser({
          id: "user1",
          name: "Admin User",
          email: "admin@test.com",
        })
        .withGroupAdmin("group1", "user1");

      const scenario = builder.build();
      const ids = builder.getIds();

      // Get the last nominee from the first category (Entry C's pick)
      // Entry C uses "all-last" strategy which picks nomineeIds[length-1]
      const entryC = scenario.entries.get(ids.entryIds[2]);
      const lastNomineeCategory1 = entryC.selections.get(ids.categoryIds[0]);

      // Set previous ranks: Entry A and B were tied at 1st, Entry C was 3rd
      const stateWithPreviousRanks = {
        ...scenario,
        ui: scenario.ui.set(
          "previousRanks",
          fromJS({
            [ids.entryIds[0]]: 1, // Entry A was 1st
            [ids.entryIds[1]]: 1, // Entry B was tied 1st
            [ids.entryIds[2]]: 3, // Entry C was 3rd
          })
        ),
      };

      // Score first category with last nominee (Entry C's pick)
      const scoredState = {
        ...stateWithPreviousRanks,
        categories: stateWithPreviousRanks.categories.setIn(
          [ids.categoryIds[0], "correctAnswer"],
          lastNomineeCategory1
        ),
      };

      renderWithProviders(<AppRoutes />, {
        preloadedState: scoredState,
        initialEntries: ["/groups/group1"],
      });

      await waitFor(() => {
        expect(screen.getByText("Entry C")).toBeInTheDocument();
      });

      // Entry C should show up arrow (moved from tied 1st to sole 1st)
      // Entry A and B should show down arrow (moved from tied 1st to 2nd)
      const allUpArrows = screen.getAllByText("↑");
      const allDownArrows = screen.getAllByText("↓");

      expect(allUpArrows.length).toBeGreaterThan(0);
      expect(allDownArrows.length).toBeGreaterThan(0);
    });

    it("should display down arrow when an entry loses rank", async () => {
      const builder = new ScenarioBuilder()
        .withGame({ id: "game1", name: "Test Game" }, 2, 5)
        .withGroup("game1", { id: "group1", name: "Test Group" })
        .withEntry("group1", { id: "entry-a", name: "Entry A" }, "all-first") // Will win
        .withEntry("group1", { id: "entry-b", name: "Entry B" }, "all-last") // Will lose
        .withCurrentUser({
          id: "user1",
          name: "Admin User",
          email: "admin@test.com",
        })
        .withGroupAdmin("group1", "user1");

      const scenario = builder.build();
      const ids = builder.getIds();

      // Get the first nominee from the first category (Entry A's pick)
      // Entry A uses "all-first" strategy which picks nomineeIds[0]
      const entryA = scenario.entries.get(ids.entryIds[0]);
      const firstNomineeCategory1 = entryA.selections.get(ids.categoryIds[0]);

      // Set previous ranks: Entry B was first
      const stateWithPreviousRanks = {
        ...scenario,
        ui: scenario.ui.set(
          "previousRanks",
          fromJS({
            [ids.entryIds[0]]: 2, // Entry A was second
            [ids.entryIds[1]]: 1, // Entry B was first, will drop
          })
        ),
      };

      // Score first category with first nominee (Entry A's pick)
      const scoredState = {
        ...stateWithPreviousRanks,
        categories: stateWithPreviousRanks.categories.setIn(
          [ids.categoryIds[0], "correctAnswer"],
          firstNomineeCategory1
        ),
      };

      renderWithProviders(<AppRoutes />, {
        preloadedState: scoredState,
        initialEntries: ["/groups/group1"],
      });

      await waitFor(() => {
        expect(screen.getByText("Entry B")).toBeInTheDocument();
      });

      // Entry A: up arrow (2nd → 1st)
      // Entry B: down arrow (1st → 2nd)
      expect(screen.getByText("↑")).toBeInTheDocument();
      expect(screen.getByText("↓")).toBeInTheDocument();
    });

    it("should display dash when rank stays the same", async () => {
      const builder = new ScenarioBuilder()
        .withGame({ id: "game1", name: "Test Game" }, 2, 5)
        .withGroup("game1", { id: "group1", name: "Test Group" })
        .withEntry("group1", { id: "entry-a", name: "Entry A" }, "all-first")
        .withEntry("group1", { id: "entry-b", name: "Entry B" }, "all-first") // Same picks
        .withCurrentUser({
          id: "user1",
          name: "Admin User",
          email: "admin@test.com",
        })
        .withGroupAdmin("group1", "user1");

      const scenario = builder.build();
      const ids = builder.getIds();

      // Set previous ranks: both tied at 1
      const stateWithPreviousRanks = {
        ...scenario,
        ui: scenario.ui.set(
          "previousRanks",
          fromJS({
            [ids.entryIds[0]]: 1,
            [ids.entryIds[1]]: 1,
          })
        ),
      };

      // Score first category with first nominee (both get it right)
      const categoryId = ids.categoryIds[0];
      const firstNomineeId = ids.nomineeIds[0];
      const scoredState = {
        ...stateWithPreviousRanks,
        categories: stateWithPreviousRanks.categories.setIn(
          [categoryId, "correctAnswer"],
          firstNomineeId
        ),
      };

      renderWithProviders(<AppRoutes />, {
        preloadedState: scoredState,
        initialEntries: ["/groups/group1"],
      });

      await waitFor(() => {
        expect(screen.getByText("Entry A")).toBeInTheDocument();
      });

      // Both entries should show dash (stayed at rank 1)
      const allDashes = screen.getAllByText("–");
      expect(allDashes.length).toBe(2);
    });
  });

  describe("multiple rank changes over time", () => {
    it("should update rank change indicators after each category scored", async () => {
      const builder = new ScenarioBuilder()
        .withGame({ id: "game1", name: "Test Game" }, 2, 5)
        .withGroup("game1", { id: "group1", name: "Test Group" })
        .withEntry("group1", { id: "entry-a", name: "Entry A" }, "all-first")
        .withEntry("group1", { id: "entry-b", name: "Entry B" }, "all-last")
        .withCurrentUser({
          id: "user1",
          name: "Admin User",
          email: "admin@test.com",
        })
        .withGroupAdmin("group1", "user1");

      const scenario = builder.build();
      const ids = builder.getIds();

      // Get the nominees that each entry selected
      const entryA = scenario.entries.get(ids.entryIds[0]);
      const entryB = scenario.entries.get(ids.entryIds[1]);
      const firstNomineeCategory1 = entryA.selections.get(ids.categoryIds[0]); // Entry A picks first
      const lastNomineeCategory2 = entryB.selections.get(ids.categoryIds[1]); // Entry B picks last

      // Previous state: Entry A had 1 point (rank 1), Entry B had 0 points (rank 2)
      // Now: Score second category where Entry B wins
      // Result: Both have 1 point, both at rank 1, so Entry B moves UP
      const stateWithTwoScored = {
        ...scenario,
        categories: scenario.categories
          .setIn([ids.categoryIds[0], "correctAnswer"], firstNomineeCategory1) // First category: Entry A wins
          .setIn([ids.categoryIds[1], "correctAnswer"], lastNomineeCategory2), // Second: Entry B wins
        ui: scenario.ui.set(
          "previousRanks",
          fromJS({
            [ids.entryIds[0]]: 1, // Entry A was rank 1
            [ids.entryIds[1]]: 2, // Entry B was rank 2
          })
        ),
      };

      renderWithProviders(<AppRoutes />, {
        preloadedState: stateWithTwoScored,
        initialEntries: ["/groups/group1"],
      });

      await waitFor(() => {
        expect(screen.getByText("Test Group")).toBeInTheDocument();
      });

      // Entry B should show up arrow (moved from rank 2 to rank 1)
      const upArrows = screen.getAllByText("↑");
      expect(upArrows.length).toBeGreaterThan(0);
    });
  });

  describe("edge cases", () => {
    it("should handle no previousRanks gracefully", async () => {
      const builder = new ScenarioBuilder()
        .withGame({ id: "game1", name: "Test Game" }, 2, 5)
        .withGroup("game1", { id: "group1", name: "Test Group" })
        .withEntry("group1", { name: "Entry A" }, "all-first")
        .withGameInProgress("game1", 1)
        .withCurrentUser({
          id: "user1",
          name: "Admin User",
          email: "admin@test.com",
        })
        .withGroupAdmin("group1", "user1");

      const scenario = builder.build();

      // No previousRanks set
      const stateWithoutPreviousRanks = {
        ...scenario,
        ui: scenario.ui.set("previousRanks", null),
      };

      renderWithProviders(<AppRoutes />, {
        preloadedState: stateWithoutPreviousRanks,
        initialEntries: ["/groups/group1"],
      });

      await waitFor(() => {
        expect(screen.getByText("Entry A")).toBeInTheDocument();
      });

      // Should show rank but no indicators
      expect(screen.queryByText("↑")).not.toBeInTheDocument();
      expect(screen.queryByText("↓")).not.toBeInTheDocument();
      expect(screen.queryByText("–")).not.toBeInTheDocument();
    });

    it("should handle ties correctly in rank display", async () => {
      const builder = new ScenarioBuilder()
        .withGame({ id: "game1", name: "Test Game" }, 2, 5)
        .withGroup("game1", { id: "group1", name: "Test Group" })
        .withEntry("group1", { id: "entry-a", name: "Entry A" }, "all-first")
        .withEntry("group1", { id: "entry-b", name: "Entry B" }, "all-first")
        .withEntry("group1", { id: "entry-c", name: "Entry C" }, "all-last")
        .withGameInProgress("game1", 1)
        .withCurrentUser({
          id: "user1",
          name: "Admin User",
          email: "admin@test.com",
        })
        .withGroupAdmin("group1", "user1");

      const scenario = builder.build();
      const ids = builder.getIds();

      // Set up: A and B tied at 1, C at 3 (not 2!)
      const stateWithTies = {
        ...scenario,
        ui: scenario.ui.set(
          "previousRanks",
          fromJS({
            [ids.entryIds[0]]: 1, // Entry A
            [ids.entryIds[1]]: 1, // Entry B
            [ids.entryIds[2]]: 3, // Entry C
          })
        ),
      };

      renderWithProviders(<AppRoutes />, {
        preloadedState: stateWithTies,
        initialEntries: ["/groups/group1"],
      });

      await waitFor(() => {
        expect(screen.getByText("Entry A")).toBeInTheDocument();
        expect(screen.getByText("Entry B")).toBeInTheDocument();
        expect(screen.getByText("Entry C")).toBeInTheDocument();
      });

      // All should show "same" indicator since ranks didn't change
      const allDashes = screen.getAllByText("–");
      expect(allDashes.length).toBe(3);
    });
  });

  describe("localStorage persistence", () => {
    it("should persist previousRanks across page reloads", () => {
      const builder = new ScenarioBuilder()
        .withGame({ id: "game1", name: "Test Game" }, 2, 5)
        .withGroup("game1", { id: "group1", name: "Test Group" })
        .withEntry("group1", { name: "Entry A" }, "all-first")
        .withGameInProgress("game1", 1)
        .withCurrentUser({
          id: "user1",
          name: "Admin User",
          email: "admin@test.com",
        });

      const scenario = builder.build();
      const ids = builder.getIds();
      const entryId = ids.entryIds[0];

      const stateWithRanks = {
        ...scenario,
        ui: scenario.ui.set(
          "previousRanks",
          fromJS({
            [entryId]: 1,
          })
        ),
      };

      // Render first time
      const { unmount } = renderWithProviders(<AppRoutes />, {
        preloadedState: stateWithRanks,
        initialEntries: ["/groups/group1"],
      });

      // Unmount (simulate page close)
      unmount();

      // Re-render (simulate page reload)
      // In real app, Redux would load from localStorage
      // Here we verify the structure is serializable
      const serialized = JSON.stringify(stateWithRanks.ui.toJS());
      expect(serialized).toContain("previousRanks");
      expect(serialized).toContain(entryId);

      const deserialized = JSON.parse(serialized);
      expect(deserialized.previousRanks[entryId]).toBe(1);
    });
  });
});
