module.exports = function(api) {
  return {
    plugins: [
      '@babel/plugin-proposal-class-properties',
      'transform-es2015-classes',
    ],
    presets: [
      '@babel/flow',
      [
        '@babel/preset-env',
        {
          targets: {
            node: 6,
            chrome: 59,
            edge: 13,
            firefox: 50,
          },
          forceAllTransforms: api.env("production"),
        },
      ]
    ],
    env: {
      test: {
        presets: [
          '@babel/preset-env',
        ],
        plugins: [
          '@babel/plugin-proposal-class-properties',
          'transform-es2015-classes',
        ],
      },
    },
  }
};
