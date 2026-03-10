import { createCrmObjectCommands } from '../../factories/crm-object.js';

export const allTicketsCommands = createCrmObjectCommands({
  objectType: 'tickets',
  singular: 'ticket',
  defaultProperties: ['subject', 'content', 'hs_pipeline', 'hs_pipeline_stage', 'hs_ticket_priority', 'hubspot_owner_id', 'createdate'],
  writeProperties: [
    { field: 'subject', flags: '-s, --subject <subject>', description: 'Ticket subject', required: true },
    { field: 'content', flags: '--content <text>', description: 'Ticket description/body' },
    { field: 'hs_pipeline', flags: '--pipeline <id>', description: 'Pipeline ID' },
    { field: 'hs_pipeline_stage', flags: '--stage <id>', description: 'Pipeline stage ID' },
    { field: 'hs_ticket_priority', flags: '--priority <priority>', description: 'Priority (LOW, MEDIUM, HIGH)' },
    { field: 'hubspot_owner_id', flags: '--owner-id <id>', description: 'Owner ID' },
    { field: 'hs_ticket_category', flags: '--category <category>', description: 'Ticket category' },
    { field: 'source_type', flags: '--source <type>', description: 'Source type (EMAIL, CHAT, PHONE, FORM)' },
  ],
});
