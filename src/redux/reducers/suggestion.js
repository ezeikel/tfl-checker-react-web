import {
  FETCH_SUGGESTIONS_START,
  FETCH_SUGGESTIONS_SUCCESS,
  CLEAR_SUGGESTIONS,
  SET_SELECTED_TRIP,
  CLEAR_SELECTED_TRIP,
} from "../actionTypes";

const initialState = {
  loading: false,
  results: [],
  selected: {},
};

// eslint-disable-next-line default-param-last
const suggestion = (state = initialState, action) => {
  if (!action) return state;

  switch (action.type) {
    case FETCH_SUGGESTIONS_START: {
      return {
        ...state,
        loading: true,
      };
    }
    case FETCH_SUGGESTIONS_SUCCESS: {
      return {
        ...state,
        results: action.journeys,
        loading: false,
      };
    }
    case CLEAR_SUGGESTIONS: {
      return {
        ...state,
        results: [],
      };
    }
    case SET_SELECTED_TRIP: {
      return {
        ...state,
        selected: action.selected,
      };
    }
    case CLEAR_SELECTED_TRIP: {
      return {
        ...state,
        selected: {},
      };
    }
    default:
      return state;
  }
};

export default suggestion;
