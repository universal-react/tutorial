const fs = require('fs');
const path = require('path');

/**
 * transfer stats to json
 * @param {object} options.path generate file path
 * finally the webpack-stats.json should like this: { statsJson: WEBPACK_STATS_OBJ }
 */
function WebpackGenStatsPlugin(options) {
  this.options = Object.assign({}, options, { path: '' }) ;
}

WebpackGenStatsPlugin.prototype.apply = function (compiler) {
  compiler.plugin('done', stats => {
    const statsJson = stats.toJson();
    const statsStr = JSON.stringify({ statsJson });
    const fileName = 'webpack-stats.json';
    const filePath = this.options.path ? path.join(this.options.path, fileName) : path.join(stats.compilation.outputOptions.path, fileName);
    fs.writeFile(filePath, statsStr, (err) => {
      if (err) {
        process.exit(1);
      }
    });
  });
}

module.exports = WebpackGenStatsPlugin;