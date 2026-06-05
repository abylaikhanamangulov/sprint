import { StringifiableRecord } from 'query-string';
import { MAPPING } from './consts';

export type View = keyof typeof MAPPING;

export interface Path {
  path: string;
  access: string[];
}

export type ViewRouteMapping = {
  [key in View]: string;
};

export type ViewAccessMapping = {
  [key in View]: string[];
};

export type PathParams = StringifiableRecord;

export type QueryParams = StringifiableRecord;

export interface RouteData {
  view: View;
  render?: (props: RenderRoutesInnerProps) => JSX.Element;
  component?: JSX.Element;
  routes?: RouteData[];
}

export interface RenderRoutesInnerProps {
  routes: RouteData[];
  parentPathLength: number;
}
