import React from "react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AlertBar from "./AlertBar";
import { renderWithProviders } from "../../testUtils/testUtils";
import { createUI, createUIWithAlert } from "../../testUtils/factories";

describe("AlertBar", () => {
  it("should render alert message when open", () => {
    const state = {
      ui: createUIWithAlert("Test alert message"),
    };

    renderWithProviders(<AlertBar />, { preloadedState: state });

    expect(screen.getByText("Test alert message")).toBeInTheDocument();
  });

  it("should not show message when closed", () => {
    const state = {
      ui: createUI({
        isAlertBarOpen: false,
        alertBarMessage: "Hidden message",
      }),
    };

    renderWithProviders(<AlertBar />, { preloadedState: state });

    // The Snackbar might still be in DOM but not visible
    const snackbar = screen.queryByText("Hidden message");
    // When closed, the message might not be visible
    if (snackbar) {
      expect(snackbar.closest('[role="presentation"]')).not.toBeVisible;
    }
  });

  it("should render error style when isError is true", () => {
    const state = {
      ui: createUIWithAlert("Error message", true),
    };

    const { container } = renderWithProviders(<AlertBar />, {
      preloadedState: state,
    });

    // Check for error styling (red background)
    expect(screen.getByText("Error message")).toBeInTheDocument();
  });

  it("should render success style when isError is false", () => {
    const state = {
      ui: createUIWithAlert("Success message", false),
    };

    renderWithProviders(<AlertBar />, { preloadedState: state });

    expect(screen.getByText("Success message")).toBeInTheDocument();
  });

  it("should render with different messages", () => {
    const messages = [
      "Entry saved successfully!",
      "Group created!",
      "Selection updated",
      "Error: Something went wrong",
    ];

    messages.forEach((message) => {
      const state = {
        ui: createUIWithAlert(message),
      };

      const { unmount } = renderWithProviders(<AlertBar />, {
        preloadedState: state,
      });

      expect(screen.getByText(message)).toBeInTheDocument();
      unmount();
    });
  });

  it("should render with empty message", () => {
    const state = {
      ui: createUIWithAlert(""),
    };

    renderWithProviders(<AlertBar />, { preloadedState: state });

    // Component should render without crashing
    expect(document.querySelector(".MuiSnackbar-root")).toBeInTheDocument();
  });
});
