import React from "react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AccountDropdown from "./AccountDropdown";
import { renderWithProviders } from "../../../testUtils/testUtils";
import { createUser } from "../../../testUtils/factories";
import * as userActions from "../../../actions/user-actions";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("../../../actions/user-actions", () => ({
  signOut: jest.fn(() => ({ type: "SIGN_OUT" })),
}));

describe("AccountDropdown", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    jest.clearAllMocks();
  });

  it("should render user avatar button", () => {
    const currentUser = createUser({ id: "user1", name: "John Doe" });
    const preloadedState = { currentUser };

    const { container } = renderWithProviders(<AccountDropdown />, {
      preloadedState,
    });

    const iconButton = container.querySelector(".AccountDropdown-icon");
    expect(iconButton).toBeInTheDocument();
  });

  it("should open menu when avatar is clicked", async () => {
    const user = userEvent.setup();
    const currentUser = createUser({ id: "user1", name: "John Doe" });
    const preloadedState = { currentUser };

    const { container } = renderWithProviders(<AccountDropdown />, {
      preloadedState,
    });

    const iconButton = container.querySelector(".AccountDropdown-icon");
    await user.click(iconButton);

    await waitFor(() => {
      expect(screen.getByText("My Entries")).toBeInTheDocument();
      expect(screen.getByText("Sign out")).toBeInTheDocument();
    });
  });

  it("should navigate to user entries when My Entries is clicked", async () => {
    const user = userEvent.setup();
    const currentUser = createUser({ id: "user1", name: "John Doe" });
    const preloadedState = { currentUser };

    const { container } = renderWithProviders(<AccountDropdown />, {
      preloadedState,
    });

    // Open menu
    const iconButton = container.querySelector(".AccountDropdown-icon");
    await user.click(iconButton);

    // Click My Entries
    await waitFor(() => {
      expect(screen.getByText("My Entries")).toBeInTheDocument();
    });
    const myEntriesItem = screen.getByText("My Entries");
    await user.click(myEntriesItem);

    expect(mockNavigate).toHaveBeenCalledWith("/users/user1/entries");
  });

  it("should call sign out when Sign out is clicked", async () => {
    const user = userEvent.setup();
    const currentUser = createUser({ id: "user1", name: "John Doe" });
    const preloadedState = { currentUser };

    // Mock the signOut action to return a valid action
    userActions.signOut.mockReturnValue({ type: "SIGN_OUT" });

    const { container } = renderWithProviders(<AccountDropdown />, {
      preloadedState,
    });

    // Open menu
    const iconButton = container.querySelector(".AccountDropdown-icon");
    await user.click(iconButton);

    // Click Sign out
    await waitFor(() => {
      expect(screen.getByText("Sign out")).toBeInTheDocument();
    });
    const signOutItem = screen.getByText("Sign out");
    await user.click(signOutItem);

    // Verify the signOut action creator was called
    expect(userActions.signOut).toHaveBeenCalled();
  });

  it("should close menu when clicking outside", async () => {
    const user = userEvent.setup();
    const currentUser = createUser({ id: "user1", name: "John Doe" });
    const preloadedState = { currentUser };

    const { container } = renderWithProviders(<AccountDropdown />, {
      preloadedState,
    });

    // Open menu
    const iconButton = container.querySelector(".AccountDropdown-icon");
    await user.click(iconButton);

    await waitFor(() => {
      expect(screen.getByText("My Entries")).toBeInTheDocument();
    });

    // Click outside (escape key)
    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(screen.queryByText("My Entries")).not.toBeInTheDocument();
    });
  });

  it("should have correct aria attributes", () => {
    const currentUser = createUser({ id: "user1", name: "John Doe" });
    const preloadedState = { currentUser };

    const { container } = renderWithProviders(<AccountDropdown />, {
      preloadedState,
    });

    const iconButton = container.querySelector(".AccountDropdown-icon");
    expect(iconButton).toHaveAttribute("aria-haspopup", "true");
  });
});
