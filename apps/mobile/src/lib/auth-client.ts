import { expoClient } from '@better-auth/expo/client';
import { createAuthClient } from 'better-auth/client';
import * as SecureStore from 'expo-secure-store';

import { API_URL } from './config';

/**
 * Officer authentication on the device.
 *
 * React Native has no cookie jar, so the Expo plugin stores the session in
 * `expo-secure-store` (Keychain / Keystore) and attaches it to outgoing
 * requests itself. That is also why the API client below must route officer
 * calls through here rather than a bare `fetch`.
 */
/**
 * The cast is a workaround for a typing bug in better-auth@1.6.26, not a
 * version mismatch — both packages resolve to exactly 1.6.26 and there is only
 * one copy installed. `expoClient()` returns a `getActions` whose parameter
 * types are contravariantly incompatible with `BetterAuthClientPlugin`, so TS
 * rejects a plugin the library itself ships. Runtime is unaffected.
 *
 * Retry removing this after any better-auth upgrade.
 */
const expoPlugin = expoClient({
  scheme: 'parakh',
  storagePrefix: 'parakh',
  storage: SecureStore,
}) as unknown as Parameters<typeof createAuthClient>[0] extends { plugins?: (infer P)[] }
  ? P
  : never;

const client = createAuthClient({
  baseURL: API_URL,
  plugins: [expoPlugin],
});

/**
 * `getCookie()` comes from the Expo plugin: React Native has no cookie jar, so
 * the session lives in SecureStore and has to be attached to officer requests
 * by hand. It is lost from the client's inferred type for the same reason as
 * above, so it is re-declared here.
 */
export const authClient = client as typeof client & { getCookie: () => string };

export const { useSession, signIn, signOut } = client;

export type Officer = {
  id: string;
  name: string;
  email: string;
  role: string;
};
