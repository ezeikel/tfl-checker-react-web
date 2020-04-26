import React, { useState } from "react";
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
    justify-content: center;
    .slick-arrow {
      background-color: ${props => `var(--color-${props.id})`};
      padding: 8px;
      width: 32px;
      height: 32px;
      border-radius: 50%;

      display: flex !important;
      height: 48px;
      width: 48px;
      align-items: center;
      justify-content: center;
      z-index: 3;
      transition: opacity 0.3s ease-in-out;
      svg {
        height: 16px;
        width: 16px;
      }
      &:before {
        display: none;
      }
      &.slick-next {
        right: 0;
        opacity: ${({ currentSlide, slideLength }) =>
          currentSlide === slideLength - 1 ? 0.6 : 1};
      }
      &.slick-prev {
        left: 0;
        opacity: ${({ currentSlide }) => (currentSlide === 0 ? 0.6 : 1)};
      }
    }
    .slick-list {
      width: 100%;
    }
  }
`;

/* eslint-disable-next-line */
const NextArrow = ({ className, onClick }) => (
  /* eslint-disable-next-line */
  <div className={className} onClick={onClick}>
    <FontAwesomeIcon
      icon={["fad", "arrow-right"]}
      color="var(--color-white)"
      size="1x"
    />
  </div>
);

/* eslint-disable-next-line */
const PrevArrow = ({ className, onClick }) => (
  /* eslint-disable-next-line */
  <div className={className} onClick={onClick}>
    <FontAwesomeIcon
      icon={["fad", "arrow-left"]}
      color="var(--color-white)"
      size="1x"
    />
  </div>
);

const Card = ({ line }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const settings = {
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    afterChange: current => setCurrentSlide(current),
  };

  return (
    <Wrapper>
      <Name id={line.id}>{line.name}</Name>
      <Status
        delays={
          line.lineStatuses.filter(status => status.statusSeverity > 0).length >
          0
        }
        id={line.id}
        currentSlide={currentSlide}
        slideLength={line.lineStatuses.length}
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
};

Card.propTypes = {
  line: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    lineStatuses: PropTypes.array,
  }).isRequired,
};

export default Card;
