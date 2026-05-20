interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * NIH Clinical Tables Search Service MCP.
 */


const BASE = 'https://clinicaltables.nlm.nih.gov/api';
const UA = 'pipeworx-mcp-clinicaltables/1.0 (+https://pipeworx.io)';

const tableMap: Record<string, string> = {
  conditions: 'conditions/v3/search',
  icd10cm: 'icd10cm/v3/search',
  icd9cm: 'icd9cm_dx/v3/search',
  procedures: 'procedures/v3/search',
  drugs: 'rxterms/v3/search',
  loinc: 'loinc_items/v3/search',
  npi_individual: 'npi_idv/v3/search',
  npi_organization: 'npi_org/v3/search',
  ucum: 'ucum/v3/search',
  disease_names: 'disease_names/v3/search',
};

const shape = {
  type: 'object' as const,
  properties: {
    terms: { type: 'string' as const },
    count: { type: 'number' as const },
    ef: { type: 'string' as const },
    df: { type: 'string' as const },
  },
  required: ['terms'] as const,
};

const tools: McpToolExport['tools'] = Object.keys(tableMap).map((k) => ({
  name: k,
  description: `Search NLM ${k} table.`,
  inputSchema: shape,
}));

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const path = tableMap[name];
  if (!path) throw new Error(`Unknown tool: ${name}`);
  const terms = args.terms;
  if (typeof terms !== 'string' || !terms.trim()) throw new Error('Required argument "terms" is missing. Pass a string like "migraine".');
  const p = new URLSearchParams({ terms });
  if (args.count != null) p.set('count', String(args.count));
  if (args.ef) p.set('ef', String(args.ef));
  if (args.df) p.set('df', String(args.df));
  const res = await fetch(`${BASE}/${path}?${p}`, { headers: { Accept: 'application/json', 'User-Agent': UA } });
  if (!res.ok) throw new Error(`Clinical Tables: ${res.status}`);
  return res.json();
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
