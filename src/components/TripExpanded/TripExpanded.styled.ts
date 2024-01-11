import styled from "styled-components";

type StopProps = {
  color: string;
};

type VerticalLineProps = {
  color: string;
};

export const Wrapper = styled.section`
  display: flex;
  flex-direction: column;
  background-color: var(--color-white);
  padding: 32px;
  border-radius: 4px;
`;

export const Leg = styled.section`
  display: flex;
  flex-direction: column;
`;

export const Header = styled.section`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`;

export const Footer = styled.section`
  display: flex;
  align-items: center;
`;

export const Content = styled.section`
  display: flex;
`;

export const Point = styled.span`
  font-size: 2rem;
  margin-left: 4px;
`;

export const Stops = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 1.6rem;
  > div {
    & + div {
      margin-top: 16px;
    }
    &:last-of-type {
      margin-bottom: 16px;
    }
  }
`;

export const Stop = styled.div<StopProps>`
  display: flex;
  flex-direction: column;
  position: relative;
  &:before {
    content: "";
    display: block;
    height: 4px;
    width: 12px;
    border-radius: 4px;
    background-color: #4d4d4d;
    background-color: ${({ color }) => color};
    position: absolute;
    top: 50%;
    left: -4px;
    margin-top: -2px;
    margin-left: -15px;
  }
`;

export const Direction = styled.div`
  display: flex;
  flex-direction: column;
  display: relative;
  position: relative;
  &:before {
    content: "";
    display: block;
    height: 4px;
    width: 12px;
    border-radius: 4px;
    background-color: #4d4d4d;
    position: absolute;
    top: 50%;
    left: -4px;
    margin-top: -2px;
    margin-left: -15px;
  }
  span {
    &:first-child {
      font-size: 18px;
    }
  }
`;

export const Summary = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 1.8rem;
  margin-bottom: 8px;
`;

export const VerticalLine = styled.div<VerticalLineProps>`
  display: flex;
  background-color: ${({ color }) => color};
  width: 4px;
  min-height: 32px;
  border-radius: 4px;
  margin-right: 18px;
  margin-left: -2px;
`;

export const Duration = styled.div`
  display: flex;
  font-size: 1.6rem;
  margin-bottom: 8px;
  span {
    &:first-of-type {
      font-weight: bold;
    }
    & + span {
      margin-left: 16px;
    }
  }
`;

export const Toggle = styled.span`
  color: #28bcd4;
  cursor: pointer;
`;

export const ModeIcon = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 32px;
  height: 32px;
  margin-left: -16px;
`;

export const ToggleExpand = styled.span`
  color: #28bcd4;
  cursor: pointer;
`;
