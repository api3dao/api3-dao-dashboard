const webpack = require('webpack');

module.exports = {
  webpack(config, env) {
    if (env === 'production') {
      // Webpack produces a single JS bundle with the default configuration that react-scripts v5 provides,
      // so we specify this optimization to get 2 bundles (like in react-scripts v4).
      // See: https://github.com/facebook/create-react-app/discussions/11278#discussioncomment-1808511
      config.optimization.splitChunks = { chunks: 'all' };
    }

    // See: https://www.alchemy.com/blog/how-to-polyfill-node-core-modules-in-webpack-5
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

    config.ignoreWarnings = [
      // Ignore warnings raised by source-map-loader for third party packages.
      // See: https://github.com/facebook/create-react-app/pull/11752#issuecomment-1137238078
      /**
       *
       * @param {import('webpack').WebpackError} warning
       * @returns {boolean}
       */
      function ignoreSourceMapLoaderWarnings(warning) {
        return (
          warning.module &&
          warning.module.resource.includes('node_modules') &&
          warning.details &&
          warning.details.includes('source-map-loader')
        );
      },
    ];

    return config;
  },

  jest(config) {
    config.transformIgnorePatterns = [
      '/node_modules/(?!wagmi|@wagmi).+\\.(js|jsx|mjs|cjs|ts|tsx)$',
      '^.+\\.module\\.(css|sass|scss)$',
    ];
    return config;
  },
};
