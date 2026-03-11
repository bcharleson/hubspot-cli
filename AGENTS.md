# AI Agent Guide — HubSpot CLI

> This file helps AI agents (Claude, GPT, Gemini, open-source models, etc.) install, authenticate, and use the HubSpot CLI to manage CRM objects — contacts, companies, deals, tickets, pipelines, engagements, associations, lists, and properties — via the HubSpot CRM API v3.

## Quick Start

```bash
# Install globally
npm install -g hubspot-cli

# Create a Private App token in HubSpot first:
# Settings -> Integrations -> Private Apps -> Create a private app

# Authenticate (non-interactive — best for agents)
export HUBSPOT_ACCESS_TOKEN="pat-na1-xxxxx"

# Verify it works
hubspot contacts list
```

**Requirements:** Node.js 18+

## Authentication

Create the token in HubSpot:

1. Go to **Settings** → **Integrations** → **Private Apps** → **Create a private app**
2. In **Basic info**, give it a name such as `hubspot-cli-agent`
3. In **Scopes**, enable the scopes for the command groups you need
4. Click **Create app**
5. In the **Auth** tab, click **Show token** and copy the value. It starts with `pat-na1-` followed by your region.

Set your access token via environment variable — no interactive login needed:

```bash
export HUBSPOT_ACCESS_TOKEN="pat-na1-xxxxx"
```

Or pass it per-command:

```bash
hubspot contacts list --access-token "pat-na1-xxxxx"
```

Access tokens are generated from HubSpot Private Apps: https://app.hubspot.com/private-apps/

### Required Scopes

Your Private App needs these scopes depending on which commands you use:

| Command group | Scopes required |
|---------------|-----------------|
| `contacts` | `crm.objects.contacts.read` + `crm.objects.contacts.write` |
| `companies` | `crm.objects.companies.read` + `crm.objects.companies.write` |
| `deals` | `crm.objects.deals.read` + `crm.objects.deals.write` |
| `tickets` | `tickets` |
| `owners` | `crm.objects.owners.read` |
| `engagements` (email read) | `sales-email-read` only if you need to read email body content |
| `lists` | `crm.lists.read` + `crm.lists.write` |
| `properties` | `crm.schemas.contacts.read` + `crm.schemas.contacts.write`, `crm.schemas.companies.read` + `crm.schemas.companies.write`, `crm.schemas.deals.read` + `crm.schemas.deals.write` |

## Output Format

All commands output **JSON to stdout** by default — ready for parsing:

```bash
# Default: compact JSON (agent-optimized)
hubspot contacts list
# → {"results":[{"id":"123","properties":{"email":"john@acme.com",...}}],"paging":{...}}

# Pretty-printed JSON
hubspot contacts list --pretty

# Select specific fields
hubspot contacts list --fields id,properties.email,properties.firstname

# Suppress output (exit code only)
hubspot contacts list --quiet
```

**Exit codes:** 0 = success, 1 = error. Errors go to stderr as JSON:
```json
{"error":"No access token found. Set HUBSPOT_ACCESS_TOKEN, use --access-token, or run: hubspot login","code":"AUTH_ERROR"}
```

## Discovering Commands

```bash
# List all command groups
hubspot --help

# List subcommands in a group
hubspot contacts --help

# Get help for a specific subcommand (shows required options + examples)
hubspot contacts create --help
```

If you use a wrong subcommand, the CLI tells you what's available:
```
error: unknown command 'archive' for 'contacts'
Available commands: list, get, create, update, delete, search, merge
```

## All Command Groups & Subcommands (55 commands)

### contacts
Manage CRM contacts.
```
list      List contacts (paginated, cursor-based)
get       Get a contact by ID
create    Create a new contact (--email required)
update    Update a contact by ID
delete    Archive (soft-delete) a contact
search    Search contacts by text query or JSON filters
merge     Merge two contacts (--primary-id survives)
```

### companies
Manage CRM companies.
```
list      List companies (paginated)
get       Get a company by ID
create    Create a new company (--name required)
update    Update a company by ID
delete    Archive a company
search    Search companies by query or filters
```

### deals
Manage CRM deals.
```
list      List deals (paginated)
get       Get a deal by ID
create    Create a new deal (--dealname required)
update    Update a deal by ID
delete    Archive a deal
search    Search deals by query or filters
```

### tickets
Manage support tickets.
```
list      List tickets (paginated)
get       Get a ticket by ID
create    Create a new ticket (--subject required)
update    Update a ticket by ID
delete    Archive a ticket
search    Search tickets by query or filters
```

### owners
Look up HubSpot users/owners.
```
list      List all owners (filter by --email)
get       Get an owner by ID
```

### pipelines
View deal and ticket pipelines.
```
list      List pipelines (--object-type deals or tickets)
get       Get a pipeline by ID
stages    List all stages in a pipeline
```

### engagements
Create and manage activities (notes, emails, calls, tasks, meetings).
```
create-note     Create a note
create-email    Create an email record
create-call     Create a call record
create-task     Create a task
create-meeting  Create a meeting
list            List engagements by --type (notes, emails, calls, tasks, meetings)
get             Get an engagement by --type and ID
delete          Archive an engagement
```

### associations
Link CRM objects together (uses v4 API).
```
list      List associations from an object to a target type
create    Create an association between two objects
delete    Remove an association between two objects
```

### lists
Manage contact lists and memberships.
```
list            List all lists
get             Get a list by ID
create          Create a new list (--name, --processing-type MANUAL or DYNAMIC)
update          Update a list name
delete          Delete a list
add-members     Add records to a list (--record-ids "123,456")
remove-members  Remove records from a list
get-members     Get all member IDs from a list
```

### properties
Manage custom properties on any object type.
```
list      List all properties (--object-type contacts|companies|deals|tickets)
get       Get a property by name
create    Create a custom property (--name, --label, --type)
update    Update a property
delete    Delete a custom property (built-in properties cannot be deleted)
```

### search
Universal CRM search.
```
run       Search any object type with text queries or JSON filters
```

## Response Structure

All CRM object responses follow this structure:

```json
{
  "results": [
    {
      "id": "123",
      "properties": {
        "email": "john@acme.com",
        "firstname": "John",
        "lastname": "Doe",
        "company": "Acme Corp"
      },
      "createdAt": "2026-01-15T10:30:00.000Z",
      "updatedAt": "2026-03-09T14:00:00.000Z",
      "archived": false
    }
  ],
  "paging": {
    "next": {
      "after": "cursor_string_for_next_page"
    }
  }
}
```

**Key points:**
- All properties live inside the `properties` object — not at the top level
- `id` is always a string
- `paging.next.after` is present only when there are more pages
- Archived objects return `"archived": true`

## Common Workflows

### Look up a contact by email

```bash
# Simple text search (searches across all indexed properties)
hubspot contacts search --query "john@acme.com"

# Exact email match using filters
hubspot contacts search --filter '{"filters":[{"propertyName":"email","operator":"EQ","value":"john@acme.com"}]}'
```

### Create a contact and associate with a company

```bash
# 1. Create the contact
hubspot contacts create --email "john@acme.com" --firstname "John" --lastname "Doe" --company "Acme Corp"
# → {"id":"123","properties":{...}}

# 2. Find or create the company
hubspot companies search --query "Acme Corp"
# → Use the company ID from the result, or create:
hubspot companies create --name "Acme Corp" --domain "acme.com"
# → {"id":"456","properties":{...}}

# 3. Associate contact → company
hubspot associations create --from-type contacts --from-id 123 --to-type companies --to-id 456 --type-id 1
```

### Create a deal in a specific pipeline stage

```bash
# 1. Find pipeline stages
hubspot pipelines list --object-type deals --pretty
# → Note the pipeline ID and stage IDs

# 2. Get stage details
hubspot pipelines stages <pipeline-id> --object-type deals --pretty

# 3. Create the deal
hubspot deals create --dealname "Acme Enterprise" --amount "50000" \
  --pipeline "<pipeline-id>" --dealstage "<stage-id>" --owner-id "<owner-id>"

# 4. Associate with contact and company
hubspot associations create --from-type deals --from-id <deal-id> --to-type contacts --to-id <contact-id> --type-id 3
hubspot associations create --from-type deals --from-id <deal-id> --to-type companies --to-id <company-id> --type-id 5
```

### Log an activity (note, call, task)

```bash
# Log a note
hubspot engagements create-note --body "Had discovery call. Interested in enterprise plan." --owner-id <id>

# Log a call
hubspot engagements create-call --body "Discussed pricing, sending proposal" \
  --status COMPLETED --duration 1800000 --direction OUTBOUND

# Create a follow-up task
hubspot engagements create-task --subject "Send proposal to Acme" \
  --status NOT_STARTED --priority HIGH --type TODO --due-date "2026-03-15T10:00:00Z"

# Schedule a meeting
hubspot engagements create-meeting --title "Acme Demo" \
  --start "2026-03-15T14:00:00Z" --end "2026-03-15T15:00:00Z" \
  --location "https://zoom.us/j/123456"
```

### Manage a list

```bash
# Create a list
hubspot lists create --name "VIP Customers" --processing-type MANUAL
# → {"listId":"789",...}

# Add contacts to it
hubspot lists add-members 789 --record-ids "123,456,101"

# Check members
hubspot lists get-members 789

# Remove contacts
hubspot lists remove-members 789 --record-ids "101"
```

### Inspect and create custom properties

```bash
# See all contact properties
hubspot properties list --object-type contacts --pretty

# Check a specific property
hubspot properties get lifecyclestage --object-type contacts --pretty

# Create a custom property
hubspot properties create --object-type contacts --name "lead_score" \
  --label "Lead Score" --type number --field-type number --group contactinformation

# Create an enumeration property with options
hubspot properties create --object-type deals --name "deal_tier" \
  --label "Deal Tier" --type enumeration --field-type select \
  --options '[{"label":"Bronze","value":"bronze"},{"label":"Silver","value":"silver"},{"label":"Gold","value":"gold"}]'
```

### Advanced search with filters

```bash
# Find all customers (lifecycle stage = customer)
hubspot search run --object-type contacts \
  --filter '{"filters":[{"propertyName":"lifecyclestage","operator":"EQ","value":"customer"}]}' \
  --properties email,firstname,lastname,company

# Find high-value deals (amount > 10000)
hubspot search run --object-type deals \
  --filter '[{"propertyName":"amount","operator":"GT","value":"10000"}]' \
  --properties dealname,amount,dealstage,closedate

# Find companies in technology industry
hubspot search run --object-type companies \
  --filter '{"filters":[{"propertyName":"industry","operator":"EQ","value":"TECHNOLOGY"}]}' \
  --properties name,domain,numberofemployees

# Combine multiple filters (AND logic within a filterGroup)
hubspot search run --object-type contacts \
  --filter '{"filters":[{"propertyName":"lifecyclestage","operator":"EQ","value":"lead"},{"propertyName":"hs_lead_status","operator":"EQ","value":"NEW"}]}' \
  --properties email,firstname,company

# Sort results
hubspot search run --object-type deals --query "acme" \
  --sorts '[{"propertyName":"amount","direction":"DESCENDING"}]' \
  --properties dealname,amount
```

### Filter operators reference

| Operator | Description | Example value |
|----------|-------------|---------------|
| `EQ` | Equal to | `"customer"` |
| `NEQ` | Not equal to | `"subscriber"` |
| `LT` | Less than | `"10000"` |
| `LTE` | Less than or equal | `"10000"` |
| `GT` | Greater than | `"10000"` |
| `GTE` | Greater than or equal | `"10000"` |
| `CONTAINS_TOKEN` | Contains word | `"acme"` |
| `NOT_CONTAINS_TOKEN` | Does not contain | `"test"` |
| `HAS_PROPERTY` | Property is set | (no value needed) |
| `NOT_HAS_PROPERTY` | Property is not set | (no value needed) |
| `IN` | In list | `["value1","value2"]` |
| `NOT_IN` | Not in list | `["value1","value2"]` |
| `BETWEEN` | Between two values | `"1000"` (use highValue too) |

### Association type IDs (common)

| From → To | Type ID | Label |
|-----------|---------|-------|
| Contact → Company | 1 | Primary company |
| Company → Contact | 2 | — |
| Deal → Contact | 3 | — |
| Contact → Deal | 4 | — |
| Deal → Company | 5 | — |
| Company → Deal | 6 | — |
| Ticket → Contact | 15 | — |
| Ticket → Company | 26 | — |

Use `HUBSPOT_DEFINED` as the `--category` for these standard types.

## Pagination

List commands support cursor-based pagination:

```bash
# First page (default limit: 100)
hubspot contacts list --limit 10

# Next page — use the `after` value from paging.next.after
hubspot contacts list --limit 10 --after "cursor_from_previous_response"
```

**To paginate through all results:**
```bash
# Page 1
hubspot contacts list --limit 100
# → Check response for paging.next.after

# Page 2
hubspot contacts list --limit 100 --after "<cursor>"
# → Repeat until no paging.next in response
```

## MCP Server (for Claude, Cursor, VS Code, OpenClaw)

The CLI includes a built-in MCP server exposing all 55 commands as tools:

```bash
# Start the MCP server
hubspot mcp
```

### MCP Config

```json
{
  "mcpServers": {
    "hubspot": {
      "command": "npx",
      "args": ["hubspot-cli", "mcp"],
      "env": {
        "HUBSPOT_ACCESS_TOKEN": "pat-na1-xxxxx"
      }
    }
  }
}
```

Or with a local install:
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

### MCP Tool Names

All tools are named `{group}_{subcommand}`:
- `contacts_list`, `contacts_get`, `contacts_create`, `contacts_search`, ...
- `deals_create`, `deals_update`, `deals_search`, ...
- `associations_create`, `associations_list`, ...
- `search_search` (universal search)
- `engagements_create_note`, `engagements_create_call`, ...

## Tips for AI Agents

1. **Always use `--help`** on a group before guessing subcommand names
2. **Parse JSON output** directly — it's the default format, compact, one line
3. **Check exit codes** — 0 means success, 1 means error
4. **Required options** are enforced with clear error messages before API calls
5. **Rate limits** are handled automatically (100 req/10s for private apps) with exponential backoff
6. **Use `--fields`** to reduce output size — supports nested paths like `properties.email`
7. **Use `--quiet`** when you only care about success/failure
8. **Use `--pretty`** only when displaying to a human
9. **Always specify `--properties`** on list/get/search to control which fields come back — HubSpot returns minimal properties by default
10. **Use `search run`** for cross-object-type searches — one command works for all 9 object types
11. **Use `--filter` with JSON** for precise queries — `--query` does fuzzy text search only
12. **Look up pipeline stages first** before creating deals — `dealstage` requires a stage ID, not a name
13. **Associate after creating** — creating a contact doesn't auto-link to a company. Use `associations create` explicitly
14. **Properties are inside `properties` object** — to access email, read `result.properties.email`, not `result.email`
15. **Delete is soft-delete (archive)** — objects can be restored in HubSpot UI after archiving
