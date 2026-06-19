import React from "react";

const COLORS = {
  key: "#a5b4fc",
  string: "#86efac",
  number: "#fdba74",
  boolean: "#93c5fd",
  null: "#fca5a5",
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
  lang?: "json" | "yaml";
}) {
  const nodes = lang === "yaml" ? highlightYaml(code) : highlightJson(code);
  return (
    <pre className="mono w-full min-h-[320px] p-4 text-sm whitespace-pre-wrap break-words leading-relaxed overflow-auto text-[var(--text-primary)]">
      {nodes}
    </pre>
  );
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
