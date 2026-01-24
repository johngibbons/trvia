import React from "react";
import { render, screen } from "@testing-library/react";
import WinnerBanner from "./WinnerBanner";
import { List } from "immutable";
import Entry from "../../../models/Entry";
import User from "../../../models/User";
import { createUser, createEntry } from "../../../testUtils/factories";

// Mock the gravatar helper
jest.mock("../../../helpers/user-helper", () => ({
  gravatar: jest.fn((email) => `https://gravatar.com/avatar/${email}`),
}));

describe("WinnerBanner", () => {
  const createWinningEntry = (name, userName, overrides = {}) => {
    const user = createUser({ name: userName });
    return new Entry({
      name,
      user,
      rank: 1,
      ...overrides,
    });
  };

  it("should render single winner with correct title", () => {
    const winners = List([createWinningEntry("John's Entry", "John Doe")]);

    render(<WinnerBanner winningEntries={winners} />);

    expect(screen.getByText("Congratulations Champion!")).toBeInTheDocument();
    expect(screen.getByText("John's Entry")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("should render multiple winners with plural title", () => {
    const winners = List([
      createWinningEntry("Alice's Entry", "Alice Smith"),
      createWinningEntry("Bob's Entry", "Bob Jones"),
    ]);

    render(<WinnerBanner winningEntries={winners} />);

    // Note: There's a typo in the original component "Contratulations"
    expect(screen.getByText("Contratulations Champions!")).toBeInTheDocument();
    expect(screen.getByText("Alice's Entry")).toBeInTheDocument();
    expect(screen.getByText("Bob's Entry")).toBeInTheDocument();
    expect(screen.getByText("Alice Smith")).toBeInTheDocument();
    expect(screen.getByText("Bob Jones")).toBeInTheDocument();
  });

  it("should render three-way tie", () => {
    const winners = List([
      createWinningEntry("Entry 1", "User 1"),
      createWinningEntry("Entry 2", "User 2"),
      createWinningEntry("Entry 3", "User 3"),
    ]);

    render(<WinnerBanner winningEntries={winners} />);

    expect(screen.getByText("Contratulations Champions!")).toBeInTheDocument();
    expect(screen.getByText("Entry 1")).toBeInTheDocument();
    expect(screen.getByText("Entry 2")).toBeInTheDocument();
    expect(screen.getByText("Entry 3")).toBeInTheDocument();
  });

  it("should render user avatars for each winner", () => {
    const winners = List([
      createWinningEntry("Winner Entry", "Winner User"),
    ]);

    render(<WinnerBanner winningEntries={winners} />);

    const avatars = screen.getAllByRole("img");
    expect(avatars.length).toBe(1);
  });

  it("should render multiple avatars for multiple winners", () => {
    const winners = List([
      createWinningEntry("Entry 1", "User 1"),
      createWinningEntry("Entry 2", "User 2"),
      createWinningEntry("Entry 3", "User 3"),
    ]);

    render(<WinnerBanner winningEntries={winners} />);

    const avatars = screen.getAllByRole("img");
    expect(avatars.length).toBe(3);
  });

  it("should render with empty list", () => {
    render(<WinnerBanner winningEntries={List()} />);

    // Should show singular title when 0 entries (since 0 > 1 is false)
    expect(screen.getByText("Congratulations Champion!")).toBeInTheDocument();
  });

  it("should have correct CSS classes", () => {
    const winners = List([createWinningEntry("Test Entry", "Test User")]);

    const { container } = render(<WinnerBanner winningEntries={winners} />);

    expect(container.querySelector(".WinnerBanner")).toBeInTheDocument();
    expect(container.querySelector(".WinnerBanner--title")).toBeInTheDocument();
    expect(container.querySelector(".WinnerBanner--winner")).toBeInTheDocument();
    expect(
      container.querySelector(".WinnerBanner--winner-entry-name")
    ).toBeInTheDocument();
    expect(
      container.querySelector(".WinnerBanner--winner-user-name")
    ).toBeInTheDocument();
  });
});
