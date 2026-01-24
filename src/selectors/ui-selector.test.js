import { Map, fromJS } from "immutable";
import { pendingValuesSelector } from "./ui-selector";
import { UI } from "../models/UI";
import { createInitialState } from "../testUtils/storeUtils";
import { createUI, createUIWithValues } from "../testUtils/factories";

describe("ui selectors", () => {
  describe("pendingValuesSelector", () => {
    it("should return pending values from UI state", () => {
      const values = { category1: 5, category2: 10 };
      const state = createInitialState({
        ui: createUIWithValues(values),
      });

      const result = pendingValuesSelector(state);
      expect(result.get("category1")).toBe(5);
      expect(result.get("category2")).toBe(10);
    });

    it("should return empty map when no values set", () => {
      const state = createInitialState({
        ui: createUI(),
      });

      const result = pendingValuesSelector(state);
      expect(result.size).toBe(0);
    });

    it("should return all category values", () => {
      const values = {
        category1: 1,
        category2: 2,
        category3: 3,
        category4: 4,
        category5: 5,
      };
      const state = createInitialState({
        ui: createUIWithValues(values),
      });

      const result = pendingValuesSelector(state);
      expect(result.size).toBe(5);
      expect(result.reduce((acc, val) => acc + val, 0)).toBe(15);
    });
  });
});
