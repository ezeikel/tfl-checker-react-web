import styled from "styled-components";
import TripSummary from "../TripSummary/TripSummary";
import TripExpanded from "../TripExpanded/TripExpanded";

export const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto 1fr;
  grid-row-gap: 32px;
  align-items: start;
`;

export const StyledTripSummary = styled(TripSummary)`
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

export const StyledTripExpanded = styled(TripExpanded)`
  grid-column: 1 / span 1;
`;
