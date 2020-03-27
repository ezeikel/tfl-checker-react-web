import React from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import formatMoney from "../utils/formatMoney";
import renderOptions from "../utils/renderOptions";

const Wrapper = styled.section`
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  width: 100%;
  padding: 32px;
  background-color: #fff;
  border-radius: 4px;
  &:hover {
    background-color: #F2F2F2;
    cursor: pointer;
  }
  .timing {
    display: flex;
    justify-content: space-between;
  }
`;

const Legs = styled.div`
  flex: 1 0 auto;
  display: flex;
  align-items: center;
  > div {
    & + div {
      margin-left: 16px;
    }
  }
`;

const Route = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid #D9D9D9;
  padding: 8px;
  border-radius: 4px;
  font-size: 1.4rem;
  font-weight: bold;
  span {
    margin-left: 8px;
  }
`;

const TotalFare = styled.div`
    flex: 0 0 auto;
    display: flex;
    font-size: 16px;
    font-weight: bold;
    color: #31CC71;
    margin-right: 32px;
`;

const Duration = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    span {
      &:first-of-type {
        font-size: 2.4rem;
        font-weight: bold;
      }
      &:last-of-type {
        font-size: 1.6rem;
      }
    }
`;

const TripSummary = ({ journey, className }) => {
  if (Object.keys(journey).length === 0) return null;

  return (
    <Wrapper className={className}>
      <Legs>
        {
          journey.legs.map((leg, i) => {
            if (leg.mode.id === "walking") {
              return (
                /* TODO: Do one for 'overground' */
                <Route key={i}>
                  {
                    <FontAwesomeIcon
                      icon={["fad", "walking"]}
                      color="#34495E"
                      size="lg"
                    />
                  }
                </Route>
              );
            } else if (leg.mode.id === "bus") {
              return (
                <Route key={i}>
                  {
                    <>
                      <FontAwesomeIcon
                        icon={["fad", "bus"]}
                        color="#C83638"
                        size="lg"
                      />
                      {renderOptions(leg)}
                    </>
                  }
                </Route>
              );
            } else if (leg.mode.id === "tube") {
              return (
                <Route key={i}>
                  {
                    <>
                      <FontAwesomeIcon
                        icon={["fad", "subway"]}
                        color="#34495E"
                        size="lg"
                      />
                      {renderOptions(leg)}
                    </>
                  }
                </Route>
              );
            } else if (leg.mode.id === "national-rail") {
              return (
                <Route key={i}>
                  {
                    <>
                      <FontAwesomeIcon
                        icon={["fad", "train"]}
                        color="#34495E"
                        size="lg"
                      />
                      {renderOptions(leg)}
                    </>
                  }
                </Route>
              );
            } else if (leg.mode.id === "overground") {
              return (
                <Route key={i}>
                  {
                    <>
                      <FontAwesomeIcon
                        icon={["fad", "train"]}
                        color="#E46B24"
                        size="lg"
                      />
                      {renderOptions(leg)}
                    </>
                  }
                </Route>
              );
            } else if (leg.mode.id === "dlr") {
              return (
                <Route key={i}>
                  {
                    <>
                      <FontAwesomeIcon
                        icon={["fad", "tram"]}
                        color="#26AFAC"
                        size="lg"
                      />
                      {renderOptions(leg)}
                    </>
                  }
                </Route>
              );
            } else {
              return (
                <div key={i}>WRONG</div>
              )
            }
          })
        }
      </Legs>
      <TotalFare>
        {formatMoney(journey.fare ? journey.fare.totalCost : 0)}
      </TotalFare>
      <Duration>
        <span>
          {journey.duration}
        </span>
        <span>
          min
        </span>
      </Duration>
    </Wrapper>
  );
};

export default TripSummary;