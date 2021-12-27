import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  fetchSuggestion,
  setFromCoords,
  setToCoords,
  setFromAddress,
  setToAddress,
  clearSuggestions,
} from "../../redux/actions";
import { useAppDispatch, useAppSelector } from "../../hooks";
import GooglePlacesInput from "../GooglePlaceInput/GooglePlacesInput";
import TripSummaries from "../TripSummaries/TripSummaries";
import {
  Wrapper,
  JourneyInput,
  Heading,
  FormWrapper,
  InputWrapper,
  StartEnd,
  VerticalLine,
  Leaving,
  Button,
} from "./TripPlanner.styled";

const useQuery = () => new URLSearchParams(useLocation().search);

const TripPlanner = () => {
  const navigate = useNavigate();
  const query = useQuery();
  const dispatch = useAppDispatch();
  const {
    journey: {
      from: { coordinates: fromCoordinates, address: fromAddress },
      to: { coordinates: toCoordinates, address: toAddress },
    },
    suggestion: { results, loading },
  } = useAppSelector(({ journey, suggestion }) => ({ journey, suggestion }));

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

      dispatch(fetchSuggestion(queryParamsFromCoords, queryParamsToCoords));
      dispatch(setFromCoords(queryParamsFromCoords));
      dispatch(setToCoords(queryParamsToCoords));
      dispatch(setFromAddress(queryParamsFromAddress));
      dispatch(setToAddress(queryParamsToAddress));
    }
  }, [dispatch, query, fromAddress, toAddress]);

  useEffect(() => {
    return () => {
      dispatch(clearSuggestions());
    };
  }, [dispatch]);

  const handleSubmit = () => {
    navigate(
      `/trip-planner?fromCoordinates=${fromCoordinates.lat},${fromCoordinates.lng}&toCoordinates=${toCoordinates.lat},${toCoordinates.lng}&fromAddress=${fromAddress}&toAddress=${toAddress}`,
    );
    dispatch(fetchSuggestion(fromCoordinates, toCoordinates));
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
                setLocation={(value: any) => {
                  dispatch(setFromCoords(value));
                }}
                address={fromAddress}
                setAddress={(value: any) => {
                  dispatch(setFromAddress(value));
                }}
                placeholder="Where are you coming from?"
              />
            </InputWrapper>
            <hr />
            <InputWrapper>
              {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
              <label htmlFor="toAddress">To</label>
              <GooglePlacesInput
                inputId="toAddress"
                setLocation={(value: any) => {
                  dispatch(setToCoords(value));
                }}
                address={toAddress}
                setAddress={(value: any) => {
                  dispatch(setToAddress(value));
                }}
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
      {
        // TODO: Disambiguations cause results to be null. Add a way to get exact location instead
        results && results.length ? <TripSummaries journeys={results} /> : null
      }
    </Wrapper>
  );
};

export default TripPlanner;
