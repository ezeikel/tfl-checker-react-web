import { 
  SET_FROM_LOCATION,
  SET_TO_LOCATION,
  CLEAR_FROM_LOCATION,
  CLEAR_TO_LOCATION
} from "../actionTypes";

export const setFromLocation = ({ lat, lng, address }) => (
  {
    type: SET_FROM_LOCATION,
    lat,
    lng,
    address
  }
);

export const setToLocation = ({lat, lng, address}) => (
  {
    type: SET_TO_LOCATION,
    lat,
    lng,
    address
  }
);

export const clearFromLocation = () => (
  {
    type: CLEAR_FROM_LOCATION
  }
);

export const clearToLocation = () => (
  {
    type: CLEAR_TO_LOCATION
  }
);
