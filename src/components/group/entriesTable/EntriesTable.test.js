import React from "react";
import { screen } from "@testing-library/react";
import EntriesTable from "./EntriesTable";
import { List, Seq, fromJS } from "immutable";
import Entry from "../../../models/Entry";
import Category from "../../../models/Category";
import User from "../../../models/User";
import {
  createUser,
  createCategory,
  ScenarioBuilder,
} from "../../../testUtils/factories";
import { renderWithProviders } from "../../../testUtils/testUtils";

// Mock the gravatar helper
jest.mock("../../../helpers/user-helper", () => ({
  gravatar: jest.fn((email) => `https://gravatar.com/avatar/${email}`),
}));

describe("EntriesTable", () => {
  const createTestScenario = () => {
    return new ScenarioBuilder()
      .withGame({ id: "game1", name: "97th Academy Awards" }, 3, 5)
      .withGroup("game1", { id: "group1", name: "Office Pool" })
      .withEntry("group1", { name: "Alice's Entry" }, "all-first")
      .withEntry("group1", { name: "Bob's Entry" }, "random")
      .withCurrentUser({ id: "user1", name: "Test User" });
  };

  it("should render table with entry names", () => {
    const builder = createTestScenario();
    const ids = builder.getIds();
    const scenario = builder.build();

    const entries = ids.entryIds.map((id) => scenario.entries.get(id));
    const entriesList = List(entries);
    const categories = Seq(
      ids.categoryIds.map((id) => scenario.categories.get(id))
    ).toKeyedSeq();

    renderWithProviders(
      <EntriesTable
        entries={entriesList}
        categories={categories}
        gameStarted={false}
      />,
      { preloadedState: scenario }
    );

    expect(screen.getByText(/alice's entry/i)).toBeInTheDocument();
    expect(screen.getByText(/bob's entry/i)).toBeInTheDocument();
  });

  it("should render table headers", () => {
    const builder = createTestScenario();
    const ids = builder.getIds();
    const scenario = builder.build();

    const entries = ids.entryIds.map((id) => scenario.entries.get(id));
    const entriesList = List(entries);
    const categories = Seq(
      ids.categoryIds.map((id) => scenario.categories.get(id))
    ).toKeyedSeq();

    renderWithProviders(
      <EntriesTable
        entries={entriesList}
        categories={categories}
        gameStarted={false}
      />,
      { preloadedState: scenario }
    );

    expect(screen.getByText("Entry Name")).toBeInTheDocument();
    expect(screen.getByText("Score")).toBeInTheDocument();
  });

  it("should show legend when game has not started", () => {
    const builder = createTestScenario();
    const ids = builder.getIds();
    const scenario = builder.build();

    const entries = ids.entryIds.map((id) => scenario.entries.get(id));
    const entriesList = List(entries);
    const categories = Seq(
      ids.categoryIds.map((id) => scenario.categories.get(id))
    ).toKeyedSeq();

    renderWithProviders(
      <EntriesTable
        entries={entriesList}
        categories={categories}
        gameStarted={false}
      />,
      { preloadedState: scenario }
    );

    expect(screen.getByText("Complete")).toBeInTheDocument();
    expect(screen.getByText("Incomplete")).toBeInTheDocument();
  });

  it("should hide legend when game has started", () => {
    const builder = createTestScenario();
    builder.withGameInProgress("game1", 1);
    const ids = builder.getIds();
    const scenario = builder.build();

    const entries = ids.entryIds.map((id) => scenario.entries.get(id));
    const entriesList = List(entries);
    const categories = Seq(
      ids.categoryIds.map((id) => scenario.categories.get(id))
    ).toKeyedSeq();

    renderWithProviders(
      <EntriesTable
        entries={entriesList}
        categories={categories}
        gameStarted={true}
      />,
      { preloadedState: scenario }
    );

    expect(screen.queryByText("Complete")).not.toBeInTheDocument();
    expect(screen.queryByText("Incomplete")).not.toBeInTheDocument();
  });

  it("should show category columns when game has started", () => {
    const builder = createTestScenario();
    builder.withGameInProgress("game1", 1);
    const ids = builder.getIds();
    const scenario = builder.build();

    const entries = ids.entryIds.map((id) => scenario.entries.get(id));
    const entriesList = List(entries);
    const categories = Seq(
      ids.categoryIds.map((id) => scenario.categories.get(id))
    ).toKeyedSeq();

    renderWithProviders(
      <EntriesTable
        entries={entriesList}
        categories={categories}
        gameStarted={true}
      />,
      { preloadedState: scenario }
    );

    // Category names should appear as column headers
    const firstCategory = scenario.categories.first();
    expect(screen.getByText(firstCategory.name)).toBeInTheDocument();
  });

  it("should not show category columns when game has not started", () => {
    const builder = createTestScenario();
    const ids = builder.getIds();
    const scenario = builder.build();

    const entries = ids.entryIds.map((id) => scenario.entries.get(id));
    const entriesList = List(entries);
    const categories = Seq(
      ids.categoryIds.map((id) => scenario.categories.get(id))
    ).toKeyedSeq();

    renderWithProviders(
      <EntriesTable
        entries={entriesList}
        categories={categories}
        gameStarted={false}
      />,
      { preloadedState: scenario }
    );

    // Category columns should not be visible (no diagonal headers)
    const firstCategory = scenario.categories.first();
    expect(screen.queryByText(firstCategory.name)).not.toBeInTheDocument();
  });

  it("should render empty table when no entries", () => {
    const builder = createTestScenario();
    const ids = builder.getIds();
    const scenario = builder.build();

    const categories = Seq(
      ids.categoryIds.map((id) => scenario.categories.get(id))
    ).toKeyedSeq();

    renderWithProviders(
      <EntriesTable
        entries={List()}
        categories={categories}
        gameStarted={false}
      />,
      { preloadedState: scenario }
    );

    // Table should exist but have no data rows
    expect(screen.getByText("Entry Name")).toBeInTheDocument();
    const table = screen.getByRole("table");
    const rows = table.querySelectorAll("tbody tr");
    expect(rows.length).toBe(0);
  });
});
