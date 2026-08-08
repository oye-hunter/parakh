/**
 * Metro config for this monorepo.
 *
 * Kept deliberately small. An earlier version carried the standard
 * pnpm-monorepo workarounds — `disableHierarchicalLookup: true` and a
 * hand-written `watchFolders` — but those exist for pnpm's *isolated*,
 * symlinked layout. This workspace uses `nodeLinker: hoisted`
 * (see pnpm-workspace.yaml), so node_modules is already flat and those
 * overrides do real damage: disabling hierarchical lookup stops Metro from
 * resolving legitimately-nested copies, and replacing `watchFolders` drops the
 * entries Expo's own config sets up.
 *
 * So: start from Expo's defaults, and only *add* to them.
 */
const { getDefaultConfig } = require('expo/metro-config');
const path = require('node:path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Append rather than replace, so edits to packages/* trigger a rebuild without
// discarding whatever Expo already watches.
config.watchFolders = Array.from(new Set([...(config.watchFolders ?? []), workspaceRoot]));

/**
 * Workspace packages are ESM TypeScript whose relative imports carry explicit
 * `.js` extensions — required by Node and tsx, but bundlers do not make that
 * mapping themselves. Mirrors the same setting in apps/web/next.config.ts.
 */
config.resolver.extensionAlias = {
  ...config.resolver.extensionAlias,
  '.js': ['.ts', '.tsx', '.js'],
};

module.exports = config;
