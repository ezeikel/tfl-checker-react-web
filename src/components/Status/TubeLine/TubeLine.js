import React from 'react';
import styled from 'styled-components';

const Line = styled.li`
  background-color: ${props => `var(--${props.id}-color)`};
    > span {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0.5rem 1rem; 
  }
`;

const LineName = styled.span`
  &:first-of-type {
    color: #fff;
  }
`;

const LineStatus = styled.span`
  &:nth-of-type(2) {
    background-color: #fff;
  }
`;

const TubeLine = (props) => (
  <Line id={props.line.id}>
    <LineName>
      {props.line.name}
    </LineName>
    <LineStatus>
      {props.line.lineStatuses.map(status => status.statusSeverityDescription)}
    </LineStatus>
  </Line>
)
  
export default TubeLine;
