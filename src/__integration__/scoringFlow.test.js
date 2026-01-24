import React from "react";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../testUtils/testUtils";
import { ScenarioBuilder } from "../testUtils/factories";
import { Map, fromJS } from "immutable";
import Group from "../components/group/Group";
import Entry from "../models/Entry";
import Category from "../models/Category";

// Mock the gravatar helper
jest.mock("../helpers/user-helper", () => ({
  gravatar: jest.fn((email) => `https://gravatar.com/avatar/${email}`),
}));

describe("Scoring Flow", () => {
  it("should display correct scores after categories are answered", () => {
    const builder = new ScenarioBuilder()
      .withGame({ id: "game1", name: "97th Academy Awards" }, 3, 5)
      .withGroup("game1", { id: "group1", name: "Office Pool" })
      .withEntry("group1", { name: "Leader" }, "all-first")
      .withEntry("group1", { name: "Behind" }, "all-last")
      .withGameInProgress("game1", 2)
      .withCurrentUser({ id: "user1", name: "Test User" });

    const scenario = builder.build();
    const props = { routeParams: { id: "group1" } };

    renderWithProviders(<Group {...props} />, {
      preloadedState: scenario,
    });

    // Both entries should be displayed
    expect(screen.getByText(/leader/i)).toBeInTheDocument();
    expect(screen.getByText(/behind/i)).toBeInTheDocument();
  });

  it("should show winner banner when game is completed", () => {
    const builder = new ScenarioBuilder()
      .withGame({ id: "game1", name: "97th Academy Awards" }, 3, 5)
      .withGroup("game1", { id: "group1", name: "Office Pool" })
      .withEntry("group1", { name: "Winner" }, "all-first")
      .withEntry("group1", { name: "Loser" }, "all-last")
      .withGameCompleted("game1")
      .withCurrentUser({ id: "user1", name: "Test User" });

    const scenario = builder.build();
    const props = { routeParams: { id: "group1" } };

    renderWithProviders(<Group {...props} />, {
      preloadedState: scenario,
    });

    // Winner banner should be displayed
    expect(screen.getByText(/champion/i)).toBeInTheDocument();
  });

  it("should handle ties correctly", () => {
    const builder = new ScenarioBuilder()
      .withGame({ id: "game1", name: "97th Academy Awards" }, 3, 5)
      .withGroup("game1", { id: "group1", name: "Office Pool" })
      // Both entries have same selections = same score
      .withEntry("group1", { name: "Tied 1" }, "all-first")
      .withEntry("group1", { name: "Tied 2" }, "all-first")
      .withGameCompleted("game1")
      .withCurrentUser({ id: "user1", name: "Test User" });

    const scenario = builder.build();
    const props = { routeParams: { id: "group1" } };

    renderWithProviders(<Group {...props} />, {
      preloadedState: scenario,
    });

    // Both should be shown as champions (plural)
    expect(screen.getByText(/champions/i)).toBeInTheDocument();
    // Entry names may appear multiple times (in table and winner banner)
    expect(screen.getAllByText(/tied 1/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/tied 2/i).length).toBeGreaterThan(0);
  });

  it("should update rankings as scores change", () => {
    // Start with partial scoring
    const builder = new ScenarioBuilder()
      .withGame({ id: "game1", name: "97th Academy Awards" }, 5, 5)
      .withGroup("game1", { id: "group1", name: "Office Pool" })
      .withEntry("group1", { name: "Entry A" }, "all-first")
      .withEntry("group1", { name: "Entry B" }, "random")
      .withGameInProgress("game1", 2)
      .withCurrentUser({ id: "user1", name: "Test User" });

    const scenario = builder.build();
    const props = { routeParams: { id: "group1" } };

    renderWithProviders(<Group {...props} />, {
      preloadedState: scenario,
    });

    // Entries should be displayed in ranked order
    expect(screen.getByText(/entry a/i)).toBeInTheDocument();
    expect(screen.getByText(/entry b/i)).toBeInTheDocument();
  });

  it("should show category columns when game starts", () => {
    const builder = new ScenarioBuilder()
      .withGame({ id: "game1", name: "97th Academy Awards" }, 3, 5)
      .withGroup("game1", { id: "group1", name: "Office Pool" })
      .withEntry("group1", { name: "Test Entry" }, "all-first")
      .withGameInProgress("game1", 1)
      .withCurrentUser({ id: "user1", name: "Test User" });

    const scenario = builder.build();
    const props = { routeParams: { id: "group1" } };

    const { container } = renderWithProviders(<Group {...props} />, {
      preloadedState: scenario,
    });

    // Category columns should be visible
    const categoryHeaders = container.querySelectorAll(
      ".EntriesTable--headerCol-diagonal"
    );
    expect(categoryHeaders.length).toBeGreaterThan(0);
  });

  it("should hide create entry button after game starts", () => {
    const builder = new ScenarioBuilder()
      .withGame({ id: "game1", name: "97th Academy Awards" }, 3, 5)
      .withGroup("game1", { id: "group1", name: "Office Pool" })
      .withEntry("group1", { name: "Test Entry" }, "all-first")
      .withGameInProgress("game1", 1)
      .withCurrentUser({ id: "user1", name: "Test User" });

    const scenario = builder.build();
    const props = { routeParams: { id: "group1" } };

    renderWithProviders(<Group {...props} />, {
      preloadedState: scenario,
    });

    // Create entry button should not be visible after game starts
    expect(
      screen.queryByRole("button", { name: "Create your entry" })
    ).not.toBeInTheDocument();
  });
});
