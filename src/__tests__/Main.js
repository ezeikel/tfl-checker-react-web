import React from 'react';
import { render } from '@testing-library/react';
import configureStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import { BrowserRouter as Router } from 'react-router-dom';
import Main from '../components/Main';

const middlewares = [thunk]; // add your middlewares like `redux-thunk`
const mockStore = configureStore(middlewares);

test('renders without crashing', () => {
  const store = mockStore({
    suggestion: {
      selected: {
        duration: 200,
        startDateTime: "",
        arrivalDateTime: "",
        legs: [],
      }
    }
  });
  const { container } = render(
    <Router>
      <Main store={store} /> { /** eslint-disable-line react/jsx-props-no-spreading */ }
    </Router>
  );
  expect(container).toMatchSnapshot();
});