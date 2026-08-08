/**
 * Metro, configured for a pnpm monorepo.
 *
 * This is the single most common reason an Expo app inside a workspace fails to
 * start. Three things have to be true:
 *
 *  1. Metro watches the workspace root, or edits to packages/* never trigger a
 *     rebuild.
 *  2. It resolves from both node_modules folders, because pnpm hoists shared
 *     dependencies to the root and keeps package-local ones nested.
 *  3. Hierarchical lookup is off, so Metro cannot silently walk up and pick a
 *     second copy of React — which produces the "Invalid hook call" error that
 *     looks like a bug in your components and is not.
 *
 * The `extensionAlias` entry mirrors next.config.ts: our workspace packages are
 * ESM TypeScript whose relative imports carry `.js` extensions, and bundlers do
 * not make that mapping on their own.
 */
const { getDefaultConfig } = require('expo/metro-config');
const path = require('node:path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

config.resolver.disableHierarchicalLookup = true;

config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs', 'cjs'];

config.resolver.extensionAlias = {
  ...config.resolver.extensionAlias,
  '.js': ['.ts', '.tsx', '.js'],
};

module.exports = config;
