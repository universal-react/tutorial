# React SSR step-by-step

Step by step to implement server-side rendering in React.
## What's the best isomorphism-react scaffold in my mind?

-  Smooth debugging - I hope to debug anywhere and in any environment
-  On-demand loading - Implement code splitting
-  Version control - The project's bundle and release should generate the correct version number
-  Configurable - Optional programming methods (sass, less, js, jsx, ts, tsx, coffee) - same as yeoman prompt
-  Fast publishing - Optimize packaging speed - webpack optimize
-  Lower learning curve - It should only differ slightly from the projects I work on, or have comprehensive tutorials to guide me
-  Updates, more stability - I don't want to use older modules, nor do I want to use newer modules
-  Testable

## Preliminary research

-  https://github.com/glenjamin/ultimate-hot-reloading-example/ is a relatively good example, but it does not include *react-router v4* and code splitting.
-  https://github.com/justinjung04/universal-boilerplate handles CSS by ignoring it during server-side rendering in the development environment.
-  https://github.com/faceyspacey/react-universal-component is quite well-developed and has a high level of integration, but the code is too invasive and requires a series of compilation tools.

-  The design of react router v4 has significant changes compared to v3. I researched [React Router v4 nearly ruined my life](https://zhuanlan.zhihu.com/p/27433116), [React Router v4 and code splitting: from giving up to getting started](http://www.wukai.me/2017/09/25/react-router-v4-code-splitting/), and also looked at the [v4 onEnter and onChange hooks](https://github.com/ReactTraining/react-router/issues/3854) issue. Later, I watched [React Router v4 with Michael Jackson and Ryan Florence - Modern Web](https://www.youtube.com/watch?v=Vur2dAFZ4GE) to learn about the design philosophy. My conclusion is that I have a very poor impression of the react router team but have no choice.
Moreover, looking at the v4 documentation, the section on [Code-splitting + server rendering](https://reacttraining.com/react-router/web/guides/code-splitting/code-splitting-server-rendering) surprisingly states that they tried several times and gave up?! orz... 

https://medium.com/airbnb-engineering/server-rendering-code-splitting-and-lazy-loading-with-react-router-v4-bfe596a6af70

## How to use

> $ yarn && npm run build

Then use *Visual studio code* to debug isomorphic react.

![debugtool](./docs/images/debug.png)

## Expectation


Implement server-side rendering for React, while supporting additional extensions, including react-router, redux, css-module, and react-addons-*.

## First Step

Before implementing server-side rendering, we need to first create a simple display process for a React component.

This step includes the basic display of a React component while using webpack-dev-server as the server.

```js
//container.jsx
import React, { Component } from 'react';

export class Hello extends Component {
  render() {
    return (
      <div>
        Hello world
      </div>
    )
  }
}

export default Hello;
```

```js
// render.js
import ReactDOM from 'react-dom';
import React from 'react';

import Home from './container/home/container';

ReactDOM.render(<Home />, document.getElementById('app'));
```

```js
//webpack.config.js
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

const config = {
  entry: path.resolve(__dirname, '../src/render.js'),
  output: {
    path: path.resolve(__dirname, '../statics'),
    filename: 'bundle.js',
    publicPath: '/',
  },
  resolve: {
    extensions: ['.js','.jsx']
  },
  module: {
    rules: [{
      test: /jsx?/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['es2015', 'react'],
          plugins: [['transform-runtime']]
        }
      },
      exclude: /node_modules/,
    }]
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.join(__dirname, './tmpl.html'),
      inject: true,
    })
  ],
  devServer: {
    port: 8388,
  }
};

module.exports = config;
```

> webpack-dev-server --config webpack/webpack.config.js --port 8388 --inline

## Step 2 - Simpe server side render


Server-side rendering essentially involves rendering components written in ES6 syntax as strings on the server using React. In this process, we first need to implement the use of ES6 syntax on the server.

We can use `babel-node` to enable the use of the ES6 module system on the server. We use Visual Studio Code for debugging:

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Launch via Babel",
      "program": "${workspaceRoot}/server/server.js",
      "runtimeExecutable": "${workspaceRoot}/node_modules/.bin/babel-node",
      "cwd": "${workspaceRoot}"
    }
  ]
}
```

Then we will implement the simplest SSR. We can use the `renderToString` method provided by `react-dom/server` to convert the React components we wrote using *ES6* syntax into a string.

```js
import http from 'http';
import path from 'path';
import React from 'react';
import { renderToString } from 'react-dom/server';
import Home from '../src/container/home/index.js';

const PORT = 8388;

const serve = http.createServer((req, res) => {
  const dom = renderToString(<Home />);
  res.end(dom);
});

serve.listen(PORT, () => {
  console.log(`server start on port ${PORT}`);
});

export default serve;
```
Execute script:
> node server/server.js

This is an implementation of server-side rendering, but this is far from enough. We also need to implement routing, data storage, and data request functionalities.

Before this, we can also conduct a small test to see whether server-side rendering is faster or client-side rendering is faster. We can use `window.performance.now()` or `console.time()` for the test. To standardize the method, we will use `console.time` here. We will render 10,000 divs in the *Hello* component for the experiment.
```js

export class Hello extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    console.time('mount');
  }

  componentDidMount(){
    console.timeEnd('mount');
  }

  render() {
    return (
      <div>
        Hello world
        {Object.keys(Array.from({ length: 10000 }))
          .map((i,index) => <div key={index}>{index}</div>)}
      </div>
    )
  }
}·
```

Similarly, let's modify the server-side code as well:

```js
// server.js
...
const serve = http.createServer((req, res) => {
  console.time('mount');
  const dom = renderToString(<Home />);
  console.timeEnd('mount');
  res.end(dom);
});
...
```

Using webpack-dev-server and `node server/server.js` to run our React code, we can see that the browser rendering takes about `mount: 303.55322265625ms`, while the server-side call to `renderToString` only takes `mount: 172.4598450064659ms`. It is evident that server-side rendering is indeed much faster.

## Step 3 - Add react router

We are now adding *react-router* to our code. We are using the latest version 4. Since there is a significant difference between version 4 and version 2, we will take this opportunity to learn about the new API.

We designed the simplest routing structure:

  - / -> `<Root />`
    - /home -> `<Home />`
    - /profile -> `<Profile />`

```js
// routes.js

import AppRoot from './container/root';
import Home from './container/home';
import Profile from './container/profile';

const routes = [
  {
    path: '/',
    exact: true,
    component: AppRoot
  },
  {
    path: '/home',
    component: Home
  },
  {
    path: '/profile',
    component: Profile
  }
];

export default routes;
```

For server-side code, we handle all requests with `Content-Type: text/html` using `react-dom/server`. In fact, when we render `<Router>`, we pass the user's current URL to `react-router`, which loads and renders different components.

```js
// server.js

import http from 'http';
import path from 'path';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { renderRoutes } from 'react-router-config';
import { StaticRouter } from 'react-router-dom';
import routers from '../src/routers';

const PORT = 8388;

const serve = http.createServer((req, res) => {
  const context = {};
  const content = renderToString(
    <StaticRouter location={req.url} context={context}>
      {renderRoutes(routers)}
    </StaticRouter>
  );
  res.end(content);
});

serve.listen(PORT, () => {
  console.log(`server start on port ${PORT}`);
});

export default serve;
```
## Step 4 - Add CSS

In this step, we need to handle CSS. In fact, we can treat CSS as ordinary text processing. We can write all styles in one file and then insert it into the `<head>` tag when loading the webpage. However, we usually do not write everything in one file; each component may have its own CSS, and we write a CSS entry file to import them using `@import`. We might also choose to use the `css-loader` provided by Webpack to automatically bundle all CSS files into one file, or use tools or technologies like CSS Modules, PostCSS, or SCSS. Therefore, handling CSS is also a challenge in React SSR.

We will write components using the CSS Modules technique. By directly using `import style from '*.[css/scss/less]'` at the top of the component file, we can achieve this. However, the server-side cannot directly import CSS files. Here, we use [babel-plugin-css-modules-transform](https://github.com/michalkvasnicak/babel-plugin-css-modules-transform) to implement CSS import while also enabling CSS Modules. This plugin can compile `.red { color: red }` into the format `Object {red: "home__red___1x-zZ"}` within the file and generate a CSS file in a specified directory. What we need to do is to write the components normally, then find the style files of the currently rendered components on the server, and add them to the page, which can be done using embedded CSS or linked CSS. We can mount a static property on the component to locate the specific style file.

### .babelrc

```json
{
  "plugins": [
    ["css-modules-transform", {
      "extensions": [
        ".css"
      ],
      "extractCss": {
        "dir": "./dist/css/",
        "filename": "[name].css",
        "generateScopedName": "[name]__[local]___[hash:base64:5]"
      }
    }]
  ]
}
```

### Rewrite `<Home>` Component

```js
// src/container/home/container.js
import React, { Component } from 'react';
import styles from './home.css';

export class Hello extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    var global,window;
    console.log(styles)
  }
  render() {
    return (
      <div className={styles.red}>
        Hello world
        {Object.keys(Array.from({ length: 10000 })).map((i,index) => <div key={index}>{index}</div>)}
      </div>
    )
  }
}

// Obtain the specified CSS file on the server side by accessing this property of the component.
Hello.getCssFile = 'home';

export default Hello;
```

```js
// server.js

import http from 'http';
import path from 'path';
import React from 'react';
import fs from 'fs';
import st from 'st';
import { renderToString } from 'react-dom/server';
import { renderRoutes } from 'react-router-config';
import { StaticRouter } from 'react-router-dom';
import routers from '../src/routers';

import { tmpl } from './utils/tmpl';

const ROOTPATH = path.resolve('./');
const PORT = 8388;

const staticsService = st({ url: '/statics', path: path.join(ROOTPATH, 'dist') })

const serve = http.createServer((req, res) => {
  const stHandled = staticsService(req, res);
  if (stHandled) return;
  const context = {};
  const currentRouter = routers.find(c => c.path === req.url);
  if (currentRouter) {
    let cssContext = '';
    const currentComponent =  currentRouter.component;
    const content = renderToString(
      <StaticRouter location={req.url} context={context}>
        {renderRoutes(routers)}
      </StaticRouter>
    );
    res.end(tmpl({
      header: currentComponent.getCssFile ? `<link rel="stylesheet" href="/statics/css/${currentComponent.getCssFile}.css" >` : '',
      content,
    }));
  } else {
    res.statusCode = 404;
    res.end('404');
  }
});


serve.listen(PORT, () => {
  console.log(`server start on port ${PORT}`);
});

export default serve;
```

At this point, we have achieved the functionality of using CSS modules on the server side. `babel-plugins-css-modules-transform` can also be combined with preprocessors or PostCSS, which can be easily handled by referring to the documentation.

## Step 5 - InitialData?

"We usually make AJAX requests to initialize the component's state in the `componentDidMount` method, but the `componentDidMount` method does not execute on the server side, so we need to use other ways to initialize the component's state."

### Unused Redux

If you don't use Redux, the usual approach is similar to obtaining the component's styles: bind a static method on the component and call it during the server render process. When combined with *react-router* v4, there isn't currently an optimal method. The official example attaches a `loadData` method when declaring routes, which is then called during server matching. This method is similar in concept to declaring a static method on the component. Here, we will implement the method it describes.
 

### Rewrite `<Home />`

We need to add a static method getInitialState to the Home component, which will simulate a call on the server side. There is a problem here: the client side uses xhr requests, so we need to simulate xhr requests on the server side. Here, I use the `xhr-request` module to achieve this.

```jsx
// container/home/container.js
import request from 'xhr-request';

export class Home extends Component {
  ...
  
  componentWillMount() {
    var global,window;
    console.log(styles)
    if (window) {
      this.t =  window.performance.now();
    }
    if (this.props.staticContext) { // https://reacttraining.com/react-router/web/api/StaticRouter/context-object 被react-router包裹的组件会从上层获得 staticContext 属性
      this.setState({
        list: this.props.staticContext.list,
      });
    }
  }

  render() {
    const userListDOM = this.state.list.map((v,i) => <p key={i}>name: {v.name}</p>);
    return (
      <div className={styles.red}>
        Hello world
        <div>
          {userListDOM}
        </div>
        {Object.keys(Array.from({ length: 10000 })).map((i,index) => <div key={index}>{index}</div>)}
      </div>
    )
  }

}


// ...
Home.getInitialData = function () {
  return new Promise((resolve, reject) => {
    request('http://localhost:8388/user/list', {
      json: true,
      method: 'post',
    }, function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    })
  });
};
```

Server implementation of the `/user/list` interface:

```js
// server/api/user.js
function userList(req, res) {
  if (req.url !== '/user/list') {
    res.writeHead(502);
    res.end();
    return false;
  } else {
    let body = '';
    req.on('data', data => body += data);
    req.on('end', () => {
      try {
        const obj = JSON.parse(body);
      } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ list: [{  name: 'bob' }, { name: 'John' }] }))
      }
    });
  }
}

export { userList };
```

Then, modify the entry file of the server side:

```js
import { userList } from './api/user';

// server.js
const serve = http.createServer((req, res) => {
  const stHandled = staticsService(req, res);
  if (stHandled) return;
  if (req.url === '/user/list') { // 这里先简单判断一下url
    userList(req,res);
  } else {
    const currentRouter = routers.find(c => c.path === req.url);
    if (currentRouter) {
      let cssContext = '';
      const currentComponent = currentRouter.component;
      // get data
      const promises = [];
      
      routers.some(route => {
        const match = matchPath(req.url, route)
        if (match)
          promises.push(route.loadData(match))
        return match
      });

      if (promises.length) {
        Promise.all(promises).then(data => {
          console.log(data);
          render(data[0]);
        });
      } else {
        render();
      }

      function render(data = {}) {
        // render component
        const content = renderToString(
          <StaticRouter location={req.url} context={data}>
            {renderRoutes(routers)}
          </StaticRouter>
        );
  
        // send
        res.end(tmpl({
          header: currentComponent.getCssFile ? `<link rel="stylesheet" href="/statics/css/${currentComponent.getCssFile}.css" >` : '',
          content,
        }));
      }

    } else {
      res.statusCode = 404;
      res.end('404');
    }
  }
});
```

Start debugging, and we can see that we can already obtain data from the server side and use it within the component.

### Use redux

If using Redux, it is largely the same. We need to refactor both the component and the server-side code.

### Components

We first need to place the component's state into the Redux store and use the `connect` method provided by `react-redux` to correctly associate the store and the component. Then, we encapsulate the `getInitialData` method as an action to be called during server-side rendering.

For simplicity, the code that tests render speed has been removed. Additionally, `<Home />` has been modified to a stateless component.

**PS:** In fact, we have always been striving for the server-side call to `renderToString`. This is solely to ensure the correct rendering of the initial screen's **DOM** on the server side. This process does not include the initialization of Redux on the client side or event binding. Here, we also wrote a simple example of a toggle button that controls the visibility of a div. In reality, it does not bind events during server-side rendering.

```jsx
// ...

const Home = (props) =>  {
  const { list, blankVisible } = props;
  const userListDOM = list.map((v, i) => <p key={i}>name: {v.name}</p>);
  return (
    <div className={styles.red}>
      Hello world
        <div>
        {userListDOM}
      </div>
      /** onClick 并不起作用 **/
      <button onClick={() => toogleBlankVisible()}>toggle blank</button> 
      {blankVisible ?
        <div className={styles.blank}>blank</div>
        : null}
    </div>
  );
};

Home.getCssFile = 'home';

/**
 * "This method is called on the server side, with the passed dispatch being store.dispatch. It also returns a Promise to facilitate initial data handling on the server."
 * ${dispatch} function store.dispatch 
 * return Promise<any>
 */
Home.getInitialData = function (dispatch) {
  return dispatch(getUserList());
}

const mapState2Props = store => {
  return {...store.home};
}

const mapDispatch2Props = dispatch => {
  return {
    getUserList,
    toogleBlankVisible,
  }
}

export default connect(mapState2Props)(Home);
```

```js
// action.js
import request from 'xhr-request';
import THROW_ERR from '../../components/error/action';

export const TOOGLE_BLANK_VISIBLE = 'TOOGLE_BLANK_VISIBLE';

export const UPDATE_USER_LIST = 'UPDATE_USER_LIST';

export const toogleBlankVisible = () => (dispatch, getState) => {
  const blankVisible = getState().home;

  dispatch({
    type: TOOGLE_BLANK_VISIBLE,
    payload: !blankVisible
  });
}

/**
 * return Promise
 * https://stackoverflow.com/questions/36189448/want-to-do-dispatch-then
 */
export const getUserList = () => (dispath, getState) => {
  return new Promise((resolve, reject) => {
    request('http://localhost:8388/user/list', {
      json: true,
      method: 'post',
    }, function (err, data) {
      if (err) {
        dispath({
          type: THROW_ERR,
          payload: err,
        });
        reject(err);
      } else {
        dispath({
          type: UPDATE_USER_LIST,
          payload: data.list,
        });
        resolve(data);
      }
    });
  })
}
```

```js
// src/home/reducer.js
import { UPDATE_USER_LIST, TOOGLE_BLANK_VISIBLE } from './action';
const initialState = {
  list: [],
  blankVisible: true,
};

export default (state = initialState, action) =>  {
  switch (action.type) {
    case UPDATE_USER_LIST:
      return {
        ...state,
        list: action.payload,
      };
      break;
    case TOOGLE_BLANK_VISIBLE:
      return {
        ...state,
        blankVisible: payload,
      };
      break;
    default:
      return state;
      break;
  }
};
```

Then, on the server side, after matching the correct component, we need to obtain the `getInitialData` method from all components and place it in a queue. The completion of all requests also means that all components' `getInitialData` have been called, triggering the correct actions and updating the data in the store. At this point, we can use the renderToString method to render the correct DOM.

```js
import http from 'http';
import path from 'path';
import React from 'react';
import fs from 'fs';
import st from 'st';
import { renderToString } from 'react-dom/server';
import { renderRoutes, matchRoutes } from 'react-router-config';
import { Provider } from 'react-redux';
import { StaticRouter, matchPath } from 'react-router-dom';

import routers from '../src/routers';
import initialStore from '../src/store';

import { tmpl } from './utils/tmpl';

import { userList } from './api/user';

const ROOTPATH = path.resolve('./');
const PORT = 8388;

const store = initialStore();

const staticsService = st({ url: '/statics', path: path.join(ROOTPATH, 'dist') })

const serve = http.createServer((req, res) => {
  const stHandled = staticsService(req, res);
  if (stHandled) return;
  if (req.url === '/user/list') {
    userList(req,res);
  } else {
    const { dispatch } = store;
    const branch = matchRoutes(routers, req.url); // Find the correct component (which may include parent components)
    const styleList = []; // Find all style files.
    const promiseList = branch.map(({ route }) => { // create promise list
      const { component } = route;
      if (component.getCssFile) {
        styleList.push(`<link rel="stylesheet" href="/statics/css/${component.getCssFile}.css" >`);
      }
      return route.component.getInitialData ? route.component.getInitialData(dispatch) : Promise.resolve();
    });

    Promise.all(promiseList).then(v => { // Waiting for initialization data to complete
      console.log(store.getState()); // The store has been updated.
      const content = renderToString(
        <Provider store={store}>
          <StaticRouter location={req.url} context={{}}>
            {renderRoutes(routers)}
          </StaticRouter>
        </Provider>
      );
      res.end(
        tmpl({
          title: '',
          header: styleList.join('\n'),
          content,
          initialState: store.getState(), // Used to initialize the store tree for the client
        })
      )
    });
  }
});

serve.listen(PORT, () => {
  console.log(`server start on port ${PORT}`);
});

export default serve;
```

Restart the server, and you can see that the server side has correctly rendered our components.

## Step 6 - Event & Redux init

In this step, we need to initialize the event binding in React. We only need to include the webpack bundled JS file in the page

## TODO

- customer react component
- css chunk plugin
- css-loader

# Future

- [x] Include redux
- [x] Include css module
- [x] ~~Visual Studio Code use nodemon~~ use chokidar
- [ ] Production useful
- [ ] require.ensure
- [ ] Code Splitting
- [ ] Optmize webpack config
