import React from 'react';
import { render } from '@testing-library/react';
import configureStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import TripPlanner from '../components/TripPlanner';

jest.mock('react-router-dom', () => ({
  useHistory: () => ({
    push: jest.fn(),
  }),
  useLocation: () => ({
    push: jest.fn(),
  }),
}));

const middlewares = [thunk]; // add your middlewares like `redux-thunk`
const mockStore = configureStore(middlewares);

const setupGoogleMock = () => {
  // Mock Google Maps JavaScript API
  const google = {
    maps: {
      places: {
        AutocompleteService: class{},
        PlacesServiceStatus: {
          INVALID_REQUEST: 'INVALID_REQUEST',
          NOT_FOUND: 'NOT_FOUND',
          OK: 'OK',
          OVER_QUERY_LIMIT: 'OVER_QUERY_LIMIT',
          REQUEST_DENIED: 'REQUEST_DENIED',
          UNKNOWN_ERROR: 'UNKNOWN_ERROR',
          ZERO_RESULTS: 'ZERO_RESULTS',
        },
      },
      Geocoder: () => {},
      GeocoderStatus: {
        ERROR: 'ERROR',
        INVALID_REQUEST: 'INVALID_REQUEST',
        OK: 'OK',
        OVER_QUERY_LIMIT: 'OVER_QUERY_LIMIT',
        REQUEST_DENIED: 'REQUEST_DENIED',
        UNKNOWN_ERROR: 'UNKNOWN_ERROR',
        ZERO_RESULTS: 'ZERO_RESULTS',
      },
    },
  };
  global.window.google = google;
};

beforeAll(() => {
  setupGoogleMock();
});

let mockProps;

beforeEach(() => {
  mockProps = {
    onFetchSuggestions: jest.fn(),
    onSetFromCoords: jest.fn(),
    onSetToCoords: jest.fn(),
    onSetFromAddress: jest.fn(),
    onSetToAddress: jest.fn(),
    onClearSuggestions: jest.fn()
  };
});

test('renders without crashing', () => {
  const store = mockStore({
    journey: {
      from: {
        coordinates: {},
        address: ""
      },
      to: {
        coordinates: {},
        address: ""
      },
    },
    suggestion: {
      results: [],
      loading: false
    }
  });

  const { container } = render(
    <TripPlanner {...mockProps}  store={store} /> // eslint-disable-line react/jsx-props-no-spreading
  );
  expect(container).toMatchSnapshot();
});
