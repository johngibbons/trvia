import React from "react";
import { screen } from "@testing-library/react";
import UserEntries from "./UserEntries";
import { renderWithProviders } from "../../../testUtils/testUtils";
import { ScenarioBuilder } from "../../../testUtils/factories";
import User from "../../../models/User";
import { Map } from "immutable";

// Mock the UserEntriesGroup to simplify testing
jest.mock("./userEntriesGroup/UserEntriesGroup", () => {
  return function MockUserEntriesGroup({ group }) {
    return (
      <div data-testid="user-entries-group">
        {group.size} entries in group
      </div>
    );
  };
});

describe("UserEntries", () => {
  const createScenarioWithEntries = () => {
    const builder = new ScenarioBuilder()
      .withGame({ id: "game1", name: "97th Academy Awards" }, 3, 5)
      .withGroup("game1", { id: "group1", name: "Office Pool" })
      .withGroup("game1", { id: "group2", name: "Family Pool" })
      .withCurrentUser({ id: "user1", name: "Test User", email: "test@example.com" })
      // Pass the user ID to link entries to the current user
      .withEntry("group1", { id: "user1", name: "Test User" }, "all-first")
      .withEntry("group2", { id: "user1", name: "Test User" }, "random");

    return builder;
  };

  it("should render the page heading", () => {
    const builder = createScenarioWithEntries();
    const scenario = builder.build();
    const props = { routeParams: { id: "user1" } };

    renderWithProviders(<UserEntries {...props} />, {
      preloadedState: scenario,
    });

    expect(screen.getByText("My Entries")).toBeInTheDocument();
  });

  it("should render 'No entries yet' when user has no entries", () => {
    const scenario = new ScenarioBuilder()
      .withGame({ id: "game1", name: "97th Academy Awards" }, 3, 5)
      .withCurrentUser({ id: "user1", name: "Test User", email: "test@example.com" })
      .build();
    const props = { routeParams: { id: "user1" } };

    renderWithProviders(<UserEntries {...props} />, {
      preloadedState: scenario,
    });

    expect(screen.getByText("No entries yet.")).toBeInTheDocument();
  });

  it("should render UserEntriesGroup for each group with entries", () => {
    const builder = createScenarioWithEntries();
    const scenario = builder.build();
    const props = { routeParams: { id: "user1" } };

    renderWithProviders(<UserEntries {...props} />, {
      preloadedState: scenario,
    });

    const entryGroups = screen.getAllByTestId("user-entries-group");
    expect(entryGroups.length).toBeGreaterThan(0);
  });
});
