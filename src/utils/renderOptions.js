import React from "react";

export default (routeOptions) =>
  routeOptions.map((option, i) => (
    // eslint-disable-next-line react/no-array-index-key
    <span key={i}>
      {option.name}
      {i < routeOptions.length - 1 ? <span>/</span> : ""}
    </span>
  ));
