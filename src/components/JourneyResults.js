import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.section`
  background-color: #fff;
`;

const Journey = styled.div`
  margin-bottom: 32px;
`;

const Leg = styled.div`
  display: flex;
  flex-direction: column;
`;

const Steps = styled.div`
  margin: 16px;
`;

const Step = styled.div`
  display: flex;
  flex-direction: column;
`;

const JourneyResults = ({ results }) => {
    console.log({ results });
    const { journeys } = results;

    if (!journeys) return <div>Empty.</div>
    return (
      <Wrapper>
        {
          journeys.map((journey, i) => (
            <Journey key={i}>
              <span>Duration: {journey.duration}</span>
              {
                journey.legs.map((leg, i) => (
                  <Leg key={i}>
                    <span>Duration: {leg.duration}</span>
                    <span>{leg.instruction.summary}</span>
                    <Steps className="steps">
                      {leg.instruction.steps.map((step, i) => (
                        <Step className="step" key={i}>
                          <span>{step.descriptionHeading}</span>
                          <span>{step.description}</span>
                        </Step>
                      ))}
                    </Steps>
                  </Leg>
                ))
              }
            </Journey>
          ))

        }
      </Wrapper>
    );
};

export default JourneyResults;