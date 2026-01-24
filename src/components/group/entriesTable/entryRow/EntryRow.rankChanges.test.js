import React from "react";
import { renderWithProviders } from "../../../../testUtils/testUtils";
import { screen } from "@testing-library/react";
import EntryRow from "./EntryRow";
import { ScenarioBuilder } from "../../../../testUtils/factories";
import { fromJS } from "immutable";

describe("EntryRow - Rank Change Indicators", () => {
  let scenario;
  let ids;
  let entry;
  let categories;

  beforeEach(() => {
    const builder = new ScenarioBuilder()
      .withGame({ id: "game1", name: "Test Game" }, 3, 5)
      .withGroup("game1", { id: "group1", name: "Test Group" })
      .withEntry("group1", { id: "entry-1", name: "Test Entry" }, "all-first")
      .withEntry("group1", { id: "entry-2", name: "Other Entry" }, "all-last")
      .withGameInProgress("game1", 1); // Score first category

    scenario = builder.build();
    ids = builder.getIds();
    entry = scenario.entries.get(ids.entryIds[0]);
    categories = scenario.categories;
  });

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

      // Should show checkmark/warning icon, not rank
      expect(screen.queryByText("↑")).not.toBeInTheDocument();
      expect(screen.queryByText("↓")).not.toBeInTheDocument();
      expect(screen.queryByText("–")).not.toBeInTheDocument();
    });
  });

  describe("when entry rank improved", () => {
    it("should display up arrow (↑)", () => {
      const stateWithPreviousRanks = {
        ...scenario,
        ui: scenario.ui.set(
          "previousRanks",
          fromJS({
            [ids.entryIds[0]]: 2, // Was rank 2, now rank 1
            [ids.entryIds[1]]: 1,
          })
        ),
      };

      renderWithProviders(
        <table>
          <tbody>
            <EntryRow
              entry={entry.toJS()}
              categories={categories}
              mostRecentCategoryId={null}
            />
          </tbody>
        </table>,
        { preloadedState: stateWithPreviousRanks }
      );

      expect(screen.getByText("↑")).toBeInTheDocument();
      expect(screen.getByText("↑")).toHaveClass("EntryRow--rank-change-up");
    });

    it("should display rank number alongside up arrow", () => {
      const stateWithPreviousRanks = {
        ...scenario,
        ui: scenario.ui.set(
          "previousRanks",
          fromJS({
            [ids.entryIds[0]]: 3, // Was rank 3
            [ids.entryIds[1]]: 1,
          })
        ),
      };

      renderWithProviders(
        <table>
          <tbody>
            <EntryRow
              entry={entry.toJS()}
              categories={categories}
              mostRecentCategoryId={null}
            />
          </tbody>
        </table>,
        { preloadedState: stateWithPreviousRanks }
      );

      // Should show both rank and indicator
      expect(screen.getByText("1")).toBeInTheDocument(); // Current rank
      expect(screen.getByText("↑")).toBeInTheDocument();
    });
  });

  describe("when entry rank worsened", () => {
    it("should display down arrow (↓)", () => {
      // Create a fresh builder where entry will actually drop in rank
      const builderWithDrop = new ScenarioBuilder()
        .withGame({ id: "game1", name: "Test Game" }, 2, 5)
        .withGroup("game1", { id: "group1", name: "Test Group" })
        .withEntry("group1", { name: "Entry Drop" }, "all-last") // Will pick last
        .withEntry("group1", { name: "Entry Win" }, "all-first") // Will pick first
        .withGameInProgress("game1", 1); // Score first category with first nominee

      const dropScenario = builderWithDrop.build();
      const dropIds = builderWithDrop.getIds();

      // Entry that picked last was rank 1, but after scoring it drops to rank 2
      const stateWithDrop = {
        ...dropScenario,
        ui: dropScenario.ui.set(
          "previousRanks",
          fromJS({
            [dropIds.entryIds[0]]: 1, // Was rank 1
            [dropIds.entryIds[1]]: 1, // Was also rank 1 (tied)
          })
        ),
      };

      renderWithProviders(
        <table>
          <tbody>
            <EntryRow
              entry={stateWithDrop.entries.get(dropIds.entryIds[0]).toJS()}
              categories={dropScenario.categories}
              mostRecentCategoryId={null}
            />
          </tbody>
        </table>,
        { preloadedState: stateWithDrop }
      );

      expect(screen.getByText("↓")).toBeInTheDocument();
      expect(screen.getByText("↓")).toHaveClass("EntryRow--rank-change-down");
    });
  });

  describe("when entry rank stayed the same", () => {
    it("should display dash (–)", () => {
      const stateWithPreviousRanks = {
        ...scenario,
        ui: scenario.ui.set(
          "previousRanks",
          fromJS({
            [ids.entryIds[0]]: 1, // Stays at rank 1
            [ids.entryIds[1]]: 2,
          })
        ),
      };

      renderWithProviders(
        <table>
          <tbody>
            <EntryRow
              entry={entry.toJS()}
              categories={categories}
              mostRecentCategoryId={null}
            />
          </tbody>
        </table>,
        { preloadedState: stateWithPreviousRanks }
      );

      expect(screen.getByText("–")).toBeInTheDocument();
      expect(screen.getByText("–")).toHaveClass("EntryRow--rank-change-same");
    });
  });

  describe("when previousRanks is not available", () => {
    it("should not display any rank change indicator", () => {
      const stateWithoutPreviousRanks = {
        ...scenario,
        ui: scenario.ui.set("previousRanks", null),
      };

      renderWithProviders(
        <table>
          <tbody>
            <EntryRow
              entry={entry.toJS()}
              categories={categories}
              mostRecentCategoryId={null}
            />
          </tbody>
        </table>,
        { preloadedState: stateWithoutPreviousRanks }
      );

      // Should show rank but no indicator
      expect(screen.getByText("1")).toBeInTheDocument(); // Rank
      expect(screen.queryByText("↑")).not.toBeInTheDocument();
      expect(screen.queryByText("↓")).not.toBeInTheDocument();
      expect(screen.queryByText("–")).not.toBeInTheDocument();
    });

    it("should not crash when previousRanks is undefined", () => {
      const stateWithUndefinedRanks = {
        ...scenario,
        ui: scenario.ui.delete("previousRanks"),
      };

      expect(() => {
        renderWithProviders(
          <table>
            <tbody>
              <EntryRow
                entry={entry.toJS()}
                categories={categories}
                mostRecentCategoryId={null}
              />
            </tbody>
          </table>,
          { preloadedState: stateWithUndefinedRanks }
        );
      }).not.toThrow();
    });
  });

  describe("styling and CSS classes", () => {
    it("should apply correct CSS class for up indicator", () => {
      const stateWithPreviousRanks = {
        ...scenario,
        ui: scenario.ui.set(
          "previousRanks",
          fromJS({
            [ids.entryIds[0]]: 2,
            [ids.entryIds[1]]: 1,
          })
        ),
      };

      renderWithProviders(
        <table>
          <tbody>
            <EntryRow
              entry={entry.toJS()}
              categories={categories}
              mostRecentCategoryId={null}
            />
          </tbody>
        </table>,
        { preloadedState: stateWithPreviousRanks }
      );

      const upArrow = screen.getByText("↑");
      expect(upArrow).toHaveClass("EntryRow--rank-change");
      expect(upArrow).toHaveClass("EntryRow--rank-change-up");
    });

    it("should apply correct CSS class for down indicator", () => {
      // Create scenario where entry actually drops
      const builderWithDrop = new ScenarioBuilder()
        .withGame({ id: "game1", name: "Test Game" }, 2, 5)
        .withGroup("game1", { id: "group1", name: "Test Group" })
        .withEntry("group1", { name: "Entry Drop" }, "all-last")
        .withEntry("group1", { name: "Entry Win" }, "all-first")
        .withGameInProgress("game1", 1);

      const dropScenario = builderWithDrop.build();
      const dropIds = builderWithDrop.getIds();

      const stateWithDrop = {
        ...dropScenario,
        ui: dropScenario.ui.set(
          "previousRanks",
          fromJS({
            [dropIds.entryIds[0]]: 1,
            [dropIds.entryIds[1]]: 1,
          })
        ),
      };

      renderWithProviders(
        <table>
          <tbody>
            <EntryRow
              entry={stateWithDrop.entries.get(dropIds.entryIds[0]).toJS()}
              categories={dropScenario.categories}
              mostRecentCategoryId={null}
            />
          </tbody>
        </table>,
        { preloadedState: stateWithDrop }
      );

      const downArrow = screen.getByText("↓");
      expect(downArrow).toHaveClass("EntryRow--rank-change");
      expect(downArrow).toHaveClass("EntryRow--rank-change-down");
    });

    it("should apply correct CSS class for same indicator", () => {
      const stateWithPreviousRanks = {
        ...scenario,
        ui: scenario.ui.set(
          "previousRanks",
          fromJS({
            [ids.entryIds[0]]: 1,
            [ids.entryIds[1]]: 2,
          })
        ),
      };

      renderWithProviders(
        <table>
          <tbody>
            <EntryRow
              entry={entry.toJS()}
              categories={categories}
              mostRecentCategoryId={null}
            />
          </tbody>
        </table>,
        { preloadedState: stateWithPreviousRanks }
      );

      const sameIndicator = screen.getByText("–");
      expect(sameIndicator).toHaveClass("EntryRow--rank-change");
      expect(sameIndicator).toHaveClass("EntryRow--rank-change-same");
    });
  });

  describe("accessibility", () => {
    it("should have rank container for proper semantic structure", () => {
      const stateWithPreviousRanks = {
        ...scenario,
        ui: scenario.ui.set(
          "previousRanks",
          fromJS({
            [ids.entryIds[0]]: 2,
            [ids.entryIds[1]]: 1,
          })
        ),
      };

      const { container } = renderWithProviders(
        <table>
          <tbody>
            <EntryRow
              entry={entry.toJS()}
              categories={categories}
              mostRecentCategoryId={null}
            />
          </tbody>
        </table>,
        { preloadedState: stateWithPreviousRanks }
      );

      const rankContainer = container.querySelector(".EntryRow--rank-container");
      expect(rankContainer).toBeInTheDocument();
      expect(rankContainer).toContainHTML("1"); // Rank
      expect(rankContainer).toContainHTML("↑"); // Indicator
    });
  });
});
