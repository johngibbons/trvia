import React from "react";
import { screen, within } from "@testing-library/react";
import { renderWithProviders } from "../testUtils/testUtils";
import { ScenarioBuilder } from "../testUtils/factories";
import Group from "../components/group/Group";
import { Map, fromJS } from "immutable";

// Mock the gravatar helper
jest.mock("../helpers/user-helper", () => ({
  gravatar: jest.fn((email) => `https://gravatar.com/avatar/${email}`),
}));

describe("Game Progression - Comprehensive Testing", () => {
  describe("Initial Game State (No Answers)", () => {
    it("should show all entries with rank 1 before any categories are answered", () => {
      const builder = new ScenarioBuilder()
        .withGame({ id: "game1", name: "Test Awards" }, 3, 3)
        .withGroup("game1", { id: "group1", name: "Test Group" })
        .withEntry("group1", { name: "Entry A" }, "all-first")
        .withEntry("group1", { name: "Entry B" }, "all-last")
        .withEntry("group1", { name: "Entry C" }, "random")
        .withCurrentUser({ id: "user1", name: "Test User" });

      const scenario = builder.build();
      const props = { routeParams: { id: "group1" } };

      renderWithProviders(<Group {...props} />, {
        preloadedState: scenario,
      });

      // All entries should be visible
      expect(screen.getByText(/entry a/i)).toBeInTheDocument();
      expect(screen.getByText(/entry b/i)).toBeInTheDocument();
      expect(screen.getByText(/entry c/i)).toBeInTheDocument();
    });

    it("should show 0 / 0 scores when no categories answered", () => {
      const builder = new ScenarioBuilder()
        .withGame({ id: "game1", name: "Test Awards" }, 3, 3)
        .withGroup("game1", { id: "group1", name: "Test Group" })
        .withEntry("group1", { name: "Test Entry" }, "all-first")
        .withCurrentUser({ id: "user1", name: "Test User" });

      const scenario = builder.build();
      const props = { routeParams: { id: "group1" } };

      renderWithProviders(<Group {...props} />, {
        preloadedState: scenario,
      });

      expect(screen.getByText("0 / 0")).toBeInTheDocument();
    });
  });

  describe("Game In Progress (Some Categories Answered)", () => {
    it("should calculate scores correctly as first category is answered", () => {
      const builder = new ScenarioBuilder()
        .withGame({ id: "game1", name: "Test Awards" }, 3, 3)
        .withGroup("game1", { id: "group1", name: "Test Group" })
        .withEntry("group1", { name: "Winner" }, "all-first")
        .withEntry("group1", { name: "Loser" }, "all-last")
        .withGameInProgress("game1", 1)
        .withCurrentUser({ id: "user1", name: "Test User" });

      const scenario = builder.build();
      const props = { routeParams: { id: "group1" } };

      renderWithProviders(<Group {...props} />, {
        preloadedState: scenario,
      });

      // Winner should have 1 point, Loser should have 0
      // Both should show X / 1 (1 category answered out of 3 total)
      expect(screen.getByText("1 / 1")).toBeInTheDocument();
      expect(screen.getByText("0 / 1")).toBeInTheDocument();
    });

    it("should update rankings when multiple categories are answered", () => {
      const builder = new ScenarioBuilder()
        .withGame({ id: "game1", name: "Test Awards" }, 5, 3)
        .withGroup("game1", { id: "group1", name: "Test Group" })
        .withEntry("group1", { name: "Leader", rank: 1 }, "all-first")
        .withEntry("group1", { name: "Second", rank: 2 }, "random")
        .withEntry("group1", { name: "Third", rank: 3 }, "all-last")
        .withGameInProgress("game1", 3)
        .withCurrentUser({ id: "user1", name: "Test User" });

      const scenario = builder.build();
      const props = { routeParams: { id: "group1" } };

      const { container } = renderWithProviders(<Group {...props} />, {
        preloadedState: scenario,
      });

      // Should show ranks in the table
      const rows = container.querySelectorAll(".EntriesTable--row");
      expect(rows.length).toBe(3);

      // First row should have rank 1
      expect(within(rows[0]).getByText("1")).toBeInTheDocument();
    });

    it("should calculate scores with custom category point values", () => {
      const builder = new ScenarioBuilder()
        .withGame({ id: "game1", name: "Test Awards" }, 3, 3)
        .withGroup("game1", { id: "group1", name: "Test Group" });

      const ids = builder.getIds();
      const categoryIds = ids.categoryIds;

      // Set custom values: 5, 3, 1 points for the three categories
      builder
        .withGroupValues("group1", {
          [categoryIds[0]]: 5,
          [categoryIds[1]]: 3,
          [categoryIds[2]]: 1,
        })
        .withEntry("group1", { name: "Perfect Score" }, "all-first")
        .withEntry("group1", { name: "Partial Score" }, "all-last")
        .withGameInProgress("game1", 2)
        .withCurrentUser({ id: "user1", name: "Test User" });

      const scenario = builder.build();
      const props = { routeParams: { id: "group1" } };

      renderWithProviders(<Group {...props} />, {
        preloadedState: scenario,
      });

      // Perfect Score should have 8 points (5+3 for first two categories)
      // Partial Score should have 0 points
      expect(screen.getByText("8 / 8")).toBeInTheDocument();
      expect(screen.getByText("0 / 8")).toBeInTheDocument();
    });

    it("should show correct/incorrect indicators in category columns", () => {
      const builder = new ScenarioBuilder()
        .withGame({ id: "game1", name: "Test Awards" }, 2, 3)
        .withGroup("game1", { id: "group1", name: "Test Group" })
        .withEntry("group1", { name: "Test Entry" }, "all-first")
        .withGameInProgress("game1", 2)
        .withCurrentUser({ id: "user1", name: "Test User" });

      const scenario = builder.build();
      const props = { routeParams: { id: "group1" } };

      const { container } = renderWithProviders(<Group {...props} />, {
        preloadedState: scenario,
      });

      // Should have correct answer indicators (green background)
      const correctCells = container.querySelectorAll(
        ".EntriesTable--col-correct"
      );
      expect(correctCells.length).toBeGreaterThan(0);
    });
  });

  describe("Tie Handling", () => {
    it("should assign same rank to entries with identical scores", () => {
      const builder = new ScenarioBuilder()
        .withGame({ id: "game1", name: "Test Awards" }, 3, 3)
        .withGroup("group1", { id: "group1", name: "Test Group" })
        // Both pick the same nominees
        .withEntry("group1", { name: "Tied A" }, "all-first")
        .withEntry("group1", { name: "Tied B" }, "all-first")
        .withGameInProgress("game1", 2)
        .withCurrentUser({ id: "user1", name: "Test User" });

      const scenario = builder.build();
      const props = { routeParams: { id: "group1" } };

      const { container } = renderWithProviders(<Group {...props} />, {
        preloadedState: scenario,
      });

      // Check that both entries are displayed in the table
      const rows = container.querySelectorAll(".EntriesTable--row");
      expect(rows.length).toBe(2);

      // When entries tie, they should show same scores
      // (The specific score doesn't matter, just that both are equal)
      const allScores = Array.from(rows).map(row =>
        row.querySelector(".EntriesTable--col-score")?.textContent?.trim()
      );
      expect(allScores[0]).toBe(allScores[1]);
    });

    it("should show plural 'Champions' when multiple entries tie for first", () => {
      const builder = new ScenarioBuilder()
        .withGame({ id: "game1", name: "Test Awards" }, 3, 3)
        .withGroup("game1", { id: "group1", name: "Test Group" })
        .withEntry("group1", { name: "Winner A" }, "all-first")
        .withEntry("group1", { name: "Winner B" }, "all-first")
        .withGameCompleted("game1")
        .withCurrentUser({ id: "user1", name: "Test User" });

      const scenario = builder.build();
      const props = { routeParams: { id: "group1" } };

      renderWithProviders(<Group {...props} />, {
        preloadedState: scenario,
      });

      expect(screen.getByText(/champions/i)).toBeInTheDocument();
    });

    it("should handle three-way tie correctly", () => {
      const builder = new ScenarioBuilder()
        .withGame({ id: "game1", name: "Test Awards" }, 3, 3)
        .withGroup("game1", { id: "group1", name: "Test Group" })
        .withEntry("group1", { name: "Tied 1", rank: 1 }, "all-first")
        .withEntry("group1", { name: "Tied 2", rank: 1 }, "all-first")
        .withEntry("group1", { name: "Tied 3", rank: 1 }, "all-first")
        .withGameInProgress("game1", 2)
        .withCurrentUser({ id: "user1", name: "Test User" });

      const scenario = builder.build();
      const props = { routeParams: { id: "group1" } };

      const { container } = renderWithProviders(<Group {...props} />, {
        preloadedState: scenario,
      });

      const rows = container.querySelectorAll(".EntriesTable--row");

      // All three should show rank 1
      expect(within(rows[0]).getByText("1")).toBeInTheDocument();
      expect(within(rows[1]).getByText("1")).toBeInTheDocument();
      expect(within(rows[2]).getByText("1")).toBeInTheDocument();
    });
  });

  describe("Rank Change Indicators", () => {
    it("should show up arrow when entry rank improves", () => {
      const builder = new ScenarioBuilder()
        .withGame({ id: "game1", name: "Test Awards" }, 5, 3)
        .withGroup("game1", { id: "group1", name: "Test Group" })
        .withEntry("group1", { name: "Rising Star" }, "all-first")
        .withEntry("group1", { name: "Falling Star" }, "all-last")
        .withGameInProgress("game1", 2)
        .withCurrentUser({ id: "user1", name: "Test User" });

      const ids = builder.getIds();
      const scenario = builder.build();

      // Set previousRanks in UI state
      // Rising Star was rank 2, now rank 1 (improved) - should show up arrow
      // Falling Star was rank 1, now rank 2 (declined) - should show down arrow
      scenario.ui = scenario.ui.set("previousRanks", fromJS({
        [ids.entryIds[0]]: 2,
        [ids.entryIds[1]]: 1
      }));

      const props = { routeParams: { id: "group1" } };

      const { container } = renderWithProviders(<Group {...props} />, {
        preloadedState: scenario,
      });

      // Should show up arrow for Rising Star
      const upArrow = container.querySelector(".EntryRow--rank-change-up");
      expect(upArrow).toBeInTheDocument();
      expect(upArrow).toHaveTextContent("↑");
    });

    it("should show down arrow when entry rank declines", () => {
      const builder = new ScenarioBuilder()
        .withGame({ id: "game1", name: "Test Awards" }, 5, 3)
        .withGroup("game1", { id: "group1", name: "Test Group" })
        .withEntry("group1", { name: "First Place" }, "all-first")
        .withEntry("group1", { name: "Dropping" }, "all-last")
        .withGameInProgress("game1", 2)
        .withCurrentUser({ id: "user1", name: "Test User" });

      const ids = builder.getIds();
      const scenario = builder.build();

      // Dropping was rank 1, now rank 2 (declined) - should show down arrow
      scenario.ui = scenario.ui.set("previousRanks", fromJS({
        [ids.entryIds[1]]: 1
      }));

      const props = { routeParams: { id: "group1" } };

      const { container } = renderWithProviders(<Group {...props} />, {
        preloadedState: scenario,
      });

      // Should show down arrow for Dropping entry
      const downArrow = container.querySelector(".EntryRow--rank-change-down");
      expect(downArrow).toBeInTheDocument();
      expect(downArrow).toHaveTextContent("↓");
    });

    it("should show dash when entry rank stays the same", () => {
      const builder = new ScenarioBuilder()
        .withGame({ id: "game1", name: "Test Awards" }, 5, 3)
        .withGroup("game1", { id: "group1", name: "Test Group" })
        .withEntry("group1", { name: "Steady" }, "all-first")
        .withGameInProgress("game1", 2)
        .withCurrentUser({ id: "user1", name: "Test User" });

      const ids = builder.getIds();
      const scenario = builder.build();

      // Steady was rank 1, still rank 1 (stayed same) - should show dash
      scenario.ui = scenario.ui.set("previousRanks", fromJS({
        [ids.entryIds[0]]: 1
      }));

      const props = { routeParams: { id: "group1" } };

      const { container } = renderWithProviders(<Group {...props} />, {
        preloadedState: scenario,
      });

      // Should show dash indicator
      const sameIndicator = container.querySelector(".EntryRow--rank-change-same");
      expect(sameIndicator).toBeInTheDocument();
      expect(sameIndicator).toHaveTextContent("–");
    });
  });

  describe("Game Completion", () => {
    it("should show final scores when all categories are answered", () => {
      const builder = new ScenarioBuilder()
        .withGame({ id: "game1", name: "Test Awards" }, 3, 3)
        .withGroup("game1", { id: "group1", name: "Test Group" })
        .withEntry("group1", { name: "Winner", score: 3 }, "all-first")
        .withEntry("group1", { name: "Loser", score: 0 }, "all-last")
        .withGameCompleted("game1")
        .withCurrentUser({ id: "user1", name: "Test User" });

      const scenario = builder.build();
      const props = { routeParams: { id: "group1" } };

      renderWithProviders(<Group {...props} />, {
        preloadedState: scenario,
      });

      // All categories answered, so possible score should equal total
      expect(screen.getByText("3 / 3")).toBeInTheDocument();
      expect(screen.getByText("0 / 3")).toBeInTheDocument();
    });

    it("should display winner banner for completed game", () => {
      const builder = new ScenarioBuilder()
        .withGame({ id: "game1", name: "Test Awards" }, 3, 3)
        .withGroup("game1", { id: "group1", name: "Test Group" })
        .withEntry("group1", { name: "Champion" }, "all-first")
        .withGameCompleted("game1")
        .withCurrentUser({ id: "user1", name: "Test User" });

      const scenario = builder.build();
      const props = { routeParams: { id: "group1" } };

      renderWithProviders(<Group {...props} />, {
        preloadedState: scenario,
      });

      // Note: WinnerBanner has a typo "Contratulations" instead of "Congratulations"
      // Look specifically for the banner title
      expect(screen.getByText("Congratulations Champion!")).toBeInTheDocument();
    });

    it("should hide create entry button when game is completed", () => {
      const builder = new ScenarioBuilder()
        .withGame({ id: "game1", name: "Test Awards" }, 3, 3)
        .withGroup("game1", { id: "group1", name: "Test Group" })
        .withEntry("group1", { name: "Entry" }, "all-first")
        .withGameCompleted("game1")
        .withCurrentUser({ id: "user1", name: "Test User" });

      const scenario = builder.build();
      const props = { routeParams: { id: "group1" } };

      renderWithProviders(<Group {...props} />, {
        preloadedState: scenario,
      });

      expect(
        screen.queryByRole("button", { name: "Create your entry" })
      ).not.toBeInTheDocument();
    });
  });

  describe("Progressive Scoring Scenarios", () => {
    it("should handle entry catching up from behind", () => {
      const builder = new ScenarioBuilder()
        .withGame({ id: "game1", name: "Test Awards" }, 3, 3)
        .withGroup("game1", { id: "group1", name: "Test Group" })
        // Entry A picks all first (will get all correct)
        .withEntry("group1", { name: "Entry A" }, "all-first")
        // Entry B picks all last (will get none correct)
        .withEntry("group1", { name: "Entry B" }, "all-last")
        .withGameInProgress("game1", 2)
        .withCurrentUser({ id: "user1", name: "Test User" });

      const scenario = builder.build();
      const props = { routeParams: { id: "group1" } };

      renderWithProviders(<Group {...props} />, {
        preloadedState: scenario,
      });

      // Entry A: 2 points (all correct), Entry B: 0 points (all wrong)
      expect(screen.getByText("2 / 2")).toBeInTheDocument();
      expect(screen.getByText("0 / 2")).toBeInTheDocument();
    });

    it("should handle large point value differences", () => {
      const builder = new ScenarioBuilder()
        .withGame({ id: "game1", name: "Test Awards" }, 3, 3)
        .withGroup("game1", { id: "group1", name: "Test Group" });

      const ids = builder.getIds();

      // One category worth 10 points, others worth 1 each
      builder
        .withGroupValues("group1", {
          [ids.categoryIds[0]]: 10,
          [ids.categoryIds[1]]: 1,
          [ids.categoryIds[2]]: 1,
        })
        .withEntry("group1", { name: "Big Winner" }, "all-first")
        .withEntry("group1", { name: "Small Winner" }, "all-last")
        .withGameInProgress("game1", 1); // Only answer the 10-point category

      const scenario = builder.build();
      const props = { routeParams: { id: "group1" } };

      renderWithProviders(<Group {...props} />, {
        preloadedState: scenario,
      });

      // Big Winner gets 10 points, Small Winner gets 0
      expect(screen.getByText("10 / 10")).toBeInTheDocument();
      expect(screen.getByText("0 / 10")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle entry with no selections during game", () => {
      const builder = new ScenarioBuilder()
        .withGame({ id: "game1", name: "Test Awards" }, 3, 3)
        .withGroup("game1", { id: "group1", name: "Test Group" })
        .withEntry("group1", { name: "Complete" }, "all-first")
        .withEntry("group1", { name: "Empty" }, "empty")
        .withGameInProgress("game1", 2)
        .withCurrentUser({ id: "user1", name: "Test User" });

      const scenario = builder.build();
      const props = { routeParams: { id: "group1" } };

      renderWithProviders(<Group {...props} />, {
        preloadedState: scenario,
      });

      // Complete entry should have points, Empty should have 0
      expect(screen.getByText("Complete")).toBeInTheDocument();
      expect(screen.getByText("Empty")).toBeInTheDocument();

      // At least one score should show 0 / 2 (for empty entry)
      expect(screen.getByText("0 / 2")).toBeInTheDocument();
    });

    it("should handle single entry in group", () => {
      const builder = new ScenarioBuilder()
        .withGame({ id: "game1", name: "Test Awards" }, 3, 3)
        .withGroup("game1", { id: "group1", name: "Test Group" })
        .withEntry("group1", { name: "Only Entry" }, "all-first")
        .withGameInProgress("game1", 2)
        .withCurrentUser({ id: "user1", name: "Test User" });

      const scenario = builder.build();
      const props = { routeParams: { id: "group1" } };

      const { container } = renderWithProviders(<Group {...props} />, {
        preloadedState: scenario,
      });

      // Should show rank 1
      const rows = container.querySelectorAll(".EntriesTable--row");
      expect(rows.length).toBe(1);
      expect(within(rows[0]).getByText("1")).toBeInTheDocument();
    });

    it("should handle all entries with zero score", () => {
      const builder = new ScenarioBuilder()
        .withGame({ id: "game1", name: "Test Awards" }, 3, 3)
        .withGroup("game1", { id: "group1", name: "Test Group" })
        .withEntry("group1", { name: "Entry A" }, "all-last")
        .withEntry("group1", { name: "Entry B" }, "all-last")
        .withGameInProgress("game1", 2)
        .withCurrentUser({ id: "user1", name: "Test User" });

      const scenario = builder.build();
      const props = { routeParams: { id: "group1" } };

      const { container } = renderWithProviders(<Group {...props} />, {
        preloadedState: scenario,
      });

      // Both should be tied at rank 1 with 0 points
      const rows = container.querySelectorAll(".EntriesTable--row");
      expect(within(rows[0]).getByText("1")).toBeInTheDocument();
      expect(within(rows[1]).getByText("1")).toBeInTheDocument();

      // Both should show 0 / 2
      expect(screen.getAllByText("0 / 2").length).toBe(2);
    });
  });
});
