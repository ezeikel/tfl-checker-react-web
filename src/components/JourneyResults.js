import React from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import formatMoney from "../utils/formatMoney";
import convertDateToTime from "../utils/convertDateToTime";

const Wrapper = styled.section`
  display: flex;
  flex-direction: column;
`;

const Journey = styled.div`
  margin-bottom: 32px;
  padding: 16px;
  background-color: #fff;
  .timing {
    display: flex;
    justify-content: space-between;
  }
`;

const TimingFare = styled.div`
  margin-bottom: 32px;
`;

const Leg = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
  .location-name {
    font-size: 22px;
    margin-bottom: 16px;
  }
  .summary {
    margin-bottom: 16px;
    > svg {
      margin-right: 16px;
    }
  }
  .duration {
    display: flex;
    margin-bottom: 16px;
    span {
      &:first-of-type {
        margin-right: 16px;
        font-weight: bold;
      }
      &:nth-of-type(2) {
        color: #2070b0;
        text-decoration: underline;
      }
    }
  }
`;

const Steps = styled.div`
  display: flex;
  flex-direction: column;
`;

const Step = styled.div`
  display: flex;
  flex-direction: column;
  & + div {
    margin-top: 16px;
  }
  span {
    &:first-of-type {
      margin-bottom: 8px;
    }
  }
`;

const JourneyResults = ({ results }) => {
  const { journeys } = results;

  if (!journeys) return <div>Empty.</div>;
  return (
    <Wrapper>
      {journeys.map((journey, i) => (
        <Journey key={i}>
          <TimingFare>
            <div className="timing">
              <span>
                {convertDateToTime(journey.startDateTime)} -{" "}
                {convertDateToTime(journey.arrivalDateTime)}
              </span>
              <span>{journey.duration} min</span>
            </div>
            {journey.fare && (
              <span className="fare">
                {formatMoney(journey.fare.totalCost)}
              </span>
            )}
          </TimingFare>
          {journey.legs.map((leg, i) => (
            <Leg key={i}>
              <span className="location-name">{`${
                leg.departurePoint.commonName
              } at ${convertDateToTime(leg.departureTime)}`}</span>
              <div className="summary">
                <FontAwesomeIcon
                  icon={["fad", leg.mode.id]}
                  color="var(--color-dark-grey)"
                  size="2x"
                />
                <span>{leg.instruction.summary}</span>
              </div>
              <div className="duration">
                <span>{leg.duration} min</span>
                {leg.mode.id === "walking" && <span>Hide directions</span>}
                {(leg.mode.id === "bus" || leg.mode.id === "tube") && (
                  <span>Hide stops</span>
                )}
              </div>
              {leg.mode.id === "walking" && (
                <Steps>
                  {leg.instruction.steps.map((step, i) => (
                    <Step key={i}>
                      <span>{step.descriptionHeading}</span>
                      <span>{step.description}</span>
                    </Step>
                  ))}
                </Steps>
              )}
              {(leg.mode.id === "bus" || leg.mode.id === "tube") && (
                <Steps>
                  {leg.path.stopPoints.map((stopPoint, i) => (
                    <Step key={i}>
                      <span>{stopPoint.name}</span>
                    </Step>
                  ))}
                </Steps>
              )}
            </Leg>
          ))}
          <Leg>
            <div className="summary">
              <FontAwesomeIcon
                icon={["fad", "map-marker-alt"]}
                color="var(--color-dark-grey)"
                size="2x"
              />
              <span>
                {journey.legs[journey.legs.length - 1].arrivalPoint.commonName}
              </span>
            </div>
          </Leg>
        </Journey>
      ))}
    </Wrapper>
  );
};

export default JourneyResults;
