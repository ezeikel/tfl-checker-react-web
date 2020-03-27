import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useHistory } from "react-router-dom";
import { connect } from "react-redux";
import { clearSelectedTrip } from "../redux/actions";
import TripSummary from './TripSummary';
import TripExpanded from './TripExpanded';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const Trip = ({ selectedTrip, onClearSelectedTrip }) => {
  const history = useHistory();

  useEffect(() => {
    return () => {
      onClearSelectedTrip();
    }
  }, [onClearSelectedTrip]);

  if (Object.keys(selectedTrip).length === 0) {
    history.push("/trip-planner");
  }

  return (
    <Wrapper>
      <TripSummary journey={selectedTrip} />
      <TripExpanded trip={selectedTrip} />
    </Wrapper>
  );
};

const mapStateToProps = ({ suggestion }) => (
  {
    selectedTrip: suggestion.selected,
  }
);

const mapDispatchToProps = dispatch => (
  {
    onClearSelectedTrip: () => dispatch(clearSelectedTrip())
  }
);

export default connect(mapStateToProps, mapDispatchToProps)(Trip);
