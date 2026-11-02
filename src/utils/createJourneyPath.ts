type JourneyLegPoints = {
  departurePoint: { lat: number; lon: number };
  arrivalPoint: { lat: number; lon: number };
};

export const createJourneyPath = (legs: readonly JourneyLegPoints[]) => {
  if (legs.length === 0) return [];
  return [
    ...legs.map((leg) => ({
      lat: leg.departurePoint.lat,
      lng: leg.departurePoint.lon,
    })),
    {
      lat: legs[legs.length - 1].arrivalPoint.lat,
      lng: legs[legs.length - 1].arrivalPoint.lon,
    },
  ];
};
