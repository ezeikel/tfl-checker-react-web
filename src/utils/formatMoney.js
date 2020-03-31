export default value =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(
    value / 100,
  );
