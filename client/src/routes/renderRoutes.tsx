import { Fragment } from 'react';
import { Route, Routes } from 'react-router-dom';

import { getRawPath } from './paths';
import { RouteData } from './types';

const generateRoute = (data: RouteData, i: number) => {
  const { render, routes, component, view } = data;
  const path = getRawPath(view);

  const Wrapper = Fragment;

  if (render) {
    return (
      <Route
        key={i}
        element={
          <Wrapper>
            {render({ routes: routes || [], parentPathLength: 0 })}
          </Wrapper>
        }
      >
        {routes?.map((child, index) => generateRoute(child, index))}
      </Route>
    );
  }

  return (
    <Route
      key={i}
      path={path}
      element={<Wrapper>{component}</Wrapper>}
    />
  );
};

export const renderRoutes = (routes: RouteData[]) => {
  return (
    <Routes>
      {routes.map((route, index) => generateRoute(route, index))}
    </Routes>
  );
};
