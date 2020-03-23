import { 
  FETCH_SUGGESTIONS_START,
  FETCH_SUGGESTIONS_SUCCESS,
  CLEAR_SUGGESTIONS,
  SET_SELECTED_SUGGESTION,
  CLEAR_SELECTED_SUGGESTION
} from "../actionTypes";

const API_ENDPOINT = "https://api.tfl.gov.uk/"

export const fetchSuggestion = (fromCoordinates, toCoordinates) => (
  async dispatch => {
    dispatch(fetchSuggestionStart());

    const responseJSON = await fetch(`${API_ENDPOINT}journey/journeyresults/${fromCoordinates.lat},${fromCoordinates.lng}/to/${toCoordinates.lat},${toCoordinates.lng}?app_id=1b83c22c&app_key=e5c7b582d0f72a04add248393e939cf5`);
    const response = await responseJSON.json();
    debugger;

    dispatch(fetchSuggestionSuccess(response));
  }
);

export const fetchSuggestionStart = () => (
  {
    type: FETCH_SUGGESTIONS_START
  }
);

export const fetchSuggestionSuccess = ({ journeys }) => (
  {
    type: FETCH_SUGGESTIONS_SUCCESS,
    journeys
  }
);

export const clearSuggestions = () => (
  {
    type: CLEAR_SUGGESTIONS
  }
);

export const setSelectedSuggestion = selected => (
  {
    type: SET_SELECTED_SUGGESTION,
    selected
  }
);

export const clearSelectedSuggestion = () => (
  {
    type: CLEAR_SELECTED_SUGGESTION
  }
);
