import { Command } from 'commander';
import { registerAllCommands } from './commands/index.js';

const program = new Command();

program
  .name('hubspot')
  .description('CLI and MCP server for the HubSpot CRM API')
  .version('0.1.4')
  .option('--access-token <token>', 'Access token (overrides HUBSPOT_ACCESS_TOKEN env var and stored config)')
  .option('--output <format>', 'Output format: json (default) or pretty', 'json')
  .option('--pretty', 'Shorthand for --output pretty')
  .option('--quiet', 'Suppress output, exit codes only')
  .option('--fields <fields>', 'Comma-separated list of fields to include in output');

registerAllCommands(program);

program.parse();
