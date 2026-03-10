import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';

export const contactsMergeCommand: CommandDefinition = {
  name: 'contacts_merge',
  group: 'contacts',
  subcommand: 'merge',
  description: 'Merge two contacts. The primary contact survives; the other is merged into it.',
  examples: [
    'hubspot contacts merge --primary-id <id1> --merge-id <id2>',
  ],

  inputSchema: z.object({
    primary_id: z.string().describe('ID of the primary contact (survives)'),
    merge_id: z.string().describe('ID of the contact to merge into the primary'),
  }),

  cliMappings: {
    options: [
      { field: 'primary_id', flags: '--primary-id <id>', description: 'Primary contact ID (survives)' },
      { field: 'merge_id', flags: '--merge-id <id>', description: 'Contact ID to merge' },
    ],
  },

  endpoint: { method: 'POST', path: '/crm/v3/objects/contacts/merge' },
  fieldMappings: {},

  handler: async (input, client) => {
    return client.post('/crm/v3/objects/contacts/merge', {
      primaryObjectId: input.primary_id,
      objectIdToMerge: input.merge_id,
    });
  },
};
