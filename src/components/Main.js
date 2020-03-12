import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Status from './Status';
import Planner from './Planner';

const Main = () => (
  <main>
    <Switch>
      <Route exact path='/'>
        <Status />
      </Route>
      <Route path='/planner'>
        <Planner />
      </Route>
    </Switch>
  </main>
);

export default Main;
