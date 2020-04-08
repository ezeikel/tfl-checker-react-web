import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  fetchSuggestion,
  setFromCoords,
  setToCoords,
  setFromAddress,
  setToAddress,
  clearSuggestions,
} from "../redux/actions";
import GooglePlacesInput from "./GooglePlacesInput";
import TripSummaries from "./TripSummaries";
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

  hr {
    background-color: #aeb8c3;
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
  border-radius: 4px;
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
    color: #aeb8c3;
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
  background-color: #aeb8c3;
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

const TripPlanner = ({
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
  onSetToAddress,
  onClearSuggestions,
}) => {
  const history = useHistory();
  const query = useQuery();

  useEffect(() => {
    if (
      fromAddress === "" &&
      toAddress === "" &&
      query.get("toCoordinates") &&
      query.get("fromCoordinates")
    ) {
      const queryParamsFromCoords = {
        lat: parseFloat(query.get("fromCoordinates").split(",")[0]),
        lng: parseFloat(query.get("fromCoordinates").split(",")[1]),
      };
      const queryParamsToCoords = {
        lat: parseFloat(query.get("toCoordinates").split(",")[0]),
        lng: parseFloat(query.get("toCoordinates").split(",")[1]),
      };
      const queryParamsFromAddress = query.get("fromAddress");
      const queryParamsToAddress = query.get("toAddress");

      onFetchSuggestions(queryParamsFromCoords, queryParamsToCoords);
      onSetFromCoords(queryParamsFromCoords);
      onSetToCoords(queryParamsToCoords);
      onSetFromAddress(queryParamsFromAddress);
      onSetToAddress(queryParamsToAddress);
    }
  }, [
    fromAddress,
    onFetchSuggestions,
    onSetFromAddress,
    onSetFromCoords,
    onSetToAddress,
    onSetToCoords,
    query,
    toAddress,
  ]);

  useEffect(() => {
    return () => {
      onClearSuggestions();
    };
  }, [onClearSuggestions]);

  const handleSubmit = () => {
    history.push(
      `/trip-planner?fromCoordinates=${fromCoordinates.lat},${fromCoordinates.lng}&toCoordinates=${toCoordinates.lat},${toCoordinates.lng}&fromAddress=${fromAddress}&toAddress=${toAddress}`,
    );
    onFetchSuggestions(fromCoordinates, toCoordinates);
  };

  return (
    <Wrapper>
      <JourneyInput>
        <Heading>Let&apos;s take a trip!</Heading>
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
              {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
              <label htmlFor="fromAddress">From</label>{" "}
              <GooglePlacesInput
                inputId="fromAddress"
                setLocation={onSetFromCoords}
                address={fromAddress}
                setAddress={onSetFromAddress}
                placeholder="Where are you coming from?"
              />
            </InputWrapper>
            <hr />
            <InputWrapper>
              {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
              <label htmlFor="toAddress">To</label>
              <GooglePlacesInput
                inputId="toAddress"
                setLocation={onSetToCoords}
                address={toAddress}
                setAddress={onSetToAddress}
                placeholder="Where are you going to?"
              />
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
          {`Search${loading ? "ing" : ""}`}
          {loading && (
            <FontAwesomeIcon
              icon={["fad", "spinner-third"]}
              color="var(--color-white)"
              size="lg"
            />
          )}
        </Button>
      </JourneyInput>
      {// TODO: Disambiguations cause results to be null. Add a way to get exact location instead
      results && results.length ? <TripSummaries journeys={results} /> : null}
    </Wrapper>
  );
};

const mapStateToProps = ({ journey, suggestion }) => ({
  fromCoordinates: journey.from.coordinates,
  fromAddress: journey.from.address,
  toCoordinates: journey.to.coordinates,
  toAddress: journey.to.address,
  results: suggestion.results,
  loading: suggestion.loading,
});

const mapDispatchToProps = dispatch => ({
  onFetchSuggestions: (fromCoordinates, toCoordinates) =>
    dispatch(fetchSuggestion(fromCoordinates, toCoordinates)),
  onSetFromCoords: value => dispatch(setFromCoords(value)),
  onSetToCoords: value => dispatch(setToCoords(value)),
  onSetFromAddress: value => dispatch(setFromAddress(value)),
  onSetToAddress: value => dispatch(setToAddress(value)),
  onClearSuggestions: () => dispatch(clearSuggestions()),
});

TripPlanner.defaultProps = {
  fromCoordinates: {},
  toCoordinates: {},
  fromAddress: "",
  toAddress: "",
  results: [],
  loading: false,
};

TripPlanner.propTypes = {
  // TODO: Make sure lat/lng are one type: number
  fromCoordinates: PropTypes.shape({
    lat: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    lng: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
  // TODO: Make sure lat/lng are one type: number
  toCoordinates: PropTypes.shape({
    lat: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    lng: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
  fromAddress: PropTypes.string,
  toAddress: PropTypes.string,
  results: PropTypes.arrayOf(
    PropTypes.shape({
      $type: PropTypes.string,
      startDateTime: PropTypes.string,
      duration: PropTypes.number,
      arrivalTime: PropTypes.string,
    }),
  ),
  loading: PropTypes.bool,
  onFetchSuggestions: PropTypes.func.isRequired,
  onSetFromCoords: PropTypes.func.isRequired,
  onSetToCoords: PropTypes.func.isRequired,
  onSetFromAddress: PropTypes.func.isRequired,
  onSetToAddress: PropTypes.func.isRequired,
  onClearSuggestions: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(TripPlanner);
