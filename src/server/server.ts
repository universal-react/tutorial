require('./utils/hook')();

import chalk from 'chalk';
import chokidar from 'chokidar';
import express from 'express';
import http from 'http';
import path from 'path';

// express middleware
import bodyParser from 'body-parser';
import favicon from 'serve-favicon';

// webpack required
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

import ssr from './middleware/ssr';

import config from './config';

const app = express();
const { PORT, DEV } = config;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('*', (req, res, next) => {
  console.log(req.originalUrl);
  next();
});

app.use('/user', (req, res, next) => {
  require('./routes/user')(req, res, next);
});

app.use(favicon(path.join(__dirname, '../../favicon.ico')));

if (DEV) {
  const webpackDevConfig = require('../../webpack/webpack.dev');
  let clientStats: any = null;
  const compile = webpack(webpackDevConfig);

  // use webpack in dev enviroment
  app.use(webpackDevMiddleware(compile, {
    publicPath: webpackDevConfig.output.publicPath,
    serverSideRender: true,
  }));
  app.use(webpackHotMiddleware(compile));

  // Do "hot-reloading" on the server
  // Throw away cached modules and re-require next time
  // Ensure there's no important state in there!
  const watcher = chokidar.watch(path.join(process.cwd(), 'src'));

  watcher.on('ready', () => {
    watcher.on('all', (e, p) => {
      if (require.cache[p]) {
        // tslint:disable-next-line:no-console
        console.log(`[chokidar] clearing ${path.relative(process.cwd(), p)} cache`);
        delete require.cache[p];
      }
    });
  });

  compile.plugin('done', stats => {
    clientStats = stats.toJson();
    Object.keys(require.cache).forEach(id => {
      if (/src[\\|\/]client/.test(id)) {
        // tslint:disable-next-line:no-console
        console.log(`[chokidar] clearing ${path.relative(process.cwd(), id)} cache`);
        delete require.cache[id];
      }
    });
  });

  // app.get('*', (req, res, next) => {
  //   if (!clientStats) {
  //     res.send('please wait webpack done...');
  //     return;
  //   }
  //   require('./utils/render').default(clientStats)(req, res, next);
  // });
  app.use(ssr(clientStats));

  app.use('/src', express.static(path.join(process.cwd(), 'src')));
} else {
  const webpackProdConfig = require('../../webpack/webpack.prod');
  const stats = require(require.resolve(`${webpackProdConfig.output.path}/webpack-stats.json`));

  app.use('/statics', express.static(path.join(process.cwd(), 'dist/statics')));
  app.use(ssr(stats));

  // app.get('*', (req, res, next) => {
  //   require('./utils/render').default(stats)(req, res, next);
  // });
}

const serve = http.createServer(app);

serve.listen(PORT, () => {
  // tslint:disable no-console
  console.log(chalk.green(`server start on http://localhost:${PORT}`));
});

export default serve;
