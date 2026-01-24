import React from "react";
import { screen } from "@testing-library/react";
import Game from "./Game";
import { renderWithProviders } from "../../testUtils/testUtils";
import { createGame } from "../../testUtils/factories";
import { Map } from "immutable";

describe("Game", () => {
  it("should show loading state when game is not loaded", () => {
    const preloadedState = {
      games: Map(),
    };
    const props = { routeParams: { id: "game1" } };

    renderWithProviders(<Game {...props} />, {
      preloadedState,
    });

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("should render game name when game is loaded", () => {
    const game = createGame({ id: "game1", name: "97th Academy Awards" });
    const preloadedState = {
      games: Map({ game1: game }),
    };
    const props = { routeParams: { id: "game1" } };

    renderWithProviders(<Game {...props} />, {
      preloadedState,
    });

    expect(screen.getByText("97th Academy Awards")).toBeInTheDocument();
  });
});
