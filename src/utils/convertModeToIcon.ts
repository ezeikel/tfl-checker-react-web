type Mode =
  | "walking"
  | "bus"
  | "replacement-bus"
  | "coach"
  | "tube"
  | "national-rail"
  | "overground"
  | "elizabeth-line"
  | "dlr";

type Icon = {
  name?: string;
  color?: string;
};

const convertModeToIcon = (mode: Mode) => {
  const icon: Icon = {};

  switch (mode) {
    case "walking":
      icon.name = "walking";
      icon.color = "#34495E";
      break;
    case "bus":
    case "replacement-bus":
      icon.name = "bus";
      icon.color = "#C83638";
      break;
    case "coach":
      icon.name = "bus-alt";
      icon.color = "#10bd59";
      break;
    case "tube":
      icon.name = "subway";
      icon.color = "#34495E";
      break;
    case "national-rail":
      icon.name = "train";
      icon.color = "#34495E";
      break;
    case "overground":
      icon.name = "train";
      icon.color = "#E46B24";
      break;
    case "elizabeth-line":
      icon.name = "train";
      icon.color = "#0026A5";
      break;
    case "dlr":
      icon.name = "tram";
      icon.color = "#26AFAC";
      break;
    default:
      console.error("Mode icon not found.");
  }

  return icon;
};

export default convertModeToIcon;
