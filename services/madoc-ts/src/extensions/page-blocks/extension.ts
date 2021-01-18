import { CaptureModel } from '@capture-models/types';
import React from 'react';
import ReactDOM from 'react-dom';
import { ApiClient } from '../../gateway/api';
import {
  CreateNormalPageRequest,
  CreateSlotRequest,
  EditorialContext,
  SiteBlock,
  SiteBlockRequest,
  SitePage,
  SiteSlot,
} from '../../types/schemas/site-page';
import { BaseExtension } from '../extension-manager';

export type PageBlockDefinition<
  Data extends any,
  Type extends string,
  Return,
  RequiredContext extends keyof EditorialContext = never
> = {
  label: string;
  type: string;
  renderType: Type;
  model: CaptureModel['document'];
  defaultData: Data;
  requiredContext?: RequiredContext[];
  render: (data: Data, context: EditorialContext, api: ApiClient) => Return;
};

export type ReactPageBlockDefinition<
  Data,
  RequiredContext extends keyof EditorialContext = never
> = PageBlockDefinition<Data, 'react', JSX.Element | null, RequiredContext>;
export type HTMLPageBlockDefinition<Data, RequiredContext extends keyof EditorialContext = never> = PageBlockDefinition<
  Data,
  'html',
  string,
  RequiredContext
>;

export class PageBlockExtension implements BaseExtension {
  api: ApiClient;
  definitionMap: {
    [type: string]: PageBlockDefinition<any, any, any, any>;
  };

  constructor(api: ApiClient, definitions: PageBlockDefinition<any, any, any, any>[]) {
    this.api = api;
    this.definitionMap = {};
    for (const definition of definitions) {
      this.definitionMap[definition.type] = definition;
    }
  }

  createBlankBlock(type: string): SiteBlockRequest {
    const definition = this.definitionMap[type];

    if (!definition) {
      throw new Error('Invalid block');
    }

    return {
      static_data: { ...definition.defaultData },
      type: definition.type,
      name: '',
      lazy: false,
    };
  }

  getDefinition(type: string) {
    return this.definitionMap[type];
  }

  getDefinitions(context: EditorialContext = {}) {
    const definitions = Object.values(this.definitionMap);
    const currentCtxKeys = Object.keys(context).filter((key: any) => {
      return !!(context as any)[key];
    });

    return definitions.filter(definition => {
      if (!definition.requiredContext) {
        return true;
      }
      for (const ctx of definition.requiredContext) {
        console.log(ctx, currentCtxKeys);
        if (currentCtxKeys.indexOf(ctx) === -1) {
          return false;
        }
      }
      return true;
    });
  }

  renderBlockToReact(block: SiteBlock | SiteBlockRequest, context: EditorialContext): JSX.Element | null {
    // @todo check required context.
    const definition = this.definitionMap[block.type];
    if (!definition) {
      return null;
    }

    if (definition.renderType === 'html') {
      return React.createElement('div', {
        dangerouslySetInnerHTML: { __html: definition.render(block.static_data, context, this.api) },
      });
    }

    if (definition.renderType === 'react') {
      return definition.render(block.static_data, context, this.api) as JSX.Element;
    }

    return null;
  }

  renderBlockToHTML(block: SiteBlock, context: EditorialContext) {
    const definition = this.definitionMap[block.type];
    if (!definition) {
      return null;
    }

    if (definition.renderType === 'html') {
      return definition.render(block.static_data, context, this.api) as string;
    }

    if (definition.renderType === 'react') {
      if (this.api.getIsServer()) {
        const reactDomServer = require('react-dom/server');
        return reactDomServer.renderToString(definition.render(block.static_data, context, this.api));
      } else {
        const tempElement = document.createElement('div');
        ReactDOM.render(definition.render(block.static_data, context, this.api), tempElement);
        return tempElement.innerHTML;
      }
    }

    return null;
  }

  async getPageNavigation(pagePath: string) {
    const slug = pagePath && pagePath !== '/' ? `/${pagePath}` : '';
    return this.api.request<{ navigation: SitePage[] }>(`/api/madoc/pages/navigation${slug}`);
  }

  async getPage(pagePath: string) {
    return this.api.request<SitePage>(`/api/madoc/pages/root/${pagePath}`);
  }

  async getSlot(slotId: number) {
    return this.api.request<SitePage>(`/api/madoc/slots/${slotId}`);
  }

  async getBlock(blockId: number) {
    return this.api.request<SitePage>(`/api/madoc/blocks/${blockId}`);
  }

  async getPublicPage(pagePath: string) {
    // @todo.
    throw new Error('Not implemented');
  }

  async createPage(page: CreateNormalPageRequest) {
    return this.api.request<SiteBlock>(`/api/madoc/pages/root/${page.path}`, {
      body: page,
      method: 'POST',
    });
  }

  async createSlot(slot: CreateSlotRequest) {
    return this.api.request<SiteBlock>(`/api/madoc/slots`, {
      body: slot,
      method: 'POST',
    });
  }

  async createBlock(block: SiteBlockRequest) {
    return this.api.request<SiteBlock>(`/api/madoc/blocks`, {
      body: block,
      method: 'POST',
    });
  }

  async updatePage(pagePath: number, page: CreateNormalPageRequest) {
    return this.api.request<SitePage>(`/api/madoc/pages/root/${pagePath}`, {
      body: page,
      method: 'PUT',
    });
  }

  async updateSlot(slotId: number, slot: CreateSlotRequest) {
    return this.api.request<SiteSlot>(`/api/madoc/slots/${slotId}`, {
      body: slot,
      method: 'PUT',
    });
  }

  async updateSlotStructure(slotId: number, blocks: number[]) {
    return this.api.request<{ blocks: number[] }>(`/api/madoc/slots/${slotId}/structure`, {
      body: { blocks },
      method: 'PUT',
    });
  }

  async updateBlock(blockId: number, block: SiteBlockRequest) {
    return this.api.request<SiteBlock>(`/api/madoc/blocks/${blockId}`, {
      body: block,
      method: 'PUT',
    });
  }
}
