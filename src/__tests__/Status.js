import React from 'react';
import { render } from '@testing-library/react';
import Status from '../components/Status';

test('renders without crashing', () => {
  const { container } = render(
    <Status />
  );
  expect(container).toMatchSnapshot();
});