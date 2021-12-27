import styled from "styled-components";

type StatusProps = {
  id: string;
  delays: boolean;
  currentSlide: any;
  slideLength: number;
};

type NameProps = {
  id: string;
};

export const Wrapper = styled.section`
  display: flex;
  flex-direction: column;
  height: 300px;
  box-shadow: var(--box-shadow);
  border-radius: var(--border-radius);
`;

export const Name = styled.div<NameProps>`
  flex: 0 0 50%;
  background-color: ${({ id }) => `var(--color-${id})`};
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

export const Status = styled.div<StatusProps>`
  flex: 0 0 50%;
  background-color: ${({ delays }) =>
    `var(--color-${delays ? "delay-background" : "white"})`};
  color: ${({ delays }) => `var(--color-${delays ? "delay-text" : "black"})`};
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
      background-color: ${({ id }) => `var(--color-${id})`};
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
