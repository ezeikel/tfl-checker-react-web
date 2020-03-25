import React, { useEffect } from 'react';
import styled from 'styled-components';
import { connect } from "react-redux";
import { clearSelectedTrip } from "../redux/actions";
import TripSummary from './TripSummary';

const Wrapper = styled.section`
  display: flex;
  flex-direction: column;
`;

const Trip = ({ selectedTrip, onClearSelectedTrip }) => {
  useEffect(() => {
    return () => {
      onClearSelectedTrip();
    }
  }, []);

  debugger;

  if (!selectedTrip) {
    return <div>No selected trip.</div>
  }

  return (
    <Wrapper>
      <TripSummary journey={selectedTrip} />
      {/* {
        <div>
          <div>
            <div className="timing">
              <span>{convertDateToTime(journey.startDateTime)} - {convertDateToTime(journey.arrivalDateTime)}</span>
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
                <span className="location-name">{`${leg.departurePoint.commonName} at ${convertDateToTime(leg.departureTime)}`}</span>
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
      } */}
    </Wrapper>
  );
};

const mapStateToProps = ({ suggestion }) => (
  {
    selectedTrip: suggestion.selected,
  }
);

const mapDispatchToProps = dispatch => (
  {
    onClearSelectedTrip: () => dispatch(clearSelectedTrip())
  }
);

export default connect(mapStateToProps, mapDispatchToProps)(Trip);
