import React from "react";

const COLORS = {
  key: "var(--syntax-key)",
  string: "var(--syntax-string)",
  number: "var(--syntax-number)",
  boolean: "var(--syntax-boolean)",
  null: "var(--syntax-null)",
  punct: "var(--text-muted)",
};

/**
 * Tokenize a JSON string into colored spans for display in a <pre> block.
 * Returns plain React nodes — safe (no dangerouslySetInnerHTML).
 */
export function highlightJson(json: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // string (with optional trailing colon = key) | boolean | null | number
  const regex =
    /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false)\b|\b(null)\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let k = 0;

  while ((match = regex.exec(json)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(
        <span key={k++} style={{ color: COLORS.punct }}>
          {json.slice(lastIndex, match.index)}
        </span>
      );
    }
    const [full, str, colon, bool, nul, num] = match;
    if (str !== undefined) {
      if (colon) {
        nodes.push(
          <span key={k++} style={{ color: COLORS.key }}>{str}</span>
        );
        nodes.push(
          <span key={k++} style={{ color: COLORS.punct }}>{colon}</span>
        );
      } else {
        nodes.push(
          <span key={k++} style={{ color: COLORS.string }}>{str}</span>
        );
      }
    } else if (bool !== undefined) {
      nodes.push(<span key={k++} style={{ color: COLORS.boolean }}>{full}</span>);
    } else if (nul !== undefined) {
      nodes.push(<span key={k++} style={{ color: COLORS.null }}>{full}</span>);
    } else if (num !== undefined) {
      nodes.push(<span key={k++} style={{ color: COLORS.number }}>{full}</span>);
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < json.length) {
    nodes.push(
      <span key={k++} style={{ color: COLORS.punct }}>
        {json.slice(lastIndex)}
      </span>
    );
  }
  return nodes;
}

/**
 * Read-only highlighted code pane for use as a ToolShell `outputContent`.
 */
export function HighlightedOutput({
  code,
  lang = "json",
}: {
  code: string;
  lang?: "json" | "yaml" | "xml" | "css" | "js" | "sql";
}) {
  const nodes =
    lang === "yaml" ? highlightYaml(code) :
    lang === "xml" ? highlightXml(code) :
    lang === "css" ? highlightCss(code) :
    lang === "js" ? highlightJs(code) :
    lang === "sql" ? highlightSql(code) :
    highlightJson(code);
  return (
    <pre className="mono w-full min-h-[320px] p-4 text-sm whitespace-pre-wrap break-words leading-relaxed overflow-auto text-[var(--text-primary)]">
      {nodes}
    </pre>
  );
}

const XML_REGEX = new RegExp(
  `(<!--[\\s\\S]*?-->)` + // 1: comment
    `|(<!\\[CDATA\\[[\\s\\S]*?\\]\\]>)` + // 2: CDATA
    `|(<\\?[\\s\\S]*?\\?>)` + // 3: declaration / processing instruction
    `|(<[^>]+>)`, // 4: tag (opening, closing, or self-closing)
  "g"
);

const XML_TAG_TOKEN_REGEX = /(<\/?)([\w:.-]+)|([\w:.-]+)(=)("[^"]*"|'[^']*')|(\/?>)/g;

function highlightXmlTag(tag: string, key: number): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;

  XML_TAG_TOKEN_REGEX.lastIndex = 0;
  while ((m = XML_TAG_TOKEN_REGEX.exec(tag)) !== null) {
    if (m.index > last) {
      parts.push(<span key={`${key}-t${i++}`} style={{ color: COLORS.punct }}>{tag.slice(last, m.index)}</span>);
    }
    const [, bracket, tagName, attrName, equals, attrValue, closeBracket] = m;
    if (tagName !== undefined) {
      parts.push(<span key={`${key}-b${i++}`} style={{ color: COLORS.punct }}>{bracket}</span>);
      parts.push(<span key={`${key}-n${i++}`} style={{ color: COLORS.key }}>{tagName}</span>);
    } else if (attrName !== undefined) {
      parts.push(<span key={`${key}-a${i++}`} style={{ color: COLORS.boolean }}>{attrName}</span>);
      parts.push(<span key={`${key}-e${i++}`} style={{ color: COLORS.punct }}>{equals}</span>);
      parts.push(<span key={`${key}-v${i++}`} style={{ color: COLORS.string }}>{attrValue}</span>);
    } else if (closeBracket !== undefined) {
      parts.push(<span key={`${key}-c${i++}`} style={{ color: COLORS.punct }}>{closeBracket}</span>);
    }
    last = XML_TAG_TOKEN_REGEX.lastIndex;
    if (m[0].length === 0) XML_TAG_TOKEN_REGEX.lastIndex++;
  }
  if (last < tag.length) {
    parts.push(<span key={`${key}-tail`} style={{ color: COLORS.punct }}>{tag.slice(last)}</span>);
  }
  return <span key={key}>{parts}</span>;
}

/**
 * Tokenize XML markup into colored spans — tag names, attributes, attribute
 * values, comments, CDATA, and the XML declaration all get distinct colors.
 */
export function highlightXml(xml: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let k = 0;

  XML_REGEX.lastIndex = 0;
  while ((match = XML_REGEX.exec(xml)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(<span key={k++}>{xml.slice(lastIndex, match.index)}</span>);
    }
    const [full, comment, cdata, decl, tag] = match;
    if (comment !== undefined) {
      nodes.push(
        <span key={k++} style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
          {comment}
        </span>
      );
    } else if (cdata !== undefined) {
      nodes.push(<span key={k++} style={{ color: COLORS.string }}>{cdata}</span>);
    } else if (decl !== undefined) {
      nodes.push(<span key={k++} style={{ color: COLORS.number }}>{decl}</span>);
    } else if (tag !== undefined) {
      nodes.push(highlightXmlTag(tag, k++));
    } else {
      nodes.push(<span key={k++}>{full}</span>);
    }
    lastIndex = XML_REGEX.lastIndex;
    if (match[0].length === 0) XML_REGEX.lastIndex++;
  }

  if (lastIndex < xml.length) {
    nodes.push(<span key={k++}>{xml.slice(lastIndex)}</span>);
  }
  return nodes;
}

/**
 * Tokenize already-formatted (beautified) CSS line by line — selectors,
 * property names, values, and comments each get a distinct color. Assumes
 * one selector/declaration/brace per line, which matches js-beautify's output.
 */
export function highlightCss(css: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const lines = css.split("\n");
  let k = 0;

  lines.forEach((line, i) => {
    if (i > 0) nodes.push(<span key={`nl-${k++}`}>{"\n"}</span>);

    const commentMatch = line.match(/^(\s*)(\/\*[\s\S]*?\*\/)(\s*)$/);
    if (commentMatch) {
      const [, lead, comment, trail] = commentMatch;
      nodes.push(<span key={k++}>{lead}</span>);
      nodes.push(
        <span key={k++} style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
          {comment}
        </span>
      );
      nodes.push(<span key={k++}>{trail}</span>);
      return;
    }

    const selectorMatch = line.match(/^(\s*)([^{]+?)(\s*\{)\s*$/);
    if (selectorMatch) {
      const [, lead, selector, brace] = selectorMatch;
      nodes.push(<span key={k++}>{lead}</span>);
      nodes.push(<span key={k++} style={{ color: COLORS.key }}>{selector}</span>);
      nodes.push(<span key={k++} style={{ color: COLORS.punct }}>{brace}</span>);
      return;
    }

    const declMatch = line.match(/^(\s*)([a-zA-Z-][a-zA-Z0-9-]*)(\s*:\s*)([^;]+?)(;?)(\s*)$/);
    if (declMatch) {
      const [, lead, property, colon, value, semi, trail] = declMatch;
      nodes.push(<span key={k++}>{lead}</span>);
      nodes.push(<span key={k++} style={{ color: COLORS.boolean }}>{property}</span>);
      nodes.push(<span key={k++} style={{ color: COLORS.punct }}>{colon}</span>);
      nodes.push(<span key={k++} style={{ color: COLORS.string }}>{value}</span>);
      nodes.push(<span key={k++} style={{ color: COLORS.punct }}>{semi}</span>);
      nodes.push(<span key={k++}>{trail}</span>);
      return;
    }

    // Closing brace, blank line, or anything else — render as-is
    nodes.push(<span key={k++}>{line}</span>);
  });

  return nodes;
}

const JS_KEYWORDS = [
  "const", "let", "var", "function", "return", "if", "else", "for", "while", "do",
  "class", "new", "async", "await", "import", "export", "from", "default", "try",
  "catch", "finally", "throw", "typeof", "instanceof", "this", "extends", "super",
  "static", "get", "set", "yield", "of", "in", "switch", "case", "break", "continue",
  "null", "undefined", "true", "false", "void", "delete",
  // TypeScript-ish additions (JSON to TypeScript output reuses this same tokenizer)
  "interface", "type", "string", "number", "boolean", "unknown", "any", "readonly",
];

const JS_KEYWORD_PATTERN = [...JS_KEYWORDS]
  .sort((a, b) => b.length - a.length)
  .join("|");

const JS_REGEX = new RegExp(
  `(//[^\\n]*)` + // 1: line comment
    `|(/\\*[\\s\\S]*?\\*/)` + // 2: block comment
    `|('(?:\\\\.|[^'\\\\])*'|"(?:\\\\.|[^"\\\\])*"|\`(?:\\\\.|[^\`\\\\])*\`)` + // 3: string (single/double/template)
    `|\\b(${JS_KEYWORD_PATTERN})\\b` + // 4: keyword
    `|\\b(\\d+(?:\\.\\d+)?)\\b`, // 5: number
  "g"
);

/**
 * Tokenize JavaScript (and TypeScript-interface-shaped) code into colored
 * spans — keywords, strings, comments, and numbers each get a distinct
 * color. Approximate, not a full parser — good enough for formatted output.
 */
export function highlightJs(code: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let k = 0;

  JS_REGEX.lastIndex = 0;
  while ((match = JS_REGEX.exec(code)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(<span key={k++}>{code.slice(lastIndex, match.index)}</span>);
    }
    const [full, lineComment, blockComment, str, keyword, num] = match;
    if (lineComment !== undefined || blockComment !== undefined) {
      nodes.push(
        <span key={k++} style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
          {full}
        </span>
      );
    } else if (str !== undefined) {
      nodes.push(<span key={k++} style={{ color: COLORS.string }}>{str}</span>);
    } else if (keyword !== undefined) {
      nodes.push(<span key={k++} style={{ color: COLORS.boolean }}>{full}</span>);
    } else if (num !== undefined) {
      nodes.push(<span key={k++} style={{ color: COLORS.number }}>{full}</span>);
    } else {
      nodes.push(<span key={k++}>{full}</span>);
    }
    lastIndex = JS_REGEX.lastIndex;
    if (match[0].length === 0) JS_REGEX.lastIndex++;
  }

  if (lastIndex < code.length) {
    nodes.push(<span key={k++}>{code.slice(lastIndex)}</span>);
  }
  return nodes;
}

const SQL_KEYWORDS = [
  "SELECT", "FROM", "WHERE", "INSERT", "INTO", "VALUES", "UPDATE", "SET", "DELETE",
  "CREATE", "TABLE", "ALTER", "DROP", "JOIN", "INNER", "LEFT", "RIGHT", "OUTER", "FULL",
  "ON", "GROUP", "BY", "ORDER", "HAVING", "LIMIT", "OFFSET", "AND", "OR", "NOT", "NULL",
  "IS", "IN", "LIKE", "BETWEEN", "AS", "DISTINCT", "UNION", "ALL", "CASE", "WHEN", "THEN",
  "ELSE", "END", "EXISTS", "PRIMARY", "KEY", "FOREIGN", "REFERENCES", "DEFAULT", "UNIQUE",
  "INDEX", "VIEW", "WITH", "ASC", "DESC", "COUNT", "SUM", "AVG", "MIN", "MAX",
];

const SQL_KEYWORD_PATTERN = [...SQL_KEYWORDS]
  .sort((a, b) => b.length - a.length)
  .join("|");

const SQL_REGEX = new RegExp(
  `(--[^\\n]*)` + // 1: line comment
    `|(/\\*[\\s\\S]*?\\*/)` + // 2: block comment
    `|('(?:''|[^'])*')` + // 3: string ('' = escaped quote)
    `|\\b(${SQL_KEYWORD_PATTERN})\\b` + // 4: keyword
    `|\\b(\\d+(?:\\.\\d+)?)\\b`, // 5: number
  "gi"
);

/**
 * Tokenize SQL into colored spans — keywords (case-insensitive), strings,
 * comments, and numbers each get a distinct color.
 */
export function highlightSql(sql: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let k = 0;

  SQL_REGEX.lastIndex = 0;
  while ((match = SQL_REGEX.exec(sql)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(<span key={k++}>{sql.slice(lastIndex, match.index)}</span>);
    }
    const [full, lineComment, blockComment, str, keyword, num] = match;
    if (lineComment !== undefined || blockComment !== undefined) {
      nodes.push(
        <span key={k++} style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
          {full}
        </span>
      );
    } else if (str !== undefined) {
      nodes.push(<span key={k++} style={{ color: COLORS.string }}>{str}</span>);
    } else if (keyword !== undefined) {
      nodes.push(<span key={k++} style={{ color: COLORS.boolean }}>{full}</span>);
    } else if (num !== undefined) {
      nodes.push(<span key={k++} style={{ color: COLORS.number }}>{full}</span>);
    } else {
      nodes.push(<span key={k++}>{full}</span>);
    }
    lastIndex = SQL_REGEX.lastIndex;
    if (match[0].length === 0) SQL_REGEX.lastIndex++;
  }

  if (lastIndex < sql.length) {
    nodes.push(<span key={k++}>{sql.slice(lastIndex)}</span>);
  }
  return nodes;
}

const MERMAID_KEYWORDS = [
  "flowchart", "graph", "sequenceDiagram", "classDiagram", "erDiagram", "gantt",
  "stateDiagram-v2", "stateDiagram", "pie", "journey", "gitGraph", "mindmap", "timeline",
  "participant", "actor", "class", "section", "subgraph", "end", "title", "dateFormat",
  "loop", "alt", "else", "opt", "par", "and", "note", "over", "activate", "deactivate",
  "rect", "autonumber", "state", "direction",
  "TD", "TB", "LR", "RL", "BT",
];

const MERMAID_KEYWORD_PATTERN = [...MERMAID_KEYWORDS]
  .sort((a, b) => b.length - a.length)
  .map((k) => k.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"))
  .join("|");

const MERMAID_REGEX = new RegExp(
  `(%%[^\\n]*)` + // 1: comment
    `|(\\|[^|\\n]*\\|)` + // 2: edge label
    `|("[^"]*")` + // 3: quoted string
    `|\\b(${MERMAID_KEYWORD_PATTERN})\\b` + // 4: keyword
    `|([-.=<|][-.=<>|ox{}*]*)`, // 5: arrow / connector
  "g"
);

const MERMAID_ARROW_COLOR = "#f472b6";

/**
 * Tokenize Mermaid diagram syntax into colored spans for a live-typed editor
 * overlay. Approximate, not a full grammar — good enough for readability.
 */
export function highlightMermaid(code: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let k = 0;

  MERMAID_REGEX.lastIndex = 0;
  while ((match = MERMAID_REGEX.exec(code)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(<span key={k++}>{code.slice(lastIndex, match.index)}</span>);
    }
    const [full, comment, label, str, keyword, arrow] = match;
    if (comment !== undefined) {
      nodes.push(
        <span key={k++} style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
          {comment}
        </span>
      );
    } else if (label !== undefined) {
      nodes.push(<span key={k++} style={{ color: COLORS.string }}>{label}</span>);
    } else if (str !== undefined) {
      nodes.push(<span key={k++} style={{ color: COLORS.string }}>{str}</span>);
    } else if (keyword !== undefined) {
      nodes.push(<span key={k++} style={{ color: COLORS.key, fontWeight: 600 }}>{keyword}</span>);
    } else if (arrow !== undefined) {
      nodes.push(<span key={k++} style={{ color: MERMAID_ARROW_COLOR }}>{arrow}</span>);
    } else {
      nodes.push(<span key={k++}>{full}</span>);
    }
    lastIndex = MERMAID_REGEX.lastIndex;
    if (match[0].length === 0) MERMAID_REGEX.lastIndex++;
  }

  if (lastIndex < code.length) {
    nodes.push(<span key={k++}>{code.slice(lastIndex)}</span>);
  }
  return nodes;
}

function yamlValueColor(v: string): string {
  const t = v.trim();
  if (t === "") return COLORS.punct;
  if (/^-?\d+(\.\d+)?$/.test(t)) return COLORS.number;
  if (/^(true|false)$/i.test(t)) return COLORS.boolean;
  if (/^(null|~)$/i.test(t)) return COLORS.null;
  return COLORS.string;
}

/**
 * Highlight a YAML document line by line — keys, scalars, list markers, comments.
 */
export function highlightYaml(yaml: string): React.ReactNode[] {
  const lines = yaml.split("\n");
  const out: React.ReactNode[] = [];

  lines.forEach((line, i) => {
    const indentMatch = line.match(/^(\s*)/);
    const indent = indentMatch ? indentMatch[1] : "";
    let content = line.slice(indent.length);
    const parts: React.ReactNode[] = [];
    let k = 0;

    if (indent) parts.push(<span key={k++}>{indent}</span>);

    if (content.startsWith("#")) {
      parts.push(
        <span key={k++} style={{ color: COLORS.punct }}>{content}</span>
      );
    } else {
      if (content.startsWith("- ")) {
        parts.push(
          <span key={k++} style={{ color: COLORS.punct }}>{"- "}</span>
        );
        content = content.slice(2);
      }
      const kv = content.match(/^([^:]+)(:\s*)(.*)$/);
      if (kv) {
        parts.push(<span key={k++} style={{ color: COLORS.key }}>{kv[1]}</span>);
        parts.push(<span key={k++} style={{ color: COLORS.punct }}>{kv[2]}</span>);
        if (kv[3]) {
          parts.push(
            <span key={k++} style={{ color: yamlValueColor(kv[3]) }}>{kv[3]}</span>
          );
        }
      } else if (content) {
        parts.push(
          <span key={k++} style={{ color: yamlValueColor(content) }}>{content}</span>
        );
      }
    }

    out.push(<span key={`line-${i}`}>{parts}</span>);
    if (i < lines.length - 1) out.push("\n");
  });

  return out;
}
