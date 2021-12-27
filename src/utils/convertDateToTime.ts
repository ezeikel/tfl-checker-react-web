import addLeadingZero from "./addLeadingZero";

export default (dateString: string) => {
  const date = new Date(dateString);
  const hours = date.getHours();
  const minutes = date.getMinutes();

  return `${addLeadingZero(hours)}:${addLeadingZero(minutes)}`;
};
