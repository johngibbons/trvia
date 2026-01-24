import React from "react";
import { render, screen } from "@testing-library/react";
import Nominee from "./Nominee";
import { createNominee } from "../../../testUtils/factories";

describe("Nominee", () => {
  it("should render nominee with text", () => {
    const nominee = createNominee({
      id: "nom1",
      text: "Best Picture Nominee",
      secondaryText: "Supporting info",
      imageUrl: "https://example.com/image.jpg",
    });

    render(<Nominee nominee={nominee} disabled={false} />);

    expect(screen.getByText("Best Picture Nominee")).toBeInTheDocument();
    expect(screen.getByText("Supporting info")).toBeInTheDocument();
  });

  it("should render nominee image", () => {
    const nominee = createNominee({
      id: "nom1",
      text: "Best Picture Nominee",
      imageUrl: "https://example.com/image.jpg",
    });

    const { container } = render(<Nominee nominee={nominee} disabled={false} />);

    const image = container.querySelector("img");
    expect(image).toHaveAttribute("src", "https://example.com/image.jpg");
  });

  it("should render as disabled when disabled prop is true", () => {
    const nominee = createNominee({
      id: "nom1",
      text: "Disabled Nominee",
    });

    const { container } = render(<Nominee nominee={nominee} disabled={true} />);

    const listItem = container.querySelector(".MuiListItem-root");
    expect(listItem).toHaveClass("Mui-disabled");
  });
});
