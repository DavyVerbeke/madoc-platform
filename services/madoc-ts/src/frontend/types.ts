import React from 'react';
import { ApiClient } from '../gateway/api';

export type UniversalRoute = {
  path: string;
  exact?: boolean;
  component: QueryComponent;
  routes?: UniversalRoute[];
};

export type UniversalComponent<
  Definition extends {
    data?: any;
    query?: any;
    params?: any;
    variables?: any;
    context?: any;
  }
> = React.FC<{ route?: UniversalRoute }> & {
  getData?: (
    key: string,
    vars: Definition['variables'],
    api: ApiClient,
    pathname: string
  ) => Promise<Definition['data']>;
  getKey?: (
    params: Definition['params'],
    query: Definition['query'],
    pathname: string
  ) => [string, Definition['variables']];
};

export type QueryComponent<Data = any, TKey = any, TVariables = any, Params = any, Query = any> = React.FC<any> & {
  getKey?: (params: Params, query: Query, pathname: string) => [TKey, TVariables];
  getData?: (key: TKey, vars: TVariables, api: ApiClient, pathname: string) => Promise<Data>;
};
