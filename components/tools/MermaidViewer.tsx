"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTheme } from "next-themes";
import { ToolShell } from "@/components/ToolShell";
import { HighlightedTextarea } from "@/components/HighlightedTextarea";
import { highlightMermaid } from "@/lib/highlight";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("mermaid-viewer")!;

const EXAMPLES: Record<string, string> = {
  flowchart: `flowchart TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> B
    C --> E[Ship it]`,
  sequence: `sequenceDiagram
    participant Client
    participant Server
    participant Database
    Client->>Server: POST /login
    Server->>Database: Verify credentials
    Database-->>Server: User record
    Server-->>Client: 200 OK + token`,
  er: `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE_ITEM : contains
    CUSTOMER {
        string name
        string email
    }
    ORDER {
        int orderId
        date orderDate
    }`,
  class: `classDiagram
    class Animal {
        +String name
        +int age
        +makeSound()
    }
    class Dog {
        +fetch()
    }
    class Cat {
        +scratch()
    }
    Animal <|-- Dog
    Animal <|-- Cat`,
  gantt: `gantt
    title Project Timeline
    dateFormat  YYYY-MM-DD
    section Design
    Wireframes       :done, des1, 2026-01-01, 5d
    Mockups          :active, des2, after des1, 5d
    section Development
    Backend API      :dev1, after des2, 10d
    Frontend UI      :dev2, after des2, 10d
    section Launch
    QA Testing       :test1, after dev1, 5d
    Release          :milestone, after test1, 0d`,
};

type MermaidTheme = "dark" | "default";

let lastInitializedTheme: MermaidTheme | null = null;

async function renderMermaid(code: string, id: string, themeName: MermaidTheme) {
  const { default: mermaid } = await import("mermaid");
  if (lastInitializedTheme !== themeName) {
    mermaid.initialize({ startOnLoad: false, theme: themeName, securityLevel: "strict" });
    lastInitializedTheme = themeName;
  }
  return mermaid.render(id, code);
}

function cleanMermaidError(message: string): string {
  const lines = message
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !/^-+\^?$/.test(l));
  return lines.slice(0, 2).join(" — ") || "Invalid Mermaid syntax.";
}

const MIN_SCALE = 0.2;
const MAX_SCALE = 5;

interface FullscreenDocument extends Document {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void>;
}

interface FullscreenElement extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void>;
}

export function MermaidViewer() {
  const [input, setInput] = useState(EXAMPLES.flowchart);
  const [selectedExample, setSelectedExample] = useState("flowchart");
  const [svg, setSvg] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { resolvedTheme } = useTheme();
  const mermaidTheme: MermaidTheme = resolvedTheme === "light" ? "default" : "dark";

  const reqRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  const resetView = useCallback(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    if (!input.trim()) {
      setSvg("");
      setError(undefined);
      return;
    }
    let cancelled = false;
    const id = ++reqRef.current;
    const renderId = `mermaid-diagram-${id}`;

    renderMermaid(input, renderId, mermaidTheme)
      .then(({ svg: rendered }) => {
        if (cancelled || id !== reqRef.current) return;
        setSvg(rendered);
        setError(undefined);
        resetView();
      })
      .catch((e: unknown) => {
        if (cancelled || id !== reqRef.current) return;
        setSvg("");
        setError(cleanMermaidError((e as Error).message ?? "Invalid Mermaid syntax."));
      })
      .finally(() => {
        // mermaid.render can leave a detached error node behind on failure
        document.getElementById(`d${renderId}`)?.remove();
      });

    return () => {
      cancelled = true;
    };
  }, [input, resetView, mermaidTheme]);

  // Non-passive wheel listener so preventDefault actually stops page scroll while zooming
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
      setScale((s) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, s * factor)));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      setTranslate({ x: dragStartRef.current.tx + dx, y: dragStartRef.current.ty + dy });
    };
    const onUp = () => setIsDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 || !svg) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY, tx: translate.x, ty: translate.y };
  };

  // Keep isFullscreen in sync even when exited via the browser's native Escape handling
  useEffect(() => {
    const onFullscreenChange = () => {
      const doc = document as FullscreenDocument;
      setIsFullscreen(Boolean(document.fullscreenElement || doc.webkitFullscreenElement));
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("webkitfullscreenchange", onFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", onFullscreenChange);
    };
  }, []);

  const toggleFullscreen = useCallback(() => {
    const doc = document as FullscreenDocument;
    const el = containerRef.current as FullscreenElement | null;
    const currentlyFullscreen = Boolean(document.fullscreenElement || doc.webkitFullscreenElement);

    if (currentlyFullscreen) {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (doc.webkitExitFullscreen) doc.webkitExitFullscreen();
    } else if (el) {
      if (el.requestFullscreen) el.requestFullscreen();
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    }
  }, []);

  const handleDownloadSvg = useCallback(() => {
    if (!svg) return;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "diagram.svg";
    a.click();
    URL.revokeObjectURL(url);
  }, [svg]);

  return (
    <ToolShell
      tool={tool}
      input={input}
      output={svg}
      onInputChange={setInput}
      error={error}
      hideDownload
      inputLabel="Mermaid Syntax"
      outputLabel="Preview"
      inputPlaceholder={"flowchart TD\n    A[Start] --> B[End]"}
      outputPlaceholder="Diagram will appear here..."
      inputContent={
        <HighlightedTextarea
          value={input}
          onChange={setInput}
          highlight={highlightMermaid}
          placeholder={"flowchart TD\n    A[Start] --> B[End]"}
        />
      }
      options={
        <label className="flex items-center gap-2 text-[var(--text-muted)] text-xs">
          Examples
          <select
            value={selectedExample}
            onChange={(e) => {
              const key = e.target.value;
              setSelectedExample(key);
              if (EXAMPLES[key]) setInput(EXAMPLES[key]);
            }}
            className="px-2 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-xs text-[var(--text-primary)] focus:outline-none cursor-pointer"
          >
            <option value="flowchart">Flowchart</option>
            <option value="sequence">Sequence Diagram</option>
            <option value="er">ER Diagram</option>
            <option value="class">Class Diagram</option>
            <option value="gantt">Gantt Chart</option>
          </select>
        </label>
      }
      extraActions={
        <>
          <button
            onClick={() => {
              setSelectedExample("flowchart");
              setInput(EXAMPLES.flowchart);
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            Load sample
          </button>
          <button
            onClick={handleDownloadSvg}
            disabled={!svg}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Download SVG
          </button>
        </>
      }
      outputContent={
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          className={`relative w-full min-h-[320px] h-full overflow-hidden flex items-center justify-center ${
            svg ? (isDragging ? "cursor-grabbing" : "cursor-grab") : ""
          } select-none ${isFullscreen ? "bg-[var(--bg-base)]" : ""}`}
        >
          {svg && (
            <div
              onMouseDown={(e) => e.stopPropagation()}
              className="absolute top-2 right-2 z-10 flex flex-col gap-1"
            >
              <button
                onClick={toggleFullscreen}
                className="w-7 h-7 flex items-center justify-center rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm hover:bg-[var(--border)] transition-colors"
                title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="4 14 10 14 10 20" />
                    <polyline points="20 10 14 10 14 4" />
                    <line x1="14" y1="10" x2="21" y2="3" />
                    <line x1="3" y1="21" x2="10" y2="14" />
                  </svg>
                ) : (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 3 21 3 21 9" />
                    <polyline points="9 21 3 21 3 15" />
                    <line x1="21" y1="3" x2="14" y2="10" />
                    <line x1="3" y1="21" x2="10" y2="14" />
                  </svg>
                )}
              </button>
              <button
                onClick={() => setScale((s) => Math.min(MAX_SCALE, s * 1.2))}
                className="w-7 h-7 flex items-center justify-center rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm hover:bg-[var(--border)] transition-colors text-sm"
                title="Zoom in"
              >
                +
              </button>
              <button
                onClick={() => setScale((s) => Math.max(MIN_SCALE, s / 1.2))}
                className="w-7 h-7 flex items-center justify-center rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm hover:bg-[var(--border)] transition-colors text-sm"
                title="Zoom out"
              >
                −
              </button>
              <button
                onClick={resetView}
                className="w-7 h-7 flex items-center justify-center rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm hover:bg-[var(--border)] transition-colors text-[10px]"
                title="Reset zoom"
              >
                ⟲
              </button>
            </div>
          )}

          {svg ? (
            <div
              style={{
                transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
                transition: isDragging ? "none" : "transform 100ms ease-out",
              }}
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          ) : (
            <p className="p-4 text-[var(--text-muted)] text-sm">
              {error ? "" : "Diagram will appear here..."}
            </p>
          )}
        </div>
      }
    />
  );
}
