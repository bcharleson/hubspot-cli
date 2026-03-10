import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

const pipelinesListCommand: CommandDefinition = {
  name: 'pipelines_list',
  group: 'pipelines',
  subcommand: 'list',
  description: 'List all pipelines for an object type (deals or tickets).',
  examples: [
    'hubspot pipelines list --object-type deals',
    'hubspot pipelines list --object-type tickets',
  ],

  inputSchema: z.object({
    objectType: z.string().default('deals').describe('Object type: deals or tickets'),
  }),

  cliMappings: {
    options: [
      { field: 'objectType', flags: '-t, --object-type <type>', description: 'Object type (deals or tickets)' },
    ],
  },

  endpoint: { method: 'GET', path: '/crm/v3/pipelines/{objectType}' },

  fieldMappings: {
    objectType: 'path',
  },

  handler: (input, client) => executeCommand(pipelinesListCommand, input, client),
};

const pipelinesGetCommand: CommandDefinition = {
  name: 'pipelines_get',
  group: 'pipelines',
  subcommand: 'get',
  description: 'Get a pipeline by ID.',
  examples: [
    'hubspot pipelines get <id> --object-type deals',
  ],

  inputSchema: z.object({
    objectType: z.string().default('deals').describe('Object type: deals or tickets'),
    pipelineId: z.string().describe('Pipeline ID'),
  }),

  cliMappings: {
    args: [{ field: 'pipelineId', name: 'id', required: true }],
    options: [
      { field: 'objectType', flags: '-t, --object-type <type>', description: 'Object type (deals or tickets)' },
    ],
  },

  endpoint: { method: 'GET', path: '/crm/v3/pipelines/{objectType}/{pipelineId}' },

  fieldMappings: {
    objectType: 'path',
    pipelineId: 'path',
  },

  handler: (input, client) => executeCommand(pipelinesGetCommand, input, client),
};

const pipelinesStagesCommand: CommandDefinition = {
  name: 'pipelines_stages',
  group: 'pipelines',
  subcommand: 'stages',
  description: 'List all stages in a pipeline.',
  examples: [
    'hubspot pipelines stages <pipeline-id> --object-type deals',
  ],

  inputSchema: z.object({
    objectType: z.string().default('deals').describe('Object type: deals or tickets'),
    pipelineId: z.string().describe('Pipeline ID'),
  }),

  cliMappings: {
    args: [{ field: 'pipelineId', name: 'pipeline-id', required: true }],
    options: [
      { field: 'objectType', flags: '-t, --object-type <type>', description: 'Object type (deals or tickets)' },
    ],
  },

  endpoint: { method: 'GET', path: '/crm/v3/pipelines/{objectType}/{pipelineId}/stages' },

  fieldMappings: {
    objectType: 'path',
    pipelineId: 'path',
  },

  handler: (input, client) => executeCommand(pipelinesStagesCommand, input, client),
};

export const allPipelinesCommands = [pipelinesListCommand, pipelinesGetCommand, pipelinesStagesCommand];
