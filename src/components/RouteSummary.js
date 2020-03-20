import React from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Wrapper = styled.section`
  display: flex;
  flex-direction: column;
  > span {
    &:first-of-type {
      font-size: 2.4rem;
      margin-bottom: 32px;
      font-weight: bold;
      color: var(--color-white);
    }
  }
`;

const Summary = styled.section`
  display: flex;
  padding: 32px;
  background-color: #fff;
  flex: 0 0 auto;
  align-items: center;
  &:hover {
    background-color: #F2F2F2;
    cursor: pointer;
  }
  & + section {
    border-top: 1px solid #f6f6f6;
  }
  .timing {
    display: flex;
    justify-content: space-between;
  }
`;

const Legs = styled.div`
  display: flex;
  flex: 1 0 auto;
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

const formatMoney = (value) => new Intl.NumberFormat('en-GB',  { style: 'currency', currency: 'GBP'}).format(value / 100);

const renderOptions = leg => leg.routeOptions.map((option, i) => <span key={i}>{option.name}</span>);

const RouteSummary = ({ results }) => {
    console.log({ results });
    const { journeys } = results;

    if (!journeys) return <div>Empty.</div>
    return (
      <Wrapper>
        <span>Suggested</span>
        <div>
          {
            journeys.map((journey, i) => (
              <Summary key={i}>
                <Legs>
                  {
                    journey.legs.map((leg, i) => {
                      if (leg.mode.id === "walking") {
                        return (
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
                      } else {
                        return (
                          <div>WRONG</div>
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
              </Summary>
            ))
          }
        </div>
      </Wrapper>
    );
};

export default RouteSummary;