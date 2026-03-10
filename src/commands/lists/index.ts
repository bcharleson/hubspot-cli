import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

// ── LIST ALL LISTS ──────────────────────────────
const listsListCommand: CommandDefinition = {
  name: 'lists_list',
  group: 'lists',
  subcommand: 'list',
  description: 'List all contact lists.',
  examples: [
    'hubspot lists list',
    'hubspot lists list --limit 50',
  ],
  inputSchema: z.object({
    limit: z.coerce.number().min(1).max(250).default(100).describe('Items per page (1-250)'),
    offset: z.coerce.number().optional().describe('Pagination offset'),
  }),
  cliMappings: {
    options: [
      { field: 'limit', flags: '-l, --limit <number>', description: 'Items per page (1-250)' },
      { field: 'offset', flags: '--offset <number>', description: 'Pagination offset' },
    ],
  },
  endpoint: { method: 'GET', path: '/crm/v3/lists' },
  fieldMappings: { limit: 'query', offset: 'query' },
  paginated: true,
  handler: (input, client) => executeCommand(listsListCommand, input, client),
};

// ── GET LIST ────────────────────────────────────
const listsGetCommand: CommandDefinition = {
  name: 'lists_get',
  group: 'lists',
  subcommand: 'get',
  description: 'Get a list by ID.',
  examples: ['hubspot lists get <id>'],
  inputSchema: z.object({
    listId: z.string().describe('List ID'),
  }),
  cliMappings: {
    args: [{ field: 'listId', name: 'id', required: true }],
  },
  endpoint: { method: 'GET', path: '/crm/v3/lists/{listId}' },
  fieldMappings: { listId: 'path' },
  handler: (input, client) => executeCommand(listsGetCommand, input, client),
};

// ── CREATE LIST ─────────────────────────────────
const listsCreateCommand: CommandDefinition = {
  name: 'lists_create',
  group: 'lists',
  subcommand: 'create',
  description: 'Create a new contact list.',
  examples: [
    'hubspot lists create --name "VIP Customers" --processing-type MANUAL',
    'hubspot lists create --name "Enterprise Leads" --processing-type MANUAL',
  ],
  inputSchema: z.object({
    name: z.string().describe('List name'),
    processingType: z.string().default('MANUAL').describe('Processing type: MANUAL or DYNAMIC'),
    objectTypeId: z.string().default('0-1').describe('Object type ID (0-1 for contacts, 0-2 for companies, 0-3 for deals, 0-5 for tickets)'),
  }),
  cliMappings: {
    options: [
      { field: 'name', flags: '-n, --name <name>', description: 'List name' },
      { field: 'processingType', flags: '--processing-type <type>', description: 'MANUAL or DYNAMIC' },
      { field: 'objectTypeId', flags: '--object-type-id <id>', description: 'Object type ID (0-1=contacts, 0-2=companies, 0-3=deals, 0-5=tickets)' },
    ],
  },
  endpoint: { method: 'POST', path: '/crm/v3/lists' },
  fieldMappings: { name: 'body', processingType: 'body', objectTypeId: 'body' },
  handler: (input, client) => executeCommand(listsCreateCommand, input, client),
};

// ── UPDATE LIST ─────────────────────────────────
const listsUpdateCommand: CommandDefinition = {
  name: 'lists_update',
  group: 'lists',
  subcommand: 'update',
  description: 'Update a list name.',
  examples: ['hubspot lists update <id> --name "New List Name"'],
  inputSchema: z.object({
    listId: z.string().describe('List ID'),
    name: z.string().describe('New list name'),
  }),
  cliMappings: {
    args: [{ field: 'listId', name: 'id', required: true }],
    options: [
      { field: 'name', flags: '-n, --name <name>', description: 'New list name' },
    ],
  },
  endpoint: { method: 'PUT', path: '/crm/v3/lists/{listId}' },
  fieldMappings: { listId: 'path', name: 'body' },
  handler: (input, client) => executeCommand(listsUpdateCommand, input, client),
};

// ── DELETE LIST ─────────────────────────────────
const listsDeleteCommand: CommandDefinition = {
  name: 'lists_delete',
  group: 'lists',
  subcommand: 'delete',
  description: 'Delete a list by ID.',
  examples: ['hubspot lists delete <id>'],
  inputSchema: z.object({
    listId: z.string().describe('List ID'),
  }),
  cliMappings: {
    args: [{ field: 'listId', name: 'id', required: true }],
  },
  endpoint: { method: 'DELETE', path: '/crm/v3/lists/{listId}' },
  fieldMappings: { listId: 'path' },
  handler: (input, client) => executeCommand(listsDeleteCommand, input, client),
};

// ── ADD MEMBERS ─────────────────────────────────
const listsAddMembersCommand: CommandDefinition = {
  name: 'lists_add_members',
  group: 'lists',
  subcommand: 'add-members',
  description: 'Add records to a list by their IDs.',
  examples: [
    'hubspot lists add-members <list-id> --record-ids "123,456,789"',
  ],
  inputSchema: z.object({
    listId: z.string().describe('List ID'),
    recordIds: z.string().describe('Comma-separated record IDs to add'),
  }),
  cliMappings: {
    args: [{ field: 'listId', name: 'list-id', required: true }],
    options: [
      { field: 'recordIds', flags: '--record-ids <ids>', description: 'Comma-separated record IDs' },
    ],
  },
  endpoint: { method: 'PUT', path: '/crm/v3/lists/{listId}/memberships/add' },
  fieldMappings: { listId: 'path' },
  handler: async (input, client) => {
    const ids = input.recordIds.split(',').map((id: string) => id.trim());
    return client.put(`/crm/v3/lists/${input.listId}/memberships/add`, ids);
  },
};

// ── REMOVE MEMBERS ──────────────────────────────
const listsRemoveMembersCommand: CommandDefinition = {
  name: 'lists_remove_members',
  group: 'lists',
  subcommand: 'remove-members',
  description: 'Remove records from a list by their IDs.',
  examples: [
    'hubspot lists remove-members <list-id> --record-ids "123,456,789"',
  ],
  inputSchema: z.object({
    listId: z.string().describe('List ID'),
    recordIds: z.string().describe('Comma-separated record IDs to remove'),
  }),
  cliMappings: {
    args: [{ field: 'listId', name: 'list-id', required: true }],
    options: [
      { field: 'recordIds', flags: '--record-ids <ids>', description: 'Comma-separated record IDs' },
    ],
  },
  endpoint: { method: 'PUT', path: '/crm/v3/lists/{listId}/memberships/remove' },
  fieldMappings: { listId: 'path' },
  handler: async (input, client) => {
    const ids = input.recordIds.split(',').map((id: string) => id.trim());
    return client.put(`/crm/v3/lists/${input.listId}/memberships/remove`, ids);
  },
};

// ── GET MEMBERS ─────────────────────────────────
const listsGetMembersCommand: CommandDefinition = {
  name: 'lists_get_members',
  group: 'lists',
  subcommand: 'get-members',
  description: 'Get all member record IDs from a list.',
  examples: [
    'hubspot lists get-members <list-id>',
    'hubspot lists get-members <list-id> --limit 200',
  ],
  inputSchema: z.object({
    listId: z.string().describe('List ID'),
    limit: z.coerce.number().min(1).max(250).default(100).describe('Items per page'),
    after: z.string().optional().describe('Pagination cursor'),
  }),
  cliMappings: {
    args: [{ field: 'listId', name: 'list-id', required: true }],
    options: [
      { field: 'limit', flags: '-l, --limit <number>', description: 'Items per page' },
      { field: 'after', flags: '--after <cursor>', description: 'Pagination cursor' },
    ],
  },
  endpoint: { method: 'GET', path: '/crm/v3/lists/{listId}/memberships' },
  fieldMappings: { listId: 'path', limit: 'query', after: 'query' },
  paginated: true,
  handler: (input, client) => executeCommand(listsGetMembersCommand, input, client),
};

export const allListsCommands = [
  listsListCommand,
  listsGetCommand,
  listsCreateCommand,
  listsUpdateCommand,
  listsDeleteCommand,
  listsAddMembersCommand,
  listsRemoveMembersCommand,
  listsGetMembersCommand,
];
