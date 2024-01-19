import { Mode, ModeColour } from "../types";

export const MODE_COLOURS: {
  [K in Mode]: ModeColour;
} = {
  [Mode.WALKING]: {
    icon: "walking",
    color: "#4D4D4D",
  },
  [Mode.BUS]: {
    icon: "bus",
    color: "#C83638",
  },
  [Mode.REPLACEMENT_BUS]: {
    icon: "bus",
    color: "#C83638",
  },
  [Mode.COACH]: {
    icon: "bus-alt",
    color: "#10bd59",
  },
  [Mode.NATIONAL_RAIL]: {
    icon: "train",
    color: "#043261",
  },
  [Mode.OVERGROUND]: {
    icon: "train",
    color: "#E46B24",
  },
  [Mode.TUBE]: {
    icon: "subway",
    color: "#051EA6",
  },
  [Mode.ELIZABETH_LINE]: {
    icon: "train",
    color: "#051EA6",
  },
  [Mode.DLR]: {
    icon: "tram",
    color: "#26AFAC",
  },
  [Mode.TRAM]: {
    icon: "tram",
    color: "#26AFAC",
  },
};
