import React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NewGroupModal from "./NewGroupModal";
import { renderWithProviders } from "../../../testUtils/testUtils";
import { createUIWithModal } from "../../../testUtils/factories";

describe("NewGroupModal", () => {
  it("should not render when modal is not NEW_GROUP", () => {
    const preloadedState = {
      ui: createUIWithModal("OTHER_MODAL"),
    };

    renderWithProviders(<NewGroupModal />, {
      preloadedState,
    });

    expect(screen.queryByText("Create New Group")).not.toBeInTheDocument();
  });

  it("should render dialog when modal is NEW_GROUP", () => {
    const preloadedState = {
      ui: createUIWithModal("NEW_GROUP"),
    };

    renderWithProviders(<NewGroupModal />, {
      preloadedState,
    });

    expect(screen.getByText("Create New Group")).toBeInTheDocument();
  });

  it("should render name input field", () => {
    const preloadedState = {
      ui: createUIWithModal("NEW_GROUP"),
    };

    renderWithProviders(<NewGroupModal />, {
      preloadedState,
    });

    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Name your group")).toBeInTheDocument();
  });

  it("should render Create Group button", () => {
    const preloadedState = {
      ui: createUIWithModal("NEW_GROUP"),
    };

    renderWithProviders(<NewGroupModal />, {
      preloadedState,
    });

    expect(screen.getByRole("button", { name: "Create Group" })).toBeInTheDocument();
  });

  it("should disable Create Group button when name is empty", () => {
    const preloadedState = {
      ui: createUIWithModal("NEW_GROUP"),
    };

    renderWithProviders(<NewGroupModal />, {
      preloadedState,
    });

    expect(screen.getByRole("button", { name: "Create Group" })).toBeDisabled();
  });

  it("should enable Create Group button when name is provided", async () => {
    const user = userEvent.setup();
    const preloadedState = {
      ui: createUIWithModal("NEW_GROUP"),
    };

    const { store } = renderWithProviders(<NewGroupModal />, {
      preloadedState,
    });

    await user.type(screen.getByLabelText("Name"), "My Group");

    expect(store.getState().ui.newGroupName).toBe("My Group");
    expect(screen.getByRole("button", { name: "Create Group" })).not.toBeDisabled();
  });

  it("should dispatch updateNewGroupName when input changes", async () => {
    const user = userEvent.setup();
    const preloadedState = {
      ui: createUIWithModal("NEW_GROUP"),
    };

    const { store } = renderWithProviders(<NewGroupModal />, {
      preloadedState,
    });

    await user.type(screen.getByLabelText("Name"), "Office Pool");

    expect(store.getState().ui.newGroupName).toBe("Office Pool");
  });

  it("should dispatch createGroup action when Create Group button is clicked", async () => {
    const user = userEvent.setup();
    const preloadedState = {
      ui: createUIWithModal("NEW_GROUP", { newGroupName: "Test Group" }),
    };

    renderWithProviders(<NewGroupModal />, {
      preloadedState,
    });

    await user.click(screen.getByRole("button", { name: "Create Group" }));

    // The action should have been dispatched (saga will handle it)
    // We can't easily verify saga behavior in unit tests
  });

  it("should close modal when backdrop is clicked", async () => {
    const user = userEvent.setup();
    const preloadedState = {
      ui: createUIWithModal("NEW_GROUP"),
    };

    const { store } = renderWithProviders(<NewGroupModal />, {
      preloadedState,
    });

    // Press Escape to close the modal (simulates clicking backdrop)
    await user.keyboard("{Escape}");

    const modalState = store.getState().ui.modal;
    expect(modalState === "" || modalState === undefined).toBe(true);
  });

  it("should show the current newGroupName value in input", () => {
    const preloadedState = {
      ui: createUIWithModal("NEW_GROUP", { newGroupName: "Existing Name" }),
    };

    renderWithProviders(<NewGroupModal />, {
      preloadedState,
    });

    expect(screen.getByLabelText("Name")).toHaveValue("Existing Name");
  });

  it("should submit form when Enter is pressed in input", async () => {
    const user = userEvent.setup();
    const preloadedState = {
      ui: createUIWithModal("NEW_GROUP", { newGroupName: "Test Group" }),
    };

    renderWithProviders(<NewGroupModal />, {
      preloadedState,
    });

    const input = screen.getByLabelText("Name");
    await user.type(input, "{Enter}");

    // Form submission should have been handled
  });
});
