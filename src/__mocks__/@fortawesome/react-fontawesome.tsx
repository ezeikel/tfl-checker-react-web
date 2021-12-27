// ISSUE: https://github.com/FortAwesome/react-fontawesome/issues/154

type FontAwesomeIconProps = {
  icon: string[];
  size?: string;
};

const FontAwesomeIcon = ({ icon, size }: FontAwesomeIconProps) => {
  const iconClass = Array.isArray(icon) ? icon.join("-") : icon;
  return (
    /* TODO: Not quite exactly what real icon outputs but fine for now */
    <svg className={`svg-inline--fa ${iconClass} fa-${size}`} />
  );
};

export default FontAwesomeIcon;
