import { Map, List, fromJS } from "immutable";
import {
  createUser,
  createGame,
  createGameWithCategories,
  createCategory,
  createNominee,
  createGroup,
  createEntry,
  createUI,
  createAdmin,
  ScenarioBuilder,
  scenarios,
  resetIdCounter,
} from "./index";
import User from "../../models/User";
import Game from "../../models/Game";
import Category from "../../models/Category";
import Nominee from "../../models/Nominee";
import Group from "../../models/Group";
import Entry from "../../models/Entry";
import { UI } from "../../models/UI";
import { Admin } from "../../models/Admin";

describe("Factories", () => {
  beforeEach(() => {
    resetIdCounter();
  });

  describe("createUser", () => {
    it("should create a valid User record", () => {
      const user = createUser();
      expect(user).toBeInstanceOf(User);
      expect(user.id).toBeDefined();
      expect(user.entries).toBeInstanceOf(Map);
      expect(user.groups).toBeInstanceOf(Map);
    });

    it("should accept overrides", () => {
      const user = createUser({ name: "Test User", email: "test@example.com" });
      expect(user.name).toBe("Test User");
      expect(user.email).toBe("test@example.com");
    });
  });

  describe("createGame", () => {
    it("should create a valid Game record", () => {
      const game = createGame();
      expect(game).toBeInstanceOf(Game);
      expect(game.id).toBeDefined();
      expect(game.categories).toBeInstanceOf(Map);
      expect(game.answered_order).toBeInstanceOf(List);
    });

    it("should accept overrides", () => {
      const game = createGame({ name: "Test Game" });
      expect(game.name).toBe("Test Game");
    });
  });

  describe("createGameWithCategories", () => {
    it("should create game with category references", () => {
      const categoryIds = ["cat1", "cat2", "cat3"];
      const game = createGameWithCategories(categoryIds);
      expect(game.categories.size).toBe(3);
      expect(game.categories.has("cat1")).toBe(true);
      expect(game.categories.has("cat2")).toBe(true);
      expect(game.categories.has("cat3")).toBe(true);
    });
  });

  describe("createCategory", () => {
    it("should create a valid Category record", () => {
      const category = createCategory();
      expect(category).toBeInstanceOf(Category);
      expect(category.id).toBeDefined();
      expect(category.nominees).toBeInstanceOf(Map);
    });

    it("should accept overrides", () => {
      const category = createCategory({ name: "Best Picture", value: 5 });
      expect(category.name).toBe("Best Picture");
      expect(category.value).toBe(5);
    });
  });

  describe("createNominee", () => {
    it("should create a valid Nominee record", () => {
      const nominee = createNominee();
      expect(nominee).toBeInstanceOf(Nominee);
      expect(nominee.id).toBeDefined();
      expect(nominee.text).toBeDefined();
    });

    it("should accept overrides", () => {
      const nominee = createNominee({
        text: "Test Movie",
        secondaryText: "Test Director",
      });
      expect(nominee.text).toBe("Test Movie");
      expect(nominee.secondaryText).toBe("Test Director");
    });
  });

  describe("createGroup", () => {
    it("should create a valid Group record", () => {
      const group = createGroup();
      expect(group).toBeInstanceOf(Group);
      expect(group.id).toBeDefined();
      expect(group.entries).toBeInstanceOf(Map);
      expect(group.values).toBeInstanceOf(Map);
    });

    it("should accept overrides", () => {
      const group = createGroup({ name: "Test Group", admin: "user1" });
      expect(group.name).toBe("Test Group");
      expect(group.admin).toBe("user1");
    });
  });

  describe("createEntry", () => {
    it("should create a valid Entry record", () => {
      const entry = createEntry();
      expect(entry).toBeInstanceOf(Entry);
      expect(entry.id).toBeDefined();
      expect(entry.selections).toBeInstanceOf(Map);
    });

    it("should accept overrides", () => {
      const entry = createEntry({ name: "Test Entry", score: 10 });
      expect(entry.name).toBe("Test Entry");
      expect(entry.score).toBe(10);
    });
  });

  describe("createUI", () => {
    it("should create a valid UI record", () => {
      const ui = createUI();
      expect(ui).toBeInstanceOf(UI);
      expect(ui.values).toBeInstanceOf(Map);
      expect(ui.previousRanks).toBeInstanceOf(Map);
    });

    it("should accept overrides", () => {
      const ui = createUI({ modal: "NEW_ENTRY", isAlertBarOpen: true });
      expect(ui.modal).toBe("NEW_ENTRY");
      expect(ui.isAlertBarOpen).toBe(true);
    });
  });

  describe("createAdmin", () => {
    it("should create a valid Admin record", () => {
      const admin = createAdmin();
      expect(admin).toBeInstanceOf(Admin);
      expect(admin.searchResults).toBeInstanceOf(List);
    });
  });
});

describe("ScenarioBuilder", () => {
  beforeEach(() => {
    resetIdCounter();
  });

  it("should create empty state", () => {
    const state = new ScenarioBuilder().build();
    expect(state.games).toBeInstanceOf(Map);
    expect(state.games.size).toBe(0);
    expect(state.entries.size).toBe(0);
    expect(state.groups.size).toBe(0);
  });

  it("should create game with categories and nominees", () => {
    const state = new ScenarioBuilder()
      .withGame({ id: "game1" }, 3, 5)
      .build();

    expect(state.games.size).toBe(1);
    expect(state.categories.size).toBe(3);
    expect(state.nominees.size).toBe(15); // 3 categories * 5 nominees
  });

  it("should create group for game", () => {
    const state = new ScenarioBuilder()
      .withGame({ id: "game1" }, 3, 5)
      .withGroup("game1", { id: "group1" })
      .build();

    expect(state.groups.size).toBe(1);
    const group = state.groups.get("group1");
    expect(group.game).toBe("game1");
    expect(group.values.size).toBe(3); // One value per category
  });

  it("should create entry for group", () => {
    const state = new ScenarioBuilder()
      .withGame({ id: "game1" }, 3, 5)
      .withGroup("game1", { id: "group1" })
      .withEntry("group1", { name: "Test User" })
      .build();

    expect(state.entries.size).toBe(1);
    expect(state.users.size).toBe(1);

    const entry = state.entries.first();
    expect(entry.group).toBe("group1");
    expect(entry.game).toBe("game1");

    const group = state.groups.get("group1");
    expect(group.entries.size).toBe(1);
  });

  it("should set current user", () => {
    const state = new ScenarioBuilder()
      .withCurrentUser({ id: "user1", name: "Test User" })
      .build();

    expect(state.currentUser.id).toBe("user1");
    expect(state.currentUser.name).toBe("Test User");
    expect(state.users.has("user1")).toBe(true);
  });

  it("should mark game in progress", () => {
    const builder = new ScenarioBuilder()
      .withGame({ id: "game1" }, 5, 5)
      .withGroup("game1", { id: "group1" })
      .withGameInProgress("game1", 2);

    const state = builder.build();
    const game = state.games.get("game1");

    expect(game.answered_order.size).toBe(2);

    // Check that categories have correctAnswer set
    let answeredCount = 0;
    state.categories.forEach((cat) => {
      if (cat.correctAnswer) answeredCount++;
    });
    expect(answeredCount).toBe(2);
  });

  it("should mark game completed", () => {
    const builder = new ScenarioBuilder()
      .withGame({ id: "game1" }, 5, 5)
      .withGroup("game1", { id: "group1" })
      .withGameCompleted("game1");

    const state = builder.build();
    const game = state.games.get("game1");

    expect(game.answered_order.size).toBe(5);

    // All categories should have correctAnswer set
    state.categories.forEach((cat) => {
      expect(cat.correctAnswer).not.toBeNull();
    });
  });

  it("should set group admin", () => {
    const state = new ScenarioBuilder()
      .withGame({ id: "game1" }, 3, 5)
      .withGroup("game1", { id: "group1" })
      .withGroupAdmin("group1", "admin-user")
      .build();

    const group = state.groups.get("group1");
    expect(group.admin).toBe("admin-user");
  });

  it("should provide generated IDs", () => {
    const builder = new ScenarioBuilder()
      .withGame({ id: "game1" }, 3, 5)
      .withGroup("game1", { id: "group1" })
      .withEntry("group1");

    const ids = builder.getIds();

    expect(ids.gameIds).toContain("game1");
    expect(ids.groupIds).toContain("group1");
    expect(ids.categoryIds.length).toBe(3);
    expect(ids.nomineeIds.length).toBe(15);
    expect(ids.entryIds.length).toBe(1);
  });
});

describe("Pre-built Scenarios", () => {
  beforeEach(() => {
    resetIdCounter();
  });

  it("should create empty scenario", () => {
    const state = scenarios.empty();
    expect(state.games.size).toBe(0);
    expect(state.entries.size).toBe(0);
  });

  it("should create basic game scenario", () => {
    const state = scenarios.basicGame();
    expect(state.games.size).toBe(1);
    expect(state.groups.size).toBe(1);
    expect(state.entries.size).toBe(3);
  });

  it("should create game in progress scenario", () => {
    const state = scenarios.gameInProgress();
    const game = state.games.first();
    expect(game.answered_order.size).toBeGreaterThan(0);
  });

  it("should create completed game scenario", () => {
    const state = scenarios.completedGame();
    const game = state.games.first();
    expect(game.answered_order.size).toBe(state.categories.size);
  });

  it("should create game with ties scenario", () => {
    const state = scenarios.gameWithTies();
    expect(state.entries.size).toBe(3);
  });
});
