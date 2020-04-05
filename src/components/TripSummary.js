import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import formatMoney from "../utils/formatMoney";
import Mode from "./Mode";

const Wrapper = styled.section`
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  width: 100%;
  padding: 32px;
  background-color: #fff;
  border-radius: 4px;
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

const TotalFare = styled.div`
  flex: 0 0 auto;
  display: flex;
  font-size: 16px;
  font-weight: bold;
  color: #31cc71;
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
        {journey.legs.map((leg, i) => (
          <Mode
            key={i} // eslint-disable-line react/no-array-index-key
            leg={leg}
          />
        ))}
      </Legs>
      <TotalFare>
        {formatMoney(journey.fare ? journey.fare.totalCost : 0)}
      </TotalFare>
      <Duration>
        <span>{journey.duration}</span>
        <span>min</span>
      </Duration>
    </Wrapper>
  );
};

TripSummary.propTypes = {
  className: PropTypes.string.isRequired,
  journey: PropTypes.shape({
    fare: PropTypes.shape({
      totalCost: PropTypes.number,
    }),
    duration: PropTypes.number,
    legs: PropTypes.arrayOf(PropTypes.shape({})),
  }).isRequired,
};

export default TripSummary;
