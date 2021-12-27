import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Wrapper } from "./Mode.styled";
import convertModeToIcon from "../../utils/convertModeToIcon";

type ModeProps = {
  leg: {
    mode: {
      id: string;
    };
    routeOptions: any[];
  };
};

const Mode = ({
  leg: {
    routeOptions,
    mode: { id },
  },
}: ModeProps) => {
  const { name, color } = convertModeToIcon(id);

  return (
    <Wrapper>
      <FontAwesomeIcon icon={["fad", name]} color={color} size="lg" />
      {routeOptions.map((option, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <span key={i}>
          {option.name}
          {i < routeOptions.length - 1 ? <span>/</span> : ""}
        </span>
      ))}
    </Wrapper>
  );
};

export default Mode;
