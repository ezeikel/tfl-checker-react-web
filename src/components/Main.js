import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { connect } from "react-redux";
import Status from './Status';
import TripPlanner from './TripPlanner';
import Trip from './Trip';

const Main = ({ selectedTrip }) => (
  <main>
    <Switch>
      <Route exact path='/'>
        <Status />
      </Route>
      <Route path='/trip-planner'>
        <TripPlanner />
      </Route>
      <Route path='/trip'>
        {selectedTrip ? <Trip /> : <Redirect to="/trip-planner" />}
      </Route>
    </Switch>
  </main>
);

const mapStateToProps = ({ suggestion }) => (
  {
    selectedTrip: suggestion.selected,
  }
);

export default connect(mapStateToProps)(Main);
