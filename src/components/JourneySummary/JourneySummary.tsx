import formatMoney from "../../utils/formatMoney";
import Mode from "../Mode/Mode";
import { Wrapper, Legs, TotalFare, Duration } from "./JourneySummary.styled";
import { Journey } from "../../../types";

type JourneySummaryProps = {
  className?: string;
  journey: Journey;
};

const JourneySummary = ({ journey, className }: JourneySummaryProps) => {
  if (Object.keys(journey).length === 0) return null;

  return (
    <Wrapper className={className}>
      <Legs>
        {journey.legs.map((leg, i) => (
          <Mode
            key={i} // eslint-disable-line react/no-array-index-key
            leg={leg}
          />
        ))}
      </Legs>
      <TotalFare>
        {formatMoney(journey.fare ? journey.fare.totalCost : 0)}
      </TotalFare>
      <Duration>
        <span>{journey.duration}</span>
        <span>min</span>
      </Duration>
    </Wrapper>
  );
};

export default JourneySummary;
