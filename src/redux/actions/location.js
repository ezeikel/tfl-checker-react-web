import { 
  SET_FROM_COORDS,
  SET_TO_COORDS,
  CLEAR_FROM_COORDS,
  CLEAR_TO_COORDS,
  SET_FROM_ADDRESS,
  SET_TO_ADDRESS,
  CLEAR_FROM_ADDRESS,
  CLEAR_TO_ADDRESS
} from "../actionTypes";

export const setFromCoords = ({ lat, lng }) => (
  {
    type: SET_FROM_COORDS,
    lat,
    lng
  }
);

export const setToCoords = ({ lat, lng  }) => (
  {
    type: SET_TO_COORDS,
    lat,
    lng
  }
);

export const clearFromCoords = () => (
  {
    type: CLEAR_FROM_COORDS
  }
);

export const clearToCoords = () => (
  {
    type: CLEAR_TO_COORDS
  }
);

export const setFromAddress = address => (
  {
    type: SET_FROM_ADDRESS,
    address
  }
);

export const setToAddress = address => (
  {
    type: SET_TO_ADDRESS,
    address
  }
);

export const clearFromAddress = () => (
  {
    type: CLEAR_FROM_ADDRESS
  }
);

export const clearToAddress = () => (
  {
    type: CLEAR_TO_ADDRESS
  }
);
