import { useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Wrapper, Name, Status } from "./Card.styled";
import NextArrow from "../NextArrow/NextArrow";
import PreviousArrow from "../PreviousArrow/PreviousArrow";

type CardProps = {
  line: {
    id: string;
    name: string;
  };
};

const Card = ({ line }: CardProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const settings = {
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PreviousArrow />,
    afterChange: (current) => setCurrentSlide(current),
  };

  return (
    <Wrapper>
      <Name id={line.id}>{line.name}</Name>
      <Status
        delays={
          line.lineStatuses.filter((status) => status.statusSeverity > 0)
            .length > 0
        }
        id={line.id}
        currentSlide={currentSlide}
        slideLength={line.lineStatuses.length}
      >
        {/* eslint-disable-next-line */}
        <Slider {...settings}>
          {line.lineStatuses.map((status) => (
            <div key={status.id}>{status.statusSeverityDescription}</div>
          ))}
        </Slider>
      </Status>
    </Wrapper>
  );
};

export default Card;
