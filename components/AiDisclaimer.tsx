import { Sparkles } from "lucide-react";

/**
 * Shared disclaimer shown alongside every AI tool's output. Consistent with
 * the "signature is NOT verified" caveat already used on the JWT Decoder —
 * sets expectations and reduces confusion/liability when the model gets
 * something wrong.
 */
export function AiDisclaimer() {
  return (
    <div className="flex items-start gap-2 text-[11px] text-[var(--text-muted)] leading-relaxed">
      <Sparkles size={12} className="shrink-0 mt-0.5" />
      <span>AI-generated — always verify before using in production.</span>
    </div>
  );
}
