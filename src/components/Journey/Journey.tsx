import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TripMap from "../TripMap/TripMap";
import {
  Wrapper,
  StyledTripSummary,
  ContentWrap,
  StyledTripExpanded,
} from "./Journey.styled";
import { useJourneyContext } from "../../contexts/journey";
import { useSuggestionsContext } from "../../contexts/suggestions";

const Journey = () => {
  const { reset: resetJourney } = useJourneyContext();
  const { clearSelectedTrip, selectedTrip } = useSuggestionsContext();
  const [path, setPath] = useState<{ lat: number; lng: number }[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    if (!selectedTrip) {
      setPath([]);
    }

    setPath(
      selectedTrip!.legs.map((leg, i) => {
        if (i === selectedTrip!.legs.length - 1) {
          return {
            lat: leg.arrivalPoint.lat,
            lng: leg.arrivalPoint.lon,
          };
        }

        return {
          lat: leg.departurePoint.lat,
          lng: leg.departurePoint.lon,
        };
      }),
    );
  }, [selectedTrip]);

  useEffect(() => {
    return () => {
      clearSelectedTrip();
      resetJourney();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!selectedTrip) {
    navigate("/trip-planner");
    return null;
  }

  return (
    <Wrapper>
      <StyledTripSummary journey={selectedTrip} />
      <ContentWrap>
        <StyledTripExpanded journey={selectedTrip} />
        <TripMap center={{ lat: 51.50853, lng: -0.12574 }} path={path} />
      </ContentWrap>
    </Wrapper>
  );
};

export default Journey;
