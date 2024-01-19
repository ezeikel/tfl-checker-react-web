import { Wrapper } from "./Mode.styled";
import ModeIcon from "../ModaIcon/ModeIcon";
import { Mode as ModeType } from "../../../types";

type ModeProps = {
  leg: {
    mode: {
      id: ModeType;
    };
    routeOptions: any[];
  };
};

const Mode = ({
  leg: {
    routeOptions,
    mode: { id },
  },
}: ModeProps) => (
  <Wrapper>
    <ModeIcon mode={id} size="lg" />
    {routeOptions
      // some route options are empty e.g walking, so filter them out
      .filter((option) => option.name !== "")
      .map((option, i) => (
        <span key={i}>
          {option.name}
          {i < routeOptions.length - 1 ? <span>/</span> : ""}
        </span>
      ))}
  </Wrapper>
);

export default Mode;
