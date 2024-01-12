import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQuery } from "@tanstack/react-query";
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
import { useJourneyContext } from "../../contexts/journey";
import { useSuggestionsContext } from "../../contexts/suggestions";
import { Location } from "../../../types";

const useSearchParams = () => new URLSearchParams(useLocation().search);

// TODO: type should be Coordinate
const fetchSuggestion = async ({
  from,
  to,
}: {
  from: Location;
  to: Location;
}) => {
  const response = await fetch(
    `${import.meta.env.VITE_TFL_API_URL}/journey/journeyresults/${from
      .coordinates?.latitude},${from.coordinates?.longitude}/to/${to.coordinates
      ?.latitude},${to.coordinates?.longitude}?app_id=1b83c22c&app_key=${
      import.meta.env.VITE_TFL_APP_KEY
    }`,
  );

  return response.json();
};

const TripPlanner = () => {
  const { from, setFrom, to, setTo } = useJourneyContext();
  const { results, reset: resetSuggestions } = useSuggestionsContext();
  const navigate = useNavigate();
  const searchParams = useSearchParams();

  const { data, isLoading } = useQuery({
    queryKey: ["journey", { from, to }],
    queryFn: () => fetchSuggestion({ from: from!, to: to! }),
    enabled: !!from && !!to,
  });

  console.log({ data });

  useEffect(() => {
    if (
      from?.address === "" &&
      to?.address === "" &&
      searchParams.get("toCoordinates") &&
      searchParams.get("fromCoordinates")
    ) {
      const queryParamsFromCoords = {
        lat: parseFloat(
          searchParams.get("fromCoordinates")?.split(",")[0] as string,
        ),
        lon: parseFloat(
          searchParams.get("fromCoordinates")?.split(",")[1] as string,
        ),
      };
      const queryParamsToCoords = {
        lat: parseFloat(
          searchParams.get("toCoordinates")?.split(",")[0] as string,
        ),
        lon: parseFloat(
          searchParams.get("toCoordinates")?.split(",")[1] as string,
        ),
      };
      const queryParamsFromAddress = searchParams.get("fromAddress");
      const queryParamsToAddress = searchParams.get("toAddress");

      // dispatch(fetchSuggestion(queryParamsFromCoords, queryParamsToCoords));
      setFrom({
        address: queryParamsFromAddress as string,
        coordinates: {
          latitude: queryParamsFromCoords.lat,
          longitude: queryParamsFromCoords.lon,
        },
      });
      setTo({
        address: queryParamsToAddress as string,
        coordinates: {
          latitude: queryParamsToCoords.lat,
          longitude: queryParamsToCoords.lon,
        },
      });
    }
  }, [searchParams, from?.address, to?.address]);

  useEffect(() => {
    return () => {
      resetSuggestions();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = () => {
    if (!from || !to) return;

    navigate(
      `/trip-planner?fromCoordinates=${from?.coordinates?.latitude},${from?.coordinates?.longitude}&toCoordinates=${to?.coordinates?.latitude},${to?.coordinates?.longitude}&fromAddress=${from?.address}&toAddress=${to?.address}`,
    );

    // dispatch(fetchSuggestion(fromCoordinates, toCoordinates));
    fetchSuggestion({ from, to });
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
                address={from?.address}
                placeholder="Where are you coming from?"
              />
            </InputWrapper>
            <hr />
            <InputWrapper>
              {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
              <label htmlFor="toAddress">To</label>
              <GooglePlacesInput
                inputId="toAddress"
                address={to?.address}
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
          {`Search${isLoading ? "ing" : ""}`}
          {isLoading && (
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
