import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type NextArrowProps = {
  className?: string;
  onClick?: () => void;
};

const NextArrow = ({ className, onClick }: NextArrowProps) => (
  /* eslint-disable-next-line */
  <div className={className} onClick={onClick}>
    <FontAwesomeIcon
      icon={["fad", "arrow-right"]}
      color="var(--color-white)"
      size="1x"
    />
  </div>
);

export default NextArrow;
