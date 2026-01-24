import React from "react";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Group from "./Group";
import { renderWithProviders } from "../../testUtils/testUtils";
import { ScenarioBuilder } from "../../testUtils/factories";
import { Map, List, fromJS } from "immutable";
import User from "../../models/User";

// Mock the gravatar helper
jest.mock("../../helpers/user-helper", () => ({
  gravatar: jest.fn((email) => `https://gravatar.com/avatar/${email}`),
}));

describe("Group", () => {
  const createGroupScenario = () => {
    return new ScenarioBuilder()
      .withGame({ id: "game1", name: "97th Academy Awards" }, 5, 5)
      .withGroup("game1", { id: "group1", name: "Office Pool" })
      .withEntry("group1", { name: "Alice" }, "all-first")
      .withEntry("group1", { name: "Bob" }, "random")
      .withCurrentUser({ id: "user1", name: "Test User", email: "test@example.com" });
  };

  it("should render group name and game name", () => {
    const scenario = createGroupScenario().build();
    const props = { routeParams: { id: "group1" } };

    renderWithProviders(<Group {...props} />, {
      preloadedState: scenario,
    });

    expect(screen.getByText("Office Pool")).toBeInTheDocument();
    expect(screen.getByText("97th Academy Awards")).toBeInTheDocument();
  });

  it("should handle missing group gracefully", () => {
    // Create a scenario without the group we're looking for
    const scenario = new ScenarioBuilder()
      .withCurrentUser({ id: "user1", name: "Test User", email: "test@example.com" })
      .build();
    const props = { routeParams: { id: "nonexistent-group" } };

    const { container } = renderWithProviders(<Group {...props} />, {
      preloadedState: scenario,
    });

    // Component should render without crashing - either shows loading or minimal content
    // The selector returns undefined for non-existent group, triggering loading state
    expect(container.querySelector(".Group")).toBeInTheDocument();
  });

  it("should show create entry button when game has not started", () => {
    const scenario = createGroupScenario().build();
    const props = { routeParams: { id: "group1" } };

    renderWithProviders(<Group {...props} />, {
      preloadedState: scenario,
    });

    expect(
      screen.getByRole("button", { name: "Create your entry" })
    ).toBeInTheDocument();
  });

  it("should hide create entry button when game has started", () => {
    const scenario = createGroupScenario()
      .withGameInProgress("game1", 1)
      .build();
    const props = { routeParams: { id: "group1" } };

    renderWithProviders(<Group {...props} />, {
      preloadedState: scenario,
    });

    expect(
      screen.queryByRole("button", { name: "Create your entry" })
    ).not.toBeInTheDocument();
  });

  it("should show winner banner when game is completed", () => {
    const scenario = createGroupScenario()
      .withGameCompleted("game1")
      .build();
    const props = { routeParams: { id: "group1" } };

    renderWithProviders(<Group {...props} />, {
      preloadedState: scenario,
    });

    // WinnerBanner shows either "Congratulations Champion!" or "Contratulations Champions!"
    const winnerText = screen.queryByText(/champion/i);
    expect(winnerText).toBeInTheDocument();
  });

  it("should not show winner banner when game not completed", () => {
    const scenario = createGroupScenario().build();
    const props = { routeParams: { id: "group1" } };

    renderWithProviders(<Group {...props} />, {
      preloadedState: scenario,
    });

    expect(screen.queryByText(/congratulations/i)).not.toBeInTheDocument();
  });

  it("should show edit values button only for group admin", () => {
    const builder = createGroupScenario();
    const scenario = builder.withGroupAdmin("group1", "user1").build();
    const props = { routeParams: { id: "group1" } };

    renderWithProviders(<Group {...props} />, {
      preloadedState: scenario,
    });

    expect(
      screen.getByRole("button", { name: "Edit Category Values" })
    ).toBeInTheDocument();
  });

  it("should not show edit values button for non-admin", () => {
    const scenario = createGroupScenario()
      .withGroupAdmin("group1", "different-user")
      .build();
    const props = { routeParams: { id: "group1" } };

    renderWithProviders(<Group {...props} />, {
      preloadedState: scenario,
    });

    expect(
      screen.queryByRole("button", { name: "Edit Category Values" })
    ).not.toBeInTheDocument();
  });

  it("should render entries table with entries", () => {
    const scenario = createGroupScenario().build();
    const props = { routeParams: { id: "group1" } };

    renderWithProviders(<Group {...props} />, {
      preloadedState: scenario,
    });

    // Should have Entry Name header
    expect(screen.getByText("Entry Name")).toBeInTheDocument();
  });

  it("should dispatch openModal action when create entry is clicked", async () => {
    const user = userEvent.setup();
    const scenario = createGroupScenario().build();
    const props = { routeParams: { id: "group1" } };

    const { store } = renderWithProviders(<Group {...props} />, {
      preloadedState: scenario,
    });

    await user.click(screen.getByRole("button", { name: "Create your entry" }));

    // Check that the modal state has changed
    expect(store.getState().ui.modal).toBe("NEW_ENTRY");
  });

  it("should dispatch openModal action when edit values is clicked", async () => {
    const user = userEvent.setup();
    const scenario = createGroupScenario()
      .withGroupAdmin("group1", "user1")
      .build();
    const props = { routeParams: { id: "group1" } };

    const { store } = renderWithProviders(<Group {...props} />, {
      preloadedState: scenario,
    });

    await user.click(screen.getByRole("button", { name: "Edit Category Values" }));

    // Check that the modal state has changed to EDIT_VALUES
    expect(store.getState().ui.modal).toBe("EDIT_VALUES");
  });
});
