import React, { useState } from "react";
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from "react-places-autocomplete";

const GooglePlacesInput = ({ coordinates, setCoordinates }) => {
  const [address, setAddress] = useState("");

  const handleSelect = async value => {
    const [results] = await geocodeByAddress(value);
    const latLng = await getLatLng(results);

    setAddress(value);
    setCoordinates(latLng);
  }

  const searchOptions = {
    componentRestrictions: {'country': ['gb']}
  };

  return (
    <div>
      <PlacesAutocomplete
        value={address}
        onChange={setAddress}
        onSelect={handleSelect}
        searchOptions={searchOptions}
      >
        {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
          <div>
            <p>Latitude: { coordinates.lat}</p>
            <p>Longitude: { coordinates.lng}</p>

            <input {...getInputProps({ placeholder: "Type address" })} />
            <div>
              { loading ? <div>...loading</div> : null}

              { suggestions.map(suggestion => {
                const style = {
                  backgroundColor: suggestion.active ? "#41b6e6" : "#fff"
                };

                return (
                  <div {...getSuggestionItemProps(suggestion, { style })}>
                    {suggestion.description}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </PlacesAutocomplete>
    </div>
  );
};

export default GooglePlacesInput;
