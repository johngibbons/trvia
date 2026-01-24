import React from "react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../testUtils/testUtils";
import { ScenarioBuilder } from "../testUtils/factories";
import Group from "../components/group/Group";

// Mock the gravatar helper
jest.mock("../helpers/user-helper", () => ({
  gravatar: jest.fn((email) => `https://gravatar.com/avatar/${email}`),
}));

describe("Group Management Flow", () => {
  it("should display group information correctly", () => {
    const scenario = new ScenarioBuilder()
      .withGame({ id: "game1", name: "97th Academy Awards" }, 5, 5)
      .withGroup("game1", { id: "group1", name: "Office Pool" })
      .withEntry("group1", { name: "Test Entry" }, "all-first")
      .withCurrentUser({ id: "user1", name: "Test User" })
      .build();

    const props = { routeParams: { id: "group1" } };

    renderWithProviders(<Group {...props} />, {
      preloadedState: scenario,
    });

    expect(screen.getByText("Office Pool")).toBeInTheDocument();
    expect(screen.getByText("97th Academy Awards")).toBeInTheDocument();
  });

  it("should show admin controls only for group admin", () => {
    const scenario = new ScenarioBuilder()
      .withGame({ id: "game1", name: "97th Academy Awards" }, 5, 5)
      .withGroup("game1", { id: "group1", name: "Office Pool" })
      .withGroupAdmin("group1", "user1")
      .withEntry("group1", { name: "Test Entry" }, "all-first")
      .withCurrentUser({ id: "user1", name: "Test User" })
      .build();

    const props = { routeParams: { id: "group1" } };

    renderWithProviders(<Group {...props} />, {
      preloadedState: scenario,
    });

    expect(
      screen.getByRole("button", { name: "Edit Category Values" })
    ).toBeInTheDocument();
  });

  it("should not show admin controls for non-admin", () => {
    const scenario = new ScenarioBuilder()
      .withGame({ id: "game1", name: "97th Academy Awards" }, 5, 5)
      .withGroup("game1", { id: "group1", name: "Office Pool" })
      .withGroupAdmin("group1", "other-user")
      .withEntry("group1", { name: "Test Entry" }, "all-first")
      .withCurrentUser({ id: "user1", name: "Test User" })
      .build();

    const props = { routeParams: { id: "group1" } };

    renderWithProviders(<Group {...props} />, {
      preloadedState: scenario,
    });

    expect(
      screen.queryByRole("button", { name: "Edit Category Values" })
    ).not.toBeInTheDocument();
  });

  it("should handle multiple entries in group", () => {
    const scenario = new ScenarioBuilder()
      .withGame({ id: "game1", name: "97th Academy Awards" }, 5, 5)
      .withGroup("game1", { id: "group1", name: "Office Pool" })
      .withEntry("group1", { name: "Alice's Entry" }, "all-first")
      .withEntry("group1", { name: "Bob's Entry" }, "random")
      .withEntry("group1", { name: "Charlie's Entry" }, "all-last")
      .withCurrentUser({ id: "user1", name: "Test User" })
      .build();

    const props = { routeParams: { id: "group1" } };

    renderWithProviders(<Group {...props} />, {
      preloadedState: scenario,
    });

    expect(screen.getByText(/alice's entry/i)).toBeInTheDocument();
    expect(screen.getByText(/bob's entry/i)).toBeInTheDocument();
    expect(screen.getByText(/charlie's entry/i)).toBeInTheDocument();
  });

  it("should handle empty group (no entries)", () => {
    const scenario = new ScenarioBuilder()
      .withGame({ id: "game1", name: "97th Academy Awards" }, 5, 5)
      .withGroup("game1", { id: "group1", name: "Office Pool" })
      .withCurrentUser({ id: "user1", name: "Test User" })
      .build();

    const props = { routeParams: { id: "group1" } };

    renderWithProviders(<Group {...props} />, {
      preloadedState: scenario,
    });

    // Should still render group info
    expect(screen.getByText("Office Pool")).toBeInTheDocument();
    // Create entry button should be visible
    expect(
      screen.getByRole("button", { name: "Create your entry" })
    ).toBeInTheDocument();
  });

  it("should open new entry modal on button click", async () => {
    const user = userEvent.setup();
    const scenario = new ScenarioBuilder()
      .withGame({ id: "game1", name: "97th Academy Awards" }, 5, 5)
      .withGroup("game1", { id: "group1", name: "Office Pool" })
      .withCurrentUser({ id: "user1", name: "Test User" })
      .build();

    const props = { routeParams: { id: "group1" } };

    const { store } = renderWithProviders(<Group {...props} />, {
      preloadedState: scenario,
    });

    await user.click(screen.getByRole("button", { name: "Create your entry" }));

    expect(store.getState().ui.modal).toBe("NEW_ENTRY");
  });

  it("should open edit values modal on button click for admin", async () => {
    const user = userEvent.setup();
    const scenario = new ScenarioBuilder()
      .withGame({ id: "game1", name: "97th Academy Awards" }, 5, 5)
      .withGroup("game1", { id: "group1", name: "Office Pool" })
      .withGroupAdmin("group1", "user1")
      .withCurrentUser({ id: "user1", name: "Test User" })
      .build();

    const props = { routeParams: { id: "group1" } };

    const { store } = renderWithProviders(<Group {...props} />, {
      preloadedState: scenario,
    });

    await user.click(
      screen.getByRole("button", { name: "Edit Category Values" })
    );

    expect(store.getState().ui.modal).toBe("EDIT_VALUES");
  });

  it("should handle loading state when group not yet loaded", () => {
    const scenario = new ScenarioBuilder()
      .withCurrentUser({ id: "user1", name: "Test User" })
      .build();

    const props = { routeParams: { id: "nonexistent" } };

    renderWithProviders(<Group {...props} />, {
      preloadedState: scenario,
    });

    // When group is not found, component shows loading state
    const loading = screen.queryByText("Loading...");
    // Either shows loading or the component doesn't render at all
    expect(loading || document.querySelector(".Group")).toBeTruthy();
  });
});
