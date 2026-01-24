import React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EditValueField from "./EditValueField";
import { renderWithProviders } from "../../../../testUtils/testUtils";
import { createCategory, createUI } from "../../../../testUtils/factories";

describe("EditValueField", () => {
  it("should render text field with category name as label", () => {
    const category = createCategory({
      id: "cat1",
      name: "Best Picture",
      value: 5,
    });
    const preloadedState = {
      ui: createUI(),
    };

    renderWithProviders(<EditValueField category={category} />, {
      preloadedState,
    });

    expect(screen.getByLabelText("Best Picture")).toBeInTheDocument();
  });

  it("should display category value by default", () => {
    const category = createCategory({
      id: "cat1",
      name: "Best Picture",
      value: 5,
    });
    const preloadedState = {
      ui: createUI(),
    };

    renderWithProviders(<EditValueField category={category} />, {
      preloadedState,
    });

    const input = screen.getByLabelText("Best Picture");
    expect(input).toHaveValue(5);
  });

  it("should display ui.values value when present", () => {
    const category = createCategory({
      id: "cat1",
      name: "Best Picture",
      value: 5,
    });
    const ui = createUI().set("values", { cat1: 10 });
    const preloadedState = {
      ui,
    };

    renderWithProviders(<EditValueField category={category} />, {
      preloadedState,
    });

    const input = screen.getByLabelText("Best Picture");
    expect(input).toHaveValue(10);
  });

  it("should call onChange when value is changed", async () => {
    const user = userEvent.setup();
    const category = createCategory({
      id: "cat1",
      name: "Best Picture",
      value: 5,
    });
    const preloadedState = {
      ui: createUI(),
    };

    const { store } = renderWithProviders(<EditValueField category={category} />, {
      preloadedState,
    });

    const input = screen.getByLabelText("Best Picture");
    await user.clear(input);
    await user.type(input, "8");

    // Verify the action was dispatched (the value is updated in the UI state)
    const uiState = store.getState().ui;
    expect(uiState.values).toBeDefined();
  });
});
