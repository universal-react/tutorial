const setHook = () => {
  if (process.env.NODE_ENV !== 'production') {
    const hook = require('css-modules-require-hook');
    hook({
      generateScopedName: '[name]-[local]-[hash:base64:5]',
      extensition: ['.scss'],
    });
    require('asset-require-hook')({
      extensions: ['jpg', 'png'],
      name: '[path][name].[ext]',
      // ${cwd}/src/client/assets/images/pig.jpg
      publicPath: result => {
        const cwd = process.cwd();
        const publicPath = result.replace(cwd, '/statics'); // TODO get publicPath above
        return publicPath;
      }
    });
    require('raw-module-require-hook')({
      extensions: ['html', 'txt']
    });
  }
};

module.exports = setHook;
