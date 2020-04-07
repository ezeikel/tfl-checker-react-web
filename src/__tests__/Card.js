import React from 'react';
import { render } from '@testing-library/react';
import Card from '../components/Card';

let mockProps;

beforeEach(() => {
  mockProps = {
    line: {
      id: "central",
      name: "Central",
      lineStatuses: [{
        statusSeverity: 3,
        statusSeverityDescription: "Part Suspended"
      }],
    }
  };
});

it('renders without crashing', () => {
  const { container } = render(
    <Card {...mockProps} /> // eslint-disable-line react/jsx-props-no-spreading
  );
  expect(container).toMatchSnapshot();
});

it('renders without crashing', () => {
  const { container } = render(
    <Card {...mockProps} /> // eslint-disable-line react/jsx-props-no-spreading
  );
  expect(container).toMatchSnapshot();
});

it('renders the correct line name', () => {
  const { getByText } = render(
    <Card {...mockProps} /> // eslint-disable-line react/jsx-props-no-spreading
  );
  expect(getByText('Central')).toBeInTheDocument();
});

it('renders the correct line status', () => {
  const { getByText } = render(
    <Card {...mockProps} /> // eslint-disable-line react/jsx-props-no-spreading
  );
  expect(getByText('Part Suspended')).toBeInTheDocument();
});