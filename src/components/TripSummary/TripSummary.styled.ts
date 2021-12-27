import styled from "styled-components";

export const Wrapper = styled.section`
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  width: 100%;
  padding: 32px;
  background-color: #fff;
  border-radius: 4px;
  .timing {
    display: flex;
    justify-content: space-between;
  }
`;

export const Legs = styled.div`
  flex: 1 0 auto;
  display: flex;
  align-items: center;
  > div {
    & + div {
      margin-left: 16px;
    }
  }
`;

export const TotalFare = styled.div`
  flex: 0 0 auto;
  display: flex;
  font-size: 16px;
  font-weight: bold;
  color: #31cc71;
  margin-right: 32px;
`;

export const Duration = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  span {
    &:first-of-type {
      font-size: 2.4rem;
      font-weight: bold;
    }
    &:last-of-type {
      font-size: 1.6rem;
    }
  }
`;
