import { createJourneyPath } from "./createJourneyPath";

it("keeps both ends of a one-leg journey", () => {
  expect(createJourneyPath([{ departurePoint: { lat: 51.5, lon: -0.12 }, arrivalPoint: { lat: 51.52, lon: -0.1 } }])).toEqual([
    { lat: 51.5, lng: -0.12 }, { lat: 51.52, lng: -0.1 },
  ]);
});

it("preserves leg handoffs and the final arrival without mutating the input", () => {
  const legs = Object.freeze([
    { departurePoint: { lat: 51.5, lon: -0.12 }, arrivalPoint: { lat: 51.51, lon: -0.11 } },
    { departurePoint: { lat: 51.51, lon: -0.11 }, arrivalPoint: { lat: 51.52, lon: -0.1 } },
  ]);
  const before = JSON.stringify(legs);
  expect(createJourneyPath(legs)).toEqual([{ lat: 51.5, lng: -0.12 }, { lat: 51.51, lng: -0.11 }, { lat: 51.52, lng: -0.1 }]);
  expect(JSON.stringify(legs)).toEqual(before);
});

it("does not invent a point for an empty journey", () => {
  expect(createJourneyPath([])).toEqual([]);
});
