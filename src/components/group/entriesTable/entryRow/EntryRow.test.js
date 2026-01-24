import React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EntryRow from "./EntryRow";
import { renderWithProviders } from "../../../../testUtils/testUtils";
import { ScenarioBuilder } from "../../../../testUtils/factories";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("EntryRow", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it("should show check icon when entry is complete and game has not started", () => {
    const builder = new ScenarioBuilder()
      .withGame({ id: "game1", name: "Test Awards" }, 3, 3)
      .withGroup("game1", { id: "group1", name: "Test Group" })
      .withEntry("group1", { name: "Jane Doe" }, "all-first");

    const ids = builder.getIds();
    const scenario = builder.build();
    const entry = scenario.entries.get(ids.entryIds[0]);

    renderWithProviders(
      <table>
        <tbody>
          <EntryRow
            entry={entry}
            categories={scenario.categories.toSeq()}
            mostRecentCategoryId={null}
          />
        </tbody>
      </table>,
      { preloadedState: scenario }
    );

    const checkIcon = document.querySelector(
      '[data-testid="CheckCircleIcon"]'
    );
    expect(checkIcon).toBeInTheDocument();
  });

  it("should show rank when game has started", () => {
    const builder = new ScenarioBuilder()
      .withGame({ id: "game1", name: "Test Awards" }, 3, 3)
      .withGroup("game1", { id: "group1", name: "Test Group" })
      .withEntry("group1", { name: "Test User", rank: 1 }, "all-first");

    builder.withGameInProgress("game1", 1);

    const ids = builder.getIds();
    const scenario = builder.build();
    const entry = scenario.entries.get(ids.entryIds[0]);

    renderWithProviders(
      <table>
        <tbody>
          <EntryRow
            entry={entry}
            categories={scenario.categories.toSeq()}
            mostRecentCategoryId={null}
          />
        </tbody>
      </table>,
      { preloadedState: scenario }
    );

    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("should display entry name and user name", () => {
    const builder = new ScenarioBuilder()
      .withGame({ id: "game1", name: "Test Awards" }, 2, 2)
      .withGroup("game1", { id: "group1", name: "Test Group" })
      .withEntry("group1", { id: "user1", name: "John Doe" }, "all-first")
      .withCurrentUser({ id: "user1", name: "John Doe" });

    const ids = builder.getIds();
    const scenario = builder.build();
    const entry = scenario.entries.get(ids.entryIds[0]);

    const updatedEntry = entry.set("name", "My Predictions");
    scenario.entries = scenario.entries.set(ids.entryIds[0], updatedEntry);

    renderWithProviders(
      <table>
        <tbody>
          <EntryRow
            entry={updatedEntry}
            categories={scenario.categories.toSeq()}
            mostRecentCategoryId={null}
          />
        </tbody>
      </table>,
      { preloadedState: scenario }
    );

    expect(screen.getByText("My Predictions")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("should navigate to entry detail when row is clicked", async () => {
    const user = userEvent.setup();
    const builder = new ScenarioBuilder()
      .withGame({ id: "game1", name: "Test Awards" }, 2, 2)
      .withGroup("game1", { id: "group1", name: "Test Group" })
      .withEntry("group1", { name: "Test User" }, "all-first");

    const ids = builder.getIds();
    const scenario = builder.build();
    const entry = scenario.entries.get(ids.entryIds[0]);

    renderWithProviders(
      <table>
        <tbody>
          <EntryRow
            entry={entry}
            categories={scenario.categories.toSeq()}
            mostRecentCategoryId={null}
          />
        </tbody>
      </table>,
      { preloadedState: scenario }
    );

    const row = screen.getByRole("row");
    await user.click(row);

    expect(mockNavigate).toHaveBeenCalledWith(`/entries/${entry.id}`);
  });

  it("should render user avatar", () => {
    const builder = new ScenarioBuilder()
      .withGame({ id: "game1", name: "Test Awards" }, 2, 2)
      .withGroup("game1", { id: "group1", name: "Test Group" })
      .withEntry("group1", { name: "Test User" }, "all-first");

    const ids = builder.getIds();
    const scenario = builder.build();
    const entry = scenario.entries.get(ids.entryIds[0]);

    const { container } = renderWithProviders(
      <table>
        <tbody>
          <EntryRow
            entry={entry}
            categories={scenario.categories.toSeq()}
            mostRecentCategoryId={null}
          />
        </tbody>
      </table>,
      { preloadedState: scenario }
    );

    const avatar = container.querySelector(".MuiAvatar-root");
    expect(avatar).toBeInTheDocument();
  });
});
