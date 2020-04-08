import React from "react";
import PropTypes from "prop-types";
import { Switch, Route, Redirect } from "react-router-dom";
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

const Main = ({ selectedTrip }) => (
  <Wrapper>
    <Switch>
      <Route exact path="/">
        <Status />
      </Route>
      <Route path="/trip-planner">
        <TripPlanner />
      </Route>
      <Route path="/trip">
        {selectedTrip ? <Trip /> : <Redirect to="/trip-planner" />}
      </Route>
    </Switch>
  </Wrapper>
);

const mapStateToProps = ({ suggestion }) => ({
  selectedTrip: suggestion.selected,
});

Main.defaultProps = {
  selectedTrip: {},
};

Main.propTypes = {
  selectedTrip: PropTypes.shape({
    duration: PropTypes.number,
    startDateTime: PropTypes.string,
    arrivalDateTime: PropTypes.string,
    legs: PropTypes.array,
  }),
};

export default connect(mapStateToProps)(Main);
