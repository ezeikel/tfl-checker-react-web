import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Footer from '../components/Footer';

test('renders without crashing', () => {
  const { container } = render(
    <Router>
      <Footer />
    </Router>
  );
  expect(container).toMatchSnapshot();
});