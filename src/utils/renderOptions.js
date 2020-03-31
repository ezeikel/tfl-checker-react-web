import React from "react";

export default leg =>
  leg.routeOptions.map((option, i) => (
    <span key={i}>
      {option.name}
      {i < leg.routeOptions.length - 1 ? <span>/</span> : ""}
    </span>
  ));
