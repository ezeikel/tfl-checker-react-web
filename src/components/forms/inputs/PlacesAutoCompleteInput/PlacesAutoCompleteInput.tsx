import PlacesAutocomplete from "react-places-autocomplete";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinnerThird } from "@fortawesome/pro-duotone-svg-icons";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import {
  Input,
  Loading,
  SuggestionsWrapper,
  Suggestion,
  PlacesByGoogle,
  List,
} from "./PlacesAutoCompleteInput.styled";

type PlacesAutoCompleteInputProps = {
  id: string;
  value: string;
  placeholder: string;
  handleSelect: (address: string, placeId: string) => void;
  handleChange?: (address: string) => void;
};

const PlacesAutoCompleteInput = ({
  id,
  value,
  placeholder,
  handleSelect,
  handleChange,
}: PlacesAutoCompleteInputProps) => {
  return (
    <PlacesAutocomplete
      value={value}
      onChange={handleChange}
      onSelect={handleSelect}
      searchOptions={{
        componentRestrictions: { country: ["gb"] },
      }}
    >
      {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
        <>
          <Input
            {...getInputProps({
              id: id,
              placeholder,
            })}
          />
          <SuggestionsWrapper>
            {loading ? (
              <Loading>
                <FontAwesomeIcon
                  icon={faSpinnerThird}
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
                    {...getSuggestionItemProps(suggestion)}
                    key={suggestion.placeId}
                  >
                    {suggestion.description}
                  </Suggestion>
                );
              })}
              <PlacesByGoogle>
                <section>
                  Places by <strong>Google</strong>
                </section>
                <FontAwesomeIcon icon={faGoogle} color="#DB4437" size="lg" />
              </PlacesByGoogle>
            </List>
          </SuggestionsWrapper>
        </>
      )}
    </PlacesAutocomplete>
  );
};

export default PlacesAutoCompleteInput;
