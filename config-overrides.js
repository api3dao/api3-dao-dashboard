// See: https://www.alchemy.com/blog/how-to-polyfill-node-core-modules-in-webpack-5
const webpack = require('webpack');

module.exports = function override(config, webpackEnv) {
  if (webpackEnv === 'production') {
    config.optimization.splitChunks = { chunks: 'all' };
  }

  config.resolve.fallback = {
    ...config.resolve.fallback,
    http: require.resolve('stream-http'),
    https: require.resolve('https-browserify'),
    os: require.resolve('os-browserify'),
    stream: require.resolve('stream-browserify'),
  };

  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
  ]);

  // See: https://github.com/facebook/create-react-app/pull/11752#issuecomment-1137238078
  config.ignoreWarnings = [
    // Ignore warnings raised by source-map-loader. Some third party packages may ship miss-configured sourcemaps,
    // that interrupts the build. See: https://github.com/facebook/create-react-app/discussions/11278#discussioncomment-1780169
    /**
     *
     * @param {import('webpack').WebpackError} warning
     * @returns {boolean}
     */
    function ignoreSourcemapsloaderWarnings(warning) {
      return (
        warning.module &&
        warning.module.resource.includes('node_modules') &&
        warning.details &&
        warning.details.includes('source-map-loader')
      );
    },
  ];

  return config;
};
