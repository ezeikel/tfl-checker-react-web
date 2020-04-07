import React from "react";
import PropTypes from "prop-types";

// ISSUE: https://github.com/FortAwesome/react-fontawesome/issues/154

// eslint-disable-next-line import/prefer-default-export
export function FontAwesomeIcon({ icon, color, size }) {
  const iconClass = Array.isArray(icon) ? icon.join("-") : icon;
  return (
    /* TODO: Not quite exactly what real icon outputs but fine for now */
    <svg className={`svg-inline--fa ${iconClass} fa-${size}`} color={color} />
  );
}

FontAwesomeIcon.propTypes = {
  icon: PropTypes.oneOfType([PropTypes.array, PropTypes.string]).isRequired,
  color: PropTypes.string.isRequired,
  size: PropTypes.string.isRequired,
};
