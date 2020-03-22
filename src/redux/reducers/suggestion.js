import { 
  FETCH_SUGGESTIONS_START,
  FETCH_SUGGESTIONS_SUCCESS,
  CLEAR_SUGGESTIONS,
  SET_SELECTED_SUGGESTION,
  CLEAR_SELECTED_SUGGESTION
} from "../actionTypes";

const initialState = {
  loading: false,
  results: [],
  selected: {}
};

export default function(state = initialState, action) {
  switch (action.type) {
    case FETCH_SUGGESTIONS_START: {
      return {
        ...state,
        loading: true
      };
    }
    case FETCH_SUGGESTIONS_SUCCESS: {
      return {
        ...state,
        results: action.results,
        loading: false
      };
    }
    case CLEAR_SUGGESTIONS: {
      return {
        ...state,
        results: []
      };
    }
    case SET_SELECTED_SUGGESTION: {
      return {
        ...state,
        selected: action.selected
      };
    }
    case CLEAR_SELECTED_SUGGESTION: {
      return {
        ...state,
        selected: {}
      };
    }
    default:
      return state;
  }
}
