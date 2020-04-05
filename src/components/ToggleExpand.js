import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

const Wrapper = styled.span`
  color: #28bcd4;
  cursor: pointer;
`;

const ToggleExpand = ({ legStops, legIndex, setLegs }) => (
  <Wrapper
    onClick={() => {
      const updatedLegs = legStops.map(({ expanded }, index) => ({
        expanded: legIndex === index ? !expanded : expanded,
      }));
      setLegs(updatedLegs);
    }}
  />
);

ToggleExpand.propTypes = {
  legIndex: PropTypes.number.isRequired,
  legStops: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  setLegs: PropTypes.func.isRequired,
};

export default ToggleExpand;
