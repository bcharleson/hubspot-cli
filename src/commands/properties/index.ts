import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

const objectTypes = ['contacts', 'companies', 'deals', 'tickets'] as const;

// ── LIST PROPERTIES ─────────────────────────────
const propertiesListCommand: CommandDefinition = {
  name: 'properties_list',
  group: 'properties',
  subcommand: 'list',
  description: 'List all properties for an object type.',
  examples: [
    'hubspot properties list --object-type contacts',
    'hubspot properties list --object-type deals',
  ],
  inputSchema: z.object({
    objectType: z.enum(objectTypes).describe('Object type: contacts, companies, deals, tickets'),
  }),
  cliMappings: {
    options: [
      { field: 'objectType', flags: '-t, --object-type <type>', description: 'Object type' },
    ],
  },
  endpoint: { method: 'GET', path: '/crm/v3/properties/{objectType}' },
  fieldMappings: { objectType: 'path' },
  handler: (input, client) => executeCommand(propertiesListCommand, input, client),
};

// ── GET PROPERTY ────────────────────────────────
const propertiesGetCommand: CommandDefinition = {
  name: 'properties_get',
  group: 'properties',
  subcommand: 'get',
  description: 'Get a property by name for an object type.',
  examples: [
    'hubspot properties get email --object-type contacts',
    'hubspot properties get dealstage --object-type deals',
  ],
  inputSchema: z.object({
    objectType: z.enum(objectTypes).describe('Object type'),
    propertyName: z.string().describe('Property name'),
  }),
  cliMappings: {
    args: [{ field: 'propertyName', name: 'property-name', required: true }],
    options: [
      { field: 'objectType', flags: '-t, --object-type <type>', description: 'Object type' },
    ],
  },
  endpoint: { method: 'GET', path: '/crm/v3/properties/{objectType}/{propertyName}' },
  fieldMappings: { objectType: 'path', propertyName: 'path' },
  handler: (input, client) => executeCommand(propertiesGetCommand, input, client),
};

// ── CREATE PROPERTY ─────────────────────────────
const propertiesCreateCommand: CommandDefinition = {
  name: 'properties_create',
  group: 'properties',
  subcommand: 'create',
  description: 'Create a custom property for an object type.',
  examples: [
    'hubspot properties create --object-type contacts --name "custom_score" --label "Custom Score" --type number --group contactinformation',
  ],
  inputSchema: z.object({
    objectType: z.enum(objectTypes).describe('Object type'),
    name: z.string().describe('Internal property name (lowercase, underscores)'),
    label: z.string().describe('Display label'),
    type: z.string().describe('Property type: string, number, date, datetime, enumeration, bool'),
    fieldType: z.string().optional().describe('Field type: text, textarea, number, date, select, checkbox, radio, booleancheckbox'),
    groupName: z.string().optional().describe('Property group name'),
    description: z.string().optional().describe('Property description'),
    options: z.string().optional().describe('JSON array of options for enumeration type: [{"label":"A","value":"a"}]'),
  }),
  cliMappings: {
    options: [
      { field: 'objectType', flags: '-t, --object-type <type>', description: 'Object type' },
      { field: 'name', flags: '-n, --name <name>', description: 'Internal property name' },
      { field: 'label', flags: '--label <label>', description: 'Display label' },
      { field: 'type', flags: '--type <type>', description: 'Property type (string, number, date, datetime, enumeration, bool)' },
      { field: 'fieldType', flags: '--field-type <type>', description: 'Field type (text, textarea, number, etc.)' },
      { field: 'groupName', flags: '--group <group>', description: 'Property group name' },
      { field: 'description', flags: '--description <text>', description: 'Description' },
      { field: 'options', flags: '--options <json>', description: 'JSON options for enumeration type' },
    ],
  },
  endpoint: { method: 'POST', path: '/crm/v3/properties/{objectType}' },
  fieldMappings: { objectType: 'path' },
  handler: async (input, client) => {
    const { objectType, options: optionsStr, ...rest } = input;
    const body: Record<string, any> = { ...rest };
    if (optionsStr) {
      try {
        body.options = JSON.parse(optionsStr);
      } catch {
        throw new Error('Invalid --options JSON. Expected: [{"label":"A","value":"a"}]');
      }
    }
    return client.post(`/crm/v3/properties/${objectType}`, body);
  },
};

// ── UPDATE PROPERTY ─────────────────────────────
const propertiesUpdateCommand: CommandDefinition = {
  name: 'properties_update',
  group: 'properties',
  subcommand: 'update',
  description: 'Update a custom property.',
  examples: [
    'hubspot properties update custom_score --object-type contacts --label "Updated Score"',
  ],
  inputSchema: z.object({
    objectType: z.enum(objectTypes).describe('Object type'),
    propertyName: z.string().describe('Property name'),
    label: z.string().optional().describe('New display label'),
    description: z.string().optional().describe('New description'),
    groupName: z.string().optional().describe('New property group'),
    options: z.string().optional().describe('JSON options for enumeration type'),
  }),
  cliMappings: {
    args: [{ field: 'propertyName', name: 'property-name', required: true }],
    options: [
      { field: 'objectType', flags: '-t, --object-type <type>', description: 'Object type' },
      { field: 'label', flags: '--label <label>', description: 'New display label' },
      { field: 'description', flags: '--description <text>', description: 'New description' },
      { field: 'groupName', flags: '--group <group>', description: 'New property group' },
      { field: 'options', flags: '--options <json>', description: 'JSON options for enumeration type' },
    ],
  },
  endpoint: { method: 'PATCH', path: '/crm/v3/properties/{objectType}/{propertyName}' },
  fieldMappings: { objectType: 'path', propertyName: 'path' },
  handler: async (input, client) => {
    const { objectType, propertyName, options: optionsStr, ...rest } = input;
    const body: Record<string, any> = {};
    for (const [key, value] of Object.entries(rest)) {
      if (value !== undefined) body[key] = value;
    }
    if (optionsStr) {
      try {
        body.options = JSON.parse(optionsStr);
      } catch {
        throw new Error('Invalid --options JSON. Expected: [{"label":"A","value":"a"}]');
      }
    }
    return client.patch(`/crm/v3/properties/${objectType}/${propertyName}`, body);
  },
};

// ── DELETE PROPERTY ─────────────────────────────
const propertiesDeleteCommand: CommandDefinition = {
  name: 'properties_delete',
  group: 'properties',
  subcommand: 'delete',
  description: 'Delete a custom property. Built-in HubSpot properties cannot be deleted.',
  examples: [
    'hubspot properties delete custom_score --object-type contacts',
  ],
  inputSchema: z.object({
    objectType: z.enum(objectTypes).describe('Object type'),
    propertyName: z.string().describe('Property name to delete'),
  }),
  cliMappings: {
    args: [{ field: 'propertyName', name: 'property-name', required: true }],
    options: [
      { field: 'objectType', flags: '-t, --object-type <type>', description: 'Object type' },
    ],
  },
  endpoint: { method: 'DELETE', path: '/crm/v3/properties/{objectType}/{propertyName}' },
  fieldMappings: { objectType: 'path', propertyName: 'path' },
  handler: (input, client) => executeCommand(propertiesDeleteCommand, input, client),
};

export const allPropertiesCommands = [
  propertiesListCommand,
  propertiesGetCommand,
  propertiesCreateCommand,
  propertiesUpdateCommand,
  propertiesDeleteCommand,
];
