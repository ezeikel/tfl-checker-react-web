import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Card from "./Card";

const Lines = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  grid-gap: 32px;
  justify-content: space-between;
  background-color: var(--color-white);
  padding: 32px;
  border-radius: 4px;
`;

const Status = () => {
  const [status, setStatus] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const data = await fetch(
        "https://api.tfl.gov.uk/line/mode/tube,overground,dlr,tflrail/status?app_id=1b83c22c&app_key=e5c7b582d0f72a04add248393e939cf5",
      );
      const json = await data.json();

      setStatus(json);
    }
    fetchData();
  }, []);

  const renderLines = () =>
    status.map(line => <Card key={line.id} line={line} />);

  return <Lines>{renderLines()}</Lines>;
};

export default Status;
