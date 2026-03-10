# HubSpot CLI — Agent Instructions

## Overview
JSON-first CLI and MCP server for the HubSpot CRM API. Every command outputs structured JSON suitable for machine consumption.

## Auth
Set `HUBSPOT_ACCESS_TOKEN` env var or pass `--access-token <token>`. Config stored at `~/.hubspot-cli/config.json`.

## Architecture
- **src/core/** — types, client, auth, config, errors, output, handler
- **src/factories/crm-object.ts** — factory that generates CRUD + search commands for any CRM object type
- **src/commands/** — command definitions grouped by resource (contacts, companies, deals, owners, pipelines)
- **src/commands/index.ts** — `allCommands` master array (single source of truth for CLI + MCP)
- **src/mcp/** — MCP server that registers all commands as tools

## Adding New Commands
1. For new CRM object types: add config to `src/factories/crm-object.ts` pattern (see contacts/companies/deals)
2. For custom commands: create a CommandDefinition in the appropriate group directory
3. Register in `src/commands/index.ts` allCommands array

## Key Patterns
- `bodyWrapper: 'properties'` — wraps body fields under `{ properties: { ... } }` for HubSpot CRM objects
- `executeCommand()` — generic handler that maps fields to path/query/body from fieldMappings
- Pagination: HubSpot uses cursor-based (`after` parameter), handled by client.paginate()

## Build
```bash
npm run build   # tsup → dist/index.js (CLI) + dist/mcp.js (MCP)
npm run dev     # tsx development mode
```
