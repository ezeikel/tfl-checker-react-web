import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
} from "react-places-autocomplete";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Input,
  Loading,
  SuggestionsWrapper,
  Suggestion,
  PlacesByGoogle,
  List,
} from "./GooglePlacesInput.styled";

type GooglePlaceInputProps = {
  inputId: string;
  placeholder: string;
  address?: string;
  setAddress: () => void;
  setLocation: () => void;
};

const GooglePlacesInput = ({
  inputId,
  placeholder,
  address = "",
  setAddress,
  setLocation,
}: GooglePlaceInputProps) => {
  const handleSelect = async (value) => {
    const [results] = await geocodeByAddress(value);
    const latLng = await getLatLng(results);

    setAddress(value);
    setLocation(latLng);
  };

  const searchOptions = {
    componentRestrictions: { country: ["gb"] },
  };

  return (
    <PlacesAutocomplete
      value={address}
      onChange={setAddress}
      onSelect={handleSelect}
      searchOptions={searchOptions}
    >
      {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
        <>
          <Input
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...getInputProps({
              inputId,
              placeholder,
            })}
          />
          <SuggestionsWrapper>
            {loading ? (
              <Loading>
                <FontAwesomeIcon
                  icon={["fad", "spinner-third"]}
                  color="var(--color-background)"
                  size="2x"
                />
              </Loading>
            ) : null}
            <List>
              {suggestions.map((suggestion) => {
                return (
                  <Suggestion
                    active={suggestion.active}
                    key={suggestion.placeId}
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...getSuggestionItemProps(suggestion)}
                  >
                    {suggestion.description}
                  </Suggestion>
                );
              })}
              <PlacesByGoogle>
                Places by <strong>Google</strong>
              </PlacesByGoogle>
            </List>
          </SuggestionsWrapper>
        </>
      )}
    </PlacesAutocomplete>
  );
};

export default GooglePlacesInput;
