"use client";

import { useState, useMemo, useSyncExternalStore } from "react";
import { ToolShell } from "@/components/ToolShell";
import { CopyButton } from "@/components/CopyButton";
import { getToolBySlug } from "@/lib/tools";

function subscribeNoop() {
  return () => {};
}

function getBrowserUa(): string {
  return navigator.userAgent;
}

function getServerUa(): string {
  return "";
}

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
  isBot: boolean;
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

  const isBot =
    /bot|crawler|spider|slurp|bingpreview|facebookexternalhit|linkedinbot|twitterbot|whatsapp|discordbot|semrush|ahrefs|petalbot/i.test(
      ua
    );

  return { browser, browserVersion, engine, os, osVersion, device, isBot };
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[var(--border)] last:border-b-0">
      <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
        {label}
      </span>
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-sm text-[var(--text-primary)] font-medium truncate">
          {value || "—"}
        </span>
        {value && <CopyButton value={value} compact label="Copy" />}
      </div>
    </div>
  );
}

export function UserAgentParser() {
  const browserUa = useSyncExternalStore(subscribeNoop, getBrowserUa, getServerUa);
  const [override, setOverride] = useState<string | null>(null);
  const input = override ?? browserUa;

  const parsed = useMemo(() => (input.trim() ? parseUserAgent(input) : null), [input]);

  const jsonExport = parsed
    ? JSON.stringify(
        {
          browser: `${parsed.browser} ${parsed.browserVersion}`.trim(),
          engine: parsed.engine,
          os: `${parsed.os} ${parsed.osVersion}`.trim(),
          device: parsed.device,
          isBot: parsed.isBot,
          userAgent: input.trim(),
        },
        null,
        2
      )
    : "";

  const summary = parsed
    ? [
        `Browser: ${parsed.browser} ${parsed.browserVersion}`,
        `Engine: ${parsed.engine}`,
        `OS: ${parsed.os} ${parsed.osVersion}`,
        `Device: ${parsed.device}`,
        `Bot: ${parsed.isBot ? "yes" : "no"}`,
      ].join("\n")
    : "";

  return (
    <ToolShell
      tool={tool}
      input={input}
      output={jsonExport || summary}
      onInputChange={setOverride}
      onClear={() => setOverride("")}
      hideFileActions
      showClear
      downloadFileName="user-agent.json"
      downloadMimeType="application/json"
      inputLabel="User-Agent String"
      outputLabel="Parsed Details"
      inputPlaceholder="Paste a User-Agent string, or your browser's is loaded by default..."
      extraActions={
        <>
          <button
            type="button"
            onClick={() => setOverride(SAMPLE)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            Load sample
          </button>
          <button
            type="button"
            onClick={() => setOverride(null)}
            disabled={!browserUa}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Reset to my browser
          </button>
        </>
      }
      outputContent={
        parsed ? (
          <div className="p-4 flex flex-col gap-3">
            <div className="result-card !p-0 flex flex-col overflow-hidden">
              <InfoRow
                label="Browser"
                value={`${parsed.browser} ${parsed.browserVersion}`.trim()}
              />
              <InfoRow label="Rendering Engine" value={parsed.engine} />
              <InfoRow
                label="Operating System"
                value={`${parsed.os} ${parsed.osVersion}`.trim()}
              />
              <InfoRow label="Device Type" value={parsed.device} />
              <InfoRow label="Likely bot" value={parsed.isBot ? "Yes" : "No"} />
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                Raw UA
              </span>
              <CopyButton value={input.trim()} compact label="Copy UA" />
            </div>
          </div>
        ) : (
          <p className="p-4 text-[var(--text-muted)] text-sm">Parsed details will appear here...</p>
        )
      }
    />
  );
}
