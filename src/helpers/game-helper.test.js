import {
  toOptionalLowercaseText,
  findMatch,
  determineNomineeType,
  isExactMatch,
  selectBestMatch,
} from "./game-helper";

describe("game-helper", () => {
  describe("toOptionalLowercaseText", () => {
    it("should convert text to lowercase", () => {
      expect(toOptionalLowercaseText("HELLO")).toBe("hello");
      expect(toOptionalLowercaseText("Hello World")).toBe("hello world");
    });

    it("should return empty string for null or undefined", () => {
      expect(toOptionalLowercaseText(null)).toBe("");
      expect(toOptionalLowercaseText(undefined)).toBe("");
    });

    it("should return empty string for empty input", () => {
      expect(toOptionalLowercaseText("")).toBe("");
    });
  });

  describe("determineNomineeType", () => {
    it("should return person if nominee has secondaryText", () => {
      const nominee = { text: "Emma Stone", secondaryText: "La La Land" };
      expect(determineNomineeType(nominee, "Best Actress")).toBe("person");
    });

    it("should return person for performance categories", () => {
      const nominee = { text: "Test Nominee" };
      expect(determineNomineeType(nominee, "Best Performance by an Actor")).toBe("person");
    });

    it("should return person for actor categories", () => {
      const nominee = { text: "Test Nominee" };
      expect(determineNomineeType(nominee, "Best Actor in a Leading Role")).toBe("person");
    });

    it("should return person for actress categories", () => {
      const nominee = { text: "Test Nominee" };
      expect(determineNomineeType(nominee, "Best Actress")).toBe("person");
    });

    it("should return person for director categories", () => {
      const nominee = { text: "Test Nominee" };
      expect(determineNomineeType(nominee, "Best Director")).toBe("person");
    });

    it("should return person for screenplay categories", () => {
      const nominee = { text: "Test Nominee" };
      expect(determineNomineeType(nominee, "Best Original Screenplay")).toBe("person");
    });

    it("should return title for picture categories", () => {
      const nominee = { text: "Test Movie" };
      expect(determineNomineeType(nominee, "Best Motion Picture")).toBe("title");
    });

    it("should return title for animated categories", () => {
      const nominee = { text: "Test Animation" };
      expect(determineNomineeType(nominee, "Best Animated Feature")).toBe("title");
    });

    it("should handle null/empty category name", () => {
      const nominee = { text: "Test Nominee" };
      expect(determineNomineeType(nominee, null)).toBe("title");
      expect(determineNomineeType(nominee, "")).toBe("title");
    });
  });

  describe("isExactMatch", () => {
    it("should return true for exact title match", () => {
      const result = { title: "La La Land" };
      const nominee = { text: "La La Land" };
      expect(isExactMatch(result, nominee)).toBe(true);
    });

    it("should return true for exact name match", () => {
      const result = { name: "Emma Stone" };
      const nominee = { text: "Emma Stone" };
      expect(isExactMatch(result, nominee)).toBe(true);
    });

    it("should be case insensitive", () => {
      const result = { title: "LA LA LAND" };
      const nominee = { text: "la la land" };
      expect(isExactMatch(result, nominee)).toBe(true);
    });

    it("should match movieDBName", () => {
      const result = { name: "Florence Pugh" };
      const nominee = { text: "Flo Pugh", movieDBName: "Florence Pugh" };
      expect(isExactMatch(result, nominee)).toBe(true);
    });

    it("should return false for non-matching names", () => {
      const result = { title: "Different Movie" };
      const nominee = { text: "La La Land" };
      expect(isExactMatch(result, nominee)).toBe(false);
    });

    it("should handle missing fields gracefully", () => {
      const result = {};
      const nominee = {};
      expect(isExactMatch(result, nominee)).toBe(true); // Both empty strings match
    });
  });

  describe("findMatch", () => {
    const titlesAndPeople = [
      { title: "La La Land", media_type: "movie", poster_path: "/poster1.jpg" },
      { name: "Emma Stone", media_type: "person", profile_path: "/emma.jpg" },
      { title: "Moonlight", media_type: "movie", poster_path: "/poster2.jpg" },
      { original_title: "Original Title Film", media_type: "movie" },
    ];

    it("should find match by text", () => {
      const nominee = { text: "La La Land" };
      const match = findMatch(titlesAndPeople, nominee);
      expect(match.title).toBe("La La Land");
    });

    it("should find match by secondaryText", () => {
      const nominee = { text: "Some Actor", secondaryText: "La La Land" };
      const match = findMatch(titlesAndPeople, nominee);
      expect(match.title).toBe("La La Land");
    });

    it("should find match by movieDBName", () => {
      const nominee = { text: "OT Film", movieDBName: "Original Title Film" };
      const match = findMatch(titlesAndPeople, nominee);
      expect(match.original_title).toBe("Original Title Film");
    });

    it("should prefer person matches over title matches", () => {
      const titlesAndPeopleWithBoth = [
        { title: "Emma Stone Movie", media_type: "movie" },
        { name: "Emma Stone", media_type: "person", profile_path: "/emma.jpg" },
      ];
      const nominee = { text: "Emma Stone" };
      const match = findMatch(titlesAndPeopleWithBoth, nominee);
      expect(match.media_type).toBe("person");
    });

    it("should return undefined for no match", () => {
      const nominee = { text: "Nonexistent Movie" };
      const match = findMatch(titlesAndPeople, nominee);
      expect(match).toBeUndefined();
    });

    it("should be case insensitive", () => {
      const nominee = { text: "MOONLIGHT" };
      const match = findMatch(titlesAndPeople, nominee);
      expect(match.title).toBe("Moonlight");
    });
  });

  describe("selectBestMatch", () => {
    it("should return null for empty results", () => {
      expect(selectBestMatch({ results: [] }, {}, "title")).toBeNull();
      expect(selectBestMatch(null, {}, "title")).toBeNull();
      expect(selectBestMatch({}, {}, "title")).toBeNull();
    });

    it("should filter by person type and require profile_path", () => {
      const searchResults = {
        results: [
          { name: "Emma Stone", media_type: "person", profile_path: "/emma.jpg" },
          { name: "Emma Stone", media_type: "person" }, // no profile_path
          { title: "Emma", media_type: "movie", poster_path: "/emma-movie.jpg" },
        ],
      };
      const nominee = { text: "Emma Stone" };
      const match = selectBestMatch(searchResults, nominee, "person");
      expect(match.profile_path).toBe("/emma.jpg");
    });

    it("should filter by title type and require poster_path", () => {
      const searchResults = {
        results: [
          { name: "Director", media_type: "person", profile_path: "/person.jpg" },
          { title: "The Movie", media_type: "movie", poster_path: "/movie.jpg" },
          { title: "No Poster Movie", media_type: "movie" }, // no poster_path
        ],
      };
      const nominee = { text: "The Movie" };
      const match = selectBestMatch(searchResults, nominee, "title");
      expect(match.poster_path).toBe("/movie.jpg");
    });

    it("should prefer exact matches", () => {
      const searchResults = {
        results: [
          { title: "La La Lands", media_type: "movie", poster_path: "/poster1.jpg" },
          { title: "La La Land", media_type: "movie", poster_path: "/poster2.jpg" },
        ],
      };
      const nominee = { text: "La La Land" };
      const match = selectBestMatch(searchResults, nominee, "title");
      expect(match.title).toBe("La La Land");
    });

    it("should accept TV shows as title type", () => {
      const searchResults = {
        results: [
          { name: "The Show", media_type: "tv", poster_path: "/show.jpg" },
        ],
      };
      const nominee = { text: "The Show" };
      const match = selectBestMatch(searchResults, nominee, "title");
      expect(match.name).toBe("The Show");
    });

    it("should return first filtered result if no better match", () => {
      const searchResults = {
        results: [
          { title: "First Movie", media_type: "movie", poster_path: "/first.jpg" },
          { title: "Second Movie", media_type: "movie", poster_path: "/second.jpg" },
        ],
      };
      const nominee = { text: "Completely Different" };
      const match = selectBestMatch(searchResults, nominee, "title");
      expect(match.title).toBe("First Movie");
    });

    it("should return null if no results match type requirements", () => {
      const searchResults = {
        results: [
          { title: "Movie", media_type: "movie", poster_path: "/movie.jpg" },
        ],
      };
      const nominee = { text: "Some Person" };
      const match = selectBestMatch(searchResults, nominee, "person");
      expect(match).toBeNull();
    });
  });
});
