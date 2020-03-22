import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Status from './Status';
import Planner from './Planner';
import Result from './Result';

const Main = () => (
  <main>
    <Switch>
      <Route exact path='/'>
        <Status />
      </Route>
      <Route path='/planner'>
        <Planner />
      </Route>
      <Route path='/result'>
        <Result />
      </Route>
    </Switch>
  </main>
);

export default Main;
