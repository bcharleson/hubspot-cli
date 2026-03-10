import { createCrmObjectCommands } from '../../factories/crm-object.js';
import { contactsMergeCommand } from './merge.js';

const contactsCommands = createCrmObjectCommands({
  objectType: 'contacts',
  singular: 'contact',
  defaultProperties: ['email', 'firstname', 'lastname', 'phone', 'company', 'lifecyclestage'],
  writeProperties: [
    { field: 'email', flags: '-e, --email <email>', description: 'Email address', required: true },
    { field: 'firstname', flags: '--firstname <name>', description: 'First name' },
    { field: 'lastname', flags: '--lastname <name>', description: 'Last name' },
    { field: 'phone', flags: '--phone <phone>', description: 'Phone number' },
    { field: 'company', flags: '--company <company>', description: 'Company name' },
    { field: 'jobtitle', flags: '--jobtitle <title>', description: 'Job title' },
    { field: 'lifecyclestage', flags: '--lifecyclestage <stage>', description: 'Lifecycle stage (subscriber, lead, marketingqualifiedlead, salesqualifiedlead, opportunity, customer, evangelist, other)' },
    { field: 'hs_lead_status', flags: '--lead-status <status>', description: 'Lead status' },
  ],
});

export const allContactsCommands = [...contactsCommands, contactsMergeCommand];
