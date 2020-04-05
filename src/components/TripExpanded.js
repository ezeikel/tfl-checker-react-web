import React, { useState } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import convertDateToTime from "../utils/convertDateToTime";
import ToggleExpand from "./ToggleExpand";

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

const Wrapper = styled.section`
  display: flex;
  flex-direction: column;
  background-color: var(--color-white);
  padding: 32px;
  border-radius: 4px;
`;

const Leg = styled.section`
  display: flex;
  flex-direction: column;
`;

const Header = styled.section`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`;

const Footer = styled.section`
  display: flex;
  align-items: center;
`;

const Content = styled.section`
  display: flex;
`;

const Point = styled.span`
  font-size: 2rem;
  margin-left: 4px;
`;

const Stops = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 1.6rem;
  > div {
    & + div {
      margin-top: 16px;
    }
    &:last-of-type {
      margin-bottom: 16px;
    }
  }
`;

const Stop = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  &:before {
    content: "";
    display: block;
    height: 4px;
    width: 12px;
    border-radius: 4px;
    background-color: #4d4d4d;
    background-color: ${({ color }) => color};
    position: absolute;
    top: 50%;
    left: -4px;
    margin-top: -2px;
    margin-left: -15px;
  }
`;

const Direction = styled.div`
  display: flex;
  flex-direction: column;
  display: relative;
  position: relative;
  &:before {
    content: "";
    display: block;
    height: 4px;
    width: 12px;
    border-radius: 4px;
    background-color: #4d4d4d;
    position: absolute;
    top: 50%;
    left: -4px;
    margin-top: -2px;
    margin-left: -15px;
  }
  span {
    &:first-child {
      font-size: 18px;
    }
  }
`;

const Summary = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 1.8rem;
  margin-bottom: 8px;
`;

const VerticalLine = styled.div`
  display: flex;
  background-color: ${({ color }) => color};
  width: 4px;
  min-height: 32px;
  border-radius: 4px;
  margin-right: 18px;
  margin-left: -2px;
`;

const Duration = styled.div`
  display: flex;
  font-size: 1.6rem;
  margin-bottom: 8px;
  span {
    &:first-of-type {
      font-weight: bold;
    }
    & + span {
      margin-left: 16px;
    }
  }
`;

const Toggle = styled.span`
  color: #28bcd4;
  cursor: pointer;
`;

const ModeIcon = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 32px;
  height: 32px;
  margin-left: -16px;
`;

const Trip = ({ className, trip }) => {
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
                    leg.instruction.steps.map((
                      step,
                      i, // eslint-disable-line no-shadow
                    ) => (
                      // eslint-disable-next-line react/no-array-index-key
                      <Direction key={i}>
                        <span>{step.descriptionHeading}</span>
                        <span>{step.description}</span>
                      </Direction>
                    ))}
                  {(leg.mode.id === "bus" ||
                    leg.mode.id === "national-rail" ||
                    leg.mode.id === "london-overground" ||
                    leg.mode.id === "tube") &&
                    leg.path.stopPoints.map((
                      stopPoint,
                      i, // eslint-disable-line no-shadow
                    ) => (
                      // eslint-disable-next-line react/no-array-index-key
                      <Stop key={i} color={MODE_COLOURS[leg.mode.id].color}>
                        {" "}
                        <span>{stopPoint.name}</span>
                      </Stop>
                    ))}
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

Trip.defaultProps = {};

Trip.propTypes = {
  className: PropTypes.string.isRequired,
  trip: PropTypes.shape({
    legs: PropTypes.arrayOf(
      PropTypes.shape({
        mode: PropTypes.shape({
          id: PropTypes.string,
        }),
        arrivalPoint: PropTypes.shape({
          commonName: PropTypes.string,
        }),
        departureTime: PropTypes.string,
      }),
    ),
  }).isRequired,
};

export default Trip;
