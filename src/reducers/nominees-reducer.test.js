import reducer from "./nominees-reducer";
import { setNominees } from "../actions/nominee-actions";
import { savePendingCategory } from "../actions/pending-game-actions";
import { Map } from "immutable";
import Nominee from "../models/Nominee";
import Category from "../models/Category";

describe("nominees reducer", () => {
  it("sets retrieved nominees", () => {
    const newNominees = {
      1: {
        id: 1,
        name: "nominee 1",
      },
      2: {
        id: 2,
        name: "nominee 2",
      },
    };
    const existingNominees = {
      2: {
        id: 2,
        name: "an old name",
      },
      3: {
        id: 3,
        name: "different nominee",
      },
    };
    const initialState = new Map()
      .set(2, new Nominee(existingNominees[2]))
      .set(3, new Nominee(existingNominees[3]));
    const action = setNominees(newNominees);

    // SET_NOMINEES replaces all nominees with the new set (not merge)
    const expectedResult = new Map()
      .set("1", new Nominee(newNominees[1]))
      .set("2", new Nominee(newNominees[2]));

    expect(reducer(initialState, action).toJS()).toEqual(expectedResult.toJS());
  });

  it("should add nominees from pending category", () => {
    const nominees = new Map()
      .set(
        "nom1",
        new Nominee({ id: "nom1", text: "Nominee 1", category: "cat1" })
      )
      .set(
        "nom2",
        new Nominee({ id: "nom2", text: "Nominee 2", category: "cat1" })
      );

    const pendingCategory = new Category({
      id: "cat1",
      name: "Test Category",
      nominees,
    });

    const initialState = new Map();
    const action = savePendingCategory(pendingCategory);
    const result = reducer(initialState, action);

    expect(result.has("nom1")).toBe(true);
    expect(result.has("nom2")).toBe(true);
    expect(result.getIn(["nom1", "text"])).toBe("Nominee 1");
    expect(result.getIn(["nom2", "text"])).toBe("Nominee 2");
  });

  it("should merge new nominees with existing ones on SAVE_PENDING_CATEGORY", () => {
    const existingNominee = new Nominee({
      id: "existing",
      text: "Existing Nominee",
    });
    const initialState = new Map().set("existing", existingNominee);

    const newNominees = new Map().set(
      "new",
      new Nominee({ id: "new", text: "New Nominee", category: "cat1" })
    );

    const pendingCategory = new Category({
      id: "cat1",
      name: "Test Category",
      nominees: newNominees,
    });

    const action = savePendingCategory(pendingCategory);
    const result = reducer(initialState, action);

    expect(result.has("existing")).toBe(true);
    expect(result.has("new")).toBe(true);
  });

  it("returns default state for unknown action", () => {
    const initialState = new Map();
    const action = { type: "UNKNOWN_ACTION" };
    expect(reducer(initialState, action)).toEqual(initialState);
  });
});
