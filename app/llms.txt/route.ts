import {
  tools,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  sortToolsByName,
  isClientSideOnly,
} from "@/lib/tools";

// Generated from lib/tools.ts so it can never go stale or misstate a tool's
// data-flow — the single source of truth stays lib/tools.ts. Served at /llms.txt
// per the llms.txt convention for AI crawlers.
export const dynamic = "force-static";

const BASE = "https://www.codinganthem.com";

function buildLlmsTxt(): string {
  const lines: string[] = [];

  lines.push("# CodingAnthem");
  lines.push("");
  lines.push("> Fast, free developer tools for your browser and AI workflows.");
  lines.push("");
  lines.push(
    `CodingAnthem ([${BASE}](${BASE})) is a collection of free developer utilities built for developers and AI-assisted workflows. Most tools run entirely client-side; a few (like the URL Shortener and the AI tools) send input to a backend or third-party API to work. No sign-up required.`
  );
  lines.push("");

  for (const category of CATEGORY_ORDER) {
    const inCategory = sortToolsByName(
      tools.filter((t) => t.category === category)
    );
    if (inCategory.length === 0) continue;

    lines.push(`## ${CATEGORY_LABELS[category]}`);
    lines.push("");
    for (const tool of inCategory) {
      const note = isClientSideOnly(tool)
        ? ""
        : " (sends input to a server/API)";
      const url = `${BASE}/tools/${tool.slug}`;
      lines.push(`- [${tool.name}](${url}) — ${tool.description}${note}`);
    }
    lines.push("");
  }

  lines.push("## About");
  lines.push("");
  lines.push("- All tools are free and require no account or sign-up.");
  lines.push(
    "- Most tools process everything in the browser; nothing is sent to a server."
  );
  lines.push(
    `- Tools marked "(sends input to a server/API)" — the URL Shortener and AI tools — transmit your input to a backend or third-party API to function. See [Privacy](${BASE}/privacy) for details.`
  );
  lines.push(`- [About CodingAnthem](${BASE}/about)`);
  lines.push("- Built with Next.js and React.");
  lines.push(
    "- Source: [github.com/RahulGo8u/codinganthem](https://github.com/RahulGo8u/codinganthem)"
  );
  lines.push("");

  return lines.join("\n");
}

export function GET() {
  return new Response(buildLlmsTxt(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
