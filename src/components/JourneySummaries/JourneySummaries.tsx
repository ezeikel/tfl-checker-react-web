import { Link } from "react-router-dom";
import { Wrapper, StyledJourneySummary } from "./JourneySummaries.styled";
import { Journey } from "../../../types";
import { useSuggestionsContext } from "../../contexts/suggestions";

type JourneySummariesProps = {
  journeys: Journey[];
};

const JourneySummaries = ({ journeys }: JourneySummariesProps) => {
  const { setSelectedJourney } = useSuggestionsContext();

  return (
    <Wrapper>
      <span>Suggested</span>
      {/* TODO: repplace index key with something from the data */}
      {journeys.map((journey, index) => (
        <Link
          to="/journey"
          onClick={() => setSelectedJourney(journey)}
          key={index}
        >
          <StyledJourneySummary journey={journey} />
        </Link>
      ))}
    </Wrapper>
  );
};

export default JourneySummaries;
