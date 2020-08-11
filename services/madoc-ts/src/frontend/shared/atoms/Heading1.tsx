import styled, { css } from 'styled-components';

export const Heading1 = styled.h1<{ $margin?: boolean }>`
  font-size: 2em;
  font-weight: 600;
  margin-bottom: 0.2em;
  ${props =>
    props.$margin &&
    css`
      margin-bottom: 1em;
    `}
`;

export const Subheading1 = styled.div`
  font-size: 1em;
  color: #999;
  margin-bottom: 1em;
  & a {
    color: #5071f4;
    font-size: 0.85em;
  }
`;
