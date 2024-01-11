import { useState, useEffect } from "react";
import Card from "../Card/Card";
import { Lines } from "./Status.styled";

const Status = () => {
  const [status, setStatus] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const data = await fetch(
        `${process.env.TFL_API_URL}/line/mode/tube,overground,dlr,tflrail/status?app_id=1b83c22c&app_key=${process.env.TFL_API_KEY}`,
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
