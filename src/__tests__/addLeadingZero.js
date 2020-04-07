import addLeadingZero from "../utils/addLeadingZero";


it('adds a leading zero', () => {
  const result = addLeadingZero(4);
  expect(result).toEqual("04");
});

it('doesnt add a leading zero', () => {
  const result = addLeadingZero(10);
  expect(result).toEqual(10);
});
