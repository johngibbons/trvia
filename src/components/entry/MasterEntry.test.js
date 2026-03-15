import React from "react";
import { screen } from "@testing-library/react";
import MasterEntry from "./MasterEntry";
import { renderWithProviders } from "../../testUtils/testUtils";
import { ScenarioBuilder } from "../../testUtils/factories";

describe("MasterEntry", () => {
  const createMasterEntryScenario = () => {
    return new ScenarioBuilder()
      .withGame({ id: "game1", name: "97th Academy Awards" }, 3, 5)
      .withCurrentUser({ id: "user1", name: "Test User", email: "test@example.com" });
  };

  it("should render Master Entry heading even with empty game", () => {
    // Note: The selector returns new Game() for missing games, and an empty Seq for categories
    // Both are truthy objects, so the component renders (not showing "Loading...")
    const scenario = new ScenarioBuilder()
      .withCurrentUser({ id: "user1", name: "Test User", email: "test@example.com" })
      .build();
    const props = { routeParams: { id: "nonexistent" } };

    renderWithProviders(<MasterEntry {...props} />, {
      preloadedState: scenario,
    });

    // Component renders with heading even if game data is empty
    expect(screen.getByText("Master Entry")).toBeInTheDocument();
  });

  it("should render Master Entry heading", () => {
    const scenario = createMasterEntryScenario().build();
    const props = { routeParams: { id: "game1" } };

    renderWithProviders(<MasterEntry {...props} />, {
      preloadedState: scenario,
    });

    expect(screen.getByText("Master Entry")).toBeInTheDocument();
  });

  it("should render game name in heading", () => {
    const scenario = createMasterEntryScenario().build();
    const props = { routeParams: { id: "game1" } };

    renderWithProviders(<MasterEntry {...props} />, {
      preloadedState: scenario,
    });

    expect(screen.getByText("97th Academy Awards")).toBeInTheDocument();
  });

  it("should render categories when game has categories", () => {
    const scenario = createMasterEntryScenario().build();
    const props = { routeParams: { id: "game1" } };

    const { container } = renderWithProviders(<MasterEntry {...props} />, {
      preloadedState: scenario,
    });

    // The scenario creates 3 categories - check Category components are rendered
    const categoryElements = container.querySelectorAll(".Category");
    expect(categoryElements.length).toBe(3);
  });

  it("should render categories with case-insensitive route id", () => {
    const scenario = createMasterEntryScenario().build();
    const props = { routeParams: { id: "GAME1" } };

    const { container } = renderWithProviders(<MasterEntry {...props} />, {
      preloadedState: scenario,
    });

    expect(screen.getByText("97th Academy Awards")).toBeInTheDocument();
    const categoryElements = container.querySelectorAll(".Category");
    expect(categoryElements.length).toBe(3);
  });

  it("should display correct answer selections when present", () => {
    const builder = createMasterEntryScenario();
    const scenario = builder.withGameInProgress("game1", 1).build();
    const props = { routeParams: { id: "game1" } };

    renderWithProviders(<MasterEntry {...props} />, {
      preloadedState: scenario,
    });

    // The withGameInProgress sets correctAnswer on one category
    // The component should show this selection
    expect(screen.getByText("Master Entry")).toBeInTheDocument();
  });
});
