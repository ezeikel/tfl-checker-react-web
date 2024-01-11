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
    id: string;
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

type CoordinatesAlt2 = {
  latitude: number;
  longitude: number;
};

export type Location = {
  address: string;
  coordinates?: CoordinatesAlt2;
};
