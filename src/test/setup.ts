import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";

// Each test starts with a clean guest cart/wishlist (localStorage) and no
// leftover DOM from the previous test.
afterEach(() => {
  window.localStorage.clear();
});
