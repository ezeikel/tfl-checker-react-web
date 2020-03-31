import {
  SET_FROM_COORDS,
  SET_TO_COORDS,
  SET_FROM_ADDRESS,
  SET_TO_ADDRESS,
  CLEAR_JOURNEY,
} from "../actionTypes";

const initialState = {
  from: {
    address: "",
    coordinates: {
      lat: "",
      lng: "",
    },
  },
  to: {
    address: "",
    coordinates: {
      lat: "",
      lng: "",
    },
  },
};

export default function (state = initialState, action) {
  switch (action.type) {
    case SET_FROM_COORDS: {
      return {
        ...state,
        from: {
          ...state.from,
          coordinates: {
            ...state.from.coordinates,
            lat: action.lat,
            lng: action.lng,
          },
        },
      };
    }
    case SET_TO_COORDS: {
      return {
        ...state,
        to: {
          ...state.to,
          coordinates: {
            ...state.to.coordinates,
            lat: action.lat,
            lng: action.lng,
          },
        },
      };
    }
    case CLEAR_JOURNEY: {
      return {
        ...initialState,
      };
    }
    case SET_FROM_ADDRESS: {
      return {
        ...state,
        from: {
          ...state.from,
          address: action.address,
        },
      };
    }
    case SET_TO_ADDRESS: {
      return {
        ...state,
        to: {
          ...state.to,
          address: action.address,
        },
      };
    }
    default:
      return state;
  }
}
