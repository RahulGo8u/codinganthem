import { ImageResponse } from "next/og";
import { getToolBySlug, CATEGORY_LABELS, tools } from "@/lib/tools";

// opengraph-image.tsx files default to the edge runtime unless overridden,
// and edge is incompatible with generateStaticParams below (edge routes run
// per-request, they can't be prerendered at build time). Explicitly opt into
// the Node.js runtime so all tool images are prerendered at build time.
export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return tools.map((tool) => ({ slug: tool.slug }));
}

export default async function ToolOgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  const name = tool?.name ?? "CodingAnthem";
  const category = tool ? CATEGORY_LABELS[tool.category] : "Developer Tools";

  return new ImageResponse(
    (
      <div
        style={{
          background: "#0a0a0a",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Subtle purple glow behind heading */}
        <div
          style={{
            position: "absolute",
            width: 600,
            height: 300,
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(99,102,241,0.18) 0%, transparent 70%)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -55%)",
          }}
        />

        {/* Category pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "rgba(99,102,241,0.12)",
            border: "1px solid rgba(99,102,241,0.3)",
            borderRadius: 999,
            padding: "8px 20px",
            fontSize: 22,
            color: "#a5b4fc",
            fontWeight: 500,
            marginBottom: 28,
            letterSpacing: "0.5px",
          }}
        >
          {category}
        </div>

        {/* Tool name */}
        <div
          style={{
            fontSize: name.length > 28 ? 56 : 72,
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "-1.5px",
            textAlign: "center",
            maxWidth: 1000,
            lineHeight: 1.15,
            padding: "0 40px",
          }}
        >
          {name}
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 26,
            color: "#a1a1aa",
            fontWeight: 400,
            marginTop: 28,
          }}
        >
          Free Online Tool · No Sign-Up Required
        </div>

        {/* Logotype + URL */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            display: "flex",
            alignItems: "baseline",
            gap: 0,
            fontSize: 22,
            fontWeight: 700,
          }}
        >
          <span style={{ color: "#6366f1" }}>coding</span>
          <span style={{ color: "#52525b" }}>anthem.com</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
