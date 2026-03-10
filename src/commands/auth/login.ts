import { Command } from 'commander';
import { HubSpotClient } from '../../core/client.js';
import { saveConfig } from '../../core/config.js';
import { output, outputError } from '../../core/output.js';
import type { GlobalOptions } from '../../core/types.js';

export function registerLoginCommand(program: Command): void {
  program
    .command('login')
    .description('Authenticate with your HubSpot Private App access token')
    .option('--access-token <token>', 'Access token (skips interactive prompt)')
    .action(async (opts) => {
      const globalOpts = program.opts() as GlobalOptions;

      try {
        let accessToken = opts.accessToken || process.env.HUBSPOT_ACCESS_TOKEN;

        // Interactive prompt if no token provided and we're in a TTY
        if (!accessToken) {
          if (!process.stdin.isTTY) {
            outputError(
              new Error('No access token provided. Use --access-token or set HUBSPOT_ACCESS_TOKEN'),
              globalOpts,
            );
            return;
          }

          console.log('Get your access token from: https://app.hubspot.com/private-apps/\n');

          const [major] = process.versions.node.split('.').map(Number);
          if (major < 20) {
            outputError(
              new Error('Interactive login requires Node.js 20+. Use --access-token or set HUBSPOT_ACCESS_TOKEN instead.'),
              globalOpts,
            );
            return;
          }
          const { password } = await import('@inquirer/prompts');
          accessToken = await password({
            message: 'Enter your access token:',
            mask: '*',
          });
        }

        if (!accessToken) {
          outputError(new Error('No access token provided'), globalOpts);
          return;
        }

        // Validate by fetching account info
        const client = new HubSpotClient({ accessToken });

        if (globalOpts.output === 'pretty' || process.stdin.isTTY) {
          console.log('Validating access token...');
        }

        let accountInfo: any;
        try {
          accountInfo = await client.get('/account-info/v3/details');
        } catch {
          accountInfo = null;
        }

        await saveConfig({
          access_token: accessToken,
          portal_id: accountInfo?.portalId?.toString(),
          portal_name: accountInfo?.companyCurrency ?? undefined,
        });

        const result = {
          status: 'authenticated',
          portal_id: accountInfo?.portalId ?? 'unknown',
          config_path: '~/.hubspot-cli/config.json',
        };

        if (globalOpts.output === 'pretty' || process.stdin.isTTY) {
          console.log(`\nAuthenticated successfully!`);
          if (accountInfo?.portalId) {
            console.log(`Portal ID: ${accountInfo.portalId}`);
          }
          console.log('Config saved to ~/.hubspot-cli/config.json');
        } else {
          output(result, globalOpts);
        }
      } catch (error) {
        outputError(error, globalOpts);
      }
    });
}
