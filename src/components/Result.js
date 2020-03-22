import React from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import JourneySummary from './JourneySummary';

const Wrapper = styled.section`
  display: flex;
  flex-direction: column;
`;

const addLeadingZero = value => value < 10 ? '0' + value : value;

const covertDateToTime = dateString => {
  const date = new Date(dateString);
  const hours = date.getHours();
  const minutes = date.getMinutes();

  return `${addLeadingZero(hours)}:${addLeadingZero(minutes)}`;
};

const formatMoney = (value) => new Intl.NumberFormat('en-GB',  { style: 'currency', currency: 'GBP'}).format(value / 100);

const JourneyResults = ({ journey }) => {
    if (!journey) return <div>Empty.</div>
    return (
      <Wrapper>
        {/* <JourneySummary results={[journey]} /> */}
        {
          <div>
            <div>
              <div className="timing">
                <span>{covertDateToTime(journey.startDateTime)} - {covertDateToTime(journey.arrivalDateTime)}</span>
                <span>
                  {journey.duration} min
                </span>
              </div>
              {journey.fare &&
                <span className="fare">
                  {formatMoney(journey.fare.totalCost)}
                </span>
              }
            </div>
            {
              journey.legs.map((leg, i) => (
                <div key={i}>
                  <span className="location-name">{`${leg.departurePoint.commonName} at ${covertDateToTime(leg.departureTime)}`}</span>
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
                    {leg.mode.id === "walking" &&
                      <span>Hide directions</span>
                    }
                    {(leg.mode.id === "bus" || leg.mode.id === "tube") &&
                      <span>Hide stops</span>
                    }
                  </div>
                  {leg.mode.id === "walking" &&
                    <div>
                      {leg.instruction.steps.map((step, i) => (
                        <div key={i}>
                          <span>{step.descriptionHeading}</span>
                          <span>{step.description}</span>
                        </div>
                      ))}
                    </div>
                  }
                  {(leg.mode.id === "bus" || leg.mode.id === "tube") &&
                    <div>
                      {leg.path.stopPoints.map((stopPoint, i) => (
                        <div key={i}>
                          <span>{stopPoint.name}</span>
                        </div>
                      ))

                      }
                    </div>
                  }
                </div>
              ))
            }
            <div>
              <div className="summary">
                <FontAwesomeIcon
                  icon={["fad", "map-marker-alt"]}
                  color="var(--color-dark-grey)"
                  size="2x"
                />
                <span>{journey.legs[journey.legs.length -1].arrivalPoint.commonName}</span>
              </div>
            </div>
          </div>
        }
      </Wrapper>
    );
};

export default JourneyResults;