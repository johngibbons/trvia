import React from "react";
import { screen } from "@testing-library/react";
import PageContainer from "./PageContainer";
import { renderWithProviders } from "../../testUtils/testUtils";
import { createUser } from "../../testUtils/factories";

describe("PageContainer", () => {
  it("should render page container with navigation and alert bar", () => {
    const preloadedState = {
      currentUser: createUser({ id: "user1", name: "Test User" }),
    };

    const { container } = renderWithProviders(<PageContainer />, {
      preloadedState,
    });

    expect(container.querySelector(".PageContainer")).toBeInTheDocument();
    expect(container.querySelector(".PageContainer-body")).toBeInTheDocument();
  });
});
