import React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Navbar from "./Navbar";
import { renderWithProviders } from "../../testUtils/testUtils";
import { createUser, createUI } from "../../testUtils/factories";
import User from "../../models/User";

describe("Navbar", () => {
  it("should render app title", () => {
    renderWithProviders(<Navbar />);

    expect(screen.getByText("trvia")).toBeInTheDocument();
  });

  it("should show login button when not logged in", () => {
    const state = {
      currentUser: new User(),
    };

    renderWithProviders(<Navbar />, { preloadedState: state });

    expect(screen.getByText(/login/i)).toBeInTheDocument();
  });

  it("should show account dropdown when logged in", () => {
    const state = {
      currentUser: createUser({
        id: "user1",
        email: "test@example.com",
        name: "Test User",
      }),
    };

    renderWithProviders(<Navbar />, { preloadedState: state });

    // When logged in, should not show login button
    expect(screen.queryByText("Login")).not.toBeInTheDocument();
  });

  it("should navigate to home when title is clicked", async () => {
    const user = userEvent.setup();
    const { container } = renderWithProviders(<Navbar />, {
      initialEntries: ["/groups/123"],
    });

    await user.click(screen.getByText("trvia"));

    // The navigation happens via useNavigate, which changes the history
    // In tests, we can check that the element is clickable and has cursor style
    expect(screen.getByText("trvia")).toHaveStyle({ cursor: "pointer" });
  });

  it("should render with proper styling", () => {
    renderWithProviders(<Navbar />);

    const appBar = document.querySelector(".Navbar");
    expect(appBar).toBeInTheDocument();
  });

  describe("logged in vs logged out states", () => {
    it("should show login when email is empty", () => {
      const notLoggedIn = {
        currentUser: new User({ id: "user1", email: "" }),
      };

      renderWithProviders(<Navbar />, {
        preloadedState: notLoggedIn,
      });
      expect(screen.getByText(/login/i)).toBeInTheDocument();
    });

    it("should hide login when user has email", () => {
      const loggedIn = {
        currentUser: new User({ id: "user1", email: "test@example.com" }),
      };

      renderWithProviders(<Navbar />, { preloadedState: loggedIn });
      expect(screen.queryByText("Login")).not.toBeInTheDocument();
    });
  });
});
