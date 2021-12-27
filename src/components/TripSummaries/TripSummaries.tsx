import { Link } from "react-router-dom";
import { setSelectedTrip } from "../../redux/actions";
import { useAppDispatch } from "../../hooks";
import { Wrapper, StyledTripSummary } from "./TripSummaries.styled";

type TripSummariesProps = {
  journeys: any[]; // TODO:
};

const TripSummaries = ({ journeys }: TripSummariesProps) => {
  const dispatch = useAppDispatch();

  return (
    <Wrapper>
      <span>Suggested</span>
      {journeys.map((journey) => (
        // eslint-disable-next-line jsx-a11y/anchor-is-valid
        <Link
          to="/trip"
          onClick={() => dispatch(setSelectedTrip(journey))}
          key={journey.id}
        >
          <StyledTripSummary journey={journey} />
        </Link>
      ))}
    </Wrapper>
  );
};

export default TripSummaries;
