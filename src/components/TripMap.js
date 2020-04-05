import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import GoogleMapReact from "google-map-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Wrapper = styled.section`
  height: 100%;
  width: 100%;
  border-radius: 4px;
  overflow: hidden;
`;

const IconWrapper = styled.span`
  position: absolute;
  transform: translate(-50%, -100%);
  z-index: 10;
`;

const defaultProps = {
  zoom: 11,
};

const handleGoogleMapApi = (google, path) => {
  const bounds = new google.maps.LatLngBounds();

  const tripPath = new google.maps.Polyline({
    path,
    geodesic: true,
    strokeColor: "#00BCD4",
    strokeOpacity: 1,
    strokeWeight: 5,
  });

  tripPath.setMap(google.map);

  bounds.extend(path[0]);
  bounds.extend(path[path.length - 1]);

  google.map.fitBounds(bounds);
};

const TripMap = ({ center, path }) => (
  <Wrapper>
    <GoogleMapReact
      defaultCenter={center}
      defaultZoom={defaultProps.zoom}
      yesIWantToUseGoogleMapApiInternals
      onGoogleApiLoaded={google => handleGoogleMapApi(google, path)}
    >
      <IconWrapper lat={path[0].lat} lng={path[0].lng}>
        <FontAwesomeIcon
          icon={["fas", "map-marker-alt"]}
          color="#31CC71"
          size="3x"
        />
      </IconWrapper>
      <IconWrapper
        lat={path[path.length - 1].lat}
        lng={path[path.length - 1].lng}
      >
        <FontAwesomeIcon
          icon={["fas", "map-marker-alt"]}
          color="#00BCD4"
          size="3x"
        />
      </IconWrapper>
    </GoogleMapReact>
  </Wrapper>
);

TripMap.propTypes = {
  center: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number,
  }).isRequired,
  path: PropTypes.arrayOf(
    PropTypes.shape({
      lat: PropTypes.number,
      lng: PropTypes.number,
    }),
  ).isRequired,
};

export default TripMap;
