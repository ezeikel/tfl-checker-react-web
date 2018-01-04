import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Status from '../../components/Status/Status';
import Planner from '../../components/Planner/Planner';

const Main = () => (
    <main>
        <Switch>
            <Route exact path='/' component={Status} />
            <Route exact path='/planner' component={Planner} />
        </Switch>
    </main>
)

export default Main;
