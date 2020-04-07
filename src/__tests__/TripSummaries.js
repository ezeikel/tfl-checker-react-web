import React from 'react';
import { render } from '@testing-library/react';
import configureStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import TripSummaries from '../components/TripSummaries';

const middlewares = [thunk]; // add your middlewares like `redux-thunk`
const mockStore = configureStore(middlewares);

let mockProps;

beforeEach(() => {
  mockProps = {
    journeys: [],
    onSetSelectedTrip: jest.fn(),
  };
});

test('renders without crashing', () => {
  const store = mockStore();

  const { container } = render(
    <TripSummaries {...mockProps} store={store} /> // eslint-disable-line react/jsx-props-no-spreading
  );
  expect(container).toMatchSnapshot();
});
