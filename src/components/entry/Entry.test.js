import React from "react";
import { screen } from "@testing-library/react";
import Entry from "./Entry";
import { renderWithProviders } from "../../testUtils/testUtils";
import { ScenarioBuilder } from "../../testUtils/factories";
import { Map, fromJS } from "immutable";
import User from "../../models/User";

describe("Entry", () => {
  const createEntryScenario = () => {
    return new ScenarioBuilder()
      .withGame({ id: "game1", name: "97th Academy Awards" }, 5, 5)
      .withGroup("game1", { id: "group1", name: "Office Pool" })
      .withEntry("group1", { name: "Test User" }, "all-first")
      .withCurrentUser({ id: "user1", name: "Test User", email: "test@example.com" });
  };

  it("should render entry name and game name", () => {
    const builder = createEntryScenario();
    const ids = builder.getIds();
    const scenario = builder.build();
    const entryId = ids.entryIds[0];
    const props = { routeParams: { id: entryId } };

    renderWithProviders(<Entry {...props} />, {
      preloadedState: scenario,
      initialEntries: [`/entries/${entryId}`],
    });

    expect(screen.getByText("97th Academy Awards")).toBeInTheDocument();
    // Office Pool appears in both the link and the back link
    expect(screen.getAllByText("Office Pool").length).toBeGreaterThan(0);
  });

  it("should handle missing entry gracefully", () => {
    // Create minimal state without the entry we're looking for
    const scenario = new ScenarioBuilder()
      .withCurrentUser({ id: "user1", name: "Test User", email: "test@example.com" })
      .build();
    const props = { routeParams: { id: "nonexistent" } };

    // Component should render without crashing even if entry is not found
    // The selectors return default empty models, so it doesn't show "Loading..."
    const { container } = renderWithProviders(<Entry {...props} />, {
      preloadedState: scenario,
    });

    // Verify component rendered (doesn't crash)
    expect(container.querySelector(".Entry--score-progress-bar")).toBeInTheDocument();
  });

  it("should show entry incomplete status when selections missing", () => {
    const builder = new ScenarioBuilder()
      .withGame({ id: "game1", name: "97th Academy Awards" }, 5, 5)
      .withGroup("game1", { id: "group1", name: "Office Pool" })
      .withEntry("group1", { name: "Incomplete Entry" }, "empty")
      .withCurrentUser({ id: "user1", name: "Test User", email: "test@example.com" });

    // The entry has no selections, but let's make sure it has some partial ones
    const ids = builder.getIds();
    const scenario = builder.build();
    const entryId = ids.entryIds[0];

    // Modify the entry to have partial selections
    const gameCategories = ids.gameCategories["game1"];
    const entry = scenario.entries.get(entryId);
    const partialSelections = { [gameCategories[0]]: ids.categoryNominees[gameCategories[0]][0] };
    const updatedEntry = entry.set("selections", fromJS(partialSelections));
    scenario.entries = scenario.entries.set(entryId, updatedEntry);

    const props = { routeParams: { id: entryId } };

    renderWithProviders(<Entry {...props} />, {
      preloadedState: scenario,
    });

    expect(screen.getAllByText(/entry incomplete/i).length).toBeGreaterThan(0);
  });

  it("should show entry complete status when all selections made", () => {
    const builder = createEntryScenario();
    const ids = builder.getIds();
    const scenario = builder.build();
    const entryId = ids.entryIds[0];
    const props = { routeParams: { id: entryId } };

    renderWithProviders(<Entry {...props} />, {
      preloadedState: scenario,
    });

    expect(screen.getAllByText(/entry complete/i).length).toBeGreaterThan(0);
  });

  it("should show score when game has started", () => {
    const builder = createEntryScenario();
    builder.withGameInProgress("game1", 2);
    const ids = builder.getIds();
    const scenario = builder.build();
    const entryId = ids.entryIds[0];
    const props = { routeParams: { id: entryId } };

    renderWithProviders(<Entry {...props} />, {
      preloadedState: scenario,
    });

    // Score should be displayed as "X/Y points"
    expect(screen.getByText(/\d+\/\d+ points/)).toBeInTheDocument();
  });

  it("should show entry not visible message when game not started and not owner", () => {
    const builder = new ScenarioBuilder()
      .withGame({ id: "game1", name: "97th Academy Awards" }, 5, 5)
      .withGroup("game1", { id: "group1", name: "Office Pool" })
      .withEntry("group1", { id: "other-user", name: "Other User Entry" }, "all-first")
      .withCurrentUser({ id: "user1", name: "Test User", email: "test@example.com" });

    const ids = builder.getIds();
    const scenario = builder.build();
    const entryId = ids.entryIds[0];
    const props = { routeParams: { id: entryId } };

    renderWithProviders(<Entry {...props} />, {
      preloadedState: scenario,
    });

    expect(
      screen.getByText("Entry not visible until game starts")
    ).toBeInTheDocument();
  });

  it("should show categories when entry is visible", () => {
    const builder = createEntryScenario();
    // Make the current user the entry owner
    const ids = builder.getIds();
    const scenario = builder.build();
    const entryId = ids.entryIds[0];

    // Update the entry to belong to the current user
    const entry = scenario.entries.get(entryId);
    const updatedEntry = entry.set("user", "user1");
    scenario.entries = scenario.entries.set(entryId, updatedEntry);

    const props = { routeParams: { id: entryId } };

    renderWithProviders(<Entry {...props} />, {
      preloadedState: scenario,
    });

    // Entry should be visible (showing categories instead of "not visible" message)
    expect(
      screen.queryByText("Entry not visible until game starts")
    ).not.toBeInTheDocument();
  });

  it("should render back to group link", () => {
    const builder = createEntryScenario();
    const ids = builder.getIds();
    const scenario = builder.build();
    const entryId = ids.entryIds[0];
    const props = { routeParams: { id: entryId } };

    renderWithProviders(<Entry {...props} />, {
      preloadedState: scenario,
    });

    // There are now two "Back to" links (top and footer), verify both exist
    const backToLinks = screen.getAllByText(/back to/i);
    expect(backToLinks.length).toBe(2);
    // Office Pool appears multiple times, verify at least one exists
    expect(screen.getAllByText("Office Pool").length).toBeGreaterThan(0);
  });
});
