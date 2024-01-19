import styled from "styled-components";
import JourneySummary from "../JourneySummary/JourneySummary";

export const Wrapper = styled.section`
  display: flex;
  flex-direction: column;
  margin-top: var(--spacing-huge);
  > span {
    &:first-of-type {
      font-size: 2.4rem;
      margin-bottom: 32px;
      font-weight: bold;
      color: var(--color-white);
    }
  }
  a {
    display: flex;
    width: 100%;
    align-items: center;
    color: var(--color-text);
    &:first-of-type {
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
      section {
        border-top-left-radius: 4px;
        border-top-right-radius: 4px;
      }
    }
    &:last-of-type {
      border-bottom-left-radius: 4px;
      border-bottom-right-radius: 4px;
      section {
        border-bottom-left-radius: 4px;
        border-bottom-right-radius: 4px;
      }
    }
    & + a {
      border-top: 1px solid #eeeeee;
    }
  }
`;

export const StyledJourneySummary = styled(JourneySummary)`
  border-radius: 0;
  &:hover {
    background-color: #f2f2f2;
    cursor: pointer;
  }
`;
