import styled from "styled-components";
import JourneySummary from "../JourneySummary/JourneySummary";
import JourneyExpanded from "../JourneyExpanded/JourneyExpanded";

export const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto 1fr;
  grid-row-gap: 32px;
  align-items: start;
`;

export const StyledJourneySummary = styled(JourneySummary)`
  grid-column: 1 / -1;
  grid-row: 1 / span 1;
`;

export const ContentWrap = styled.div`
  grid-column: 1 / -1;
  grid-row: 2 / -1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-column-gap: 32px;
`;

export const StyledJourneyExpanded = styled(JourneyExpanded)`
  grid-column: 1 / span 1;
`;
