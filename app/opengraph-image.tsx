import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
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

        {/* Logotype */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 0,
            marginBottom: 24,
          }}
        >
          <span
            style={{
              fontSize: 80,
              fontWeight: 700,
              color: "#6366f1",
              letterSpacing: "-2px",
            }}
          >
            coding
          </span>
          <span
            style={{
              fontSize: 80,
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-2px",
            }}
          >
            anthem
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            color: "#a1a1aa",
            fontWeight: 400,
            letterSpacing: "0px",
            marginBottom: 48,
          }}
        >
          Free Online Developer Utilities &amp; Tools
        </div>

        {/* Tool pills */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            justifyContent: "center",
            maxWidth: 900,
          }}
        >
          {[
            "JSON Formatter",
            "Base64",
            "UUID Generator",
            "Password Generator",
            "Hash Generator",
            "Timestamp Converter",
            "Color Converter",
            "Regex Tester",
            "Case Converter",
            "Text Compare",
          ].map((name) => (
            <div
              key={name}
              style={{
                background: "rgba(99,102,241,0.12)",
                border: "1px solid rgba(99,102,241,0.3)",
                borderRadius: 8,
                padding: "6px 14px",
                fontSize: 16,
                color: "#a5b4fc",
                fontWeight: 500,
              }}
            >
              {name}
            </div>
          ))}
        </div>

        {/* URL */}
        <div
          style={{
            position: "absolute",
            bottom: 36,
            fontSize: 18,
            color: "#52525b",
            letterSpacing: "0.5px",
          }}
        >
          www.codinganthem.com
        </div>
      </div>
    ),
    { ...size }
  );
}
