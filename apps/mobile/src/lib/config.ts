import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Where the API lives.
 *
 * A phone cannot reach `localhost` — that resolves to the phone itself. So the
 * host is derived from whatever machine Metro is being served from, which is
 * exactly the machine running `pnpm dev`. Set EXPO_PUBLIC_API_URL to override
 * (a tunnel, a deployed URL, a teammate's laptop).
 *
 * Nothing secret goes in an EXPO_PUBLIC_ variable — those are compiled into the
 * bundle. The Groq key lives server-side only.
 */
function inferHost(): string {
  const explicit = process.env.EXPO_PUBLIC_API_URL;
  if (explicit) return explicit.replace(/\/$/, '');

  // Android emulator maps the host machine to a fixed address.
  if (Platform.OS === 'android' && !Constants.expoConfig?.hostUri) {
    return 'http://10.0.2.2:3000';
  }

  // `hostUri` looks like "192.168.1.14:8081" — same machine, different port.
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return `http://${host}:3000`;
    }
  }

  return 'http://localhost:3000';
}

export const API_URL = inferHost();

/** The agent point this device is installed at. Real hardware would be provisioned. */
export const AGENT_POINT_ID = process.env.EXPO_PUBLIC_AGENT_POINT ?? 'RWP-114';
