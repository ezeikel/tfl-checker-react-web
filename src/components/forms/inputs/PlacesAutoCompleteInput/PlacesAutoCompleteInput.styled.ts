import styled from "styled-components";
import { rotate } from "../../../../GlobalStyle";

type SuggestionProps = {
  active: boolean;
};

export const Input = styled.input`
  font-size: 1.6rem;
  width: 100%;
  outline: none;
  border: 0;
  background-color: transparent;
  font-weight: bold;
  ::-webkit-input-placeholder {
    /* Edge */
    color: #aeb8c3;
    font-weight: bold;
  }

  :-ms-input-placeholder {
    /* Internet Explorer 10-11 */
    color: #aeb8c3;
    font-weight: bold;
  }

  ::placeholder {
    color: #aeb8c3;
    font-weight: bold;
  }
`;

export const Loading = styled.div`
  display: flex;
  padding: 8px 0;
  animation: ${rotate} 1.2s linear infinite;
  align-self: flex-start;
`;

export const SuggestionsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  [aria-expanded="true"] + & {
    margin-top: 8px;
  }
`;

export const Suggestion = styled.div<SuggestionProps>`
  font-family: var(--primary-font-family);
  font-size: 1.6rem;
  background-color: ${({ active }) =>
    `var(--color-${active ? "background" : "white"})`};
  color: ${({ active }) => `var(--color-${active ? "white" : "black"})`};
  cursor: pointer;
  padding: 8px;
`;

export const PlacesByGoogle = styled.div`
  display: none;
  gap: var(--spacing-small);
  align-items: center;
  font-size: 11px;
  background-color: white;
  padding: 8px;
  &:not(:only-child) {
    display: flex;
  }
`;

export const List = styled.div`
  > div {
    & + div {
      border-top: 1px solid #eeeeee;
    }
  }
`;
