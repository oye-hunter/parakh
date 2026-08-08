import type { NextConfig } from 'next';

/**
 * The workspace packages are pure ESM TypeScript with no build step, so their
 * relative imports carry explicit `.js` extensions — which is what Node and tsx
 * require. Bundlers do not make that mapping on their own, so both resolvers
 * need to be told that `./schema.js` may mean `./schema.ts`.
 */
const extensionAlias = {
  '.js': ['.ts', '.tsx', '.js'],
  '.mjs': ['.mts', '.mjs'],
};

const config: NextConfig = {
  // Raw TypeScript in, so Next has to transpile it itself.
  transpilePackages: ['@parakh/core', '@parakh/db'],

  turbopack: {
    resolveAlias: {},
    resolveExtensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.json'],
  },

  webpack: (cfg) => {
    cfg.resolve.extensionAlias = { ...cfg.resolve.extensionAlias, ...extensionAlias };
    return cfg;
  },
};

export default config;
