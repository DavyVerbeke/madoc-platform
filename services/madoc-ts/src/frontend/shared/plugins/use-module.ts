import * as publicApi from './public-api';

export const _ALLOWED_MODULES = [
  '@madoc.io/types',
  '@atlas-viewer/atlas',
  '@atlas-viewer/iiif-image-api',
  '@capture-models/editor',
  '@capture-models/helpers',
  '@hyperion-framework/presentation-2',
  '@hyperion-framework/react-vault',
  '@hyperion-framework/vault',
  'color-hash',
  'easy-peasy',
  'i18next',
  'immer',
  'make-color-accessible',
  'react',
  'react-accessible-dropdown-menu-hook',
  'react-beautiful-dnd',
  'react-dnd',
  'react-dnd-html5-backend',
  'react-dnd-multi-backend',
  'react-dnd-touch-backend',
  'react-dropzone',
  'react-error-boundary',
  'react-helmet',
  'react-i18next',
  'react-intersection-observer',
  'react-mosaic-component',
  'react-query',
  'react-router-config',
  'react-router-dom',
  'react-stack-grid',
  'react-timeago',
  'react-tooltip',
  'styled-components',
] as const;

export const ALLOWED_MODULES = [..._ALLOWED_MODULES];

type AvailableModules = typeof _ALLOWED_MODULES[number];

export function useModule(name: AvailableModules) {
  switch (name) {
    case '@madoc.io/types':
      return publicApi;
    case '@atlas-viewer/atlas':
      return require('@atlas-viewer/atlas');
    case '@atlas-viewer/iiif-image-api':
      return require('@atlas-viewer/iiif-image-api');
    case '@capture-models/editor':
      return require('@capture-models/editor');
    case '@capture-models/helpers':
      return require('@capture-models/helpers');
    case '@hyperion-framework/presentation-2':
      return require('@hyperion-framework/presentation-2');
    case '@hyperion-framework/react-vault':
      return require('@hyperion-framework/react-vault');
    case '@hyperion-framework/vault':
      return require('@hyperion-framework/vault');
    case 'color-hash':
      return require('color-hash');
    case 'easy-peasy':
      return require('easy-peasy');
    case 'i18next':
      return require('i18next');
    case 'immer':
      return require('immer');
    case 'make-color-accessible':
      return require('make-color-accessible');
    case 'react':
      return require('react');
    case 'react-accessible-dropdown-menu-hook':
      return require('react-accessible-dropdown-menu-hook');
    case 'react-beautiful-dnd':
      return require('react-beautiful-dnd');
    case 'react-dnd':
      return require('react-dnd');
    case 'react-dnd-html5-backend':
      return require('react-dnd-html5-backend');
    case 'react-dnd-multi-backend':
      return require('react-dnd-multi-backend');
    case 'react-dnd-touch-backend':
      return require('react-dnd-touch-backend');
    case 'react-dropzone':
      return require('react-dropzone');
    case 'react-error-boundary':
      return require('react-error-boundary');
    case 'react-helmet':
      return require('react-helmet');
    case 'react-i18next':
      return require('react-i18next');
    case 'react-intersection-observer':
      return require('react-intersection-observer');
    case 'react-mosaic-component':
      return require('react-mosaic-component');
    case 'react-query':
      return require('react-query');
    case 'react-router-config':
      return require('react-router-config');
    case 'react-router-dom':
      return require('react-router-dom');
    case 'react-stack-grid':
      return require('react-stack-grid');
    case 'react-timeago':
      return require('react-timeago');
    case 'react-tooltip':
      return require('react-tooltip');
    case 'styled-components':
      return require('styled-components');
    default:
      return undefined;
  }
}
