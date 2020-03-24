import React, { useEffect } from 'react';
import { connect } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";
import styled from 'styled-components';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fetchSuggestion, setFromCoords, setToCoords, clearFromAddress, clearToAddress, setFromAddress, setToAddress } from "../redux/actions";
import GooglePlacesInput from './GooglePlacesInput';
import JourneySummary from './JourneySummary';
import { rotate } from "../GlobalStyle";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const JourneyInput = styled.section`
  display: flex;
  flex-direction: column;
  padding: 32px;
  background-color: var(--color-white);
  border-radius: var(--border-radius);
  max-width: 600px;
  margin-bottom: 64px;

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

const FormWrapper = styled.div`
  background-color: var(--color-input-background);
  padding: 16px;
  margin-bottom: 32px;
  display: flex;
  form {
    flex: 1 0 auto;
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
  align-items: center;
  justify-content: center;
  background-color: var(--color-green);
  color: var(--color-white);
  font-size: var(--font-size-bravo);
  font-weight: bold;
  padding: 16px 0;
  border-radius: var(--border-radius);
  svg {
    margin-left: 16px;
    animation: ${rotate} 1.2s linear infinite;
  }
`;

const useQuery = () => new URLSearchParams(useLocation().search);

const Planner = ({
  fromCoordinates,
  toCoordinates,
  fromAddress,
  toAddress,
  loading,
  results,
  onFetchSuggestions,
  onSetFromCoords,
  onSetToCoords,
  onSetFromAddress,
  onSetToAddress
}) => {
  const history = useHistory();
  const query = useQuery();

  useEffect(() => {
    if (fromAddress === "" && toAddress === "" && query.get("toCoordinates") && query.get("fromCoordinates")) {
      const fromCoords = { lat: query.get("fromCoordinates").split(',')[0], lng: query.get("fromCoordinates").split(',')[1] };
      const toCoords = { lat: query.get("toCoordinates").split(',')[0], lng: query.get("toCoordinates").split(',')[1] };
      const fromAddress = query.get("fromAddress");
      const toAddress = query.get("toAddress");

      onFetchSuggestions(fromCoords, toCoords);
      onSetFromCoords(fromCoords);
      onSetToCoords(toCoords);
      onSetFromAddress(fromAddress);
      onSetToAddress(toAddress);
    }
  },[]);

  const handleSubmit = () => {
    history.push(`/planner?fromCoordinates=${fromCoordinates.lat},${fromCoordinates.lng}&toCoordinates=${toCoordinates.lat},${toCoordinates.lng}&fromAddress=${fromAddress}&toAddress=${toAddress}`);
    onFetchSuggestions(fromCoordinates, toCoordinates);
  };

  return (
    <Wrapper>
      <JourneyInput>
        <Heading>Let's take a trip!</Heading>
        <FormWrapper>
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
          <form>
            <InputWrapper>
              <label>From</label>
              <GooglePlacesInput setLocation={onSetFromCoords} address={fromAddress} setAddress={onSetFromAddress} placeholder="Where are you coming from?" />
            </InputWrapper>
            <hr />
            <InputWrapper>
              <label>To</label>
              <GooglePlacesInput setLocation={onSetToCoords} address={toAddress} setAddress={onSetToAddress} placeholder="Where are you going to?" />
            </InputWrapper>
          </form>
        </FormWrapper>
        <Leaving>
          Leaving now
          <FontAwesomeIcon
            icon={["fad", "chevron-right"]}
            color="var(--color-background)"
            size="2x"
          />
        </Leaving>
        <Button onClick={handleSubmit}>
          { `Search${loading ? "ing" : ""}` }
          {
            loading && (
              <FontAwesomeIcon
                icon={["fad", "spinner-third"]}
                color="var(--color-white)"
                size="lg"
              />
            )
          }
        </Button>
      </JourneyInput>
      {
        results && <JourneySummary journeys={results} />
      }
    </Wrapper>
  );
};

const mapDispatchToProps = dispatch => (
  {
    onFetchSuggestions: (fromCoordinates, toCoordinates) => dispatch(fetchSuggestion(fromCoordinates, toCoordinates)),
    onSetFromCoords: value => dispatch(setFromCoords(value)),
    onSetToCoords: value => dispatch(setToCoords(value)),
    onSetFromAddress: value => dispatch(setFromAddress(value)),
    onSetToAddress: value => dispatch(setToAddress(value)),
    onClearFromAddress: () => dispatch(clearFromAddress()),
    onClearToAddress: () => dispatch(clearToAddress()),
  }
);

const mapStateToProps = ({ location, suggestion }) => (
  {
    fromCoordinates: location.from.coordinates,
    fromAddress: location.from.address,
    toCoordinates: location.to.coordinates,
    toAddress: location.to.address,
    results: suggestion.results,
    loading: suggestion.loading
  }
);

export default connect(mapStateToProps, mapDispatchToProps)(Planner);