import { Wrapper } from "./ToggleExpand.styled";

type ToggleExpandProps = {
  legIndex: number;
  legStops: [];
  setLegs: () => void;
};

const ToggleExpand = ({ legStops, legIndex, setLegs }: ToggleExpandProps) => (
  <Wrapper
    onClick={() => {
      const updatedLegs = legStops.map(({ expanded }, index) => ({
        expanded: legIndex === index ? !expanded : expanded,
      }));
      setLegs(updatedLegs);
    }}
  />
);

export default ToggleExpand;
