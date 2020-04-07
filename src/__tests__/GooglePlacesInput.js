import React from 'react';
import { render } from '@testing-library/react';
import GooglePlacesInput from '../components/GooglePlacesInput';

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
    inputId: "id",
    placeholder: "Placeholder",
    setAddress: jest.fn(),
    setLocation: jest.fn()
  };
});

test('renders without crashing', () => {
  const { container } = render(
    <GooglePlacesInput {...mockProps} /> // eslint-disable-line react/jsx-props-no-spreading
  );
  expect(container).toMatchSnapshot();
});