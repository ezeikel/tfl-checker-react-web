import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import JourneySummaries from "../JourneySummaries/JourneySummaries";
import {
  Wrapper,
  JourneyInput,
  Heading,
  Leaving,
  Button,
} from "./JourneyPlanner.styled";
import { useJourneyContext } from "../../contexts/journey";
import JourneyPlannerForm from "../forms/JourneyPlannerForm/JourneyPlannerForm";
import {
  faChevronRight,
  faSpinnerThird,
} from "@fortawesome/pro-duotone-svg-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CoordinatesAlt2 } from "../../../types";

const fetchSuggestion = async ({
  fromCoordinates,
  toCoordinates,
}: {
  fromCoordinates: CoordinatesAlt2;
  toCoordinates: CoordinatesAlt2;
}) => {
  const response = await fetch(
    `${
      import.meta.env.VITE_TFL_API_URL
    }/journey/journeyresults/${fromCoordinates?.latitude},${fromCoordinates?.longitude}/to/${toCoordinates?.latitude},${toCoordinates?.longitude}?app_id=${
      import.meta.env.VITE_TFL_APP_ID
    }&app_key=${import.meta.env.VITE_TFL_APP_KEY}`,
  );

  return response.json();
};

const JourneyPlanner = () => {
  const { from, setFrom, to, setTo, reset } = useJourneyContext();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const {
    data: { journeys } = { journeys: [] },
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      "journey",
      { fromCoordinates: from?.coordiantes, toCoordinates: to?.coordiantes },
    ],
    queryFn: () =>
      fetchSuggestion({
        fromCoordinates: from?.coordiantes as CoordinatesAlt2,
        toCoordinates: to?.coordiantes as CoordinatesAlt2,
      }),
    enabled: false, // allows query to be called manually with refetch()
  });

  useEffect(() => {
    const fromCoordinates = {
      lat: parseFloat(searchParams.get("from")?.split(",")[0] as string),
      lon: parseFloat(searchParams.get("from")?.split(",")[1] as string),
    };
    const toCoordinates = {
      lat: parseFloat(searchParams.get("to")?.split(",")[0] as string),
      lon: parseFloat(searchParams.get("to")?.split(",")[1] as string),
    };
    const fromPlaceId = searchParams.get("fromPlaceId");
    const toPlaceId = searchParams.get("toPlaceId");

    if (fromCoordinates.lat && fromCoordinates.lon) {
      setFrom({
        coordiantes: {
          latitude: fromCoordinates.lat,
          longitude: fromCoordinates.lon,
        },
        placeId: fromPlaceId as string,
      });
    }

    if (toCoordinates.lat && toCoordinates.lon) {
      setTo({
        coordiantes: {
          latitude: toCoordinates.lat,
          longitude: toCoordinates.lon,
        },
        placeId: toPlaceId as string,
      });
    }
  }, [searchParams]);

  useEffect(() => {
    return () => {
      reset();

      // clear query from cache
      queryClient.removeQueries({
        queryKey: ["journey"],
      });
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>TfL Checker - Journey Planner</title>
      </Helmet>
      <Wrapper>
        <JourneyInput>
          <Heading>Let&apos;s take a trip!</Heading>
          <JourneyPlannerForm />
          <Leaving>
            Leaving now
            <FontAwesomeIcon
              icon={faChevronRight}
              color="var(--color-background)"
              size="2x"
            />
          </Leaving>
          <Button
            onClick={() => refetch()}
            disabled={!from?.coordiantes || !to?.coordiantes || isLoading}
          >
            {`Search${isLoading ? "ing" : ""}`}
            {isLoading && (
              <FontAwesomeIcon
                icon={faSpinnerThird}
                color="var(--color-white)"
                size="lg"
              />
            )}
          </Button>
        </JourneyInput>
        {
          // TODO: Disambiguations cause results to be null. Add a way to get exact location instead
          journeys?.length ? <JourneySummaries journeys={journeys} /> : null
        }
      </Wrapper>
    </>
  );
};

export default JourneyPlanner;
