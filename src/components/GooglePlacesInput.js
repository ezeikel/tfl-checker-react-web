import React, { useState } from "react";
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from "react-places-autocomplete";
import styled from 'styled-components';

const Input = styled.input`
  font-size: 1.6rem;
  width: 100%;
  outline: none;
  border: 0;
  background-color: transparent;
  font-weight: bold;
  ::-webkit-input-placeholder { /* Edge */
    color: #AEB8C3;
    font-weight: bold;
  }

  :-ms-input-placeholder { /* Internet Explorer 10-11 */
    color: #AEB8C3;
    font-weight: bold;
  }

  ::placeholder {
    color: #AEB8C3;
    font-weight: bold;
  }
`;

const SuggestionsWrapper = styled.div`
  margin-top: 8px;
`;

const Suggestion = styled.div`
  font-family: var(--primary-font-family);
  font-size: 1.6rem;
  background-color: ${props => `var(--color-${props.active ? 'background' : 'white'})`};
  color: ${props => `var(--color-${props.active ? 'white' : 'black'})`};
  cursor: pointer;
  padding: 8px;
`;

const GooglePlacesInput = ({ coordinates, setCoordinates, placeholder }) => {
  const [address, setAddress] = useState("");

  const handleSelect = async value => {
    const [results] = await geocodeByAddress(value);
    const latLng = await getLatLng(results);

    console.log({
      coordinates
    });

    setAddress(value);
    setCoordinates(latLng);
  }

  const searchOptions = {
    componentRestrictions: {'country': ['gb']}
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
          <Input {...getInputProps({ placeholder })} />
          <SuggestionsWrapper>
            { loading ? <div>...loading</div> : null}

            { suggestions.map(suggestion => {
              return (
                <Suggestion active={suggestion.active} {...getSuggestionItemProps(suggestion)}>
                  {suggestion.description}
                </Suggestion>
              );
            })}
          </SuggestionsWrapper>
        </>
      )}
    </PlacesAutocomplete>
  );
};

export default GooglePlacesInput;
