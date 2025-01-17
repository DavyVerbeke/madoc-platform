import styled, { css } from 'styled-components';
import { CloseIcon } from './CloseIcon';

export const ModalBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 20;
  background: rgba(0, 0, 0, 0.4);
`;

export const ModalContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 21;
  display: flex;
`;

const sizes = {
  sm: {
    maxWidth: '600px',
  },
  md: {
    maxWidth: '800px',
  },
  lg: {
    maxWidth: '1000px',
  },
};

export const InnerModalContainer = styled.div<{ size?: keyof typeof sizes }>`
  max-width: ${props => sizes[props.size || 'sm'].maxWidth};
  width: 100%;
  min-height: 350px;
  height: auto;
  display: flex;
  margin: auto;
  flex-direction: column;
  max-height: 80vh;
  border-radius: 5px;
  overflow: hidden;
  box-shadow: 4px 0 20px 0 rgba(0, 0, 0, 0.5);
`;

export const ModalHeader = styled.div`
  background: #3766f2;
  width: 100%;
  color: #fff;
  padding: 1em;
  display: flex;
`;

export const ModalHeaderTitle = styled.div`
  color: #fff;
  font-size: 1.2em;
  flex: 1 1 0px;
`;

export const ModalCloseIcon = styled(CloseIcon)`
  fill: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  &:hover {
    fill: rgba(255, 255, 255, 1);
  }
`;

export const ModalBody = styled.div`
  background: #fff;
  padding: 1em;
  overflow-y: auto;
  min-height: 230px;
`;

export const ModalFooter = styled.div<{ $footerAlignRight?: boolean }>`
  background: #eee;
  width: 100%;
  color: #fff;
  padding: 1em;
  display: flex;
  ${props =>
    props.$footerAlignRight &&
    css`
      flex-direction: row-reverse;
    `}
`;
