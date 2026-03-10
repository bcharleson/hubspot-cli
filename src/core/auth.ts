import { loadConfig } from './config.js';
import { AuthError } from './errors.js';

export async function resolveAccessToken(flagToken?: string): Promise<string> {
  // 1. --access-token flag takes highest priority
  if (flagToken) return flagToken;

  // 2. HUBSPOT_ACCESS_TOKEN environment variable
  const envToken = process.env.HUBSPOT_ACCESS_TOKEN;
  if (envToken) return envToken;

  // 3. Stored config from ~/.hubspot-cli/config.json
  const config = await loadConfig();
  if (config?.access_token) return config.access_token;

  throw new AuthError(
    'No access token found. Set HUBSPOT_ACCESS_TOKEN, use --access-token, or run: hubspot login',
  );
}
