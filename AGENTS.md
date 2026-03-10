# HubSpot CLI — AI Agent Integration Guide

## MCP Server

Start the MCP server:
```bash
hubspot mcp
# or
node dist/mcp.js
```

### MCP Config (Claude Desktop / OpenClaw)
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

## Available Tools (24 total)

### Contacts (7 tools)
- `contacts_list` — List contacts with pagination
- `contacts_get` — Get a contact by ID
- `contacts_create` — Create a new contact
- `contacts_update` — Update a contact
- `contacts_delete` — Archive a contact
- `contacts_search` — Search contacts by query or filters
- `contacts_merge` — Merge two contacts

### Companies (6 tools)
- `companies_list`, `companies_get`, `companies_create`, `companies_update`, `companies_delete`, `companies_search`

### Deals (6 tools)
- `deals_list`, `deals_get`, `deals_create`, `deals_update`, `deals_delete`, `deals_search`

### Owners (2 tools)
- `owners_list` — List all owners
- `owners_get` — Get an owner by ID

### Pipelines (3 tools)
- `pipelines_list` — List pipelines (deals or tickets)
- `pipelines_get` — Get a pipeline by ID
- `pipelines_stages` — List stages in a pipeline

## Output Format

All tools return JSON. Responses follow HubSpot's API structure:

```json
{
  "results": [
    {
      "id": "123",
      "properties": {
        "email": "john@acme.com",
        "firstname": "John"
      },
      "createdAt": "2026-01-15T10:30:00Z",
      "updatedAt": "2026-03-09T14:00:00Z"
    }
  ],
  "paging": {
    "next": {
      "after": "cursor_string"
    }
  }
}
```

## Search

Use `query` for simple text search or `filter` for advanced filtering:

```json
{
  "query": "acme",
  "properties": "email,firstname,lastname",
  "limit": 10
}
```

Advanced filter:
```json
{
  "filter": "{\"filters\":[{\"propertyName\":\"email\",\"operator\":\"CONTAINS_TOKEN\",\"value\":\"acme.com\"}]}",
  "properties": "email,firstname,company"
}
```

## Tips for Agents
- Always include `properties` parameter when listing/getting objects to control which fields are returned
- Use `contacts_search` with `query` for simple lookups before trying complex filters
- Pipeline stages are needed to map `dealstage` IDs to human-readable names
- HubSpot uses `after` cursor for pagination — check `paging.next.after` in responses
- Create/update body fields are automatically wrapped in `{ "properties": { ... } }`
