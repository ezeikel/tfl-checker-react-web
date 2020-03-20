import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './components/App';
import registerServiceWorker from './registerServiceWorker';

const app = (
    <Router>
        <App />
    </Router>
);

render(app, document.querySelector('#app'));
registerServiceWorker();
