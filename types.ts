export enum Mode {
  WALKING = "walking",
  BUS = "bus",
  REPLACEMENT_BUS = "replacement-bus",
  COACH = "coach",
  TUBE = "tube",
  NATIONAL_RAIL = "national-rail",
  OVERGROUND = "overground",
  ELIZABETH_LINE = "elizabeth-line",
  DLR = "dlr",
  TRAM = "tram",
}

export type ModeColour = {
  icon: string;
  color: string;
};

type Coordinate = {
  lat: number;
  lon: number;
};

export type CoordinateAlt = {
  lat: number;
  lng: number;
};

type Leg = {
  mode: {
    id: Mode;
  };
  arrivalPoint: Coordinate & {
    commonName: string;
  };
  departurePoint: Coordinate & {
    commonName: string;
  };
  departureTime: string;
  duration: number;
  instruction: {
    summary: string;
    steps: {
      descriptionHeading: string;
      description: string;
      distance: number;
      duration: number;
    }[];
  };
  path: {
    stopPoints: {
      name: string;
    }[];
  };
};

export type Journey = {
  id: string;
  fare: {
    totalCost: number;
  };
  duration: number;
  legs: Leg[];
};

export type Path = Coordinate[];

export type CoordinatesAlt2 = {
  latitude: number;
  longitude: number;
};

export type Location = {
  coordiantes: CoordinatesAlt2;
  placeId: string;
};

export type Journey2 = {
  from: Location;
  to: Location;
};
