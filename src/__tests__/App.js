import React from 'react';
import { render } from '@testing-library/react';
import App from '../components/App';

test('renders without crashing', () => {
  const { container } = render(
    <App />
  );
  expect(container).toMatchSnapshot();
});