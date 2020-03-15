import React, { useState } from 'react';
import GooglePlacesInput from './GooglePlacesInput';
import JourneyResults from './JourneyResults';

const Planner = () => {
  const API_ENDPOINT = "https://api.tfl.gov.uk/"
  const [fromCoordinates, setFromCoordinates] = useState({
    lat: null,
    lng: null
  });

  const [toCoordinates, setToCoordinates] = useState({
    lat: null,
    lng: null
  });

  const [journeyResults, setJourneyResults] = useState({});

  const handleSubmit = async () => {
    const resultsJson = await fetch(`${API_ENDPOINT}journey/journeyresults/${fromCoordinates.lat},${fromCoordinates.lng}/to/${toCoordinates.lat},${toCoordinates.lng}?app_id=1b83c22c&app_key=e5c7b582d0f72a04add248393e939cf5`);
    const results = await resultsJson.json();
    setJourneyResults(results);
  };

  return (
    <div>
      <GooglePlacesInput coordinates={fromCoordinates} setCoordinates={setFromCoordinates} />
      <GooglePlacesInput coordinates={toCoordinates} setCoordinates={setToCoordinates} />
      <button onClick={handleSubmit}>Submit</button>
      <JourneyResults results={journeyResults} />
    </div>
  );
};

export default Planner;