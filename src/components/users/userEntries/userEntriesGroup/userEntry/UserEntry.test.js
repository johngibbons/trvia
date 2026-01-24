import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import UserEntry from "./UserEntry";
import { createEntry } from "../../../../../testUtils/factories";

describe("UserEntry", () => {
  it("should render entry name as link", () => {
    const entry = createEntry({
      id: "entry1",
      name: "My Predictions",
    });

    render(
      <BrowserRouter>
        <UserEntry entry={entry} />
      </BrowserRouter>
    );

    const link = screen.getByText("My Predictions");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/entries/entry1");
  });

  it("should have UserEntry class", () => {
    const entry = createEntry({
      id: "entry2",
      name: "Test Entry",
    });

    const { container } = render(
      <BrowserRouter>
        <UserEntry entry={entry} />
      </BrowserRouter>
    );

    const link = container.querySelector(".UserEntry");
    expect(link).toBeInTheDocument();
  });
});
