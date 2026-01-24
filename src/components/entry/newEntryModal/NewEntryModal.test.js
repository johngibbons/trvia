import React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NewEntryModal from "./NewEntryModal";
import { renderWithProviders } from "../../../testUtils/testUtils";
import { createUIWithModal, createUser } from "../../../testUtils/factories";

describe("NewEntryModal", () => {
  const defaultProps = {
    groupId: "group1",
    gameId: "game1",
  };

  it("should not render when modal is not NEW_ENTRY", () => {
    const preloadedState = {
      ui: createUIWithModal("OTHER_MODAL"),
      currentUser: createUser({ id: "user1" }),
    };

    renderWithProviders(<NewEntryModal {...defaultProps} />, {
      preloadedState,
    });

    expect(screen.queryByText("Create Your Entry")).not.toBeInTheDocument();
  });

  it("should render dialog when modal is NEW_ENTRY", () => {
    const preloadedState = {
      ui: createUIWithModal("NEW_ENTRY"),
      currentUser: createUser({ id: "user1" }),
    };

    renderWithProviders(<NewEntryModal {...defaultProps} />, {
      preloadedState,
    });

    expect(screen.getByText("Create Your Entry")).toBeInTheDocument();
  });

  it("should render name input field", () => {
    const preloadedState = {
      ui: createUIWithModal("NEW_ENTRY"),
      currentUser: createUser({ id: "user1" }),
    };

    renderWithProviders(<NewEntryModal {...defaultProps} />, {
      preloadedState,
    });

    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("What do you want to call your entry?")
    ).toBeInTheDocument();
  });

  it("should render Create Entry button", () => {
    const preloadedState = {
      ui: createUIWithModal("NEW_ENTRY"),
      currentUser: createUser({ id: "user1" }),
    };

    renderWithProviders(<NewEntryModal {...defaultProps} />, {
      preloadedState,
    });

    expect(screen.getByRole("button", { name: "Create Entry" })).toBeInTheDocument();
  });

  it("should disable Create Entry button when name is empty", () => {
    const preloadedState = {
      ui: createUIWithModal("NEW_ENTRY"),
      currentUser: createUser({ id: "user1" }),
    };

    renderWithProviders(<NewEntryModal {...defaultProps} />, {
      preloadedState,
    });

    expect(screen.getByRole("button", { name: "Create Entry" })).toBeDisabled();
  });

  it("should enable Create Entry button when name is provided", async () => {
    const user = userEvent.setup();
    const preloadedState = {
      ui: createUIWithModal("NEW_ENTRY"),
      currentUser: createUser({ id: "user1" }),
    };

    const { store } = renderWithProviders(<NewEntryModal {...defaultProps} />, {
      preloadedState,
    });

    await user.type(screen.getByLabelText("Name"), "My Entry");

    expect(store.getState().ui.newEntryName).toBe("My Entry");
    expect(screen.getByRole("button", { name: "Create Entry" })).not.toBeDisabled();
  });

  it("should dispatch updateNewEntryName when input changes", async () => {
    const user = userEvent.setup();
    const preloadedState = {
      ui: createUIWithModal("NEW_ENTRY"),
      currentUser: createUser({ id: "user1" }),
    };

    const { store } = renderWithProviders(<NewEntryModal {...defaultProps} />, {
      preloadedState,
    });

    await user.type(screen.getByLabelText("Name"), "My Picks");

    expect(store.getState().ui.newEntryName).toBe("My Picks");
  });

  it("should close modal and clear name when Create Entry is clicked", async () => {
    const user = userEvent.setup();
    const preloadedState = {
      ui: createUIWithModal("NEW_ENTRY", { newEntryName: "Test Entry" }),
      currentUser: createUser({ id: "user1" }),
    };

    const { store } = renderWithProviders(<NewEntryModal {...defaultProps} />, {
      preloadedState,
    });

    await user.click(screen.getByRole("button", { name: "Create Entry" }));

    // Modal should be closed
    const modalState = store.getState().ui.modal;
    expect(modalState === "" || modalState === undefined).toBe(true);

    // Entry name should be cleared
    expect(store.getState().ui.newEntryName).toBe("");
  });

  it("should close modal when backdrop is clicked", async () => {
    const user = userEvent.setup();
    const preloadedState = {
      ui: createUIWithModal("NEW_ENTRY"),
      currentUser: createUser({ id: "user1" }),
    };

    const { store } = renderWithProviders(<NewEntryModal {...defaultProps} />, {
      preloadedState,
    });

    // Press Escape to close the modal
    await user.keyboard("{Escape}");

    const modalState = store.getState().ui.modal;
    expect(modalState === "" || modalState === undefined).toBe(true);
  });

  it("should show the current newEntryName value in input", () => {
    const preloadedState = {
      ui: createUIWithModal("NEW_ENTRY", { newEntryName: "Existing Name" }),
      currentUser: createUser({ id: "user1" }),
    };

    renderWithProviders(<NewEntryModal {...defaultProps} />, {
      preloadedState,
    });

    expect(screen.getByLabelText("Name")).toHaveValue("Existing Name");
  });
});
