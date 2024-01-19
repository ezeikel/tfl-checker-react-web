import {
  FontAwesomeIcon,
  FontAwesomeIconProps,
} from "@fortawesome/react-fontawesome";
import { Mode } from "../../../types";
import {
  faBus,
  faBusAlt,
  faSubway,
  faTrain,
  faTram,
  faWalking,
} from "@fortawesome/pro-duotone-svg-icons";
import { useEffect, useRef, useState } from "react";
import { MODE_COLOURS } from "../../constants";

type FontAwesomeIconPropsWihoutIcon = Omit<FontAwesomeIconProps, "icon">;

type ModeIconProps = FontAwesomeIconPropsWihoutIcon & {
  mode: Mode;
  minusMarginLeft?: boolean;
};

const ModeIcon = ({ mode, minusMarginLeft, ...props }: ModeIconProps) => {
  let icon;

  const iconRef = useRef<SVGSVGElement>(null);
  const [marginLeft, setMarginLeft] = useState<string | number>("auto");

  switch (mode) {
    case Mode.WALKING:
      icon = faWalking;
      break;
    case Mode.BUS:
    case Mode.REPLACEMENT_BUS:
      icon = faBus;
      break;
    case Mode.COACH:
      icon = faBusAlt;
      break;
    case Mode.TUBE:
      icon = faSubway;
      break;
    case Mode.NATIONAL_RAIL:
      icon = faTrain;
      break;
    case Mode.OVERGROUND:
      icon = faTrain;
      break;
    case Mode.ELIZABETH_LINE:
      icon = faTrain;
      break;
    case Mode.DLR:
    case Mode.TRAM: // TODO: seperate icon?
      icon = faTram;
      break;
    default:
      console.error(`Mode icon not found. Mode: ${mode}`);
  }

  useEffect(() => {
    if (iconRef.current) {
      const iconWidth = iconRef.current.getBoundingClientRect().width;
      setMarginLeft(-iconWidth / 2); // Example: center the icon
    }
  }, []);

  if (!icon) {
    return null;
  }

  return (
    <FontAwesomeIcon
      icon={icon}
      color={MODE_COLOURS[mode].color}
      style={{
        marginLeft: minusMarginLeft ? marginLeft : 0,
        ...props.style,
      }}
      ref={iconRef}
      {...props}
    />
  );
};

export default ModeIcon;
