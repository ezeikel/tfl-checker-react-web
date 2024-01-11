import { Link } from "react-router-dom";
import { Wrapper, StyledTripSummary } from "./TripSummaries.styled";
import { Journey } from "../../../types";
import { useSuggestionsContext } from "../../contexts/suggestions";

type TripSummariesProps = {
  journeys: Journey[];
};

const TripSummaries = ({ journeys }: TripSummariesProps) => {
  const { setSelectedTrip } = useSuggestionsContext();

  return (
    <Wrapper>
      <span>Suggested</span>
      {journeys.map((journey) => (
        // eslint-disable-next-line jsx-a11y/anchor-is-valid
        <Link
          to="/trip"
          onClick={() => setSelectedTrip(journey)}
          key={journey.id}
        >
          <StyledTripSummary journey={journey} />
        </Link>
      ))}
    </Wrapper>
  );
};

export default TripSummaries;
