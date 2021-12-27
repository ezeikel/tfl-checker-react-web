import styled from "styled-components";
import { rotate } from "../../GlobalStyle";

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

export const JourneyInput = styled.section`
  display: flex;
  flex-direction: column;
  padding: 32px;
  background-color: var(--color-white);
  border-radius: var(--border-radius);
  max-width: 600px;

  hr {
    background-color: #aeb8c3;
    height: 1px;
    margin: 16px 0;
  }
`;

export const Heading = styled.span`
  display: flex;
  color: var(--color-black);
  margin-bottom: 32px;
  font-size: 2.4rem;
  font-weight: bold;
`;

export const FormWrapper = styled.div`
  background-color: var(--color-input-background);
  padding: 16px;
  margin-bottom: 32px;
  display: flex;
  border-radius: 4px;
  form {
    flex: 1 0 auto;
  }
`;

export const InputWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  label {
    font-size: 1.4rem;
    margin-bottom: 8px;
    color: #aeb8c3;
  }
`;

export const StartEnd = styled.span`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 16px;
  > svg {
    flex: 0 0 auto;
  }
`;

export const VerticalLine = styled.span`
  flex: 1 0 auto;
  background-color: #aeb8c3;
  width: 1px;
`;

export const Leaving = styled.span`
  display: flex;
  align-items: center;
  font-size: 1.6rem;
  margin-bottom: 32px;
  svg {
    width: 10px;
    height: 18px;
    margin-left: 8px;
  }
`;

export const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-green);
  color: var(--color-white);
  font-size: var(--font-size-bravo);
  font-weight: bold;
  padding: 16px 0;
  border-radius: var(--border-radius);
  svg {
    margin-left: 16px;
    animation: ${rotate} 1.2s linear infinite;
  }
`;
