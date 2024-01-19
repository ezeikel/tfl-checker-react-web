import { Routes, Route } from "react-router-dom";
import Status from "../Status/Status";
import JourneyPlanner from "../JourneyPlanner/JourneyPlanner";
import Journey from "../Journey/Journey";
import { Wrapper } from "./Main.styled";

const Main = () => (
  <Wrapper>
    <Routes>
      <Route path="/" element={<Status />} />
      <Route path="/journey-planner" element={<JourneyPlanner />} />
      <Route path="/journey" element={<Journey />} />
    </Routes>
  </Wrapper>
);

export default Main;
