import React, { useEffect } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { useHistory } from "react-router-dom";
import { connect } from "react-redux";
import { clearSelectedTrip, clearJourney } from "../redux/actions";
import TripSummary from "./TripSummary";
import TripExpanded from "./TripExpanded";
import TripMap from "./TripMap";

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

const Trip = ({ selectedTrip, onClearSelectedTrip, onClearJourney }) => {
  const history = useHistory();

  const path =
    selectedTrip.legs &&
    selectedTrip.legs.map((leg, i) => {
      if (i === selectedTrip.legs.length - 1) {
        return {
          lat: leg.arrivalPoint.lat,
          lng: leg.arrivalPoint.lon,
        };
      }

      return {
        lat: leg.departurePoint.lat,
        lng: leg.departurePoint.lon,
      };
    });

  useEffect(() => {
    return () => {
      onClearSelectedTrip();
      onClearJourney();
    };
  }, [onClearSelectedTrip, onClearJourney]);

  if (Object.keys(selectedTrip).length === 0) {
    history.push("/trip-planner");
    return null;
  }

  return (
    <Wrapper>
      <StyledTripSummary journey={selectedTrip} />
      <ContentWrap>
        <StyledTripExpanded trip={selectedTrip} />
        <TripMap center={{ lat: 51.50853, lng: -0.12574 }} path={path} />
      </ContentWrap>
    </Wrapper>
  );
};

const mapStateToProps = ({ suggestion }) => ({
  selectedTrip: suggestion.selected,
});

const mapDispatchToProps = dispatch => ({
  onClearSelectedTrip: () => dispatch(clearSelectedTrip()),
  onClearJourney: () => dispatch(clearJourney()),
});

Trip.propTypes = {
  selectedTrip: PropTypes.shape({
    duration: PropTypes.number,
    startDateTime: PropTypes.string,
    arrivalDateTime: PropTypes.string,
    legs: PropTypes.array,
  }).isRequired,
  onClearSelectedTrip: PropTypes.func.isRequired,
  onClearJourney: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(Trip);
