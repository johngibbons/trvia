import React from "react";
import { render, screen } from "@testing-library/react";
import PageHeading from "./PageHeading";

describe("PageHeading", () => {
  it("should render the heading text", () => {
    render(<PageHeading text="Test Heading" />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Test Heading"
    );
  });

  it("should render children", () => {
    render(
      <PageHeading text="Heading">
        <button>Child Button</button>
      </PageHeading>
    );

    expect(screen.getByRole("button", { name: "Child Button" })).toBeInTheDocument();
  });

  it("should render without text", () => {
    render(<PageHeading />);

    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("should render with empty text", () => {
    render(<PageHeading text="" />);

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("");
  });

  it("should render multiple children", () => {
    render(
      <PageHeading text="Heading">
        <span>First child</span>
        <span>Second child</span>
      </PageHeading>
    );

    expect(screen.getByText("First child")).toBeInTheDocument();
    expect(screen.getByText("Second child")).toBeInTheDocument();
  });

  it("should have correct CSS class", () => {
    const { container } = render(<PageHeading text="Test" />);

    expect(container.querySelector(".PageHeading")).toBeInTheDocument();
    expect(container.querySelector(".PageHeading-text")).toBeInTheDocument();
  });
});
