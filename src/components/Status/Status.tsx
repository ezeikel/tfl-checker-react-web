import { useState, useEffect } from "react";
import Card from "../Card/Card";
import { Lines } from "./Status.styled";

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
    status.map((line) => <Card key={line.id} line={line} />);

  return <Lines>{renderLines()}</Lines>;
};

export default Status;
