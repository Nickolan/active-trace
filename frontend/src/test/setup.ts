import "@testing-library/jest-dom";

// jsdom does not implement scrollIntoView — stub it to avoid test failures
if (typeof window !== "undefined") {
  window.HTMLElement.prototype.scrollIntoView = function () {};
}
