import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import convertDateToTime from "../../utils/convertDateToTime";
import {
  Wrapper,
  Leg,
  Header,
  Footer,
  Content,
  Point,
  Stops,
  Stop,
  Direction,
  Summary,
  VerticalLine,
  Duration,
  Toggle,
  ModeIcon,
  ToggleExpand,
} from "./TripExpanded.styled";
import { Journey } from "../../../types";

const MODE_COLOURS: {
  [key: string]: {
    icon: string;
    color: string;
  };
} = {
  walking: {
    icon: "walking",
    color: "#4D4D4D",
  },
  bus: {
    icon: "bus",
    color: "#C83638",
  },
  "replacement-bus": {
    icon: "bus",
    color: "#C83638",
  },
  coach: {
    icon: "bus-alt",
    color: "#10bd59",
  },
  "national-rail": {
    icon: "train",
    color: "#043261",
  },
  overground: {
    icon: "train",
    color: "#E46B24",
  },
  tube: {
    icon: "subway",
    color: "#051EA6",
  },
  tflrail: {
    icon: "train",
    color: "#051EA6",
  },
  dlr: {
    icon: "tram",
    color: "#26AFAC",
  },
};

type TripExpandedProps = {
  className?: string;
  journey: Journey;
};

const TripExpanded = ({ className, journey }: TripExpandedProps) => {
  const [legs, setLegs] = useState(
    journey.legs.map(() => ({ expanded: false })),
  );

  if (Object.keys(journey).length === 0) return null;

  return (
    <Wrapper className={className}>
      {journey.legs.map((leg, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <Leg key={i}>
          <Header>
            <ModeIcon>
              <FontAwesomeIcon
                icon={["fad", MODE_COLOURS[leg.mode.id].icon] as IconProp}
                color={MODE_COLOURS[leg.mode.id].color}
                size="2x"
              />
            </ModeIcon>
            <Point className="location-name">{`${
              leg.departurePoint.commonName
            } at ${convertDateToTime(leg.departureTime)}`}</Point>
          </Header>
          <Content>
            <VerticalLine color={MODE_COLOURS[leg.mode.id].color} />
            <div>
              <Summary>{leg.instruction.summary}</Summary>
              <Duration>
                <span>{leg.duration} min</span>
                {leg.mode.id === "walking" && (
                  <ToggleExpand
                    onClick={() => {
                      const updatedLegs = legs.map(({ expanded }, index) => ({
                        expanded: i === index ? !expanded : expanded,
                      }));
                      setLegs(updatedLegs);
                    }}
                  />
                )}
                {(leg.mode.id === "bus" ||
                  leg.mode.id === "national-rail" ||
                  leg.mode.id === "london-overground" ||
                  leg.mode.id === "tube") && (
                  <Toggle
                    onClick={() => {
                      const updatedLegs = legs.map(({ expanded }, index) => ({
                        expanded: i === index ? !expanded : expanded,
                      }));
                      setLegs(updatedLegs);
                    }}
                  >
                    {`${legs[i].expanded ? "Hide" : "Show"} ${
                      leg.path.stopPoints.length
                    } stop${leg.path.stopPoints.length === 1 ? "" : "s"}`}
                  </Toggle>
                )}
              </Duration>
              {legs[i].expanded && (
                <Stops>
                  {leg.mode.id === "walking" &&
                    leg.instruction.steps.map(
                      (
                        step,
                        i, // eslint-disable-line no-shadow
                      ) => (
                        // eslint-disable-next-line react/no-array-index-key
                        <Direction key={i}>
                          <span>{step.descriptionHeading}</span>
                          <span>{step.description}</span>
                        </Direction>
                      ),
                    )}
                  {(leg.mode.id === "bus" ||
                    leg.mode.id === "national-rail" ||
                    leg.mode.id === "london-overground" ||
                    leg.mode.id === "tube") &&
                    leg.path.stopPoints.map(
                      (
                        stopPoint,
                        i, // eslint-disable-line no-shadow
                      ) => (
                        // eslint-disable-next-line react/no-array-index-key
                        <Stop key={i} color={MODE_COLOURS[leg.mode.id].color}>
                          {" "}
                          <span>{stopPoint.name}</span>
                        </Stop>
                      ),
                    )}
                </Stops>
              )}
            </div>
          </Content>
        </Leg>
      ))}
      <Footer>
        <ModeIcon>
          <FontAwesomeIcon
            icon={["fas", "map-marker-alt"]}
            color="var(--color-background)"
            size="2x"
          />
        </ModeIcon>
        <Point className="location-name">{`${
          journey.legs[journey.legs.length - 1].arrivalPoint.commonName
        } at ${convertDateToTime(
          journey.legs[journey.legs.length - 1].departureTime,
        )}`}</Point>
      </Footer>
    </Wrapper>
  );
};

export default TripExpanded;
