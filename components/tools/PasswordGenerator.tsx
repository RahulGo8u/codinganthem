"use client";

import { useState, useCallback } from "react";
import { ToolShell } from "@/components/ToolShell";
import { getToolBySlug } from "@/lib/tools";
import { usePersistedState } from "@/lib/usePersistedState";

const tool = getToolBySlug("password-generator")!;

const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;':\",./<>?";

function getStrength(password: string): { label: string; color: string; width: string } {
  if (!password) return { label: "", color: "", width: "0%" };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { label: "Weak", color: "#ef4444", width: "25%" };
  if (score <= 4) return { label: "Fair", color: "#f59e0b", width: "50%" };
  if (score <= 5) return { label: "Good", color: "#6366f1", width: "75%" };
  return { label: "Strong", color: "#22c55e", width: "100%" };
}

export function PasswordGenerator() {
  const [length, setLength] = usePersistedState("ca_pref_password_length", 16);
  const [useUpper, setUseUpper] = usePersistedState("ca_pref_password_upper", true);
  const [useLower, setUseLower] = usePersistedState("ca_pref_password_lower", true);
  const [useNumbers, setUseNumbers] = usePersistedState("ca_pref_password_numbers", true);
  const [useSymbols, setUseSymbols] = usePersistedState("ca_pref_password_symbols", true);
  const [count, setCount] = useState(1);
  const [output, setOutput] = useState("");

  const generate = useCallback(() => {
    let charset = "";
    if (useUpper) charset += UPPERCASE;
    if (useLower) charset += LOWERCASE;
    if (useNumbers) charset += NUMBERS;
    if (useSymbols) charset += SYMBOLS;
    if (!charset) {
      setOutput("⚠ Select at least one character set (A–Z, a–z, 0–9, or !@#).");
      return;
    }

    const charsetSize = charset.length;
    // Rejection sampling: discard values in the biased tail so every
    // character in the charset has exactly equal probability of selection.
    const limit = Math.floor(0x100000000 / charsetSize) * charsetSize;
    function unbiasedChar(): string {
      const buf = new Uint32Array(1);
      let n: number;
      do {
        crypto.getRandomValues(buf);
        n = buf[0];
      } while (n >= limit);
      return charset[n % charsetSize];
    }

    const passwords = Array.from({ length: count }, () =>
      Array.from({ length }, unbiasedChar).join("")
    );
    setOutput(passwords.join("\n"));
  }, [length, useUpper, useLower, useNumbers, useSymbols, count]);

  const strength = getStrength(output.split("\n")[0] || "");

  return (
    <ToolShell
      tool={tool}
      input=""
      output={output}
      onInputChange={() => {}}
      hideFileActions
      hideInputPane
      outputLabel="Generated Passwords"
      outputPlaceholder="Click Generate to create passwords..."
      options={
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-[var(--text-muted)] text-xs">
            Length
            <input
              type="range"
              min={4}
              max={128}
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-24 accent-[#6366f1]"
            />
            <span className="w-6 text-[var(--text-primary)]">{length}</span>
          </label>
          <label className="flex items-center gap-2 text-[var(--text-muted)] text-xs">
            Count
            <input
              type="number"
              min={1}
              max={50}
              value={count}
              onChange={(e) => setCount(Math.min(50, Math.max(1, Number(e.target.value))))}
              className="w-14 bg-[var(--bg-elevated)] border border-[var(--border)] rounded px-2 py-1 text-xs text-[var(--text-primary)]"
            />
          </label>
          {[
            { label: "A–Z", state: useUpper, set: setUseUpper },
            { label: "a–z", state: useLower, set: setUseLower },
            { label: "0–9", state: useNumbers, set: setUseNumbers },
            { label: "!@#", state: useSymbols, set: setUseSymbols },
          ].map(({ label, state, set }) => (
            <label key={label} className="flex items-center gap-1.5 text-[var(--text-muted)] text-xs cursor-pointer select-none">
              <input
                type="checkbox"
                checked={state}
                onChange={(e) => set(e.target.checked)}
                className="accent-[#6366f1]"
              />
              {label}
            </label>
          ))}
          <button
            onClick={generate}
            className="px-4 py-1.5 rounded-lg text-xs font-medium bg-[#6366f1]/15 border border-[#6366f1]/40 text-[#6366f1] hover:bg-[#6366f1]/25 transition-colors"
          >
            Generate
          </button>
        </div>
      }
      extraActions={
        <button
          onClick={() => {
            setOutput("");
            setCount(1);
            setLength(16);
            setUseUpper(true);
            setUseLower(true);
            setUseNumbers(true);
            setUseSymbols(true);
          }}
          disabled={!output}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[#ef4444]/40 bg-[#ef4444]/10 text-[#ef4444] hover:bg-[#ef4444]/20 hover:border-[#ef4444]/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Clear
        </button>
      }
      outputContent={
        output ? (
          <div className="flex flex-col gap-3">
            {/* Strength indicator */}
            {count === 1 && strength.label && (
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: strength.width, backgroundColor: strength.color }}
                  />
                </div>
                <span className="text-xs font-medium" style={{ color: strength.color }}>
                  {strength.label}
                </span>
              </div>
            )}
            <pre className="mono text-sm text-[var(--text-primary)] whitespace-pre-wrap break-all leading-relaxed">
              {output}
            </pre>
          </div>
        ) : (
          <p className="text-[var(--text-muted)] text-sm">Click Generate to create passwords...</p>
        )
      }
    />
  );
}
