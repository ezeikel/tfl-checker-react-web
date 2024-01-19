import { Helmet } from "react-helmet";
import Card from "../Card/Card";
import { Lines } from "./Status.styled";
import { useQuery } from "@tanstack/react-query";

const fetchStatus = async () => {
  const response = await fetch(
    `${
      import.meta.env.VITE_TFL_API_URL
    }/line/mode/tube,overground,dlr,elizabeth-line/status?app_key=${
      import.meta.env.VITE_TFL_APP_KEY
    }`,
  );

  return response.json();
};

const Status = () => {
  const { data: status, isLoading } = useQuery({
    queryKey: ["status"],
    queryFn: () => fetchStatus(),
  });

  if (isLoading) return null;

  return (
    <>
      <Helmet>
        <title>TfL Checker - Status</title>
      </Helmet>
      <Lines>
        {status.map((line) => (
          <Card key={line.id} line={line} />
        ))}
      </Lines>
    </>
  );
};

export default Status;
