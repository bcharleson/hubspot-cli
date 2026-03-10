import { Command } from 'commander';
import { loadConfig, getConfigPath } from '../../core/config.js';
import { HubSpotClient } from '../../core/client.js';
import { resolveAccessToken } from '../../core/auth.js';
import { output, outputError } from '../../core/output.js';
import type { GlobalOptions } from '../../core/types.js';

export function registerStatusCommand(program: Command): void {
  program
    .command('status')
    .description('Show current authentication status and account info')
    .action(async () => {
      const globalOpts = program.opts() as GlobalOptions;

      try {
        const config = await loadConfig();
        let accessToken: string | undefined;

        try {
          accessToken = await resolveAccessToken(globalOpts.accessToken);
        } catch {
          // No token available
        }

        if (!accessToken) {
          const result = {
            authenticated: false,
            config_path: getConfigPath(),
            message: 'Not authenticated. Run: hubspot login',
          };

          if (globalOpts.output === 'pretty' || process.stdin.isTTY) {
            console.log('Not authenticated.');
            console.log('Run: hubspot login');
          } else {
            output(result, globalOpts);
          }
          return;
        }

        // Fetch account info
        const client = new HubSpotClient({ accessToken });
        let accountInfo: any;
        try {
          accountInfo = await client.get('/account-info/v3/details');
        } catch {
          accountInfo = null;
        }

        const result = {
          authenticated: true,
          portal_id: accountInfo?.portalId ?? config?.portal_id ?? 'unknown',
          time_zone: accountInfo?.timeZone,
          currency: accountInfo?.companyCurrency,
          config_path: getConfigPath(),
          token_source: globalOpts.accessToken
            ? 'flag'
            : process.env.HUBSPOT_ACCESS_TOKEN
              ? 'env'
              : 'config',
        };

        if (globalOpts.output === 'pretty' || process.stdin.isTTY) {
          console.log('Authenticated');
          console.log(`Portal ID: ${result.portal_id}`);
          if (result.time_zone) console.log(`Time Zone: ${result.time_zone}`);
          if (result.currency) console.log(`Currency: ${result.currency}`);
          console.log(`Token source: ${result.token_source}`);
        } else {
          output(result, globalOpts);
        }
      } catch (error) {
        outputError(error, globalOpts);
      }
    });
}
