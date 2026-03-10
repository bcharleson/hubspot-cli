import { z } from 'zod';

export interface CliMapping {
  args?: Array<{
    field: string;
    name: string;
    required?: boolean;
  }>;
  options?: Array<{
    field: string;
    flags: string;
    description?: string;
  }>;
}

export interface CommandDefinition<TInput extends z.ZodObject<any> = z.ZodObject<any>> {
  /** Unique identifier, used as MCP tool name. e.g., "contacts_list" */
  name: string;

  /** CLI group. e.g., "contacts" */
  group: string;

  /** CLI subcommand name. e.g., "list" */
  subcommand: string;

  /** Human-readable description (used in --help AND MCP tool description) */
  description: string;

  /** Detailed examples for --help output */
  examples?: string[];

  /** Zod schema defining all inputs */
  inputSchema: TInput;

  /** Maps Zod fields to CLI constructs (args and options) */
  cliMappings: CliMapping;

  /** HTTP method and path template */
  endpoint: {
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
    path: string;
  };

  /** Where each input field goes in the HTTP request */
  fieldMappings: Record<string, 'path' | 'query' | 'body'>;

  /** Optional key to nest body fields under (e.g., "properties" for HubSpot CRM objects) */
  bodyWrapper?: string;

  /** Whether this is a paginated list endpoint */
  paginated?: boolean;

  /** The handler function */
  handler: (input: z.infer<TInput>, client: HubSpotClient) => Promise<unknown>;
}

export interface HubSpotClient {
  request<T>(options: {
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
    path: string;
    query?: Record<string, string | number | boolean | undefined>;
    body?: unknown;
  }): Promise<T>;

  get<T>(path: string, query?: Record<string, any>): Promise<T>;
  post<T>(path: string, body?: unknown, query?: Record<string, any>): Promise<T>;
  patch<T>(path: string, body?: unknown): Promise<T>;
  delete<T>(path: string, query?: Record<string, any>): Promise<T>;
  put<T>(path: string, body?: unknown): Promise<T>;
}

export interface HubSpotPaginatedResponse<T> {
  results: T[];
  paging?: {
    next?: {
      after: string;
      link?: string;
    };
  };
}

export interface HubSpotConfig {
  access_token: string;
  portal_id?: string;
  portal_name?: string;
}

export interface GlobalOptions {
  accessToken?: string;
  output?: 'json' | 'pretty';
  quiet?: boolean;
  fields?: string;
  pretty?: boolean;
}
