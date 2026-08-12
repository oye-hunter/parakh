import type { NextConfig } from 'next';

const extensionAlias = {
  '.js': ['.ts', '.tsx', '.js'],
  '.mjs': ['.mts', '.mjs'],
};

const config: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },

  transpilePackages: ['@parakh/core', '@parakh/db'],

  turbopack: {
    resolveAlias: {
      './env.js': './env.ts',
      './schema.js': './schema.ts',
      './client.js': './client.ts',
      './types.js': './types.ts',
      './prompt.js': './prompt.ts',
      './risk.js': './risk.ts',
      './signals.js': './signals.ts',
      './agent.js': './agent.ts',
    },
    resolveExtensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.json'],
  },

  webpack: (cfg) => {
    cfg.resolve.extensionAlias = { ...cfg.resolve.extensionAlias, ...extensionAlias };
    return cfg;
  },
};

export default config;
