import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';

const objectTypes = ['contacts', 'companies', 'deals', 'tickets', 'notes', 'emails', 'calls', 'tasks', 'meetings'] as const;

const universalSearchCommand: CommandDefinition = {
  name: 'search_search',
  group: 'search',
  subcommand: 'run',
  description: 'Universal CRM search across any object type. Supports simple text queries and advanced JSON filters.',
  examples: [
    'hubspot search run --object-type contacts --query "acme"',
    'hubspot search run --object-type deals --query "enterprise" --properties dealname,amount,dealstage',
    'hubspot search run --object-type contacts --filter \'{"filters":[{"propertyName":"lifecyclestage","operator":"EQ","value":"customer"}]}\'',
    'hubspot search run --object-type companies --filter \'[{"propertyName":"industry","operator":"EQ","value":"TECHNOLOGY"}]\' --properties name,domain',
  ],
  inputSchema: z.object({
    objectType: z.enum(objectTypes).describe('Object type to search'),
    query: z.string().optional().describe('Simple text search query'),
    filter: z.string().optional().describe('JSON filter: {"filters":[...]} or {"filterGroups":[...]} or just [...]'),
    properties: z.string().optional().describe('Comma-separated properties to return'),
    sorts: z.string().optional().describe('JSON sort: [{"propertyName":"createdate","direction":"DESCENDING"}]'),
    limit: z.coerce.number().min(1).max(100).default(100).describe('Max results (1-100)'),
    after: z.string().optional().describe('Pagination cursor'),
  }),
  cliMappings: {
    options: [
      { field: 'objectType', flags: '-t, --object-type <type>', description: 'Object type to search' },
      { field: 'query', flags: '-q, --query <text>', description: 'Text search query' },
      { field: 'filter', flags: '-f, --filter <json>', description: 'JSON filter expression' },
      { field: 'properties', flags: '-p, --properties <props>', description: 'Comma-separated properties to return' },
      { field: 'sorts', flags: '--sorts <json>', description: 'JSON sort expression' },
      { field: 'limit', flags: '-l, --limit <number>', description: 'Max results (1-100)' },
      { field: 'after', flags: '--after <cursor>', description: 'Pagination cursor' },
    ],
  },
  endpoint: { method: 'POST', path: '/crm/v3/objects/{objectType}/search' },
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
        if (parsed.filterGroups) {
          body.filterGroups = parsed.filterGroups;
        } else if (parsed.filters) {
          body.filterGroups = [{ filters: parsed.filters }];
        } else if (Array.isArray(parsed)) {
          body.filterGroups = [{ filters: parsed }];
        }
      } catch {
        throw new Error('Invalid --filter JSON. Expected: {"filters":[...]} or {"filterGroups":[...]} or [...]');
      }
    }

    if (input.properties) {
      body.properties = input.properties.split(',').map((p: string) => p.trim());
    }

    if (input.sorts) {
      try {
        body.sorts = JSON.parse(input.sorts);
      } catch {
        throw new Error('Invalid --sorts JSON. Expected: [{"propertyName":"...","direction":"ASCENDING|DESCENDING"}]');
      }
    }

    if (input.after) {
      body.after = input.after;
    }

    return client.post(`/crm/v3/objects/${input.objectType}/search`, body);
  },
};

export const allSearchCommands = [universalSearchCommand];
