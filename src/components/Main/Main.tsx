import { Routes, Route } from "react-router-dom";
import Status from "../Status/Status";
import TripPlanner from "../TripPlanner/TripPlanner";
import Trip from "../Trip/Trip";
import { Wrapper } from "./Main.styled";

const Main = () => (
  <Wrapper>
    <Routes>
      <Route path="/" element={<Status />} />
      <Route path="/trip-planner" element={<TripPlanner />} />
      <Route path="/trip" element={<Trip />} />
    </Routes>
  </Wrapper>
);

export default Main;
