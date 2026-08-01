import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SponsoredNodeProps {
  /** Optional live ad unit (AdSense/Amazon/mobile SDK view). Falls back to a placeholder. */
  children?: ReactNode;
  title?: string;
  /** Reserved height in px for the ad slot — prevents layout shift when the unit loads. */
  slotHeight?: number;
  className?: string;
}

/**
 * Aetheric Sponsored Node — a dark-academia, frosted-glass ad placement container
 * with golden glowing borders. Structured so any standard banner unit can be
 * dropped in as children without disrupting the surrounding layout.
 */
const SponsoredNode = ({
  children,
  title = "Aetheric Sponsored Node",
  slotHeight = 100,
  className,
}: SponsoredNodeProps) => {
  const [active, setActive] = useState(true);

  return (
    <section
      aria-label="Sponsored content"
      className={cn("px-4 mb-6 animate-fade-in", className)}
    >
      <div
        className="relative rounded-2xl border border-gold/25 bg-obsidian/70 backdrop-blur-xl overflow-hidden"
        style={{ boxShadow: "0 0 30px -12px hsl(var(--gold) / 0.45), inset 0 1px 0 hsl(var(--gold) / 0.12)" }}
      >
        {/* Ambient gold wash */}
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(120% 80% at 50% -20%, hsl(var(--gold) / 0.14), transparent 70%)",
          }}
        />

        {/* Header */}
        <header className="relative flex items-center justify-between gap-3 px-4 py-3 border-b border-gold/15">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="h-1.5 w-1.5 rounded-full bg-gold shadow-[0_0_10px_hsl(var(--gold))]" />
            <h2 className="truncate text-[11px] sm:text-xs font-medium uppercase tracking-[0.22em] text-gold">
              {title}
            </h2>
          </div>

          {/* Status toggle */}
          <button
            type="button"
            onClick={() => setActive((v) => !v)}
            aria-pressed={active}
            className="group flex items-center gap-2 rounded-full border border-gold/25 bg-gold/5 px-2.5 py-1 transition-colors hover:bg-gold/10"
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full transition-all",
                active
                  ? "bg-gold-glow shadow-[0_0_8px_hsl(var(--gold-glow))] animate-pulse"
                  : "bg-gold-muted/50"
              )}
            />
            <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.16em] text-gold-muted whitespace-nowrap">
              Ad Stream: {active ? "Active" : "Ready for Review"}
            </span>
          </button>
        </header>

        {/* Ad slot */}
        <div
          className="relative flex w-full items-center justify-center overflow-hidden px-3 py-3"
          style={{ minHeight: slotHeight }}
        >
          {children ?? (
            <div
              className="flex w-full items-center justify-center rounded-xl border border-dashed border-gold/20 bg-gold/[0.03]"
              style={{ minHeight: slotHeight - 8 }}
            >
              <span className="text-[10px] uppercase tracking-[0.28em] text-gold-muted/60">
                {active ? "Transmission Slot" : "Standby"}
              </span>
            </div>
          )}
        </div>

        {/* Foot rule */}
        <div className="relative h-px w-full bg-gradient-to-r from-transparent via-gold/35 to-transparent" />
      </div>
    </section>
  );
};

export default SponsoredNode;
