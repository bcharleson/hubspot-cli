import { createCrmObjectCommands } from '../../factories/crm-object.js';

export const allCompaniesCommands = createCrmObjectCommands({
  objectType: 'companies',
  singular: 'company',
  defaultProperties: ['name', 'domain', 'industry', 'phone', 'city', 'state', 'country', 'numberofemployees'],
  writeProperties: [
    { field: 'name', flags: '-n, --name <name>', description: 'Company name', required: true },
    { field: 'domain', flags: '-d, --domain <domain>', description: 'Company domain' },
    { field: 'industry', flags: '--industry <industry>', description: 'Industry' },
    { field: 'phone', flags: '--phone <phone>', description: 'Phone number' },
    { field: 'city', flags: '--city <city>', description: 'City' },
    { field: 'state', flags: '--state <state>', description: 'State/Region' },
    { field: 'country', flags: '--country <country>', description: 'Country' },
    { field: 'numberofemployees', flags: '--employees <count>', description: 'Number of employees' },
    { field: 'annualrevenue', flags: '--revenue <amount>', description: 'Annual revenue' },
    { field: 'description', flags: '--description <text>', description: 'Company description' },
  ],
});
