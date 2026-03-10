import { Command } from 'commander';
import type { CommandDefinition, GlobalOptions } from '../core/types.js';
import { resolveAccessToken } from '../core/auth.js';
import { HubSpotClient } from '../core/client.js';
import { output, outputError } from '../core/output.js';

// Auth commands (special — don't need an API client)
import { registerLoginCommand } from './auth/login.js';
import { registerLogoutCommand } from './auth/logout.js';
import { registerStatusCommand } from './auth/status.js';

// MCP command
import { registerMcpCommand } from './mcp/index.js';

// Command definitions — Phase 1
import { allContactsCommands } from './contacts/index.js';
import { allCompaniesCommands } from './companies/index.js';
import { allDealsCommands } from './deals/index.js';
import { allOwnersCommands } from './owners/index.js';
import { allPipelinesCommands } from './pipelines/index.js';

// Command definitions — Phase 2
import { allTicketsCommands } from './tickets/index.js';
import { allEngagementsCommands } from './engagements/index.js';
import { allAssociationsCommands } from './associations/index.js';

// Command definitions — Phase 3
import { allListsCommands } from './lists/index.js';
import { allPropertiesCommands } from './properties/index.js';
import { allSearchCommands } from './search/index.js';

/** All command definitions — the single source of truth for CLI + MCP */
export const allCommands: CommandDefinition[] = [
  // Phase 1: Core CRM objects
  ...allContactsCommands,
  ...allCompaniesCommands,
  ...allDealsCommands,
  ...allOwnersCommands,
  ...allPipelinesCommands,
  // Phase 2: Tickets, Engagements, Associations
  ...allTicketsCommands,
  ...allEngagementsCommands,
  ...allAssociationsCommands,
  // Phase 3: Lists, Properties, Universal Search
  ...allListsCommands,
  ...allPropertiesCommands,
  ...allSearchCommands,
];

export function registerAllCommands(program: Command): void {
  // Register auth commands (special handling — no API client needed)
  registerLoginCommand(program);
  registerLogoutCommand(program);
  registerStatusCommand(program);

  // Register MCP server command
  registerMcpCommand(program);

  // Group commands by their `group` field
  const groups = new Map<string, CommandDefinition[]>();
  for (const cmd of allCommands) {
    if (!groups.has(cmd.group)) groups.set(cmd.group, []);
    groups.get(cmd.group)!.push(cmd);
  }

  for (const [groupName, commands] of groups) {
    const groupCmd = program
      .command(groupName)
      .description(`Manage ${groupName}`);

    for (const cmdDef of commands) {
      registerCommand(groupCmd, cmdDef);
    }

    groupCmd.on('command:*', (operands: string[]) => {
      const available = commands.map((c) => c.subcommand).join(', ');
      console.error(`error: unknown command '${operands[0]}' for '${groupName}'`);
      console.error(`Available commands: ${available}`);
      process.exitCode = 1;
    });
  }
}

function registerCommand(parent: Command, cmdDef: CommandDefinition): void {
  const cmd = parent
    .command(cmdDef.subcommand)
    .description(cmdDef.description);

  // Register positional arguments
  if (cmdDef.cliMappings.args) {
    for (const arg of cmdDef.cliMappings.args) {
      const argStr = arg.required ? `<${arg.name}>` : `[${arg.name}]`;
      cmd.argument(argStr, `${arg.field}`);
    }
  }

  // Register options
  if (cmdDef.cliMappings.options) {
    for (const opt of cmdDef.cliMappings.options) {
      cmd.option(opt.flags, opt.description ?? '');
    }
  }

  // Add examples to help
  if (cmdDef.examples?.length) {
    cmd.addHelpText('after', '\nExamples:\n' + cmdDef.examples.map((e) => `  $ ${e}`).join('\n'));
  }

  cmd.action(async (...actionArgs: any[]) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions & Record<string, any>;

      // --pretty shorthand for --output pretty
      if (globalOpts.pretty) {
        globalOpts.output = 'pretty';
      }

      // Resolve access token
      const accessToken = await resolveAccessToken(globalOpts.accessToken);
      const client = new HubSpotClient({ accessToken });

      // Build input from positional args + options
      const input: Record<string, any> = {};

      // Map positional arguments
      if (cmdDef.cliMappings.args) {
        for (let i = 0; i < cmdDef.cliMappings.args.length; i++) {
          const argDef = cmdDef.cliMappings.args[i];
          if (actionArgs[i] !== undefined) {
            input[argDef.field] = actionArgs[i];
          }
        }
      }

      // Map options
      if (cmdDef.cliMappings.options) {
        for (const opt of cmdDef.cliMappings.options) {
          const match = opt.flags.match(/--([a-z-]+)/);
          if (match) {
            const optName = match[1].replace(/-([a-z])/g, (_, c) => c.toUpperCase());
            if (globalOpts[optName] !== undefined) {
              input[opt.field] = globalOpts[optName];
            }
          }
        }
      }

      // Validate input against schema
      const parsed = cmdDef.inputSchema.safeParse(input);
      if (!parsed.success) {
        const issues = parsed.error.issues ?? [];
        const missing = issues
          .filter((i: any) => {
            const fieldName = String(i.path?.[0] ?? '');
            const fieldValue = (input as Record<string, any>)[fieldName];
            return fieldValue === undefined || fieldValue === null;
          })
          .map((i: any) => {
            const flag = '--' + String(i.path?.[0] ?? '').replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase().replace(/_/g, '-');
            // For enum fields, include allowed values
            if (i.code === 'invalid_value' && i.values) {
              return `${flag} (expected: ${i.values.join(', ')})`;
            }
            return flag;
          });
        if (missing.length > 0) {
          throw new Error(`Missing required option(s): ${missing.join(', ')}`);
        }
        const msg = issues.map((i: any) => `${i.path?.join('.')}: ${i.message}`).join('; ');
        throw new Error(`Invalid input: ${msg}`);
      }

      const result = await cmdDef.handler(parsed.data, client);
      output(result, globalOpts);
    } catch (error) {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      outputError(error, globalOpts);
    }
  });
}
