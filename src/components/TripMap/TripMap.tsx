import GoogleMapReact from "google-map-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Wrapper, IconWrapper } from "./TripMap.styled";

type TripMapProps = {
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

const TripMap = ({ center, path }: TripMapProps) => (
  <Wrapper>
    <GoogleMapReact
      defaultCenter={center}
      defaultZoom={defaultProps.zoom}
      yesIWantToUseGoogleMapApiInternals
      onGoogleApiLoaded={(google) => handleGoogleMapApi(google, path)}
    >
      <IconWrapper>
        <FontAwesomeIcon
          icon={["fas", "map-marker-alt"]}
          color="#31CC71"
          size="3x"
        />
      </IconWrapper>
      <IconWrapper>
        <FontAwesomeIcon
          icon={["fas", "map-marker-alt"]}
          color="#00BCD4"
          size="3x"
        />
      </IconWrapper>
    </GoogleMapReact>
  </Wrapper>
);

export default TripMap;
