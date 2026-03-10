import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

// HubSpot v3 models engagements as CRM objects: notes, emails, calls, tasks, meetings

const engagementTypes = ['notes', 'emails', 'calls', 'tasks', 'meetings'] as const;

// ── CREATE NOTE ─────────────────────────────────
const createNoteCommand: CommandDefinition = {
  name: 'engagements_create_note',
  group: 'engagements',
  subcommand: 'create-note',
  description: 'Create a note engagement. Use --associations to link to contacts/companies/deals.',
  examples: [
    'hubspot engagements create-note --body "Called client, discussed renewal"',
    'hubspot engagements create-note --body "Follow up needed" --owner-id <id> --associations \'[{"to":{"id":"123"},"types":[{"associationTypeId":202,"associationCategory":"HUBSPOT_DEFINED"}]}]\'',
  ],
  inputSchema: z.object({
    hs_note_body: z.string().describe('Note body (HTML or plain text)'),
    hs_timestamp: z.string().optional().describe('Timestamp (ISO 8601, defaults to now)'),
    hubspot_owner_id: z.string().optional().describe('Owner ID'),
    associations: z.string().optional().describe('JSON array of associations (e.g., [{"to":{"id":"123"},"types":[{"associationTypeId":202,"associationCategory":"HUBSPOT_DEFINED"}]}])'),
  }),
  cliMappings: {
    options: [
      { field: 'hs_note_body', flags: '-b, --body <text>', description: 'Note body' },
      { field: 'hs_timestamp', flags: '--timestamp <iso>', description: 'Timestamp (ISO 8601)' },
      { field: 'hubspot_owner_id', flags: '--owner-id <id>', description: 'Owner ID' },
      { field: 'associations', flags: '--associations <json>', description: 'JSON array of associations' },
    ],
  },
  endpoint: { method: 'POST', path: '/crm/v3/objects/notes' },
  fieldMappings: {},
  handler: async (input, client) => {
    const properties: Record<string, string> = {
      hs_note_body: input.hs_note_body,
      hs_timestamp: input.hs_timestamp ?? new Date().toISOString(),
    };
    if (input.hubspot_owner_id) properties.hubspot_owner_id = input.hubspot_owner_id;
    const body: Record<string, unknown> = { properties };
    if (input.associations) {
      body.associations = JSON.parse(input.associations);
    }
    return client.post('/crm/v3/objects/notes', body);
  },
};

// ── CREATE EMAIL ────────────────────────────────
const createEmailCommand: CommandDefinition = {
  name: 'engagements_create_email',
  group: 'engagements',
  subcommand: 'create-email',
  description: 'Create an email engagement. Use --associations to link to contacts/companies/deals.',
  examples: [
    'hubspot engagements create-email --subject "Follow up" --body "<p>Hi there</p>" --direction OUTBOUND',
  ],
  inputSchema: z.object({
    hs_email_subject: z.string().describe('Email subject'),
    hs_email_text: z.string().optional().describe('Email body (HTML)'),
    hs_email_direction: z.string().optional().describe('Direction: INCOMING_EMAIL or FORWARDED_EMAIL or EMAIL (outbound)'),
    hs_timestamp: z.string().optional().describe('Timestamp (ISO 8601)'),
    hubspot_owner_id: z.string().optional().describe('Owner ID'),
    hs_email_to_email: z.string().optional().describe('To email address'),
    hs_email_from_email: z.string().optional().describe('From email address'),
    associations: z.string().optional().describe('JSON array of associations'),
  }),
  cliMappings: {
    options: [
      { field: 'hs_email_subject', flags: '-s, --subject <subject>', description: 'Email subject' },
      { field: 'hs_email_text', flags: '-b, --body <html>', description: 'Email body (HTML)' },
      { field: 'hs_email_direction', flags: '--direction <dir>', description: 'Direction (INCOMING_EMAIL, FORWARDED_EMAIL, EMAIL)' },
      { field: 'hs_timestamp', flags: '--timestamp <iso>', description: 'Timestamp (ISO 8601)' },
      { field: 'hubspot_owner_id', flags: '--owner-id <id>', description: 'Owner ID' },
      { field: 'hs_email_to_email', flags: '--to <email>', description: 'To email address' },
      { field: 'hs_email_from_email', flags: '--from <email>', description: 'From email address' },
      { field: 'associations', flags: '--associations <json>', description: 'JSON array of associations' },
    ],
  },
  endpoint: { method: 'POST', path: '/crm/v3/objects/emails' },
  fieldMappings: {},
  handler: async (input, client) => {
    const properties: Record<string, string> = {
      hs_email_subject: input.hs_email_subject,
      hs_timestamp: input.hs_timestamp ?? new Date().toISOString(),
    };
    if (input.hs_email_text) properties.hs_email_text = input.hs_email_text;
    if (input.hs_email_direction) properties.hs_email_direction = input.hs_email_direction;
    if (input.hubspot_owner_id) properties.hubspot_owner_id = input.hubspot_owner_id;
    if (input.hs_email_to_email) properties.hs_email_to_email = input.hs_email_to_email;
    if (input.hs_email_from_email) properties.hs_email_from_email = input.hs_email_from_email;
    const body: Record<string, unknown> = { properties };
    if (input.associations) body.associations = JSON.parse(input.associations);
    return client.post('/crm/v3/objects/emails', body);
  },
};

// ── CREATE CALL ─────────────────────────────────
const createCallCommand: CommandDefinition = {
  name: 'engagements_create_call',
  group: 'engagements',
  subcommand: 'create-call',
  description: 'Create a call engagement. Use --associations to link to contacts/companies/deals.',
  examples: [
    'hubspot engagements create-call --body "Discussed pricing" --status COMPLETED --duration 300000',
  ],
  inputSchema: z.object({
    hs_call_body: z.string().optional().describe('Call notes'),
    hs_call_status: z.string().optional().describe('Call status (COMPLETED, BUSY, NO_ANSWER, FAILED, CONNECTING, CANCELED, RINGING, IN_PROGRESS, QUEUED)'),
    hs_call_duration: z.string().optional().describe('Call duration in milliseconds'),
    hs_call_direction: z.string().optional().describe('Direction: INBOUND or OUTBOUND'),
    hs_call_to_number: z.string().optional().describe('To phone number'),
    hs_call_from_number: z.string().optional().describe('From phone number'),
    hs_timestamp: z.string().optional().describe('Timestamp (ISO 8601)'),
    hubspot_owner_id: z.string().optional().describe('Owner ID'),
    associations: z.string().optional().describe('JSON array of associations'),
  }),
  cliMappings: {
    options: [
      { field: 'hs_call_body', flags: '-b, --body <text>', description: 'Call notes' },
      { field: 'hs_call_status', flags: '--status <status>', description: 'Call status' },
      { field: 'hs_call_duration', flags: '--duration <ms>', description: 'Duration in ms' },
      { field: 'hs_call_direction', flags: '--direction <dir>', description: 'INBOUND or OUTBOUND' },
      { field: 'hs_call_to_number', flags: '--to <number>', description: 'To phone number' },
      { field: 'hs_call_from_number', flags: '--from <number>', description: 'From phone number' },
      { field: 'hs_timestamp', flags: '--timestamp <iso>', description: 'Timestamp (ISO 8601)' },
      { field: 'hubspot_owner_id', flags: '--owner-id <id>', description: 'Owner ID' },
      { field: 'associations', flags: '--associations <json>', description: 'JSON array of associations' },
    ],
  },
  endpoint: { method: 'POST', path: '/crm/v3/objects/calls' },
  fieldMappings: {},
  handler: async (input, client) => {
    const properties: Record<string, string> = {
      hs_timestamp: input.hs_timestamp ?? new Date().toISOString(),
    };
    if (input.hs_call_body) properties.hs_call_body = input.hs_call_body;
    if (input.hs_call_status) properties.hs_call_status = input.hs_call_status;
    if (input.hs_call_duration) properties.hs_call_duration = input.hs_call_duration;
    if (input.hs_call_direction) properties.hs_call_direction = input.hs_call_direction;
    if (input.hs_call_to_number) properties.hs_call_to_number = input.hs_call_to_number;
    if (input.hs_call_from_number) properties.hs_call_from_number = input.hs_call_from_number;
    if (input.hubspot_owner_id) properties.hubspot_owner_id = input.hubspot_owner_id;
    const body: Record<string, unknown> = { properties };
    if (input.associations) body.associations = JSON.parse(input.associations);
    return client.post('/crm/v3/objects/calls', body);
  },
};

// ── CREATE TASK ─────────────────────────────────
const createTaskCommand: CommandDefinition = {
  name: 'engagements_create_task',
  group: 'engagements',
  subcommand: 'create-task',
  description: 'Create a task engagement. Use --associations to link to contacts/companies/deals.',
  examples: [
    'hubspot engagements create-task --subject "Follow up call" --status NOT_STARTED --priority HIGH',
  ],
  inputSchema: z.object({
    hs_task_subject: z.string().describe('Task subject'),
    hs_task_body: z.string().optional().describe('Task body/notes'),
    hs_task_status: z.string().optional().describe('Status: NOT_STARTED, IN_PROGRESS, WAITING, COMPLETED, DEFERRED'),
    hs_task_priority: z.string().optional().describe('Priority: LOW, MEDIUM, HIGH'),
    hs_task_type: z.string().optional().describe('Type: TODO, CALL, EMAIL'),
    hs_timestamp: z.string().optional().describe('Due date (ISO 8601)'),
    hubspot_owner_id: z.string().optional().describe('Owner ID'),
    associations: z.string().optional().describe('JSON array of associations'),
  }),
  cliMappings: {
    options: [
      { field: 'hs_task_subject', flags: '-s, --subject <subject>', description: 'Task subject' },
      { field: 'hs_task_body', flags: '-b, --body <text>', description: 'Task notes' },
      { field: 'hs_task_status', flags: '--status <status>', description: 'Status' },
      { field: 'hs_task_priority', flags: '--priority <level>', description: 'Priority (LOW, MEDIUM, HIGH)' },
      { field: 'hs_task_type', flags: '--type <type>', description: 'Type (TODO, CALL, EMAIL)' },
      { field: 'hs_timestamp', flags: '--due-date <iso>', description: 'Due date (ISO 8601)' },
      { field: 'hubspot_owner_id', flags: '--owner-id <id>', description: 'Owner ID' },
      { field: 'associations', flags: '--associations <json>', description: 'JSON array of associations' },
    ],
  },
  endpoint: { method: 'POST', path: '/crm/v3/objects/tasks' },
  fieldMappings: {},
  handler: async (input, client) => {
    const properties: Record<string, string> = {
      hs_task_subject: input.hs_task_subject,
      hs_timestamp: input.hs_timestamp ?? new Date().toISOString(),
    };
    if (input.hs_task_body) properties.hs_task_body = input.hs_task_body;
    if (input.hs_task_status) properties.hs_task_status = input.hs_task_status;
    if (input.hs_task_priority) properties.hs_task_priority = input.hs_task_priority;
    if (input.hs_task_type) properties.hs_task_type = input.hs_task_type;
    if (input.hubspot_owner_id) properties.hubspot_owner_id = input.hubspot_owner_id;
    const body: Record<string, unknown> = { properties };
    if (input.associations) body.associations = JSON.parse(input.associations);
    return client.post('/crm/v3/objects/tasks', body);
  },
};

// ── CREATE MEETING ──────────────────────────────
const createMeetingCommand: CommandDefinition = {
  name: 'engagements_create_meeting',
  group: 'engagements',
  subcommand: 'create-meeting',
  description: 'Create a meeting engagement. Use --associations to link to contacts/companies/deals.',
  examples: [
    'hubspot engagements create-meeting --title "Discovery Call" --start "2026-03-15T10:00:00Z" --end "2026-03-15T11:00:00Z"',
  ],
  inputSchema: z.object({
    hs_meeting_title: z.string().describe('Meeting title'),
    hs_meeting_body: z.string().optional().describe('Meeting description'),
    hs_meeting_start_time: z.string().optional().describe('Start time (ISO 8601)'),
    hs_meeting_end_time: z.string().optional().describe('End time (ISO 8601)'),
    hs_meeting_outcome: z.string().optional().describe('Outcome: SCHEDULED, COMPLETED, RESCHEDULED, NO_SHOW, CANCELED'),
    hs_meeting_location: z.string().optional().describe('Meeting location or URL'),
    hs_timestamp: z.string().optional().describe('Timestamp (ISO 8601)'),
    hubspot_owner_id: z.string().optional().describe('Owner ID'),
    associations: z.string().optional().describe('JSON array of associations'),
  }),
  cliMappings: {
    options: [
      { field: 'hs_meeting_title', flags: '--title <title>', description: 'Meeting title' },
      { field: 'hs_meeting_body', flags: '-b, --body <text>', description: 'Meeting description' },
      { field: 'hs_meeting_start_time', flags: '--start <iso>', description: 'Start time (ISO 8601)' },
      { field: 'hs_meeting_end_time', flags: '--end <iso>', description: 'End time (ISO 8601)' },
      { field: 'hs_meeting_outcome', flags: '--outcome <outcome>', description: 'Outcome' },
      { field: 'hs_meeting_location', flags: '--location <location>', description: 'Location or URL' },
      { field: 'hs_timestamp', flags: '--timestamp <iso>', description: 'Timestamp (ISO 8601)' },
      { field: 'hubspot_owner_id', flags: '--owner-id <id>', description: 'Owner ID' },
      { field: 'associations', flags: '--associations <json>', description: 'JSON array of associations' },
    ],
  },
  endpoint: { method: 'POST', path: '/crm/v3/objects/meetings' },
  fieldMappings: {},
  handler: async (input, client) => {
    const properties: Record<string, string> = {
      hs_meeting_title: input.hs_meeting_title,
      hs_timestamp: input.hs_timestamp ?? new Date().toISOString(),
    };
    if (input.hs_meeting_body) properties.hs_meeting_body = input.hs_meeting_body;
    if (input.hs_meeting_start_time) properties.hs_meeting_start_time = input.hs_meeting_start_time;
    if (input.hs_meeting_end_time) properties.hs_meeting_end_time = input.hs_meeting_end_time;
    if (input.hs_meeting_outcome) properties.hs_meeting_outcome = input.hs_meeting_outcome;
    if (input.hs_meeting_location) properties.hs_meeting_location = input.hs_meeting_location;
    if (input.hubspot_owner_id) properties.hubspot_owner_id = input.hubspot_owner_id;
    const body: Record<string, unknown> = { properties };
    if (input.associations) body.associations = JSON.parse(input.associations);
    return client.post('/crm/v3/objects/meetings', body);
  },
};

// ── LIST ENGAGEMENTS (by type) ──────────────────
const listEngagementsCommand: CommandDefinition = {
  name: 'engagements_list',
  group: 'engagements',
  subcommand: 'list',
  description: 'List engagements by type (notes, emails, calls, tasks, meetings).',
  examples: [
    'hubspot engagements list --type notes',
    'hubspot engagements list --type tasks --limit 50',
  ],
  inputSchema: z.object({
    type: z.enum(engagementTypes).describe('Engagement type: notes, emails, calls, tasks, meetings'),
    limit: z.coerce.number().min(1).max(100).default(100).describe('Items per page (1-100)'),
    after: z.string().optional().describe('Pagination cursor'),
  }),
  cliMappings: {
    options: [
      { field: 'type', flags: '-t, --type <type>', description: 'Engagement type (notes, emails, calls, tasks, meetings)' },
      { field: 'limit', flags: '-l, --limit <number>', description: 'Items per page (1-100)' },
      { field: 'after', flags: '--after <cursor>', description: 'Pagination cursor' },
    ],
  },
  endpoint: { method: 'GET', path: '/crm/v3/objects/{type}' },
  fieldMappings: { type: 'path', limit: 'query', after: 'query' },
  paginated: true,
  handler: (input, client) => executeCommand(listEngagementsCommand, input, client),
};

// ── GET ENGAGEMENT ──────────────────────────────
const getEngagementCommand: CommandDefinition = {
  name: 'engagements_get',
  group: 'engagements',
  subcommand: 'get',
  description: 'Get an engagement by type and ID.',
  examples: [
    'hubspot engagements get <id> --type notes',
    'hubspot engagements get <id> --type calls',
  ],
  inputSchema: z.object({
    type: z.enum(engagementTypes).describe('Engagement type'),
    id: z.string().describe('Engagement ID'),
  }),
  cliMappings: {
    args: [{ field: 'id', name: 'id', required: true }],
    options: [
      { field: 'type', flags: '-t, --type <type>', description: 'Engagement type' },
    ],
  },
  endpoint: { method: 'GET', path: '/crm/v3/objects/{type}/{id}' },
  fieldMappings: { type: 'path', id: 'path' },
  handler: (input, client) => executeCommand(getEngagementCommand, input, client),
};

// ── DELETE ENGAGEMENT ───────────────────────────
const deleteEngagementCommand: CommandDefinition = {
  name: 'engagements_delete',
  group: 'engagements',
  subcommand: 'delete',
  description: 'Archive (soft-delete) an engagement by type and ID.',
  examples: [
    'hubspot engagements delete <id> --type notes',
  ],
  inputSchema: z.object({
    type: z.enum(engagementTypes).describe('Engagement type'),
    id: z.string().describe('Engagement ID'),
  }),
  cliMappings: {
    args: [{ field: 'id', name: 'id', required: true }],
    options: [
      { field: 'type', flags: '-t, --type <type>', description: 'Engagement type' },
    ],
  },
  endpoint: { method: 'DELETE', path: '/crm/v3/objects/{type}/{id}' },
  fieldMappings: { type: 'path', id: 'path' },
  handler: (input, client) => executeCommand(deleteEngagementCommand, input, client),
};

export const allEngagementsCommands = [
  createNoteCommand,
  createEmailCommand,
  createCallCommand,
  createTaskCommand,
  createMeetingCommand,
  listEngagementsCommand,
  getEngagementCommand,
  deleteEngagementCommand,
];
