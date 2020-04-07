import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { render } from '@testing-library/react';
import Nav from '../components/Nav';

test('renders without crashing', () => {
  const { container } = render(
    <Router>
      <Nav />
    </Router>
  );
  expect(container).toMatchSnapshot();
});
