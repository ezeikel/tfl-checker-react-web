import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { clearSelectedTrip, clearJourney } from "../../redux/actions";
import TripMap from "../TripMap/TripMap";
import {
  Wrapper,
  StyledTripSummary,
  ContentWrap,
  StyledTripExpanded,
} from "./Trip.styled";
import { useAppDispatch, useAppSelector } from "../../hooks";

const Trip = () => {
  const { selected: selectedTrip } = useAppSelector(
    ({ suggestion }) => suggestion,
  );
  const dispatch = useAppDispatch();
  console.warn({ selectedTrip });
  const navigate = useNavigate();

  const path =
    selectedTrip.legs &&
    selectedTrip.legs.map((leg, i) => {
      if (i === selectedTrip.legs.length - 1) {
        return {
          lat: leg.arrivalPoint.lat,
          lng: leg.arrivalPoint.lon,
        };
      }

      return {
        lat: leg.departurePoint.lat,
        lng: leg.departurePoint.lon,
      };
    });

  useEffect(() => {
    return () => {
      dispatch(clearSelectedTrip());
      dispatch(clearJourney());
    };
  }, [dispatch]);

  if (!selectedTrip) {
    navigate("/trip-planner");
    return null;
  }

  return (
    <Wrapper>
      <StyledTripSummary journey={selectedTrip} />
      <ContentWrap>
        <StyledTripExpanded trip={selectedTrip} />
        <TripMap center={{ lat: 51.50853, lng: -0.12574 }} path={path} />
      </ContentWrap>
    </Wrapper>
  );
};

export default Trip;
