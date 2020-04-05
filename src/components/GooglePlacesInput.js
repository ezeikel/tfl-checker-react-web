import React from "react";
import PropTypes from "prop-types";
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
} from "react-places-autocomplete";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { rotate } from "../GlobalStyle";

const Input = styled.input`
  font-size: 1.6rem;
  width: 100%;
  outline: none;
  border: 0;
  background-color: transparent;
  font-weight: bold;
  ::-webkit-input-placeholder {
    /* Edge */
    color: #aeb8c3;
    font-weight: bold;
  }

  :-ms-input-placeholder {
    /* Internet Explorer 10-11 */
    color: #aeb8c3;
    font-weight: bold;
  }

  ::placeholder {
    color: #aeb8c3;
    font-weight: bold;
  }
`;

const Loading = styled.div`
  display: flex;
  padding: 8px 0;
  animation: ${rotate} 1.2s linear infinite;
  align-self: flex-start;
`;

const SuggestionsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  [aria-expanded="true"] + & {
    margin-top: 8px;
  }
`;

const Suggestion = styled.div`
  font-family: var(--primary-font-family);
  font-size: 1.6rem;
  background-color: ${props =>
    `var(--color-${props.active ? "background" : "white"})`};
  color: ${props => `var(--color-${props.active ? "white" : "black"})`};
  cursor: pointer;
  padding: 8px;
`;

const PlacesByGoogle = styled.div`
  font-size: 11px;
  background-color: white;
  padding: 8px;
  display: none;
  &:not(:only-child) {
    display: block;
  }
`;

const List = styled.div`
  > div {
    & + div {
      border-top: 1px solid #eeeeee;
    }
  }
`;

const GooglePlacesInput = ({
  inputId,
  placeholder,
  address,
  setAddress,
  setLocation,
}) => {
  const handleSelect = async value => {
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
              {suggestions.map(suggestion => {
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

GooglePlacesInput.defaultProps = {
  address: "",
};

GooglePlacesInput.propTypes = {
  inputId: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  address: PropTypes.string,
  setAddress: PropTypes.func.isRequired,
  setLocation: PropTypes.func.isRequired,
};

export default GooglePlacesInput;
