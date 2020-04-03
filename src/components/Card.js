import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

const Wrapper = styled.section`
  display: flex;
  flex-direction: column;
  height: 300px;
  box-shadow: var(--box-shadow);
  border-radius: var(--border-radius);
`;

const Name = styled.div`
  flex: 0 0 50%;
  background-color: ${props => `var(--color-${props.id})`};
  color: var(--color-white);
  display: flex;
  align-content: center;
  justify-content: center;
  border-top-left-radius: var(--border-radius);
  border-top-right-radius: var(--border-radius);
  font-size: 24px;
  font-weight: bold;
  display: flex;
  align-items: center;
`;

const Status = styled.div`
  flex: 0 0 50%;
  background-color: var(--color-white);
  background-color: ${props =>
    `var(--color-${props.delays ? "delay-background" : "white"})`};
  color: ${props => `var(--color-${props.delays ? "delay-text" : "black"})`};
  border-bottom-left-radius: var(--border-radius);
  border-bottom-right-radius: var(--border-radius);
  font-size: 24px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Card = ({ line }) => (
  <Wrapper>
    <Name id={line.id}>{line.name}</Name>
    <Status
      delays={
        line.lineStatuses.filter(status => status.statusSeverity === 9).length >
        0
      }
    >
      {line.lineStatuses.map(status => status.statusSeverityDescription)}
    </Status>
  </Wrapper>
);

Card.propTypes = {
  line: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    lineStatuses: PropTypes.array,
  }).isRequired,
};

export default Card;
