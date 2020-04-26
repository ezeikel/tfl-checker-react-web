import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Wrapper = styled.section`
  display: flex;
  flex-direction: column;
  height: 300px;
  box-shadow: var(--box-shadow);
  border-radius: var(--border-radius);
`;

const Name = styled.div`
  flex: 0 0 50%;
  background-color: ${props => `var(--color-${props.id})`};
  color: var(--color-white);
  display: flex;
  align-content: center;
  justify-content: center;
  border-top-left-radius: var(--border-radius);
  border-top-right-radius: var(--border-radius);
  font-family: var(--primary-font-family);
  font-size: 24px;
  font-weight: bold;
  display: flex;
  align-items: center;
`;

const Status = styled.div`
  flex: 0 0 50%;
  background-color: var(--color-white);
  background-color: ${props =>
    `var(--color-${props.delays ? "delay-background" : "white"})`};
  color: ${props => `var(--color-${props.delays ? "delay-text" : "black"})`};
  border-bottom-left-radius: var(--border-radius);
  border-bottom-right-radius: var(--border-radius);
  font-size: 24px;

  padding: 16px;
  text-align: center;
  .slick-slider {
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    .slick-arrow {
      background-color: ${props => `var(--color-${props.id})`};
      padding: 16px;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      &.slick-next {
        right: 0;
      }
      &.slick-prev {
        left: 0;
      }
    }
  }
`;

const NextArrow = () => (
  <FontAwesomeIcon
    icon={["fad", "arrow-right"]}
    color="var(--color-white)"
    size="lg"
  />
);

const PrevArrow = () => (
  <FontAwesomeIcon
    icon={["fad", "arrow-left"]}
    color="var(--color-white)"
    size="lg"
  />
);

const settings = {
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  prevArrow: PrevArrow,
  nextArrow: NextArrow,
};

const Card = ({ line }) => (
  <Wrapper>
    <Name id={line.id}>{line.name}</Name>
    <Status
      delays={
        line.lineStatuses.filter(status => status.statusSeverity === 9).length >
        0
      }
      id={line.id}
    >
      {/* eslint-disable-next-line */}
      <Slider {...settings}>
        {line.lineStatuses.map(status => (
          <div key={status.id}>{status.statusSeverityDescription}</div>
        ))}
      </Slider>
    </Status>
  </Wrapper>
);

Card.propTypes = {
  line: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    lineStatuses: PropTypes.array,
  }).isRequired,
};

export default Card;
