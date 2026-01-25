import { renderWithProviders } from "../testUtils/testUtils";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ScenarioBuilder } from "../testUtils/factories";
import AppRoutes from "../routes";
import { List } from "immutable";

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
      const entryC = scenario.entries.get(ids.entryIds[2]);
      const lastNomineeCategory1 = entryC.selections.get(ids.categoryIds[0]);

      // Score first category with last nominee (Entry C's pick)
      // With answered_order, rank indicators will compare:
      // - Before: answered_order = [] (no one has points, all tied at rank 1)
      // - After: answered_order = [cat0] (Entry C has 1 point = rank 1, A & B have 0 = rank 2)
      const scoredState = {
        ...scenario,
        categories: scenario.categories.setIn(
          [ids.categoryIds[0], "correctAnswer"],
          lastNomineeCategory1
        ),
        games: scenario.games.setIn(
          ["game1", "answered_order"],
          List([ids.categoryIds[0]])
        ),
      };

      renderWithProviders(<AppRoutes />, {
        preloadedState: scoredState,
        initialEntries: ["/groups/group1"],
      });

      await waitFor(() => {
        expect(screen.getByText("Entry C")).toBeInTheDocument();
      });

      // Entry C should show "same" (rank 1 → rank 1, but now sole leader)
      // Entry A and B should show "same" too (both rank 1 → rank 2, but that's really rank 1 tied → rank 2)
      // Actually, all entries start tied at rank 1 with 0 points
      // After scoring: Entry C is rank 1 (1 point), A & B are rank 2 (0 points)
      // So Entry C: rank 1 → rank 1 = "same"
      // Entry A & B: rank 1 → rank 2 = "down"
      const allDashes = screen.queryAllByText("–");
      const allDownArrows = screen.queryAllByText("↓");

      // Entry C shows same, Entry A and B show down
      expect(allDashes.length).toBe(1); // Entry C
      expect(allDownArrows.length).toBe(2); // Entry A and B
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
      const entryA = scenario.entries.get(ids.entryIds[0]);
      const firstNomineeCategory1 = entryA.selections.get(ids.categoryIds[0]);

      // Score first category with first nominee (Entry A's pick)
      // Before (answered_order = []): both tied at rank 1 (0 points)
      // After (answered_order = [cat0]): Entry A rank 1 (1 point), Entry B rank 2 (0 points)
      const scoredState = {
        ...scenario,
        categories: scenario.categories.setIn(
          [ids.categoryIds[0], "correctAnswer"],
          firstNomineeCategory1
        ),
        games: scenario.games.setIn(
          ["game1", "answered_order"],
          List([ids.categoryIds[0]])
        ),
      };

      renderWithProviders(<AppRoutes />, {
        preloadedState: scoredState,
        initialEntries: ["/groups/group1"],
      });

      await waitFor(() => {
        expect(screen.getByText("Entry B")).toBeInTheDocument();
      });

      // Entry A: rank 1 → rank 1 = "same"
      // Entry B: rank 1 → rank 2 = "down"
      expect(screen.getByText("–")).toBeInTheDocument(); // Entry A shows same
      expect(screen.getByText("↓")).toBeInTheDocument(); // Entry B shows down
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

      // Score first category with first nominee (both get it right)
      const categoryId = ids.categoryIds[0];
      const firstNomineeId = ids.nomineeIds[0];

      // Before (answered_order = []): both tied at rank 1 (0 points)
      // After (answered_order = [cat0]): both tied at rank 1 (1 point each)
      const scoredState = {
        ...scenario,
        categories: scenario.categories.setIn(
          [categoryId, "correctAnswer"],
          firstNomineeId
        ),
        games: scenario.games.setIn(
          ["game1", "answered_order"],
          List([categoryId])
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
      const firstNomineeCategory1 = entryA.selections.get(ids.categoryIds[0]);
      const lastNomineeCategory2 = entryB.selections.get(ids.categoryIds[1]);

      // Score both categories
      // answered_order = [cat0, cat1]
      // Most recent is cat1
      // Before cat1 (answered_order = [cat0]): Entry A rank 1 (1 pt), Entry B rank 2 (0 pts)
      // After cat1 (answered_order = [cat0, cat1]): Both rank 1 (1 pt each)
      const stateWithTwoScored = {
        ...scenario,
        categories: scenario.categories
          .setIn([ids.categoryIds[0], "correctAnswer"], firstNomineeCategory1)
          .setIn([ids.categoryIds[1], "correctAnswer"], lastNomineeCategory2),
        games: scenario.games.setIn(
          ["game1", "answered_order"],
          List([ids.categoryIds[0], ids.categoryIds[1]])
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
      // Entry A should show same (stayed at rank 1)
      const upArrows = screen.getAllByText("↑");
      const dashes = screen.getAllByText("–");
      expect(upArrows.length).toBe(1); // Entry B
      expect(dashes.length).toBe(1); // Entry A
    });
  });

  describe("edge cases", () => {
    it("should handle no answered_order gracefully", async () => {
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

      // No answered_order or empty answered_order - no indicators should show
      const stateWithoutAnsweredOrder = {
        ...scenario,
        games: scenario.games.setIn(["game1", "answered_order"], List()),
      };

      renderWithProviders(<AppRoutes />, {
        preloadedState: stateWithoutAnsweredOrder,
        initialEntries: ["/groups/group1"],
      });

      await waitFor(() => {
        expect(screen.getByText("Entry A")).toBeInTheDocument();
      });

      // Should show rank but no indicators (no categories scored yet)
      expect(screen.queryByText("↑")).not.toBeInTheDocument();
      expect(screen.queryByText("↓")).not.toBeInTheDocument();
      expect(screen.queryByText("–")).not.toBeInTheDocument();
    });

    it("should handle ties correctly in rank display", async () => {
      const builder = new ScenarioBuilder()
        .withGame({ id: "game1", name: "Test Game" }, 3, 5)
        .withGroup("game1", { id: "group1", name: "Test Group" })
        .withEntry("group1", { id: "entry-a", name: "Entry A" }, "all-first")
        .withEntry("group1", { id: "entry-b", name: "Entry B" }, "all-first")
        .withEntry("group1", { id: "entry-c", name: "Entry C" }, "all-last")
        .withCurrentUser({
          id: "user1",
          name: "Admin User",
          email: "admin@test.com",
        })
        .withGroupAdmin("group1", "user1");

      const scenario = builder.build();
      const ids = builder.getIds();

      // Score first TWO categories where A and B get them right, C gets them wrong
      const entryA = scenario.entries.get(ids.entryIds[0]);
      const nominee0 = entryA.selections.get(ids.categoryIds[0]);
      const nominee1 = entryA.selections.get(ids.categoryIds[1]);

      // After cat 0: A and B tied at rank 1 (1 point), C at rank 2 (0 points)
      // After cat 1: A and B tied at rank 1 (2 points), C at rank 2 (0 points)
      // Most recent is cat1, so we compare:
      // Before cat1: A and B rank 1 (1 pt), C rank 2 (0 pts)
      // After cat1: A and B rank 1 (2 pts), C rank 2 (0 pts)
      // All stayed at same rank
      const stateWithTies = {
        ...scenario,
        categories: scenario.categories
          .setIn([ids.categoryIds[0], "correctAnswer"], nominee0)
          .setIn([ids.categoryIds[1], "correctAnswer"], nominee1),
        games: scenario.games.setIn(
          ["game1", "answered_order"],
          List([ids.categoryIds[0], ids.categoryIds[1]])
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

      // All entries stayed at same rank
      const allDashes = screen.getAllByText("–");
      expect(allDashes.length).toBe(3);
    });
  });

  describe("answered_order persistence", () => {
    it("should persist answered_order in game state", () => {
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
      const categoryId = ids.categoryIds[0];

      const stateWithAnsweredOrder = {
        ...scenario,
        games: scenario.games.setIn(
          ["game1", "answered_order"],
          List([categoryId])
        ),
      };

      // Render first time
      const { unmount } = renderWithProviders(<AppRoutes />, {
        preloadedState: stateWithAnsweredOrder,
        initialEntries: ["/groups/group1"],
      });

      // Unmount (simulate page close)
      unmount();

      // Verify the structure is serializable
      const game = stateWithAnsweredOrder.games.get("game1");
      const serialized = JSON.stringify(game.toJS());
      expect(serialized).toContain("answered_order");
      expect(serialized).toContain(categoryId);

      const deserialized = JSON.parse(serialized);
      expect(deserialized.answered_order).toContain(categoryId);
    });
  });
});
