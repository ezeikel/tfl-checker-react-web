import React from 'react';
import styled from 'styled-components';
import GoogleMapReact from 'google-map-react';

const Wrapper = styled.section`
  height: 100%;
  width: 100%;
  border-radius: 4px;
  overflow: hidden;
`;

const defaultProps = {
  zoom: 11
};

const TripMap = ({ center }) => (
  <Wrapper>
    <GoogleMapReact
      defaultCenter={center}
      defaultZoom={defaultProps.zoom}
    />
  </Wrapper>
);

export default TripMap;
