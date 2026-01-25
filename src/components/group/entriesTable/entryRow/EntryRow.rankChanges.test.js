import React from "react";
import { renderWithProviders } from "../../../../testUtils/testUtils";
import { screen } from "@testing-library/react";
import EntryRow from "./EntryRow";
import { ScenarioBuilder } from "../../../../testUtils/factories";
import { List } from "immutable";

describe("EntryRow - Rank Change Indicators", () => {
  describe("when game has not started", () => {
    it("should not display rank change indicator", () => {
      const builderNoScore = new ScenarioBuilder()
        .withGame({ id: "game1", name: "Test Game" }, 3, 5)
        .withGroup("game1", { id: "group1", name: "Test Group" })
        .withEntry("group1", { id: "entry-1", name: "Test Entry" }, "all-first");

      const scenarioNoScore = builderNoScore.build();
      const idsNoScore = builderNoScore.getIds();

      renderWithProviders(
        <table>
          <tbody>
            <EntryRow
              entry={scenarioNoScore.entries.get(idsNoScore.entryIds[0]).toJS()}
              categories={scenarioNoScore.categories}
              mostRecentCategoryId={null}
            />
          </tbody>
        </table>,
        { preloadedState: scenarioNoScore }
      );

      // Should show checkmark/warning icon, not rank indicators
      expect(screen.queryByText("↑")).not.toBeInTheDocument();
      expect(screen.queryByText("↓")).not.toBeInTheDocument();
      expect(screen.queryByText("–")).not.toBeInTheDocument();
    });
  });

  describe("when entry rank improved", () => {
    it("should display up arrow (↑)", () => {
      // Create scenario where Entry 2 moves from rank 2 to rank 1
      const builder = new ScenarioBuilder()
        .withGame({ id: "game1", name: "Test Game" }, 2, 5)
        .withGroup("game1", { id: "group1", name: "Test Group" })
        .withEntry("group1", { id: "entry-1", name: "Entry 1" }, "all-first")
        .withEntry("group1", { id: "entry-2", name: "Entry 2" }, "all-last");

      const scenario = builder.build();
      const ids = builder.getIds();

      // Score cat0 with first nominee, then cat1 with last nominee
      // After cat0: Entry 1 has 1 pt (rank 1), Entry 2 has 0 (rank 2)
      // After cat1: both have 1 pt (tied at rank 1)
      // Entry 2 goes from rank 2 → rank 1 = "up"
      const entry1 = scenario.entries.get(ids.entryIds[0]);
      const entry2 = scenario.entries.get(ids.entryIds[1]);
      const nominee0 = entry1.selections.get(ids.categoryIds[0]);
      const nominee1 = entry2.selections.get(ids.categoryIds[1]);

      const stateWithTwoScored = {
        ...scenario,
        categories: scenario.categories
          .setIn([ids.categoryIds[0], "correctAnswer"], nominee0)
          .setIn([ids.categoryIds[1], "correctAnswer"], nominee1),
        games: scenario.games.setIn(
          ["game1", "answered_order"],
          List([ids.categoryIds[0], ids.categoryIds[1]])
        ),
      };

      renderWithProviders(
        <table>
          <tbody>
            <EntryRow
              entry={entry2.toJS()}
              categories={stateWithTwoScored.categories}
              mostRecentCategoryId={ids.categoryIds[1]}
            />
          </tbody>
        </table>,
        { preloadedState: stateWithTwoScored }
      );

      expect(screen.getByText("↑")).toBeInTheDocument();
      expect(screen.getByText("↑")).toHaveClass("EntryRow--rank-change-up");
    });

    it("should display rank number alongside up arrow", () => {
      // Same scenario as above
      const builder = new ScenarioBuilder()
        .withGame({ id: "game1", name: "Test Game" }, 2, 5)
        .withGroup("game1", { id: "group1", name: "Test Group" })
        .withEntry("group1", { id: "entry-1", name: "Entry 1" }, "all-first")
        .withEntry("group1", { id: "entry-2", name: "Entry 2" }, "all-last");

      const scenario = builder.build();
      const ids = builder.getIds();

      const entry1 = scenario.entries.get(ids.entryIds[0]);
      const entry2 = scenario.entries.get(ids.entryIds[1]);
      const nominee0 = entry1.selections.get(ids.categoryIds[0]);
      const nominee1 = entry2.selections.get(ids.categoryIds[1]);

      const stateWithTwoScored = {
        ...scenario,
        categories: scenario.categories
          .setIn([ids.categoryIds[0], "correctAnswer"], nominee0)
          .setIn([ids.categoryIds[1], "correctAnswer"], nominee1),
        games: scenario.games.setIn(
          ["game1", "answered_order"],
          List([ids.categoryIds[0], ids.categoryIds[1]])
        ),
      };

      renderWithProviders(
        <table>
          <tbody>
            <EntryRow
              entry={entry2.toJS()}
              categories={stateWithTwoScored.categories}
              mostRecentCategoryId={ids.categoryIds[1]}
            />
          </tbody>
        </table>,
        { preloadedState: stateWithTwoScored }
      );

      // Should show both rank and indicator
      expect(screen.getByText("1")).toBeInTheDocument(); // Current rank (tied for 1st)
      expect(screen.getByText("↑")).toBeInTheDocument();
    });
  });

  describe("when entry rank worsened", () => {
    it("should display down arrow (↓)", () => {
      // Create scenario where entry drops from rank 1 to rank 2
      const builder = new ScenarioBuilder()
        .withGame({ id: "game1", name: "Test Game" }, 3, 5)
        .withGroup("game1", { id: "group1", name: "Test Group" })
        .withEntry("group1", { name: "Entry 1" }, "all-first")
        .withEntry("group1", { name: "Entry 2" }, "all-last");

      const scenario = builder.build();
      const ids = builder.getIds();

      // Score cat0 and cat1 with first nominee, then cat2 with first nominee too
      // After cat0: Entry 1 rank 1 (1 pt), Entry 2 rank 2 (0 pts)
      // After cat1: Entry 1 rank 1 (2 pts), Entry 2 rank 2 (0 pts)
      // Entry 2 stays at rank 2 = "same"
      // We need a different scenario for "down"

      // Let's score cat0 with last, cat1 with first
      // After cat0: Entry 2 rank 1 (1 pt), Entry 1 rank 2 (0 pts)
      // After cat1: Entry 1 rank 1 (1 pt), Entry 2 rank 2 (1 pt) - wait, they'd be tied

      // Better: score 3 categories
      // cat0: first nominee (Entry 1 gets it)
      // cat1: last nominee (Entry 2 gets it)
      // cat2: first nominee (Entry 1 gets it)
      // After cat1: both tied at rank 1 (1 pt each)
      // After cat2: Entry 1 rank 1 (2 pts), Entry 2 rank 2 (1 pt)
      const entry1 = scenario.entries.get(ids.entryIds[0]);
      const entry2 = scenario.entries.get(ids.entryIds[1]);
      const nominee0 = entry1.selections.get(ids.categoryIds[0]);
      const nominee1 = entry2.selections.get(ids.categoryIds[1]);
      const nominee2 = entry1.selections.get(ids.categoryIds[2]);

      const stateWithThreeScored = {
        ...scenario,
        categories: scenario.categories
          .setIn([ids.categoryIds[0], "correctAnswer"], nominee0)
          .setIn([ids.categoryIds[1], "correctAnswer"], nominee1)
          .setIn([ids.categoryIds[2], "correctAnswer"], nominee2),
        games: scenario.games.setIn(
          ["game1", "answered_order"],
          List([ids.categoryIds[0], ids.categoryIds[1], ids.categoryIds[2]])
        ),
      };

      renderWithProviders(
        <table>
          <tbody>
            <EntryRow
              entry={entry2.toJS()}
              categories={stateWithThreeScored.categories}
              mostRecentCategoryId={ids.categoryIds[2]}
            />
          </tbody>
        </table>,
        { preloadedState: stateWithThreeScored }
      );

      expect(screen.getByText("↓")).toBeInTheDocument();
      expect(screen.getByText("↓")).toHaveClass("EntryRow--rank-change-down");
    });
  });

  describe("when entry rank stayed the same", () => {
    it("should display dash (–)", () => {
      const builder = new ScenarioBuilder()
        .withGame({ id: "game1", name: "Test Game" }, 2, 5)
        .withGroup("game1", { id: "group1", name: "Test Group" })
        .withEntry("group1", { id: "entry-1", name: "Entry 1" }, "all-first")
        .withEntry("group1", { id: "entry-2", name: "Entry 2" }, "all-last");

      const scenario = builder.build();
      const ids = builder.getIds();

      // Score both categories with first nominee
      // Entry 1 stays at rank 1 throughout
      const entry1 = scenario.entries.get(ids.entryIds[0]);
      const nominee0 = entry1.selections.get(ids.categoryIds[0]);
      const nominee1 = entry1.selections.get(ids.categoryIds[1]);

      const stateWithTwoScored = {
        ...scenario,
        categories: scenario.categories
          .setIn([ids.categoryIds[0], "correctAnswer"], nominee0)
          .setIn([ids.categoryIds[1], "correctAnswer"], nominee1),
        games: scenario.games.setIn(
          ["game1", "answered_order"],
          List([ids.categoryIds[0], ids.categoryIds[1]])
        ),
      };

      renderWithProviders(
        <table>
          <tbody>
            <EntryRow
              entry={entry1.toJS()}
              categories={stateWithTwoScored.categories}
              mostRecentCategoryId={ids.categoryIds[1]}
            />
          </tbody>
        </table>,
        { preloadedState: stateWithTwoScored }
      );

      expect(screen.getByText("–")).toBeInTheDocument();
      expect(screen.getByText("–")).toHaveClass("EntryRow--rank-change-same");
    });
  });

  describe("when answered_order is not available", () => {
    it("should not display any rank change indicator", () => {
      const builder = new ScenarioBuilder()
        .withGame({ id: "game1", name: "Test Game" }, 2, 5)
        .withGroup("game1", { id: "group1", name: "Test Group" })
        .withEntry("group1", { id: "entry-1", name: "Entry 1" }, "all-first");

      const scenario = builder.build();
      const ids = builder.getIds();

      // No answered_order - no indicators
      const stateWithoutAnsweredOrder = {
        ...scenario,
        games: scenario.games.setIn(["game1", "answered_order"], List()),
      };

      renderWithProviders(
        <table>
          <tbody>
            <EntryRow
              entry={scenario.entries.get(ids.entryIds[0]).toJS()}
              categories={scenario.categories}
              mostRecentCategoryId={null}
            />
          </tbody>
        </table>,
        { preloadedState: stateWithoutAnsweredOrder }
      );

      // Should show rank (1) but no indicator
      expect(screen.queryByText("↑")).not.toBeInTheDocument();
      expect(screen.queryByText("↓")).not.toBeInTheDocument();
      expect(screen.queryByText("–")).not.toBeInTheDocument();
    });

    it("should not crash when answered_order is undefined", () => {
      const builder = new ScenarioBuilder()
        .withGame({ id: "game1", name: "Test Game" }, 2, 5)
        .withGroup("game1", { id: "group1", name: "Test Group" })
        .withEntry("group1", { id: "entry-1", name: "Entry 1" }, "all-first");

      const scenario = builder.build();
      const ids = builder.getIds();

      const stateWithUndefinedAnsweredOrder = {
        ...scenario,
        games: scenario.games.deleteIn(["game1", "answered_order"]),
      };

      expect(() => {
        renderWithProviders(
          <table>
            <tbody>
              <EntryRow
                entry={scenario.entries.get(ids.entryIds[0]).toJS()}
                categories={scenario.categories}
                mostRecentCategoryId={null}
              />
            </tbody>
          </table>,
          { preloadedState: stateWithUndefinedAnsweredOrder }
        );
      }).not.toThrow();
    });
  });

  describe("styling and CSS classes", () => {
    it("should apply correct CSS class for up indicator", () => {
      const builder = new ScenarioBuilder()
        .withGame({ id: "game1", name: "Test Game" }, 2, 5)
        .withGroup("game1", { id: "group1", name: "Test Group" })
        .withEntry("group1", { id: "entry-1", name: "Entry 1" }, "all-first")
        .withEntry("group1", { id: "entry-2", name: "Entry 2" }, "all-last");

      const scenario = builder.build();
      const ids = builder.getIds();

      const entry1 = scenario.entries.get(ids.entryIds[0]);
      const entry2 = scenario.entries.get(ids.entryIds[1]);
      const nominee0 = entry1.selections.get(ids.categoryIds[0]);
      const nominee1 = entry2.selections.get(ids.categoryIds[1]);

      const stateWithTwoScored = {
        ...scenario,
        categories: scenario.categories
          .setIn([ids.categoryIds[0], "correctAnswer"], nominee0)
          .setIn([ids.categoryIds[1], "correctAnswer"], nominee1),
        games: scenario.games.setIn(
          ["game1", "answered_order"],
          List([ids.categoryIds[0], ids.categoryIds[1]])
        ),
      };

      renderWithProviders(
        <table>
          <tbody>
            <EntryRow
              entry={entry2.toJS()}
              categories={stateWithTwoScored.categories}
              mostRecentCategoryId={ids.categoryIds[1]}
            />
          </tbody>
        </table>,
        { preloadedState: stateWithTwoScored }
      );

      const upArrow = screen.getByText("↑");
      expect(upArrow).toHaveClass("EntryRow--rank-change");
      expect(upArrow).toHaveClass("EntryRow--rank-change-up");
    });

    it("should apply correct CSS class for down indicator", () => {
      const builder = new ScenarioBuilder()
        .withGame({ id: "game1", name: "Test Game" }, 3, 5)
        .withGroup("game1", { id: "group1", name: "Test Group" })
        .withEntry("group1", { name: "Entry 1" }, "all-first")
        .withEntry("group1", { name: "Entry 2" }, "all-last");

      const scenario = builder.build();
      const ids = builder.getIds();

      const entry1 = scenario.entries.get(ids.entryIds[0]);
      const entry2 = scenario.entries.get(ids.entryIds[1]);
      const nominee0 = entry1.selections.get(ids.categoryIds[0]);
      const nominee1 = entry2.selections.get(ids.categoryIds[1]);
      const nominee2 = entry1.selections.get(ids.categoryIds[2]);

      const stateWithThreeScored = {
        ...scenario,
        categories: scenario.categories
          .setIn([ids.categoryIds[0], "correctAnswer"], nominee0)
          .setIn([ids.categoryIds[1], "correctAnswer"], nominee1)
          .setIn([ids.categoryIds[2], "correctAnswer"], nominee2),
        games: scenario.games.setIn(
          ["game1", "answered_order"],
          List([ids.categoryIds[0], ids.categoryIds[1], ids.categoryIds[2]])
        ),
      };

      renderWithProviders(
        <table>
          <tbody>
            <EntryRow
              entry={entry2.toJS()}
              categories={stateWithThreeScored.categories}
              mostRecentCategoryId={ids.categoryIds[2]}
            />
          </tbody>
        </table>,
        { preloadedState: stateWithThreeScored }
      );

      const downArrow = screen.getByText("↓");
      expect(downArrow).toHaveClass("EntryRow--rank-change");
      expect(downArrow).toHaveClass("EntryRow--rank-change-down");
    });

    it("should apply correct CSS class for same indicator", () => {
      const builder = new ScenarioBuilder()
        .withGame({ id: "game1", name: "Test Game" }, 2, 5)
        .withGroup("game1", { id: "group1", name: "Test Group" })
        .withEntry("group1", { id: "entry-1", name: "Entry 1" }, "all-first")
        .withEntry("group1", { id: "entry-2", name: "Entry 2" }, "all-last");

      const scenario = builder.build();
      const ids = builder.getIds();

      const entry1 = scenario.entries.get(ids.entryIds[0]);
      const nominee0 = entry1.selections.get(ids.categoryIds[0]);
      const nominee1 = entry1.selections.get(ids.categoryIds[1]);

      const stateWithTwoScored = {
        ...scenario,
        categories: scenario.categories
          .setIn([ids.categoryIds[0], "correctAnswer"], nominee0)
          .setIn([ids.categoryIds[1], "correctAnswer"], nominee1),
        games: scenario.games.setIn(
          ["game1", "answered_order"],
          List([ids.categoryIds[0], ids.categoryIds[1]])
        ),
      };

      renderWithProviders(
        <table>
          <tbody>
            <EntryRow
              entry={entry1.toJS()}
              categories={stateWithTwoScored.categories}
              mostRecentCategoryId={ids.categoryIds[1]}
            />
          </tbody>
        </table>,
        { preloadedState: stateWithTwoScored }
      );

      const sameIndicator = screen.getByText("–");
      expect(sameIndicator).toHaveClass("EntryRow--rank-change");
      expect(sameIndicator).toHaveClass("EntryRow--rank-change-same");
    });
  });

  describe("accessibility", () => {
    it("should have rank container for proper semantic structure", () => {
      const builder = new ScenarioBuilder()
        .withGame({ id: "game1", name: "Test Game" }, 2, 5)
        .withGroup("game1", { id: "group1", name: "Test Group" })
        .withEntry("group1", { id: "entry-1", name: "Entry 1" }, "all-first")
        .withEntry("group1", { id: "entry-2", name: "Entry 2" }, "all-last");

      const scenario = builder.build();
      const ids = builder.getIds();

      const entry1 = scenario.entries.get(ids.entryIds[0]);
      const nominee0 = entry1.selections.get(ids.categoryIds[0]);
      const nominee1 = entry1.selections.get(ids.categoryIds[1]);

      const stateWithTwoScored = {
        ...scenario,
        categories: scenario.categories
          .setIn([ids.categoryIds[0], "correctAnswer"], nominee0)
          .setIn([ids.categoryIds[1], "correctAnswer"], nominee1),
        games: scenario.games.setIn(
          ["game1", "answered_order"],
          List([ids.categoryIds[0], ids.categoryIds[1]])
        ),
      };

      const { container } = renderWithProviders(
        <table>
          <tbody>
            <EntryRow
              entry={entry1.toJS()}
              categories={stateWithTwoScored.categories}
              mostRecentCategoryId={ids.categoryIds[1]}
            />
          </tbody>
        </table>,
        { preloadedState: stateWithTwoScored }
      );

      const rankContainer = container.querySelector(".EntryRow--rank-container");
      expect(rankContainer).toBeInTheDocument();
      expect(rankContainer).toContainHTML("1"); // Rank
      expect(rankContainer).toContainHTML("–"); // Indicator (same)
    });
  });
});
