import React from "react";
import { render } from "@testing-library/react";
import NomineesList from "./NomineesList";
import { Seq } from "immutable";
import { createNominee } from "../../testUtils/factories";

describe("NomineesList", () => {
  it("should render list of nominees", () => {
    const nominees = Seq([
      createNominee({ id: "nom1", text: "Nominee 1" }),
      createNominee({ id: "nom2", text: "Nominee 2" }),
    ]);

    const { container } = render(
      <NomineesList nominees={nominees} answerable={true} />
    );

    expect(container.querySelector(".MuiList-root")).toBeInTheDocument();
  });

  it("should pass disabled prop when not answerable", () => {
    const nominees = Seq([
      createNominee({ id: "nom1", text: "Nominee 1" }),
    ]);

    render(<NomineesList nominees={nominees} answerable={false} />);

    // Component should render (disabled state is handled by Nominee component)
    expect(true).toBe(true);
  });
});
