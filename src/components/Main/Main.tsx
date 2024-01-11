import { Routes, Route } from "react-router-dom";
import Status from "../Status/Status";
import TripPlanner from "../TripPlanner/TripPlanner";
import Journey from "../Journey/Journey";
import { Wrapper } from "./Main.styled";

const Main = () => (
  <Wrapper>
    <Routes>
      <Route path="/" element={<Status />} />
      <Route path="/trip-planner" element={<TripPlanner />} />
      <Route path="/trip" element={<Journey />} />
    </Routes>
  </Wrapper>
);

export default Main;
