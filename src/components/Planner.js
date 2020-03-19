import React, { useState } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import GooglePlacesInput from './GooglePlacesInput';
import JourneyResults from './JourneyResults';

const Wrapper = styled.section`
  display: flex;
  flex-direction: column;
  padding: 32px;
  background-color: var(--color-white);
  border-radius: var(--border-radius);

  hr {
    background-color: #AEB8C3;
    height: 1px;
    margin: 16px 0;
  }
`;

const Heading = styled.span`
  display: flex;
  color: var(--color-black);
  margin-bottom: 32px;
  font-size: 2.4rem;
  font-weight: bold;
`;

const InputsWrapper = styled.div`
  background-color: var(--color-input-background);
  padding: 16px;
  margin-bottom: 32px;
  display: flex;

  section {
    :first-of-type {

    }
    :last-of-type {
      flex: 1 0 auto;
    }
  }
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  label {
    font-size: 1.4rem;
    margin-bottom: 8px;
    color: #AEB8C3;
  }
`;

const StartEnd = styled.span`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 16px;
  > svg {
    flex: 0 0 auto;
  }
`;

const VerticalLine = styled.span`
  flex: 1 0 auto;
  background-color: #AEB8C3;
  width: 1px;
`;

const Leaving = styled.span`
  display: flex;
  align-items: center;
  font-size: 1.6rem;
  margin-bottom: 32px;
  svg {
    width: 10px;
    height: 18px;
    margin-left: 8px;
  }
`;

const Button = styled.button`
  display: flex;
  justify-content: center;
  background-color: var(--color-green);
  color: var(--color-white);
  font-size: var(--font-size-bravo);
  font-weight: bold;
  padding: 16px 0;
  border-radius: var(--border-radius);
`;

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

  const [journeyResults, setJourneyResults] = useState();

  const handleSubmit = async () => {
    const resultsJson = await fetch(`${API_ENDPOINT}journey/journeyresults/${fromCoordinates.lat},${fromCoordinates.lng}/to/${toCoordinates.lat},${toCoordinates.lng}?app_id=1b83c22c&app_key=e5c7b582d0f72a04add248393e939cf5`);
    const results = await resultsJson.json();
    setJourneyResults(results);
  };

  return (
    <Wrapper>
      <Heading>Let's take a trip!</Heading>
      <InputsWrapper>
        <StartEnd>
          <FontAwesomeIcon
            icon={["fad", "circle"]}
            color="var(--color-green)"
            size="2x"
          />
          <VerticalLine />
          <FontAwesomeIcon
            icon={["fad", "circle"]}
            color="var(--color-background)"
            size="2x"
          />
        </StartEnd>
        <section>
          <InputWrapper>
            <label>From</label>
            <GooglePlacesInput coordinates={fromCoordinates} setCoordinates={setFromCoordinates} placeholder="Where are you coming from?" />
          </InputWrapper>
          <hr />
          <InputWrapper>
            <label>To</label>
            <GooglePlacesInput coordinates={toCoordinates} setCoordinates={setToCoordinates} placeholder="Where are you going to?" />
          </InputWrapper>
        </section>
      </InputsWrapper>
      <Leaving>
        Leaving now
        <FontAwesomeIcon
          icon={["fad", "chevron-right"]}
          color="var(--color-background)"
          size="2x"
        />
      </Leaving>
      <Button onClick={handleSubmit}>Go</Button>
      {
        journeyResults && <JourneyResults results={journeyResults} />
      }
    </Wrapper>
  );
};

export default Planner;