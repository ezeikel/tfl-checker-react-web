import {
  SET_FROM_COORDS,
  SET_TO_COORDS,
  SET_FROM_ADDRESS,
  SET_TO_ADDRESS,
  CLEAR_JOURNEY,
} from "../actionTypes";

export const setFromCoords = ({ lat, lng }) => ({
  type: SET_FROM_COORDS,
  lat,
  lng,
});

export const setToCoords = ({ lat, lng }) => ({
  type: SET_TO_COORDS,
  lat,
  lng,
});

export const setFromAddress = address => ({
  type: SET_FROM_ADDRESS,
  address,
});

export const setToAddress = address => ({
  type: SET_TO_ADDRESS,
  address,
});

export const clearJourney = () => ({
  type: CLEAR_JOURNEY,
});
