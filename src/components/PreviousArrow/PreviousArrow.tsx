import { faArrowLeft } from "@fortawesome/pro-duotone-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type PreviousArrowProps = {
  className?: string;
  onClick?: () => void;
};

const PreviousArrow = ({ className, onClick }: PreviousArrowProps) => (
  /* eslint-disable-next-line */
  <div className={className} onClick={onClick}>
    <FontAwesomeIcon icon={faArrowLeft} color="var(--color-white)" size="1x" />
  </div>
);

export default PreviousArrow;
