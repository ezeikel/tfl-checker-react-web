import React from 'react';
import { render } from '@testing-library/react';
import JourneyResults from '../components/JourneyResults';

let mockProps;

beforeEach(() => {
  mockProps = {
    results: {
      journeys: [{
        startDateTime: "",
      arrivalDateTime: "",
        duration: 20,
        fare: {
          totalCost: 200,
        },
        legs: [{
          arrivalPoint: {
            commonName: ""
          },
          departurePoint: {
            commontName: ""
          },
          departureTime: "",
          mode: {
            id: "walking"
          },
          instruction: {
            summary: "",
            steps: [{
              descriptionHeading: "",
              description: ""
            }]
          },
          path: {
            stopPoints: [{
              name: ""
            }]
          }
        }],
      }]
    }
  };
});

test('renders without crashing', () => {
  const { container } = render(
    <JourneyResults {...mockProps} /> // eslint-disable-line react/jsx-props-no-spreading
  );
  expect(container).toMatchSnapshot();
});
