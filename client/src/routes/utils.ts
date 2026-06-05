import { useMemo } from 'react';
import queryString, { StringifiableRecord } from 'query-string';
import {
  matchRoutes as matchRoutesRRD,
  useLocation,
  useParams,
} from 'react-router-dom';

import { VIEWS, VIEW_PATH_PAIRS, getPath } from './paths';
import { View } from './types';

export const matchViews = (investigatedView: View, referenceView: View) => {
  const investigatedPath = getPath({ view: investigatedView });
  const referencePath = getPath({ view: referenceView });

  const routes = [{ path: referencePath, children: [{ path: '*' }] }];
  const match = matchRoutesRRD(routes, { pathname: investigatedPath });

  return !!match;
};

export const matchRoutes = (pathTemplate: string, path: string) => {
  return matchRoutesRRD([{ path: pathTemplate }], { pathname: path });
};

export const useCurrentView = () => {
  const { pathname, search } = useLocation();
  const params = useParams();

  const result = useMemo(() => {
    let currentView: View = VIEWS.NOT_FOUND;
    const index = VIEW_PATH_PAIRS.findIndex(({ path }) => {
      const routes = matchRoutes(path, pathname);
      return !!routes?.length && !!routes[0].pathname;
    });
    
    if (index !== -1) {
      currentView = VIEW_PATH_PAIRS[index].view;
    }
    
    const rawQueryParams = search
      ? (queryString.parse(search) as { [x: string]: string })
      : undefined;

    return {
      currentView,
      params,
      queryParams: rawQueryParams as StringifiableRecord | undefined,
    };
  }, [pathname, search, params]);

  return result;
};
