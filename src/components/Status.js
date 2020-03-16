import React, { useState, useEffect } from 'react';
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

const Status = () => {
  const [ status, setStatus ] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const data = await fetch('https://api.tfl.gov.uk/line/mode/tube/status?app_id=1b83c22c&app_key=e5c7b582d0f72a04add248393e939cf5');
      const json = await data.json();

      setStatus(json);
    }
    fetchData();
  }, []);

  const renderLines = () => (
    status.map(line => (
      <TubeLine key={line.id} line={line} />
    ))
  );

  return (
    <>
      <Title>Status:</Title>
      <Lines>
        {renderLines()}
      </Lines>
    </>
  )
};

export default Status;