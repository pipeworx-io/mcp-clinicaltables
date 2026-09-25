# @pipeworx/clinicaltables

[NIH Clinical Tables Search Service](https://clinicaltables.nlm.nih.gov/) MCP — keyless autocomplete-style search across NLM/NIH clinical tables.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1683+ live data sources.

## Tools

- `conditions(terms, count?, ef?, df?)` — UMLS conditions
- `icd10cm(terms, count?, ef?, df?)` — ICD-10-CM diagnosis codes
- `icd9cm(terms, count?, ef?, df?)` — ICD-9-CM diagnosis codes
- `procedures(terms, count?, ef?, df?)` — UMLS procedures
- `drugs(terms, count?, ef?, df?)` — drug names (RxTerms)
- `loinc(terms, count?, ef?, df?)` — LOINC codes
- `npi_individual(terms, count?, ef?, df?)` — NPI individual providers
- `npi_organization(terms, count?, ef?, df?)` — NPI organizations
- `ucum(terms, count?, ef?, df?)` — UCUM units of measure
- `disease_names(terms, count?, ef?, df?)` — disease vocab

`ef`: extra fields returned (comma-sep). `df`: display fields. `count`: max results (default 7).

## Data source

`https://clinicaltables.nlm.nih.gov/api`

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "clinicaltables": {
      "url": "https://gateway.pipeworx.io/clinicaltables/mcp"
    }
  }
}
```

### What this endpoint actually serves

`tools/list` at `https://gateway.pipeworx.io/clinicaltables/mcp` returns the tools in the table
above **plus the shared Pipeworx meta-tools** — `ask_pipeworx`,
`discover_tools`, `search_within`, `remember`/`recall` and the rest of the
gateway-wide set. So the tool count you see is larger than this table: a
single-pack endpoint currently lists roughly 30 shared tools alongside the
pack's own. The connection's `initialize` response states its exact scope, and
is the authoritative answer for a given day.

This is deliberate, not multiplexing by accident. The meta-tools are what let a
scoped connection answer a question this pack does not cover — via
`ask_pipeworx`, which routes across the whole catalog — without you adding a
second MCP server. There is currently no way to mount a pack endpoint without
them; if the extra schemas cost you more context than the routing is worth,
connect to the full gateway once rather than to several pack endpoints.

Or connect to the full Pipeworx gateway to get every pack's tools listed
directly, instead of just this one's:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

Both URLs reach the same gateway and the same 1683+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## No MCP client? Call it over HTTP

```bash
curl -X POST https://gateway.pipeworx.io/v1/tools/conditions \
  -H 'Content-Type: application/json' \
  -d '{"terms":"migraine","count":3}'
```

No account needed for the first calls. Inspect any tool: `GET https://gateway.pipeworx.io/v1/tools/conditions`. Find one: `POST https://gateway.pipeworx.io/v1/tools/search_packs` with `{"query":"..."}`.

## Standalone (no gateway account)

This package also runs as a local stdio MCP server — no Pipeworx account, no
gateway round-trip:

```json
{
  "mcpServers": {
    "clinicaltables": {
      "command": "npx",
      "args": ["-y", "@pipeworx/mcp-clinicaltables"]
    }
  }
}
```

Or run it directly to confirm it starts:

```bash
npx -y @pipeworx/mcp-clinicaltables
```

It speaks MCP over stdin/stdout and answers `initialize`/`tools/list`/`tools/call`
for **only** this pack's tools — none of the shared meta-tools the gateway
connection above adds. Same source, same tools, no ask_pipeworx routing.

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English —
this works on the pack endpoint above as well as on the full gateway:

```
ask_pipeworx({ question: "your question about Clinicaltables data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
