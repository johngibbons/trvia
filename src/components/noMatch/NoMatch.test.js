import React from "react";
import { render, screen } from "@testing-library/react";
import NoMatch from "./NoMatch";

describe("NoMatch", () => {
  it("should render not found message", () => {
    render(<NoMatch />);
    expect(screen.getByText("Not Found")).toBeInTheDocument();
  });
});
