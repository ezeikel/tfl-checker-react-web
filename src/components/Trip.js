import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useHistory } from "react-router-dom";
import { connect } from "react-redux";
import { clearSelectedTrip, clearJourney } from "../redux/actions";
import TripSummary from './TripSummary';
import TripExpanded from './TripExpanded';
import TripMap from './TripMap';

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto 1fr;
  grid-row-gap: 32px;
  align-items: start;
`;

const StyledTripSummary = styled(TripSummary)`
  grid-column: 1 / -1;
  grid-row: 1 / span 1;
`;

const ContentWrap = styled.div`
  grid-column: 1 / -1;
  grid-row: 2 / -1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-column-gap: 32px;
`;

const StyledTripExpanded = styled(TripExpanded)`
  grid-column: 1 / span 1;
`;

const Trip = ({ selectedTrip, fromCoordinates, onClearSelectedTrip, onClearJourney }) => {
  const history = useHistory();

  useEffect(() => {
    return () => {
      onClearSelectedTrip();
      onClearJourney();
    }
  }, [onClearSelectedTrip]);

  if (Object.keys(selectedTrip).length === 0) {
    history.push("/trip-planner");
    return null;
  }

  return (
    <Wrapper>
      <StyledTripSummary journey={selectedTrip} />
      <ContentWrap>
        <StyledTripExpanded trip={selectedTrip} />
        <TripMap center={fromCoordinates} />
      </ContentWrap>
    </Wrapper>
  );
};

const mapStateToProps = ({ suggestion, journey }) => (
  {
    selectedTrip: suggestion.selected,
    fromCoordinates: journey.from.coordinates
  }
);

const mapDispatchToProps = dispatch => (
  {
    onClearSelectedTrip: () => dispatch(clearSelectedTrip()),
    onClearJourney: () => dispatch(clearJourney()),
  }
);

export default connect(mapStateToProps, mapDispatchToProps)(Trip);
