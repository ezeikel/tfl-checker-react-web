import React from 'react';
import { render } from '@testing-library/react';
import TripMap from '../components/TripMap';

let mockProps;

beforeEach(() => {
  mockProps = {
    center: {
      lat: 0,
      lng: 0
    },
    path: [
      {
        lat: 0,
        lng: 0
      }
    ]
  };
});

test('renders without crashing', () => {
  const { container } = render(
    <TripMap {...mockProps} /> // eslint-disable-line react/jsx-props-no-spreading
  );
  expect(container).toMatchSnapshot();
});
