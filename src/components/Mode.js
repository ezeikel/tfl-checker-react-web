import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import renderOptions from "../utils/renderOptions";

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid #d9d9d9;
  padding: 8px;
  border-radius: 4px;
  font-size: 1.4rem;
  font-weight: bold;
  span {
    margin-left: 8px;
  }
`;

const convertModeToIcon = mode => {
  const icon = {};

  switch (mode) {
    case "walking":
      icon.name = "walking";
      icon.color = "#34495E";
      break;
    case "bus":
    case "replacement-bus":
      icon.name = "bus";
      icon.color = "#C83638";
      break;
    case "coach":
      icon.name = "bus-alt";
      icon.color = "#10bd59";
      break;
    case "tube":
      icon.name = "subway";
      icon.color = "#34495E";
      break;
    case "national-rail":
      icon.name = "train";
      icon.color = "#34495E";
      break;
    case "overground":
      icon.name = "train";
      icon.color = "#E46B24";
      break;
    case "tflrail":
      icon.name = "train";
      icon.color = "#0026A5";
      break;
    case "dlr":
      icon.name = "tram";
      icon.color = "#26AFAC";
      break;
    default:
      console.error("Mode icon not found.");
  }

  return icon;
};

const Mode = ({
  leg: {
    routeOptions,
    mode: { id },
  },
}) => (
  <Wrapper>
    <FontAwesomeIcon
      icon={["fad", convertModeToIcon(id).name]}
      color={convertModeToIcon(id).color}
      size="lg"
    />
    {renderOptions(routeOptions)}
  </Wrapper>
);

Mode.propTypes = {
  leg: PropTypes.shape({
    mode: PropTypes.shape({
      id: PropTypes.string,
    }),
    routeOptions: PropTypes.arrayOf(PropTypes.shape({})),
  }).isRequired,
};

export default Mode;
