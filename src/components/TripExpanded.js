import React from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import convertDateToTime from "../utils/convertDateToTime";

const Wrapper = styled.section`
  display: flex;
  flex-direction: column;
  background-color: var(--color-white);
  padding: 32px;
  border-radius: 4px;
  margin-top: 32px;
`;

const Leg = styled.section`
  display: flex;
  flex-direction: column;
`;

const Header = styled.section`
  display: flex;
  align-items: center;
  /* svg {
    margin-right: 16px;
  } */
`;

const Content = styled.section`
  display: flex;
`;

const Point = styled.span`
  font-size: 2rem;
`;

const Stops = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 1.6rem;
`;

const Stop = styled.div`
  display: flex;
  flex-direction: column;
`;

const Direction = styled.div`
  display: flex;
  flex-direction: column;
`;

const Summary = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 1.8rem;
`;

const VerticalLine = styled.div`
  display: flex;
  background-color: #4D4D4D;
  width: 4px;
  min-height: 32px;
  border-radius: 4px;
  margin-right: 18px;
  margin-left: -2px;
`;

const Duration = styled.div`
  display: flex;
  font-size: 1.6rem;
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
  color: #28BCD4;
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

const Trip = ({ trip }) => {
  if (Object.keys(trip).length === 0) return null;

  return (
    <Wrapper>
      {
        trip.legs.map((leg, i) => (
          <Leg key={i}>
            <Header>
              <ModeIcon>
                <FontAwesomeIcon
                  icon={["fad", leg.mode.id]}
                  color="var(--color-dark-grey)"
                  size="2x"
                />
              </ModeIcon>
              <Point className="location-name">{`${leg.departurePoint.commonName} at ${convertDateToTime(leg.departureTime)}`}</Point>
            </Header>
            <Content>
              <VerticalLine />
              <div>
                <Summary>{leg.instruction.summary}</Summary>
                <Duration>
                  <span>{leg.duration} min</span>
                  {leg.mode.id === "walking" &&
                    <Toggle>Hide directions</Toggle>
                  }
                  {(leg.mode.id === "bus" || leg.mode.id === "tube") &&
                    <Toggle>Hide stops</Toggle>
                  }
                </Duration>
                <Stops>
                  {leg.mode.id === "walking" &&
                    leg.instruction.steps.map((step, i) => (
                      <Direction key={i}>
                        <span>{step.descriptionHeading}</span>
                        <span>{step.description}</span>
                      </Direction>
                    ))
                  }
                  {(leg.mode.id === "bus" || leg.mode.id === "tube") &&
                    leg.path.stopPoints.map((stopPoint, i) => (
                      <Stop key={i}>
                        <span>{stopPoint.name}</span>
                      </Stop>
                    ))
                  }
                </Stops>
              </div>
            </Content>
          </Leg>
        ))
      }
      <div>
        <div className="summary">
          <ModeIcon>
            <FontAwesomeIcon
              icon={["fad", "map-marker-alt"]}
              color="var(--color-dark-grey)"
              size="3x"
            />
          </ModeIcon>
          <span>{trip.legs[trip.legs.length -1].arrivalPoint.commonName}</span>
        </div>
      </div>
    </Wrapper>
  );
};

export default Trip;
