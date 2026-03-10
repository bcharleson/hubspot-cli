import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';

const objectTypes = ['contacts', 'companies', 'deals', 'tickets', 'notes', 'emails', 'calls', 'tasks', 'meetings'] as const;

// ── LIST ASSOCIATIONS ───────────────────────────
const associationsListCommand: CommandDefinition = {
  name: 'associations_list',
  group: 'associations',
  subcommand: 'list',
  description: 'List all associations from an object to a target type.',
  examples: [
    'hubspot associations list --from-type contacts --id <contact-id> --to-type companies',
    'hubspot associations list --from-type deals --id <deal-id> --to-type contacts',
  ],
  inputSchema: z.object({
    fromObjectType: z.enum(objectTypes).describe('Source object type'),
    objectId: z.string().describe('Source object ID'),
    toObjectType: z.enum(objectTypes).describe('Target object type'),
    limit: z.coerce.number().min(1).max(500).default(500).describe('Max results'),
    after: z.string().optional().describe('Pagination cursor'),
  }),
  cliMappings: {
    options: [
      { field: 'fromObjectType', flags: '--from-type <type>', description: 'Source object type' },
      { field: 'objectId', flags: '--id <id>', description: 'Source object ID' },
      { field: 'toObjectType', flags: '--to-type <type>', description: 'Target object type' },
      { field: 'limit', flags: '-l, --limit <number>', description: 'Max results' },
      { field: 'after', flags: '--after <cursor>', description: 'Pagination cursor' },
    ],
  },
  endpoint: { method: 'GET', path: '/crm/v4/objects/{fromObjectType}/{objectId}/associations/{toObjectType}' },
  fieldMappings: {
    fromObjectType: 'path',
    objectId: 'path',
    toObjectType: 'path',
    limit: 'query',
    after: 'query',
  },
  paginated: true,
  handler: async (input, client) => {
    return client.get(
      `/crm/v4/objects/${input.fromObjectType}/${input.objectId}/associations/${input.toObjectType}`,
      { limit: input.limit, after: input.after },
    );
  },
};

// ── CREATE ASSOCIATIONS (batch) ─────────────────
const associationsCreateCommand: CommandDefinition = {
  name: 'associations_create',
  group: 'associations',
  subcommand: 'create',
  description: 'Create an association between two objects.',
  examples: [
    'hubspot associations create --from-type contacts --from-id <id> --to-type companies --to-id <id> --type-id 1',
    'hubspot associations create --from-type deals --from-id <id> --to-type contacts --to-id <id> --type-id 3',
  ],
  inputSchema: z.object({
    fromObjectType: z.enum(objectTypes).describe('Source object type'),
    fromObjectId: z.string().describe('Source object ID'),
    toObjectType: z.enum(objectTypes).describe('Target object type'),
    toObjectId: z.string().describe('Target object ID'),
    associationTypeId: z.coerce.number().describe('Association type ID (e.g., 1 for contact→company primary)'),
    associationCategory: z.string().default('HUBSPOT_DEFINED').describe('Category: HUBSPOT_DEFINED or USER_DEFINED'),
  }),
  cliMappings: {
    options: [
      { field: 'fromObjectType', flags: '--from-type <type>', description: 'Source object type' },
      { field: 'fromObjectId', flags: '--from-id <id>', description: 'Source object ID' },
      { field: 'toObjectType', flags: '--to-type <type>', description: 'Target object type' },
      { field: 'toObjectId', flags: '--to-id <id>', description: 'Target object ID' },
      { field: 'associationTypeId', flags: '--type-id <id>', description: 'Association type ID' },
      { field: 'associationCategory', flags: '--category <cat>', description: 'HUBSPOT_DEFINED or USER_DEFINED' },
    ],
  },
  endpoint: { method: 'PUT', path: '/crm/v4/associations/{fromObjectType}/{toObjectType}/batch/create' },
  fieldMappings: {},
  handler: async (input, client) => {
    return client.put(
      `/crm/v4/associations/${input.fromObjectType}/${input.toObjectType}/batch/create`,
      {
        inputs: [
          {
            _from: { id: input.fromObjectId },
            to: { id: input.toObjectId },
            types: [
              {
                associationTypeId: input.associationTypeId,
                associationCategory: input.associationCategory,
              },
            ],
          },
        ],
      },
    );
  },
};

// ── DELETE ASSOCIATIONS (batch) ─────────────────
const associationsDeleteCommand: CommandDefinition = {
  name: 'associations_delete',
  group: 'associations',
  subcommand: 'delete',
  description: 'Remove an association between two objects.',
  examples: [
    'hubspot associations delete --from-type contacts --from-id <id> --to-type companies --to-id <id>',
  ],
  inputSchema: z.object({
    fromObjectType: z.enum(objectTypes).describe('Source object type'),
    fromObjectId: z.string().describe('Source object ID'),
    toObjectType: z.enum(objectTypes).describe('Target object type'),
    toObjectId: z.string().describe('Target object ID'),
  }),
  cliMappings: {
    options: [
      { field: 'fromObjectType', flags: '--from-type <type>', description: 'Source object type' },
      { field: 'fromObjectId', flags: '--from-id <id>', description: 'Source object ID' },
      { field: 'toObjectType', flags: '--to-type <type>', description: 'Target object type' },
      { field: 'toObjectId', flags: '--to-id <id>', description: 'Target object ID' },
    ],
  },
  endpoint: { method: 'POST', path: '/crm/v4/associations/{fromObjectType}/{toObjectType}/batch/archive' },
  fieldMappings: {},
  handler: async (input, client) => {
    return client.post(
      `/crm/v4/associations/${input.fromObjectType}/${input.toObjectType}/batch/archive`,
      {
        inputs: [
          {
            from: { id: input.fromObjectId },
            to: { id: input.toObjectId },
          },
        ],
      },
    );
  },
};

export const allAssociationsCommands = [
  associationsListCommand,
  associationsCreateCommand,
  associationsDeleteCommand,
];
