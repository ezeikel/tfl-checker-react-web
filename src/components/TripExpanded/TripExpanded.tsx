import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import convertDateToTime from "../../utils/convertDateToTime";
import ToggleExpand from "../ToggleExpand/ToggleExpand";
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
} from "./TripExpanded.styled";

const MODE_COLOURS = {
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
  className: string;
  trip: {
    legs: {
      mode: {
        id: string;
      };
      arrivalPoint: {
        commonName: string;
      };
      departureTime: string;
    };
  };
};

const TripExpanded = ({ className, trip }: TripExpandedProps) => {
  const [legs, setLegs] = useState(trip.legs.map(() => ({ expanded: false })));

  if (Object.keys(trip).length === 0) return null;

  return (
    <Wrapper className={className}>
      {trip.legs.map((leg, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <Leg key={i}>
          <Header>
            <ModeIcon>
              <FontAwesomeIcon
                icon={["fad", MODE_COLOURS[leg.mode.id].icon]}
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
                    legIndex={i}
                    legStops={legs}
                    setLegs={setLegs}
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
          trip.legs[trip.legs.length - 1].arrivalPoint.commonName
        } at ${convertDateToTime(
          trip.legs[trip.legs.length - 1].departureTime,
        )}`}</Point>
      </Footer>
    </Wrapper>
  );
};

export default TripExpanded;
