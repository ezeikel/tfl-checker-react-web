import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Status from './Status';
import TripPlanner from './TripPlanner';
import Trip from './Trip';

const Main = () => (
  <main>
    <Switch>
      <Route exact path='/'>
        <Status />
      </Route>
      <Route path='/trip-planner'>
        <TripPlanner />
      </Route>
      <Route path='/trip'>
        <Trip />
      </Route>
    </Switch>
  </main>
);

export default Main;
