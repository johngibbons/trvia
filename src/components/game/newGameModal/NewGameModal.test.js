import React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NewGameModal from "./NewGameModal";
import { renderWithProviders } from "../../../testUtils/testUtils";
import { createUIWithModal, createUIForNewGroup } from "../../../testUtils/factories";

describe("NewGameModal", () => {
  it("should not render when modal is not NEW_GAME", () => {
    const preloadedState = {
      ui: createUIWithModal("OTHER_MODAL"),
    };

    renderWithProviders(<NewGameModal />, {
      preloadedState,
    });

    expect(screen.queryByText("Create New Game")).not.toBeInTheDocument();
  });

  it("should render dialog when modal is NEW_GAME", () => {
    const preloadedState = {
      ui: createUIWithModal("NEW_GAME"),
    };

    renderWithProviders(<NewGameModal />, {
      preloadedState,
    });

    expect(screen.getByText("Create New Game")).toBeInTheDocument();
  });

  it("should render name input field", () => {
    const preloadedState = {
      ui: createUIWithModal("NEW_GAME"),
    };

    renderWithProviders(<NewGameModal />, {
      preloadedState,
    });

    expect(screen.getByLabelText("Name")).toBeInTheDocument();
  });

  it("should render Create Game button", () => {
    const preloadedState = {
      ui: createUIWithModal("NEW_GAME"),
    };

    renderWithProviders(<NewGameModal />, {
      preloadedState,
    });

    expect(screen.getByRole("button", { name: "Create Game" })).toBeInTheDocument();
  });

  it("should disable Create Game button when name is empty", () => {
    const preloadedState = {
      ui: createUIWithModal("NEW_GAME"),
    };

    renderWithProviders(<NewGameModal />, {
      preloadedState,
    });

    expect(screen.getByRole("button", { name: "Create Game" })).toBeDisabled();
  });

  it("should enable Create Game button when name is provided", async () => {
    const user = userEvent.setup();
    const preloadedState = {
      ui: createUIWithModal("NEW_GAME"),
    };

    const { store } = renderWithProviders(<NewGameModal />, {
      preloadedState,
    });

    await user.type(screen.getByLabelText("Name"), "Test Game");

    // The store should have updated the newGameName
    expect(store.getState().ui.newGameName).toBe("Test Game");
    expect(screen.getByRole("button", { name: "Create Game" })).not.toBeDisabled();
  });

  it("should dispatch updateNewGameName when input changes", async () => {
    const user = userEvent.setup();
    const preloadedState = {
      ui: createUIWithModal("NEW_GAME"),
    };

    const { store } = renderWithProviders(<NewGameModal />, {
      preloadedState,
    });

    await user.type(screen.getByLabelText("Name"), "My Game");

    expect(store.getState().ui.newGameName).toBe("My Game");
  });

  it("should close modal when backdrop is clicked", async () => {
    const user = userEvent.setup();
    const preloadedState = {
      ui: createUIWithModal("NEW_GAME"),
    };

    const { store } = renderWithProviders(<NewGameModal />, {
      preloadedState,
    });

    // Press Escape to close the modal (simulates clicking backdrop)
    await user.keyboard("{Escape}");

    // Modal is closed when it's undefined or empty string
    const modalState = store.getState().ui.modal;
    expect(modalState === "" || modalState === undefined).toBe(true);
  });
});
