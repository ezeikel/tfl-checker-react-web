// BUG: https://github.com/google-map-react/google-map-react/issues/1117
// BUG: https://github.com/googlemaps/react-wrapper/issues/642
import GoogleMapReact from "google-map-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Wrapper, IconWrapper } from "./JourneyMap.styled";
import { faMapMarkerAlt } from "@fortawesome/pro-solid-svg-icons";

type JourneyMapProps = {
  center: {
    lat: number;
    lng: number;
  };
  path: {
    lat: number;
    lng: number;
  }[];
};

const defaultProps = {
  zoom: 11,
};

const handleGoogleMapApi = (
  google: {
    map: any;
    maps: any;
    ref: Element | null;
  },
  path: {
    lat: number;
    lng: number;
  }[],
) => {
  const bounds = new google.maps.LatLngBounds();

  const journeyPath = new google.maps.Polyline({
    path,
    geodesic: true,
    strokeColor: "#00BCD4",
    strokeOpacity: 1,
    strokeWeight: 5,
  });

  journeyPath.setMap(google.map);

  bounds.extend(path[0]);
  bounds.extend(path[path.length - 1]);

  google.map.fitBounds(bounds);
};

const JourneyMap = ({ center, path }: JourneyMapProps) => {
  if (!path.length) {
    return null;
  }

  return (
    <Wrapper>
      <GoogleMapReact
        defaultCenter={center}
        defaultZoom={defaultProps.zoom}
        yesIWantToUseGoogleMapApiInternals
        onGoogleApiLoaded={(google) => handleGoogleMapApi(google, path)}
      >
        {/* lat and lng props to any child of GoogleMapReact will position it on the map */}
        <IconWrapper lat={path[0].lat} lng={path[0].lng}>
          <FontAwesomeIcon icon={faMapMarkerAlt} color="#31CC71" size="3x" />
        </IconWrapper>
        {/* lat and lng props to any child of GoogleMapReact will position it on the map */}
        <IconWrapper
          lat={path[path.length - 1].lat}
          lng={path[path.length - 1].lng}
        >
          <FontAwesomeIcon icon={faMapMarkerAlt} color="#00BCD4" size="3x" />
        </IconWrapper>
      </GoogleMapReact>
    </Wrapper>
  );
};

export default JourneyMap;
