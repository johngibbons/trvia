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

describe("Create Entry Flow", () => {
  it("should open new entry modal when create entry button is clicked", async () => {
    const user = userEvent.setup();
    const scenario = new ScenarioBuilder()
      .withGame({ id: "game1", name: "97th Academy Awards" }, 5, 5)
      .withGroup("game1", { id: "group1", name: "Office Pool" })
      .withCurrentUser({ id: "user1", name: "Test User", email: "test@example.com" })
      .build();

    const props = { routeParams: { id: "group1" } };

    const { store } = renderWithProviders(<Group {...props} />, {
      preloadedState: scenario,
    });

    // Click create entry button
    const createButton = screen.getByRole("button", { name: "Create your entry" });
    await user.click(createButton);

    // Verify modal state changed
    expect(store.getState().ui.modal).toBe("NEW_ENTRY");
  });

  it("should allow editing category values as admin", async () => {
    const user = userEvent.setup();
    const scenario = new ScenarioBuilder()
      .withGame({ id: "game1", name: "97th Academy Awards" }, 5, 5)
      .withGroup("game1", { id: "group1", name: "Office Pool" })
      .withGroupAdmin("group1", "user1")
      .withCurrentUser({ id: "user1", name: "Test User", email: "test@example.com" })
      .build();

    const props = { routeParams: { id: "group1" } };

    const { store } = renderWithProviders(<Group {...props} />, {
      preloadedState: scenario,
    });

    // Click edit values button
    const editButton = screen.getByRole("button", { name: "Edit Category Values" });
    await user.click(editButton);

    // Verify modal state changed
    expect(store.getState().ui.modal).toBe("EDIT_VALUES");
  });

  it("should display entries in ranked order", () => {
    const scenario = new ScenarioBuilder()
      .withGame({ id: "game1", name: "97th Academy Awards" }, 5, 5)
      .withGroup("game1", { id: "group1", name: "Office Pool" })
      .withEntry("group1", { name: "Alice" }, "all-first")
      .withEntry("group1", { name: "Bob" }, "all-last")
      .withEntry("group1", { name: "Charlie" }, "random")
      .withGameInProgress("game1", 3)
      .withCurrentUser({ id: "user1", name: "Test User" })
      .build();

    const props = { routeParams: { id: "group1" } };

    renderWithProviders(<Group {...props} />, {
      preloadedState: scenario,
    });

    // All three entries should be displayed
    expect(screen.getByText(/alice/i)).toBeInTheDocument();
    expect(screen.getByText(/bob/i)).toBeInTheDocument();
    expect(screen.getByText(/charlie/i)).toBeInTheDocument();
  });
});
