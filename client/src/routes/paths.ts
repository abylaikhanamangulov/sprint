import queryString, { StringifiableRecord } from 'query-string';
import { isEmpty } from 'underscore';

import { MAPPING, defaultAccess } from './consts';
import { View, ViewAccessMapping, ViewRouteMapping } from './types';
import { PathParams, QueryParams } from './types';

export const VIEW_KEYS = Object.keys(MAPPING) as View[];

export const getRawPath = (view: View) =>
  MAPPING[view] ? MAPPING[view].path : '';

export const injectPathParams = (
  route: string,
  params: StringifiableRecord
) => {
  let newRoute = route;
  if (params['*']) {
    delete params['*'];
  }
  Object.keys(params).forEach(function (key) {
    const regex = new RegExp(`:${key}`, 'g');
    newRoute = newRoute.replace(regex, params[key] as string);
  });
  return newRoute;
};

export const getPath = ({
  view,
  params = {},
  queryParams,
}: {
  view: View;
  params?: PathParams;
  queryParams?: QueryParams;
}): string => {
  const pathRaw = MAPPING[view] ? MAPPING[view].path : '';

  const pathWithParams = !isEmpty(params)
    ? injectPathParams(pathRaw, params)
    : pathRaw;

  const pathWithSearch =
    queryParams && !isEmpty(queryParams)
      ? queryString.stringifyUrl({ url: pathWithParams, query: queryParams })
      : pathWithParams;

  return pathWithSearch;
};

export const getAccess = (view: View) =>
  MAPPING[view] ? MAPPING[view].access : defaultAccess;

export const VIEWS = VIEW_KEYS.reduce(
  (acc, currentView) => ({
    ...acc,
    [currentView]: currentView,
  }),
  {}
) as {
  [key in View]: key;
};

export const PATHS = VIEW_KEYS.map((key) => ({
  [key]: getRawPath(key),
})).reduce(
  (obj, item) => ({
    ...obj,
    [Object.keys(item)[0]]: item[Object.keys(item)[0]],
  }),
  {}
) as ViewRouteMapping;

export const ACCESSES = VIEW_KEYS.map((key) => ({
  [key]: getAccess(key),
})).reduce(
  (obj, item) => ({
    ...obj,
    [Object.keys(item)[0]]: item[Object.keys(item)[0]],
  }),
  {}
) as ViewAccessMapping;

export const VIEW_PATH_PAIRS = VIEW_KEYS.map((key) => ({
  view: key,
  path: getRawPath(key),
}));
