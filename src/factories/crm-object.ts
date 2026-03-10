import { z } from 'zod';
import type { CommandDefinition } from '../core/types.js';
import { executeCommand } from '../core/handler.js';

interface CrmObjectConfig {
  /** Object type for API path: "contacts", "companies", "deals", "tickets" */
  objectType: string;

  /** Singular name for descriptions: "contact", "company", "deal", "ticket" */
  singular: string;

  /** Default properties to fetch on list/get (comma-separated for query) */
  defaultProperties: string[];

  /** Common writable properties for create/update examples */
  writeProperties: Array<{
    field: string;
    flags: string;
    description: string;
    required?: boolean;
  }>;
}

/**
 * Factory: generates list, get, create, update, delete, search commands
 * for any HubSpot CRM v3 object type.
 */
export function createCrmObjectCommands(config: CrmObjectConfig): CommandDefinition[] {
  const { objectType, singular, defaultProperties, writeProperties } = config;
  const basePath = `/crm/v3/objects/${objectType}`;

  // ── LIST ──────────────────────────────────────────────
  const listCommand: CommandDefinition = {
    name: `${objectType}_list`,
    group: objectType,
    subcommand: 'list',
    description: `List ${objectType}. Returns paginated results with default properties.`,
    examples: [
      `hubspot ${objectType} list`,
      `hubspot ${objectType} list --limit 50`,
      `hubspot ${objectType} list --properties email,firstname,lastname`,
      `hubspot ${objectType} list --after <cursor>`,
    ],

    inputSchema: z.object({
      limit: z.coerce.number().min(1).max(100).default(100).describe('Items per page (1-100)'),
      after: z.string().optional().describe('Pagination cursor'),
      properties: z.string().optional().describe('Comma-separated list of properties to return'),
    }),

    cliMappings: {
      options: [
        { field: 'limit', flags: '-l, --limit <number>', description: 'Items per page (1-100)' },
        { field: 'after', flags: '--after <cursor>', description: 'Pagination cursor' },
        { field: 'properties', flags: '-p, --properties <props>', description: 'Comma-separated properties to return' },
      ],
    },

    endpoint: { method: 'GET', path: basePath },

    fieldMappings: {
      limit: 'query',
      after: 'query',
      properties: 'query',
    },

    paginated: true,

    handler: (input, client) => {
      // Default properties if none specified
      if (!input.properties && defaultProperties.length > 0) {
        input.properties = defaultProperties.join(',');
      }
      return executeCommand(listCommand, input, client);
    },
  };

  // ── GET ───────────────────────────────────────────────
  const getCommand: CommandDefinition = {
    name: `${objectType}_get`,
    group: objectType,
    subcommand: 'get',
    description: `Get a ${singular} by ID.`,
    examples: [
      `hubspot ${objectType} get <id>`,
      `hubspot ${objectType} get <id> --properties email,firstname`,
    ],

    inputSchema: z.object({
      id: z.string().describe(`${singular} ID`),
      properties: z.string().optional().describe('Comma-separated properties to return'),
    }),

    cliMappings: {
      args: [{ field: 'id', name: 'id', required: true }],
      options: [
        { field: 'properties', flags: '-p, --properties <props>', description: 'Comma-separated properties to return' },
      ],
    },

    endpoint: { method: 'GET', path: `${basePath}/{id}` },

    fieldMappings: {
      id: 'path',
      properties: 'query',
    },

    handler: (input, client) => {
      if (!input.properties && defaultProperties.length > 0) {
        input.properties = defaultProperties.join(',');
      }
      return executeCommand(getCommand, input, client);
    },
  };

  // ── CREATE ────────────────────────────────────────────
  const createSchema: Record<string, z.ZodTypeAny> = {};
  const createOptions: Array<{ field: string; flags: string; description: string }> = [];
  const createFieldMappings: Record<string, 'body'> = {};

  for (const prop of writeProperties) {
    createSchema[prop.field] = prop.required
      ? z.string().describe(prop.description)
      : z.string().optional().describe(prop.description);
    createOptions.push({ field: prop.field, flags: prop.flags, description: prop.description });
    createFieldMappings[prop.field] = 'body';
  }

  const createCommand: CommandDefinition = {
    name: `${objectType}_create`,
    group: objectType,
    subcommand: 'create',
    description: `Create a new ${singular}.`,
    examples: [
      `hubspot ${objectType} create ${writeProperties.slice(0, 2).map(p => `${p.flags.split('<')[0].trim().split(',').pop()?.trim()} "value"`).join(' ')}`,
    ],

    inputSchema: z.object(createSchema),

    cliMappings: { options: createOptions },

    endpoint: { method: 'POST', path: basePath },

    fieldMappings: createFieldMappings,
    bodyWrapper: 'properties',

    handler: (input, client) => executeCommand(createCommand, input, client),
  };

  // ── UPDATE ────────────────────────────────────────────
  const updateSchema: Record<string, z.ZodTypeAny> = {
    id: z.string().describe(`${singular} ID`),
  };
  const updateOptions: Array<{ field: string; flags: string; description: string }> = [];
  const updateFieldMappings: Record<string, 'path' | 'body'> = { id: 'path' };

  for (const prop of writeProperties) {
    updateSchema[prop.field] = z.string().optional().describe(prop.description);
    updateOptions.push({ field: prop.field, flags: prop.flags, description: prop.description });
    updateFieldMappings[prop.field] = 'body';
  }

  const updateCommand: CommandDefinition = {
    name: `${objectType}_update`,
    group: objectType,
    subcommand: 'update',
    description: `Update an existing ${singular} by ID.`,
    examples: [
      `hubspot ${objectType} update <id> ${writeProperties[0]?.flags.split('<')[0].trim().split(',').pop()?.trim()} "new value"`,
    ],

    inputSchema: z.object(updateSchema),

    cliMappings: {
      args: [{ field: 'id', name: 'id', required: true }],
      options: updateOptions,
    },

    endpoint: { method: 'PATCH', path: `${basePath}/{id}` },

    fieldMappings: updateFieldMappings,
    bodyWrapper: 'properties',

    handler: (input, client) => executeCommand(updateCommand, input, client),
  };

  // ── DELETE ────────────────────────────────────────────
  const deleteCommand: CommandDefinition = {
    name: `${objectType}_delete`,
    group: objectType,
    subcommand: 'delete',
    description: `Archive (soft-delete) a ${singular} by ID.`,
    examples: [`hubspot ${objectType} delete <id>`],

    inputSchema: z.object({
      id: z.string().describe(`${singular} ID`),
    }),

    cliMappings: {
      args: [{ field: 'id', name: 'id', required: true }],
    },

    endpoint: { method: 'DELETE', path: `${basePath}/{id}` },

    fieldMappings: { id: 'path' },

    handler: (input, client) => executeCommand(deleteCommand, input, client),
  };

  // ── SEARCH ────────────────────────────────────────────
  const searchCommand: CommandDefinition = {
    name: `${objectType}_search`,
    group: objectType,
    subcommand: 'search',
    description: `Search ${objectType} using filters or a text query.`,
    examples: [
      `hubspot ${objectType} search --query "acme"`,
      `hubspot ${objectType} search --filter '{"filters":[{"propertyName":"email","operator":"CONTAINS_TOKEN","value":"acme"}]}'`,
    ],

    inputSchema: z.object({
      query: z.string().optional().describe('Simple text search query'),
      filter: z.string().optional().describe('JSON filterGroups for advanced search'),
      properties: z.string().optional().describe('Comma-separated properties to return'),
      limit: z.coerce.number().min(1).max(100).default(100).describe('Max results (1-100)'),
      after: z.string().optional().describe('Pagination cursor'),
    }),

    cliMappings: {
      options: [
        { field: 'query', flags: '-q, --query <text>', description: 'Text search query' },
        { field: 'filter', flags: '-f, --filter <json>', description: 'JSON filterGroups' },
        { field: 'properties', flags: '-p, --properties <props>', description: 'Properties to return' },
        { field: 'limit', flags: '-l, --limit <number>', description: 'Max results (1-100)' },
        { field: 'after', flags: '--after <cursor>', description: 'Pagination cursor' },
      ],
    },

    endpoint: { method: 'POST', path: `${basePath}/search` },
    fieldMappings: {},

    handler: async (input, client) => {
      const body: Record<string, any> = {
        limit: input.limit,
      };

      if (input.query) {
        body.query = input.query;
      }

      if (input.filter) {
        try {
          const parsed = JSON.parse(input.filter);
          // Accept either { filters: [...] } or { filterGroups: [...] }
          if (parsed.filterGroups) {
            body.filterGroups = parsed.filterGroups;
          } else if (parsed.filters) {
            body.filterGroups = [{ filters: parsed.filters }];
          } else if (Array.isArray(parsed)) {
            body.filterGroups = [{ filters: parsed }];
          }
        } catch {
          throw new Error('Invalid --filter JSON. Expected: {"filters":[...]} or [...]');
        }
      }

      if (input.properties) {
        body.properties = input.properties.split(',').map((p: string) => p.trim());
      } else if (defaultProperties.length > 0) {
        body.properties = defaultProperties;
      }

      if (input.after) {
        body.after = input.after;
      }

      return client.post(`${basePath}/search`, body);
    },
  };

  return [listCommand, getCommand, createCommand, updateCommand, deleteCommand, searchCommand];
}
