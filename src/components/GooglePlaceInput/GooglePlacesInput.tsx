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
import { useJourneyContext } from "../../contexts/journey";

type GooglePlaceInputProps = {
  inputId: string;
  placeholder: string;
  address?: string;
};

const GooglePlacesInput = ({
  inputId,
  placeholder,
  address = "",
}: GooglePlaceInputProps) => {
  const { setFrom, setTo } = useJourneyContext();

  const handleSelect = async (add: string) => {
    const [results] = await geocodeByAddress(add);
    const latLng = await getLatLng(results);
    if (inputId === "from") {
      setFrom((prev) => ({
        ...prev,
        address: add,
        coordinates: {
          latitude: latLng.lat,
          longitude: latLng.lng,
        },
      }));
    } else {
      setTo((prev) => ({
        ...prev,
        address: add,
        coordinates: {
          latitude: latLng.lat,
          longitude: latLng.lng,
        },
      }));
    }
  };

  const handeChange = (add: string) => {
    if (inputId === "from") {
      setFrom((prev) => ({
        ...prev,
        address: add,
      }));
    } else {
      setTo((prev) => ({
        ...prev,
        address: add,
      }));
    }
  };

  const searchOptions = {
    componentRestrictions: { country: ["gb"] },
  };

  return (
    <PlacesAutocomplete
      value={address}
      onChange={handeChange}
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
