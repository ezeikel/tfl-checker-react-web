import React from 'react';
import { render } from '@testing-library/react';
import Mode from '../components/Mode';

let mockProps;

beforeEach(() => {
  mockProps = {
    leg: {
      mode: {
        id: "walking"
      },
      routeOptions: [
        {

        }
      ]
    }
  };
});

test('renders without crashing', () => {
  const { container } = render(
    <Mode {...mockProps} /> // eslint-disable-line react/jsx-props-no-spreading
  );
  expect(container).toMatchSnapshot();
});
