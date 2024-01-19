import { faArrowRight } from "@fortawesome/pro-duotone-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type NextArrowProps = {
  className?: string;
  onClick?: () => void;
};

const NextArrow = ({ className, onClick }: NextArrowProps) => (
  /* eslint-disable-next-line */
  <div className={className} onClick={onClick}>
    <FontAwesomeIcon icon={faArrowRight} color="var(--color-white)" size="1x" />
  </div>
);

export default NextArrow;
