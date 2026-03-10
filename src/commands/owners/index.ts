import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

const ownersListCommand: CommandDefinition = {
  name: 'owners_list',
  group: 'owners',
  subcommand: 'list',
  description: 'List all owners in the HubSpot account.',
  examples: [
    'hubspot owners list',
    'hubspot owners list --limit 50',
    'hubspot owners list --email "user@company.com"',
  ],

  inputSchema: z.object({
    limit: z.coerce.number().min(1).max(500).default(100).describe('Items per page'),
    after: z.string().optional().describe('Pagination cursor'),
    email: z.string().optional().describe('Filter by email address'),
  }),

  cliMappings: {
    options: [
      { field: 'limit', flags: '-l, --limit <number>', description: 'Items per page' },
      { field: 'after', flags: '--after <cursor>', description: 'Pagination cursor' },
      { field: 'email', flags: '-e, --email <email>', description: 'Filter by email' },
    ],
  },

  endpoint: { method: 'GET', path: '/crm/v3/owners' },

  fieldMappings: {
    limit: 'query',
    after: 'query',
    email: 'query',
  },

  paginated: true,

  handler: (input, client) => executeCommand(ownersListCommand, input, client),
};

const ownersGetCommand: CommandDefinition = {
  name: 'owners_get',
  group: 'owners',
  subcommand: 'get',
  description: 'Get an owner by ID.',
  examples: ['hubspot owners get <id>'],

  inputSchema: z.object({
    ownerId: z.string().describe('Owner ID'),
  }),

  cliMappings: {
    args: [{ field: 'ownerId', name: 'id', required: true }],
  },

  endpoint: { method: 'GET', path: '/crm/v3/owners/{ownerId}' },

  fieldMappings: {
    ownerId: 'path',
  },

  handler: (input, client) => executeCommand(ownersGetCommand, input, client),
};

export const allOwnersCommands = [ownersListCommand, ownersGetCommand];
