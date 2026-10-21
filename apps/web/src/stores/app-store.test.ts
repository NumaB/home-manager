import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createAppStore } from "./app-store";

describe("app store", () => {
  it("initializes the global UI state and exposes menu actions", () => {
    const store = createAppStore();
    assert.equal(store.getState().isMenuOpen, false);

    store.getState().openMenu();
    assert.equal(store.getState().isMenuOpen, true);

    store.getState().toggleMenu();
    assert.equal(store.getState().isMenuOpen, false);

    store.getState().toggleMenu();
    store.getState().closeMenu();
    assert.equal(store.getState().isMenuOpen, false);
  });

  it("creates an isolated store for each app instance", () => {
    const firstStore = createAppStore();
    const secondStore = createAppStore();

    firstStore.getState().openMenu();

    assert.equal(firstStore.getState().isMenuOpen, true);
    assert.equal(secondStore.getState().isMenuOpen, false);
  });
});
