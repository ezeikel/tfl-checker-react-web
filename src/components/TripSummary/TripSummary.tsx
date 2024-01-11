import formatMoney from "../../utils/formatMoney";
import Mode from "../Mode/Mode";
import { Wrapper, Legs, TotalFare, Duration } from "./TripSummary.styled";
import { Journey } from "../../../types";

type TripSummaryProps = {
  className?: string;
  journey: Journey;
};

const TripSummary = ({ journey, className }: TripSummaryProps) => {
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

export default TripSummary;
