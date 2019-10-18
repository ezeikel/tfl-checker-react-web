import React, { Component } from 'react';
import styled from 'styled-components';
import TubeLine from "./TubeLine";

const Lines = styled.ul`
  display: flex;
  flex-direction: column;
`;

const Title = styled.h4`
  font-size: 18px;
  margin-top: 10px;
  margin-bottom: 10px;
`;

class Status extends Component {
  state = {
    status: []
  };

  async componentDidMount() {
    const data = await fetch('https://api.tfl.gov.uk/line/mode/tube/status');
    const json = await data.json();

    this.setState({
      status: json
    });
  }

  renderLines = () => (
    this.state.status.map(line => (
      <TubeLine key={line.id} line={line} />
    ))
  );

  render() {
    return (
      <React.Fragment>
        <Title>Status:</Title>
        <Lines>
          {this.renderLines()}
        </Lines>
      </React.Fragment>
    )
  }
};

export default Status;