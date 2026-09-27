export type SchemaFormat =
  | "json-schema"
  | "openai"
  | "anthropic"
  | "gemini"
  | "typescript"
  | "zod"
  | "python";

export interface SchemaBuildOptions {
  title: string;
  description: string;
  functionName: string;
  detectFormats: boolean;
  requireProperties: boolean;
  rejectExtraProperties: boolean;
}

export const SCHEMA_SAMPLE = `{
  "id": "8c1b7e4a-2f3d-4a9b-9c1e-0a1b2c3d4e5f",
  "email": "ada@example.com",
  "profileUrl": "https://example.com/ada",
  "joined": "2026-09-27T14:30:00Z",
  "birthDate": "1990-04-12",
  "plan": "pro",
  "seats": 3,
  "active": true,
  "tags": ["billing", "priority"],
  "address": {
    "city": "London",
    "postalCode": "SW1A 1AA"
  }
}`;

type SchemaNode = {
  type?: string;
  format?: string;
  properties?: Record<string, SchemaNode>;
  required?: string[];
  items?: SchemaNode;
  additionalProperties?: false;
  anyOf?: SchemaNode[];
  title?: string;
  description?: string;
  $schema?: string;
};

const EMPTY_ITEMS: SchemaNode = {};

export function friendlyJsonError(err: unknown, input: string): string {
  const msg = err instanceof Error ? err.message : "Invalid JSON";
  const match = /position\s+(\d+)/i.exec(msg);
  if (!match) return msg.includes("JSON") ? msg : `Invalid JSON: ${msg}`;
  const pos = Number(match[1]);
  let line = 1;
  let col = 1;
  for (let i = 0; i < pos && i < input.length; i++) {
    if (input[i] === "\n") {
      line++;
      col = 1;
    } else {
      col++;
    }
  }
  return `Invalid JSON at line ${line}, column ${col}. ${msg}`;
}

export function sanitizeFunctionName(value: string): string {
  const cleaned = value
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
  const lowered = cleaned.replace(/^[^a-zA-Z]+/, "");
  return lowered || "submit_data";
}

export function buildSchemaArtifact(
  value: unknown,
  format: SchemaFormat,
  options: SchemaBuildOptions
): { code: string; filename: string } {
  const title = options.title.trim() || "Root";
  const description = options.description.trim();
  const functionName = sanitizeFunctionName(options.functionName);
  const inferred = inferValue(value, options);
  const parameters = asObjectParameters(inferred, options);

  if (format === "json-schema") {
    const schema: SchemaNode = {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      title,
      ...(description ? { description } : {}),
      ...inferred,
    };
    return { code: JSON.stringify(schema, null, 2), filename: "schema.json" };
  }

  if (format === "openai") {
    return {
      code: JSON.stringify(
        {
          type: "function",
          function: {
            name: functionName,
            description: description || `Call ${functionName} with the generated arguments.`,
            strict: true,
            parameters: strictify(parameters),
          },
        },
        null,
        2
      ),
      filename: "openai-tool.json",
    };
  }

  if (format === "anthropic") {
    return {
      code: JSON.stringify(
        {
          name: functionName,
          description: description || `Call ${functionName} with the generated input.`,
          input_schema: parameters,
        },
        null,
        2
      ),
      filename: "anthropic-tool.json",
    };
  }

  if (format === "gemini") {
    return {
      code: JSON.stringify(
        {
          name: functionName,
          description: description || `Call ${functionName} with the generated parameters.`,
          parameters,
        },
        null,
        2
      ),
      filename: "gemini-tool.json",
    };
  }

  if (format === "typescript") {
    return { code: emitTypeScript(parameters, title), filename: "schema.ts" };
  }

  if (format === "zod") {
    return { code: emitZod(parameters, title), filename: "schema.ts" };
  }

  return { code: emitPython(parameters, title), filename: "schema.py" };
}

function asObjectParameters(node: SchemaNode, options: SchemaBuildOptions): SchemaNode {
  if (node.type === "object") return node;
  const wrapped: SchemaNode = {
    type: "object",
    properties: { value: node },
    required: ["value"],
  };
  if (options.rejectExtraProperties) wrapped.additionalProperties = false;
  return wrapped;
}

function strictify(node: SchemaNode): SchemaNode {
  const copy: SchemaNode = { ...node };
  if (copy.properties) {
    copy.properties = Object.fromEntries(
      Object.entries(copy.properties).map(([key, child]) => [key, strictify(child)])
    );
    copy.required = Object.keys(copy.properties);
    copy.additionalProperties = false;
  }
  if (copy.items && Object.keys(copy.items).length > 0) copy.items = strictify(copy.items);
  if (copy.anyOf) copy.anyOf = copy.anyOf.map(strictify);
  return copy;
}

function inferValue(value: unknown, options: SchemaBuildOptions): SchemaNode {
  if (value === null) return { type: "null" };
  if (Array.isArray(value)) return inferArray(value, options);
  if (typeof value === "object") return inferObject(value as Record<string, unknown>, options);
  if (typeof value === "string") return inferString(value, options.detectFormats);
  if (typeof value === "boolean") return { type: "boolean" };
  if (typeof value === "number") return { type: Number.isInteger(value) ? "integer" : "number" };
  return {};
}

function inferArray(values: unknown[], options: SchemaBuildOptions): SchemaNode {
  if (values.length === 0) return { type: "array", items: EMPTY_ITEMS };
  return { type: "array", items: inferValues(values, options) };
}

function inferValues(values: unknown[], options: SchemaBuildOptions): SchemaNode {
  if (
    values.length > 0 &&
    values.every((value) => isPlainObject(value))
  ) {
    return inferObject(mergeObjectSamples(values as Record<string, unknown>[]), options, values as Record<string, unknown>[]);
  }
  return combine(values.map((value) => inferValue(value, options)));
}

function inferObject(
  sample: Record<string, unknown>,
  options: SchemaBuildOptions,
  samples: Record<string, unknown>[] = [sample]
): SchemaNode {
  const keys = Object.keys(sample);
  const properties: Record<string, SchemaNode> = {};
  const required: string[] = [];

  for (const key of keys) {
    const present = samples.filter((item) => Object.prototype.hasOwnProperty.call(item, key));
    properties[key] = inferValues(present.map((item) => item[key]), options);
    if (options.requireProperties && present.length === samples.length) required.push(key);
  }

  const node: SchemaNode = { type: "object", properties };
  if (required.length > 0) node.required = required;
  if (options.rejectExtraProperties) node.additionalProperties = false;
  return node;
}

function mergeObjectSamples(samples: Record<string, unknown>[]): Record<string, unknown> {
  const merged: Record<string, unknown> = {};
  for (const sample of samples) Object.assign(merged, sample);
  return merged;
}

function inferString(value: string, detectFormats: boolean): SchemaNode {
  const node: SchemaNode = { type: "string" };
  if (!detectFormats) return node;
  const format = detectStringFormat(value);
  if (format) node.format = format;
  return node;
}

export function detectStringFormat(value: string): string | undefined {
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
    return "uuid";
  }
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "email";
  if (/^https?:\/\/\S+$/i.test(value)) return "uri";
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value)) {
    return "date-time";
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return "date";
  return undefined;
}

function combine(nodes: SchemaNode[]): SchemaNode {
  const unique: SchemaNode[] = [];
  const seen = new Set<string>();
  for (const node of nodes) {
    const key = JSON.stringify(node);
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(node);
  }
  if (unique.length === 1) return unique[0];
  return { anyOf: unique };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function pascalCase(value: string): string {
  const parts = value.replace(/[^a-zA-Z0-9]+/g, " ").trim().split(/\s+/).filter(Boolean);
  const name = parts.map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("");
  return /^[A-Za-z]/.test(name) ? name : `Schema${name || "Value"}`;
}

function safeKey(key: string): string {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key) ? key : JSON.stringify(key);
}

function emitTypeScript(root: SchemaNode, title: string): string {
  const blocks: string[] = [];
  const used = new Set<string>();
  const typeName = tsType(root, pascalCase(title), blocks, used);
  if (!blocks.some((block) => block.includes(`interface ${typeName} `) || block.startsWith(`export type ${typeName} `))) {
    blocks.push(`export type ${pascalCase(title)} = ${typeName};`);
  }
  return blocks.join("\n\n") + "\n";
}

function tsType(node: SchemaNode, name: string, blocks: string[], used: Set<string>): string {
  if (node.anyOf) return node.anyOf.map((child) => tsType(child, name, blocks, used)).join(" | ");
  if (node.type === "object" && node.properties) {
    let iface = pascalCase(name);
    while (used.has(iface)) iface += "Value";
    used.add(iface);
    const lines = [`export interface ${iface} {`];
    for (const [key, child] of Object.entries(node.properties)) {
      const optional = !node.required?.includes(key);
      const childType = tsType(child, key, blocks, used);
      if (child.format) lines.push(`  /** format: ${child.format} */`);
      lines.push(`  ${safeKey(key)}${optional ? "?" : ""}: ${childType};`);
    }
    lines.push("}");
    blocks.push(lines.join("\n"));
    return iface;
  }
  if (node.type === "array") {
    const item = node.items && Object.keys(node.items).length > 0 ? tsType(node.items, `${name}Item`, blocks, used) : "unknown";
    return `${item}[]`;
  }
  if (node.type === "integer" || node.type === "number") return "number";
  if (node.type === "boolean") return "boolean";
  if (node.type === "string") return "string";
  if (node.type === "null") return "null";
  return "unknown";
}

function emitZod(root: SchemaNode, title: string): string {
  const blocks: string[] = [`import { z } from "zod";`];
  const used = new Set<string>();
  const rootName = `${pascalCase(title)}Schema`;
  const expr = zodExpr(root, pascalCase(title), blocks, used);
  if (expr === rootName) {
    const index = blocks.findIndex((block) => block.startsWith(`const ${rootName} =`));
    if (index >= 0) blocks[index] = blocks[index].replace(`const ${rootName}`, `export const ${rootName}`);
  } else {
    blocks.push(`export const ${rootName} = ${expr};`);
  }
  blocks.push(`export type ${pascalCase(title)} = z.infer<typeof ${rootName}>;`);
  return blocks.join("\n\n") + "\n";
}

function zodExpr(node: SchemaNode, name: string, blocks: string[], used: Set<string>): string {
  if (node.anyOf) {
    const members = node.anyOf.map((child) => zodExpr(child, name, blocks, used));
    return `z.union([${members.join(", ")}])`;
  }
  if (node.type === "object" && node.properties) {
    let schemaName = `${pascalCase(name)}Schema`;
    while (used.has(schemaName)) schemaName += "Value";
    used.add(schemaName);
    const fields = Object.entries(node.properties).map(([key, child]) => {
      let expr = zodExpr(child, key, blocks, used);
      if (!node.required?.includes(key)) expr += ".optional()";
      return `  ${safeKey(key)}: ${expr},`;
    });
    const strict = node.additionalProperties === false ? ".strict()" : "";
    blocks.push(`const ${schemaName} = z.object({\n${fields.join("\n")}\n})${strict};`);
    return schemaName;
  }
  if (node.type === "array") {
    const item = node.items && Object.keys(node.items).length > 0 ? zodExpr(node.items, `${name}Item`, blocks, used) : "z.unknown()";
    return `z.array(${item})`;
  }
  if (node.type === "integer") return "z.number().int()";
  if (node.type === "number") return "z.number()";
  if (node.type === "boolean") return "z.boolean()";
  if (node.type === "null") return "z.null()";
  if (node.type === "string") {
    if (node.format === "email") return "z.string().email()";
    if (node.format === "uuid") return "z.string().uuid()";
    if (node.format === "uri") return "z.string().url()";
    if (node.format === "date-time") return "z.string().datetime()";
    if (node.format === "date") return "z.string().regex(/^\\d{4}-\\d{2}-\\d{2}$/)";
    return "z.string()";
  }
  return "z.unknown()";
}

function emitPython(root: SchemaNode, title: string): string {
  const blocks: string[] = ["from typing import Any, NotRequired, TypedDict"];
  const used = new Set<string>();
  const typeName = pythonType(root, pascalCase(title), blocks, used);
  if (typeName !== pascalCase(title)) {
    blocks.push(`${pascalCase(title)} = ${typeName}`);
  }
  return blocks.join("\n\n") + "\n";
}

function pythonType(node: SchemaNode, name: string, blocks: string[], used: Set<string>): string {
  if (node.anyOf) return node.anyOf.map((child) => pythonType(child, name, blocks, used)).join(" | ");
  if (node.type === "object" && node.properties) {
    let className = pascalCase(name);
    while (used.has(className)) className += "Value";
    used.add(className);
    const lines = [`class ${className}(TypedDict):`];
    const entries = Object.entries(node.properties);
    if (entries.length === 0) lines.push("    pass");
    for (const [key, child] of entries) {
      let typeName = pythonType(child, key, blocks, used);
      if (!node.required?.includes(key)) typeName = `NotRequired[${typeName}]`;
      const comment = child.format ? `  # format: ${child.format}` : "";
      lines.push(`    ${/^[A-Za-z_][A-Za-z0-9_]*$/.test(key) ? key : JSON.stringify(key)}: ${typeName}${comment}`);
    }
    blocks.push(lines.join("\n"));
    return className;
  }
  if (node.type === "array") {
    const item = node.items && Object.keys(node.items).length > 0 ? pythonType(node.items, `${name}Item`, blocks, used) : "Any";
    return `list[${item}]`;
  }
  if (node.type === "integer") return "int";
  if (node.type === "number") return "float";
  if (node.type === "boolean") return "bool";
  if (node.type === "string") return "str";
  if (node.type === "null") return "None";
  return "Any";
}
