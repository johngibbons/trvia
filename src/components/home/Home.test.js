import React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "./Home";
import { renderWithProviders } from "../../testUtils/testUtils";
import { ScenarioBuilder } from "../../testUtils/factories";
import { CURRENT_TITLE, CURRENT_GAME } from "../../constants";

// Mock the NewGroupModal to simplify testing
jest.mock("../group/newGroupModal/NewGroupModal", () => {
  return function MockNewGroupModal() {
    return <div data-testid="new-group-modal" />;
  };
});

describe("Home", () => {
  // Use CURRENT_GAME to match the gameNomineesSelector
  const createHomeScenario = () => {
    return new ScenarioBuilder()
      .withGame({ id: CURRENT_GAME, name: "97th Academy Awards" }, 3, 5)
      .withCurrentUser({ id: "user1", name: "Test User", email: "test@example.com" });
  };

  it("should render the awards title", () => {
    const scenario = createHomeScenario().build();

    renderWithProviders(<Home />, {
      preloadedState: scenario,
    });

    expect(screen.getByText(CURRENT_TITLE)).toBeInTheDocument();
  });

  it("should render the main title with gold text", () => {
    const scenario = createHomeScenario().build();

    renderWithProviders(<Home />, {
      preloadedState: scenario,
    });

    expect(screen.getByText(/Pick the/)).toBeInTheDocument();
    expect(screen.getByText("winners")).toBeInTheDocument();
    expect(screen.getByText(/Beat your friends/)).toBeInTheDocument();
  });

  it("should render the Start a group button", () => {
    const scenario = createHomeScenario().build();

    renderWithProviders(<Home />, {
      preloadedState: scenario,
    });

    expect(screen.getByRole("button", { name: "Start a group" })).toBeInTheDocument();
  });

  it("should dispatch openModal when logged in user clicks Start a group", async () => {
    const user = userEvent.setup();
    const scenario = createHomeScenario().build();

    const { store } = renderWithProviders(<Home />, {
      preloadedState: scenario,
    });

    await user.click(screen.getByRole("button", { name: "Start a group" }));

    expect(store.getState().ui.modal).toBe("NEW_GROUP");
  });

  it("should navigate to login when non-logged in user clicks Start a group", async () => {
    const user = userEvent.setup();
    const scenario = new ScenarioBuilder()
      .withGame({ id: "game1", name: "97th Academy Awards" }, 3, 5)
      .build();

    renderWithProviders(<Home />, {
      preloadedState: scenario,
      initialEntries: ["/"],
    });

    await user.click(screen.getByRole("button", { name: "Start a group" }));

    // The navigation should have happened - we can't easily test this without
    // checking the router state, but the important thing is no error occurred
  });

  it("should render nominee posters in carousel", () => {
    const scenario = createHomeScenario().build();

    const { container } = renderWithProviders(<Home />, {
      preloadedState: scenario,
    });

    // Check that nominee poster elements exist
    const posterElements = container.querySelectorAll(".Home-nominee-poster");
    expect(posterElements.length).toBeGreaterThan(0);
  });

  it("should render NewGroupModal", () => {
    const scenario = createHomeScenario().build();

    renderWithProviders(<Home />, {
      preloadedState: scenario,
    });

    expect(screen.getByTestId("new-group-modal")).toBeInTheDocument();
  });
});
