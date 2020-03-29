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

const handleGoogleMapApi = (google, path) => {
  const bounds = new google.maps.LatLngBounds();

  var flightPath = new google.maps.Polyline({
    path,
    geodesic: true,
    strokeColor: '#33BD4E',
    strokeOpacity: 1,
    strokeWeight: 5
  });

  flightPath.setMap(google.map);

  const startMarker = new google.maps.Marker({
    position: new google.maps.LatLng(path[0]),
    map: google.map
  });

  const endMarker = new google.maps.Marker({
    position: new google.maps.LatLng(path[path.length -1]),
    map: google.map
  });

  bounds.extend(startMarker.position);
  bounds.extend(endMarker.position);

  google.map.fitBounds(bounds);
}

const TripMap = ({ center, path }) => (
  <Wrapper>
    <GoogleMapReact
      defaultCenter={center}
      defaultZoom={defaultProps.zoom}
      yesIWantToUseGoogleMapApiInternals
      onGoogleApiLoaded={google => handleGoogleMapApi(google, path)}
    />
  </Wrapper>
);

export default TripMap;
