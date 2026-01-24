import React from "react";
import { screen } from "@testing-library/react";
import UserEntriesGroup from "./UserEntriesGroup";
import { renderWithProviders } from "../../../../testUtils/testUtils";
import { ScenarioBuilder } from "../../../../testUtils/factories";
import { List } from "immutable";

describe("UserEntriesGroup", () => {
  it("should render group with game name and group name", () => {
    const builder = new ScenarioBuilder()
      .withGame({ id: "game1", name: "97th Academy Awards" }, 3, 3)
      .withGroup("game1", { id: "group1", name: "Office Pool" })
      .withEntry("group1", { name: "User 1" }, "all-first")
      .withEntry("group1", { name: "User 2" }, "all-last");

    const ids = builder.getIds();
    const scenario = builder.build();

    // Get entries as a List
    const entries = List([
      scenario.entries.get(ids.entryIds[0]),
      scenario.entries.get(ids.entryIds[1]),
    ]);

    renderWithProviders(
      <UserEntriesGroup group={entries} groupId="group1" />,
      { preloadedState: scenario }
    );

    expect(screen.getByText("97th Academy Awards")).toBeInTheDocument();
    expect(screen.getByText("Office Pool")).toBeInTheDocument();
  });

  it("should render group name as link to group page", () => {
    const builder = new ScenarioBuilder()
      .withGame({ id: "game1", name: "Test Game" }, 2, 2)
      .withGroup("game1", { id: "group1", name: "Test Group" })
      .withEntry("group1", { name: "User 1" }, "all-first");

    const ids = builder.getIds();
    const scenario = builder.build();

    const entries = List([scenario.entries.get(ids.entryIds[0])]);

    renderWithProviders(
      <UserEntriesGroup group={entries} groupId="group1" />,
      { preloadedState: scenario }
    );

    const groupLink = screen.getByText("Test Group");
    expect(groupLink).toHaveAttribute("href", "/groups/group1");
  });

  it("should render user entries", () => {
    const builder = new ScenarioBuilder()
      .withGame({ id: "game1", name: "Test Game" }, 2, 2)
      .withGroup("game1", { id: "group1", name: "Test Group" })
      .withEntry("group1", { id: "user1", name: "User 1" }, "all-first")
      .withEntry("group1", { id: "user2", name: "User 2" }, "all-first");

    const ids = builder.getIds();
    const scenario = builder.build();

    const entries = List([
      scenario.entries.get(ids.entryIds[0]),
      scenario.entries.get(ids.entryIds[1]),
    ]);

    const { container } = renderWithProviders(
      <UserEntriesGroup group={entries} groupId="group1" />,
      { preloadedState: scenario }
    );

    const entriesContainer = container.querySelector(
      ".UserEntriesGroup--entries-container"
    );
    expect(entriesContainer).toBeInTheDocument();
  });
});
