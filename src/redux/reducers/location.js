import { 
  SET_FROM_LOCATION,
  SET_TO_LOCATION,
  CLEAR_FROM_LOCATION,
  CLEAR_TO_LOCATION
} from "../actionTypes";

const initialState = {
  from: {
    coordinates: {
      lat: '',
      lng: ''
    }
  },
  to: {
    coordinates: {
      lat: '',
      lng: ''
    }
  },
};

export default function(state = initialState, action) {
  switch (action.type) {
    case SET_FROM_LOCATION: {
      return {
        ...state,
        from: {
          ...state.from,
          coordinates: {
            ...state.from.coordinates,
            lat: action.lat,
            lng: action.lng
          }
        }
      };
    }
    case SET_TO_LOCATION: {
      return {
        ...state,
        to: {
          ...state.to,
          coordinates: {
            ...state.to.coordinates,
            lat: action.lat,
            lng: action.lng
          }
        }
      };
    }
    case CLEAR_FROM_LOCATION: {
      return {
        ...state,
        from: {}
      };
    }
    case CLEAR_TO_LOCATION: {
      return {
        ...state,
        to: {}
      };
    }
    default:
      return state;
  }
}
