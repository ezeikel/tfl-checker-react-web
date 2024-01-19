import { useEffect, useRef, useState } from "react";
import convertDateToTime from "../../utils/convertDateToTime";
import {
  Wrapper,
  Leg,
  Header,
  Footer,
  Content,
  Point,
  Stops,
  Stop,
  Direction,
  Summary,
  VerticalLine,
  Duration,
  Toggle,
  StyledModeIcon,
  ToggleExpand,
} from "./JourneyExpanded.styled";
import { Journey, Mode } from "../../../types";
import { MODE_COLOURS } from "../../constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt } from "@fortawesome/pro-solid-svg-icons";

type JourneyExpandedProps = {
  className?: string;
  journey: Journey;
};

const JourneyExpanded = ({ className, journey }: JourneyExpandedProps) => {
  const [legs, setLegs] = useState(
    journey.legs.map(() => ({ expanded: false })),
  );
  const [marginLeft, setMarginLeft] = useState<string | number>("auto");
  const markerIconRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (markerIconRef.current) {
      const iconWidth = markerIconRef.current.getBoundingClientRect().width;
      setMarginLeft(-iconWidth / 2); // Example: center the icon
    }
  }, []);

  // TODO: should really clear selected journey when component unmounts, but this useEffect fires when the component mounts - fine for now as this component only mounts when a new journey is selected
  // useEffect(() => {
  //   return () => {
  //     clearSelectedJourney();
  //   };
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  if (Object.keys(journey).length === 0) return null;

  return (
    <Wrapper className={className}>
      {journey.legs.map((leg, i) => (
        <Leg key={i}>
          <Header>
            <StyledModeIcon mode={leg.mode.id} size="2x" minusMarginLeft />
            <Point className="location-name">{`${
              leg.departurePoint.commonName
            } at ${convertDateToTime(leg.departureTime)}`}</Point>
          </Header>
          <Content>
            <VerticalLine color={MODE_COLOURS[leg.mode.id].color} />
            <div>
              <Summary>{leg.instruction.summary}</Summary>
              <Duration>
                <span>{leg.duration} min</span>
                {leg.mode.id === Mode.WALKING && (
                  <ToggleExpand
                    onClick={() => {
                      const updatedLegs = legs.map(({ expanded }, index) => ({
                        expanded: i === index ? !expanded : expanded,
                      }));
                      setLegs(updatedLegs);
                    }}
                  />
                )}
                {(leg.mode.id === Mode.BUS ||
                  leg.mode.id === Mode.NATIONAL_RAIL ||
                  leg.mode.id === Mode.OVERGROUND ||
                  leg.mode.id === Mode.TUBE) && (
                  <Toggle
                    onClick={() => {
                      const updatedLegs = legs.map(({ expanded }, index) => ({
                        expanded: i === index ? !expanded : expanded,
                      }));
                      setLegs(updatedLegs);
                    }}
                  >
                    {`${legs[i].expanded ? "Hide" : "Show"} ${
                      leg.path.stopPoints.length
                    } stop${leg.path.stopPoints.length === 1 ? "" : "s"}`}
                  </Toggle>
                )}
              </Duration>
              {legs[i].expanded && (
                <Stops>
                  {leg.mode.id === Mode.WALKING &&
                    leg.instruction.steps.map(
                      (
                        step,
                        i, // eslint-disable-line no-shadow
                      ) => (
                        <Direction key={i}>
                          <span>{step.descriptionHeading}</span>
                          <span>{step.description}</span>
                        </Direction>
                      ),
                    )}
                  {(leg.mode.id === Mode.BUS ||
                    leg.mode.id === Mode.NATIONAL_RAIL ||
                    leg.mode.id === Mode.OVERGROUND ||
                    leg.mode.id === Mode.TUBE) &&
                    leg.path.stopPoints.map(
                      (
                        stopPoint,
                        i, // eslint-disable-line no-shadow
                      ) => (
                        <Stop key={i} color={MODE_COLOURS[leg.mode.id].color}>
                          {" "}
                          <span>{stopPoint.name}</span>
                        </Stop>
                      ),
                    )}
                </Stops>
              )}
            </div>
          </Content>
        </Leg>
      ))}
      <Footer>
        <FontAwesomeIcon
          icon={faMapMarkerAlt}
          color="var(--color-background)"
          size="2x"
          style={{
            marginLeft,
          }}
          ref={markerIconRef}
        />
        <Point className="location-name">{`${
          journey.legs[journey.legs.length - 1].arrivalPoint.commonName
        } at ${convertDateToTime(
          journey.legs[journey.legs.length - 1].departureTime,
        )}`}</Point>
      </Footer>
    </Wrapper>
  );
};

export default JourneyExpanded;
