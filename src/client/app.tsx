import React from 'react';
import { renderRoutes } from 'react-router-config';
import { BrowserRouter } from 'react-router-dom';

import routers from './routers';

import 'antd/dist/antd.less';

export default () => (
  <BrowserRouter>
    {renderRoutes(routers)}
  </BrowserRouter>
);
