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

const initialState = {
  from: {
    address: '',
    coordinates: {
      lat: '',
      lng: ''
    }
  },
  to: {
    address: '',
    coordinates: {
      lat: '',
      lng: ''
    }
  },
};

export default function(state = initialState, action) {
  switch (action.type) {
    case SET_FROM_COORDS: {
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
    case SET_TO_COORDS: {
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
    case CLEAR_FROM_COORDS: {
      return {
        ...state,
        from: {}
      };
    }
    case CLEAR_TO_COORDS: {
      return {
        ...state,
        to: {}
      };
    }
    case SET_FROM_ADDRESS: {
      return {
        ...state,
        from: {
          ...state.from,
          address: action.address
        }
      };
    }
    case SET_TO_ADDRESS: {
      return {
        ...state,
        to: {
          ...state.to,
          address: action.address
        }
      };
    }
    case CLEAR_FROM_ADDRESS: {
      return {
        ...state,
        from: {
          ...state.from,
          address: ""
        }
      };
    }
    case CLEAR_TO_ADDRESS: {
      return {
        ...state,
        to: {
          ...state.to,
          address: ""
        }
      };
    }
    default:
      return state;
  }
}
