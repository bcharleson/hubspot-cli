import { createCrmObjectCommands } from '../../factories/crm-object.js';

export const allDealsCommands = createCrmObjectCommands({
  objectType: 'deals',
  singular: 'deal',
  defaultProperties: ['dealname', 'amount', 'dealstage', 'pipeline', 'closedate', 'hubspot_owner_id'],
  writeProperties: [
    { field: 'dealname', flags: '-n, --dealname <name>', description: 'Deal name', required: true },
    { field: 'amount', flags: '-a, --amount <amount>', description: 'Deal amount' },
    { field: 'dealstage', flags: '--dealstage <stage>', description: 'Deal stage ID' },
    { field: 'pipeline', flags: '--pipeline <id>', description: 'Pipeline ID' },
    { field: 'closedate', flags: '--closedate <date>', description: 'Close date (ISO 8601)' },
    { field: 'hubspot_owner_id', flags: '--owner-id <id>', description: 'Owner ID' },
    { field: 'description', flags: '--description <text>', description: 'Deal description' },
  ],
});
