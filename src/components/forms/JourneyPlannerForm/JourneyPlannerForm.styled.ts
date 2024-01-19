import styled from "styled-components";
import { rotate } from "../../GlobalStyle";

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
