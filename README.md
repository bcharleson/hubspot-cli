# HubSpot CLI

**JSON-first, agent-native CLI for the HubSpot CRM API.**

> HubSpot has an official CLI (`@hubspot/cli`) — but it only covers CMS developer tools (Design Manager, serverless functions, HubDB). There is **no official CLI for the CRM API**: contacts, companies, deals, tickets, pipelines, owners, engagements, or associations.
>
> This CLI fills that gap. Every command returns structured JSON, works from the terminal _and_ as an MCP tool — so your AI agents can manage your entire HubSpot CRM the same way a human would from the command line.

## Why Agent-Native?

| | `@hubspot/cli` (Official) | `hubspot-cli` (This) |
|---|---|---|
| **Scope** | CMS only (themes, modules, serverless) | Full CRM API (contacts, companies, deals, tickets, pipelines, owners) |
| **Output** | Human-readable text | JSON-first — machine-parseable by default |
| **MCP Support** | No | Built-in MCP server — every command is an MCP tool |
| **Agent Use** | Not designed for agents | Every command works identically from terminal or MCP |
| **Auth** | OAuth / Personal Access Key | Private App access token (3-tier resolution) |

**Agent-native** means:
- **JSON-first output** — every response is valid JSON, pipe to `jq` or consume from any language
- **Dual entry point** — same commands work as CLI _and_ MCP tools with zero adaptation
- **Structured errors** — errors return `{ "error": "...", "code": "..." }`, not stack traces
- **Field filtering** — `--fields id,properties.email` returns only what you need
- **No interactive prompts in automation** — all params available as flags, env vars, or config

## Install

```bash
npm install -g hubspot-cli
```

## Quick Start

```bash
# Authenticate (interactive)
hubspot login

# Or set env var
export HUBSPOT_ACCESS_TOKEN=pat-na1-xxxxx

# List contacts
hubspot contacts list --pretty

# Create a contact
hubspot contacts create --email "john@acme.com" --firstname "John" --lastname "Doe"

# Search deals
hubspot deals search --query "acme" --pretty

# Get pipeline stages
hubspot pipelines stages <pipeline-id> --object-type deals
```

## Auth

Three-tier resolution (highest priority first):

1. `--access-token <token>` CLI flag
2. `HUBSPOT_ACCESS_TOKEN` environment variable
3. `~/.hubspot-cli/config.json` (saved via `hubspot login`)

Get your access token from [HubSpot Private Apps](https://app.hubspot.com/private-apps/).

## Commands

### CRM Objects

| Group | Commands |
|-------|----------|
| **contacts** | `list`, `get`, `create`, `update`, `delete`, `search`, `merge` |
| **companies** | `list`, `get`, `create`, `update`, `delete`, `search` |
| **deals** | `list`, `get`, `create`, `update`, `delete`, `search` |
| **owners** | `list`, `get` |
| **pipelines** | `list`, `get`, `stages` |

### Auth & Config

| Command | Description |
|---------|-------------|
| `login` | Authenticate with access token |
| `logout` | Remove stored credentials |
| `status` | Show current auth + account info |

### MCP Server

```bash
# Start as MCP server (stdio transport)
hubspot mcp
```

Every command is registered as an MCP tool. Configure in Claude Desktop, OpenClaw, or any MCP-compatible agent:

```json
{
  "mcpServers": {
    "hubspot": {
      "command": "node",
      "args": ["/path/to/hubspot-cli/dist/mcp.js"],
      "env": {
        "HUBSPOT_ACCESS_TOKEN": "pat-na1-xxxxx"
      }
    }
  }
}
```

## Global Options

```
--access-token <token>  Override stored auth
--output <format>       json (default) or pretty
--pretty                Shorthand for --output pretty
--quiet                 Suppress output, exit codes only
--fields <fields>       Comma-separated field filter (supports nested: properties.email)
```

## Examples

```bash
# List contacts with specific fields
hubspot contacts list --fields id,properties.email,properties.firstname

# Search companies by name
hubspot companies search --query "acme" --properties name,domain,industry --pretty

# Create a deal
hubspot deals create --dealname "Acme Enterprise" --amount "50000" --pipeline "default" --dealstage "appointmentscheduled"

# Get all deal pipelines with stages
hubspot pipelines list --object-type deals --pretty

# Pipe to jq
hubspot contacts list | jq '.results[].properties.email'
```

## Architecture

This CLI follows the same metadata-driven architecture as [instantly-cli](https://github.com/bcharleson/instantly-cli) (156 commands) and [clay-gtm-cli](https://github.com/bcharleson/clay-gtm-cli):

- **CommandDefinition** — single struct drives both CLI registration and MCP tool registration
- **Zod schemas** — input validation shared between CLI and MCP
- **CRM Object Factory** — `createCrmObjectCommands()` generates CRUD + search for any HubSpot object type
- **Thin REST client** — ~130 lines, cursor-based pagination, exponential backoff on 429s
- **Dual entry** — `dist/index.js` (CLI) and `dist/mcp.js` (MCP server)

## License

MIT
