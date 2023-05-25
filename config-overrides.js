/* eslint-disable no-console */
const webpack = require('webpack');
const { isEqual } = require('lodash');

module.exports = {
  webpack(config, env) {
    if (env === 'production') {
      // Webpack produces a single JS bundle with the default configuration (for the initial non-async chunk),
      // so we specify "chunks: all" and provide a cache group to generate more bundles
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          // The "(?<!node_modules.*)" regex ignores nested copies of packages, so that they're bundled with their issuer.
          // See: https://github.com/vercel/next.js/pull/9012
          framework: {
            name: 'framework',
            test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|use-subscription|styled-components)[\\/]/,
          },
          coreWeb3: {
            name: 'core-web3',
            test: /(?<!node_modules.*)[\\/]node_modules[\\/](@ethersproject|bn\.js|aes-js)[\\/]/,
          },
        },
      };
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
      // The @web3modal/react package spawns too many async chunks, so we limit the total amount of chunks
      new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: 5,
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
    const defaultIgnorePatterns = [
      '[/\\\\]node_modules[/\\\\].+\\.(js|jsx|mjs|cjs|ts|tsx)$',
      '^.+\\.module\\.(css|sass|scss)$',
    ];
    if (!isEqual(defaultIgnorePatterns, config.transformIgnorePatterns)) {
      console.warn('\n******************************************************************');
      console.warn('WARNING: The default Jest transformIgnorePatterns have changed to:');
      console.warn(config.transformIgnorePatterns);
      console.warn('Please make sure the current override still makes sense.');
      console.warn('******************************************************************\n');
    }

    config.transformIgnorePatterns = [
      // The wagmi package ships with untranspiled import statements, so we tell Jest not to ignore them
      '/node_modules/(?!wagmi|@wagmi).+\\.(js|jsx|mjs|cjs|ts|tsx)$',
      defaultIgnorePatterns[1],
    ];

    return config;
  },
};
