// react-testing-library renders your components to document.body,
// this adds jest-dom's custom assertions
import "@testing-library/jest-dom/extend-expect";

window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: () => {},
      removeListener: () => {},
    };
  };

window.requestAnimationFrame =
  window.requestAnimationFrame ||
  function (callback) {
    return setTimeout(callback, 0);
  };
