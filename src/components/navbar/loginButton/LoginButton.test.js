import React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginButton from "./LoginButton";
import { renderWithProviders } from "../../../testUtils/testUtils";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("LoginButton", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it("should render login button", () => {
    renderWithProviders(<LoginButton />);
    expect(screen.getByText("login")).toBeInTheDocument();
  });

  it("should navigate to login page when clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginButton />);

    const button = screen.getByText("login");
    await user.click(button);

    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("should have LoginButton class", () => {
    const { container } = renderWithProviders(<LoginButton />);
    const button = container.querySelector(".LoginButton");
    expect(button).toBeInTheDocument();
  });
});
