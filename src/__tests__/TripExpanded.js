import React from 'react';
import { render } from '@testing-library/react';
import TripExpanded from '../components/TripExpanded';

let mockProps;

beforeEach(() => {
  mockProps = {
    className: "className",
    trip: {
      legs: [
        {
          mode: {
            id: "walking"
          },
          arrivalPoint: {
            commonName: ""
          },
          departurePoint: {
            commonName: ""
          },
          departureTime: "",
          instruction: {
            summary: ""
          }
        }
      ]
    }
  };
});

test('renders without crashing', () => {
  const { container } = render(
    <TripExpanded {...mockProps} /> // eslint-disable-line react/jsx-props-no-spreading
  );
  expect(container).toMatchSnapshot();
});
