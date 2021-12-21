import React from "react";
import { Routes, Route } from "react-router-dom";
import { connect } from "react-redux";
import styled from "styled-components";
import Status from "./Status";
import TripPlanner from "./TripPlanner";
import Trip from "./Trip";

const Wrapper = styled.main`
  display: flex;
  flex-direction: column;
  padding: var(--spacing-large);
`;

const Main = () => {
  return (
    <Wrapper>
      <Routes>
        <Route path="/" element={<Status />} />
        <Route path="/trip-planner" element={<TripPlanner />} />
        <Route path="/trip" element={<Trip />} />
      </Routes>
    </Wrapper>
  );
};

const mapStateToProps = ({ suggestion }) => ({
  selectedTrip: suggestion.selected,
});

Main.defaultProps = {
  selectedTrip: {},
};

export default connect(mapStateToProps)(Main);
