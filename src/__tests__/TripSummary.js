import React from 'react';
import { render } from '@testing-library/react';
import configureStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import TripSummary from '../components/TripSummary';

const middlewares = [thunk]; // add your middlewares like `redux-thunk`
const mockStore = configureStore(middlewares);

let mockProps;

beforeEach(() => {
  mockProps = {
    className: "",
    journey: {
      fare: {
        totalCost: 200
      },
      duration: 800,
      legs: []
    },
    onSetSelectedTrip: jest.fn(),
  };
});

test('renders without crashing', () => {
  const store = mockStore();

  const { container } = render(
    <TripSummary {...mockProps} store={store} /> // eslint-disable-line react/jsx-props-no-spreading
  );
  expect(container).toMatchSnapshot();
});
