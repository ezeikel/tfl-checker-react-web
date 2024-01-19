import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import JourneyMap from "../JourneyMap/JourneyMap";
import {
  Wrapper,
  StyledJourneySummary,
  ContentWrap,
  StyledJourneyExpanded,
} from "./Journey.styled";
import { useSuggestionsContext } from "../../contexts/suggestions";

const Journey = () => {
  const { selectedJourney } = useSuggestionsContext();
  const [path, setPath] = useState<{ lat: number; lng: number }[]>([]);

  useEffect(() => {
    if (!selectedJourney) {
      setPath([]);
      return;
    }

    setPath(
      selectedJourney!.legs.map((leg, i) => {
        if (i === selectedJourney!.legs.length - 1) {
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
  }, [selectedJourney]);

  if (!selectedJourney) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>TfL Checker - Your Journey</title>
      </Helmet>
      <Wrapper>
        <StyledJourneySummary journey={selectedJourney} />
        <ContentWrap>
          <StyledJourneyExpanded journey={selectedJourney} />
          <JourneyMap center={{ lat: 51.50853, lng: -0.12574 }} path={path} />
        </ContentWrap>
      </Wrapper>
    </>
  );
};

export default Journey;
