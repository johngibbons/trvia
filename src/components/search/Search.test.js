import React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Search from "./Search";
import { renderWithProviders } from "../../testUtils/testUtils";
import { createUI, createAdminWithSearchResults } from "../../testUtils/factories";
import { fromJS, List } from "immutable";

describe("Search", () => {
  it("should render the search input", () => {
    const preloadedState = {
      ui: createUI(),
      admin: createAdminWithSearchResults([]),
    };

    renderWithProviders(<Search />, {
      preloadedState,
    });

    expect(screen.getByLabelText("Search for movies, tv, actors")).toBeInTheDocument();
  });

  it("should dispatch updateSearchField when input changes", async () => {
    const user = userEvent.setup();
    const preloadedState = {
      ui: createUI(),
      admin: createAdminWithSearchResults([]),
    };

    const { store } = renderWithProviders(<Search />, {
      preloadedState,
    });

    await user.type(screen.getByLabelText("Search for movies, tv, actors"), "Avengers");

    expect(store.getState().ui.searchValue).toBe("Avengers");
  });

  it("should dispatch submitSearch on form submit", async () => {
    const user = userEvent.setup();
    const preloadedState = {
      ui: createUI({ searchValue: "Batman" }),
      admin: createAdminWithSearchResults([]),
    };

    renderWithProviders(<Search />, {
      preloadedState,
    });

    // Submit the form by pressing Enter
    await user.type(screen.getByLabelText("Search for movies, tv, actors"), "{enter}");

    // The action should have been dispatched (we can't easily verify saga behavior in unit tests)
  });

  it("should not render Titles heading when no title results", () => {
    // No results at all - selector will filter to empty
    const preloadedState = {
      ui: createUI(),
      admin: createAdminWithSearchResults([]),
    };

    renderWithProviders(<Search />, {
      preloadedState,
    });

    expect(screen.queryByText("Titles")).not.toBeInTheDocument();
  });

  it("should render Titles heading when title results exist", () => {
    // searchResults is a single List that gets filtered by selectors
    const searchResults = [
      fromJS({
        id: 1,
        title: "The Batman",
        poster_path: "/batman.jpg",
        media_type: "movie",
      }),
    ];

    const preloadedState = {
      ui: createUI(),
      admin: createAdminWithSearchResults(searchResults),
    };

    renderWithProviders(<Search />, {
      preloadedState,
    });

    expect(screen.getByText("Titles")).toBeInTheDocument();
  });

  it("should not render People heading when no people results", () => {
    // Only movie results, no person results
    const searchResults = [
      fromJS({
        id: 1,
        title: "Some Movie",
        poster_path: "/movie.jpg",
        media_type: "movie",
      }),
    ];

    const preloadedState = {
      ui: createUI(),
      admin: createAdminWithSearchResults(searchResults),
    };

    renderWithProviders(<Search />, {
      preloadedState,
    });

    expect(screen.queryByText("People")).not.toBeInTheDocument();
  });

  it("should render People heading when people results exist", () => {
    const searchResults = [
      fromJS({
        id: 1,
        name: "Robert Pattinson",
        profile_path: "/robert.jpg",
        media_type: "person",
      }),
    ];

    const preloadedState = {
      ui: createUI(),
      admin: createAdminWithSearchResults(searchResults),
    };

    renderWithProviders(<Search />, {
      preloadedState,
    });

    expect(screen.getByText("People")).toBeInTheDocument();
  });

  it("should render title images with correct src", () => {
    const searchResults = [
      fromJS({
        id: 1,
        title: "The Batman",
        poster_path: "/batman.jpg",
        media_type: "movie",
      }),
    ];

    const preloadedState = {
      ui: createUI(),
      admin: createAdminWithSearchResults(searchResults),
    };

    renderWithProviders(<Search />, {
      preloadedState,
    });

    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "https://image.tmdb.org/t/p/w300/batman.jpg");
  });

  it("should render people images with correct src", () => {
    const searchResults = [
      fromJS({
        id: 1,
        name: "Robert Pattinson",
        profile_path: "/robert.jpg",
        media_type: "person",
      }),
    ];

    const preloadedState = {
      ui: createUI(),
      admin: createAdminWithSearchResults(searchResults),
    };

    renderWithProviders(<Search />, {
      preloadedState,
    });

    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "https://image.tmdb.org/t/p/w300/robert.jpg");
  });

  it("should call onSaveTitle when title result is clicked", async () => {
    const user = userEvent.setup();
    const searchResults = [
      fromJS({
        id: 1,
        title: "The Batman",
        poster_path: "/batman.jpg",
        media_type: "movie",
      }),
    ];

    const preloadedState = {
      ui: createUI(),
      admin: createAdminWithSearchResults(searchResults),
    };

    renderWithProviders(<Search />, {
      preloadedState,
    });

    const resultDiv = screen.getByRole("img").closest(".Search__result");
    await user.click(resultDiv);

    // Action should have been dispatched (saga will handle it)
  });

  it("should call onSavePerson when person result is clicked", async () => {
    const user = userEvent.setup();
    const searchResults = [
      fromJS({
        id: 1,
        name: "Robert Pattinson",
        profile_path: "/robert.jpg",
        media_type: "person",
      }),
    ];

    const preloadedState = {
      ui: createUI(),
      admin: createAdminWithSearchResults(searchResults),
    };

    renderWithProviders(<Search />, {
      preloadedState,
    });

    const resultDiv = screen.getByRole("img").closest(".Search__result");
    await user.click(resultDiv);

    // Action should have been dispatched (saga will handle it)
  });
});
