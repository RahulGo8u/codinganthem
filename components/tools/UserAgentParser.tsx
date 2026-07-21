"use client";

import { useState, useEffect, useMemo } from "react";
import { ToolShell } from "@/components/ToolShell";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("user-agent-parser")!;

const SAMPLE =
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36";

interface ParsedUA {
  browser: string;
  browserVersion: string;
  engine: string;
  os: string;
  osVersion: string;
  device: string;
}

function parseUserAgent(ua: string): ParsedUA {
  let browser = "Unknown";
  let browserVersion = "";
  let engine = "Unknown";

  if (/Edg\//.test(ua)) {
    browser = "Microsoft Edge";
    browserVersion = ua.match(/Edg\/([\d.]+)/)?.[1] ?? "";
    engine = "Blink";
  } else if (/OPR\//.test(ua) || /\bOpera\b/.test(ua)) {
    browser = "Opera";
    browserVersion = ua.match(/OPR\/([\d.]+)/)?.[1] ?? ua.match(/Opera\/([\d.]+)/)?.[1] ?? "";
    engine = "Blink";
  } else if (/CriOS\//.test(ua)) {
    browser = "Chrome (iOS)";
    browserVersion = ua.match(/CriOS\/([\d.]+)/)?.[1] ?? "";
    engine = "WebKit";
  } else if (/FxiOS\//.test(ua)) {
    browser = "Firefox (iOS)";
    browserVersion = ua.match(/FxiOS\/([\d.]+)/)?.[1] ?? "";
    engine = "WebKit";
  } else if (/Firefox\//.test(ua)) {
    browser = "Firefox";
    browserVersion = ua.match(/Firefox\/([\d.]+)/)?.[1] ?? "";
    engine = "Gecko";
  } else if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) {
    browser = "Chrome";
    browserVersion = ua.match(/Chrome\/([\d.]+)/)?.[1] ?? "";
    engine = "Blink";
  } else if (/Safari\//.test(ua) && /Version\//.test(ua)) {
    browser = "Safari";
    browserVersion = ua.match(/Version\/([\d.]+)/)?.[1] ?? "";
    engine = "WebKit";
  } else if (/MSIE |Trident\//.test(ua)) {
    browser = "Internet Explorer";
    browserVersion = ua.match(/MSIE ([\d.]+)/)?.[1] ?? ua.match(/rv:([\d.]+)/)?.[1] ?? "";
    engine = "Trident";
  }

  let os = "Unknown";
  let osVersion = "";
  const ntMatch = ua.match(/Windows NT ([\d.]+)/);
  const macMatch = ua.match(/Mac OS X ([\d_.]+)/);
  const iosMatch = ua.match(/OS ([\d_]+) like Mac OS X/);
  const androidMatch = ua.match(/Android ([\d.]+)/);

  if (ntMatch) {
    os = "Windows";
    const ntVersionMap: Record<string, string> = {
      "10.0": "10 / 11",
      "6.3": "8.1",
      "6.2": "8",
      "6.1": "7",
      "6.0": "Vista",
      "5.1": "XP",
    };
    osVersion = ntVersionMap[ntMatch[1]] ?? ntMatch[1];
  } else if (/iPhone|iPad|iPod/.test(ua)) {
    os = "iOS";
    osVersion = iosMatch?.[1]?.replace(/_/g, ".") ?? "";
  } else if (macMatch) {
    os = "macOS";
    osVersion = macMatch[1].replace(/_/g, ".");
  } else if (androidMatch) {
    os = "Android";
    osVersion = androidMatch[1];
  } else if (/CrOS/.test(ua)) {
    os = "Chrome OS";
  } else if (/Linux/.test(ua)) {
    os = "Linux";
  }

  let device = "Desktop";
  if (/iPad/.test(ua) || (/Android/.test(ua) && !/Mobile/.test(ua)) || /Tablet/.test(ua)) {
    device = "Tablet";
  } else if (/Mobile|iPhone|iPod|Android/.test(ua)) {
    device = "Mobile";
  }

  return { browser, browserVersion, engine, os, osVersion, device };
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] last:border-b-0">
      <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">{label}</span>
      <span className="text-sm text-[var(--text-primary)] font-medium">{value || "—"}</span>
    </div>
  );
}

export function UserAgentParser() {
  const [input, setInput] = useState("");

  useEffect(() => {
    if (typeof navigator !== "undefined") setInput(navigator.userAgent);
  }, []);

  const parsed = useMemo(() => (input.trim() ? parseUserAgent(input) : null), [input]);

  const summary = parsed
    ? [
        `Browser: ${parsed.browser} ${parsed.browserVersion}`,
        `Engine: ${parsed.engine}`,
        `OS: ${parsed.os} ${parsed.osVersion}`,
        `Device: ${parsed.device}`,
      ].join("\n")
    : "";

  return (
    <ToolShell
      tool={tool}
      input={input}
      output={summary}
      onInputChange={setInput}
      hideFileActions
      showClear
      inputLabel="User-Agent String"
      outputLabel="Parsed Details"
      inputPlaceholder="Paste a User-Agent string, or your browser's is loaded by default..."
      badges={<span className="badge badge-neutral">Client-side</span>}
      extraActions={
        <button
          onClick={() => setInput(SAMPLE)}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
        >
          Load sample
        </button>
      }
      outputContent={
        parsed ? (
          <div className="p-4">
            <div className="result-card !p-0 flex flex-col overflow-hidden">
              <InfoRow label="Browser" value={`${parsed.browser} ${parsed.browserVersion}`.trim()} />
              <InfoRow label="Rendering Engine" value={parsed.engine} />
              <InfoRow label="Operating System" value={`${parsed.os} ${parsed.osVersion}`.trim()} />
              <InfoRow label="Device Type" value={parsed.device} />
            </div>
          </div>
        ) : (
          <p className="p-4 text-[var(--text-muted)] text-sm">Parsed details will appear here...</p>
        )
      }
    />
  );
}
