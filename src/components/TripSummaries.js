import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import styled from "styled-components";
import TripSummary from "./TripSummary";
import { setSelectedTrip } from "../redux/actions";

const Wrapper = styled.section`
  display: flex;
  flex-direction: column;
  margin-top: var(--spacing-huge);
  > span {
    &:first-of-type {
      font-size: 2.4rem;
      margin-bottom: 32px;
      font-weight: bold;
      color: var(--color-white);
    }
  }
  a {
    display: flex;
    width: 100%;
    align-items: center;
    color: var(--color-text);
    &:first-of-type {
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
      section {
        border-top-left-radius: 4px;
        border-top-right-radius: 4px;
      }
    }
    &:last-of-type {
      border-bottom-left-radius: 4px;
      border-bottom-right-radius: 4px;
      section {
        border-bottom-left-radius: 4px;
        border-bottom-right-radius: 4px;
      }
    }
    & + a {
      border-top: 1px solid #eeeeee;
    }
  }
`;

const StyledTripSummary = styled(TripSummary)`
  border-radius: 0;
  &:hover {
    background-color: #f2f2f2;
    cursor: pointer;
  }
`;

const TripSummaries = ({ journeys, onSetSelectedTrip }) => (
  <Wrapper>
    <span>Suggested</span>
    {journeys.map((journey, i) => (
      // eslint-disable-next-line react/no-array-index-key
      <Link to="/trip" onClick={() => onSetSelectedTrip(journey)} key={i}>
        <StyledTripSummary journey={journey} />
      </Link>
    ))}
  </Wrapper>
);

const mapDispatchToProps = dispatch => ({
  onSetSelectedTrip: value => dispatch(setSelectedTrip(value)),
});

TripSummaries.propTypes = {
  journeys: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  onSetSelectedTrip: PropTypes.func.isRequired,
};

export default connect(null, mapDispatchToProps)(TripSummaries);
