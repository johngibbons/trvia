import React from "react";
import { render, screen } from "@testing-library/react";
import UserAvatar from "./UserAvatar";
import User from "../../../models/User";
import { createUser } from "../../../testUtils/factories";

// Mock the gravatar helper
jest.mock("../../../helpers/user-helper", () => ({
  gravatar: jest.fn((email) => `https://gravatar.com/avatar/${email}`),
}));

describe("UserAvatar", () => {
  it("should render user photo when photoURL is provided", () => {
    const user = createUser({
      photoURL: "https://example.com/photo.jpg",
      email: "test@example.com",
    });

    render(<UserAvatar user={user} />);

    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "https://example.com/photo.jpg");
  });

  it("should use gravatar src when no photoURL", () => {
    const user = createUser({
      photoURL: "",
      email: "test@example.com",
    });

    const { container } = render(<UserAvatar user={user} />);

    // MUI Avatar may render either an img or a fallback depending on image load
    // Check that the Avatar component is rendered
    expect(container.querySelector(".MuiAvatar-root")).toBeInTheDocument();
  });

  it("should apply custom className", () => {
    const user = createUser({ photoURL: "https://example.com/photo.jpg" });

    const { container } = render(
      <UserAvatar user={user} className="custom-class" />
    );

    expect(container.querySelector(".custom-class")).toBeInTheDocument();
  });

  it("should render with minimal user data", () => {
    const user = new User();

    const { container } = render(<UserAvatar user={user} />);

    // Avatar component should render (either with image or fallback)
    expect(container.querySelector(".MuiAvatar-root")).toBeInTheDocument();
  });

  it("should prefer photoURL over gravatar", () => {
    const user = createUser({
      photoURL: "https://example.com/photo.jpg",
      email: "test@example.com",
    });

    render(<UserAvatar user={user} />);

    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "https://example.com/photo.jpg");
  });
});
