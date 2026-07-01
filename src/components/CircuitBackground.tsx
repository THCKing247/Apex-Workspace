'use client'

/**
 * CircuitBackground
 * -----------------
 * Renders an animated SVG circuit-trace overlay inside any .circuit-bg parent.
 * Mount it as the first child of any container that has position:relative.
 *
 * Color breakdown (all at very low opacity so content wins):
 *   Dominant: Apex blue  #5B9BFF  — main traces + most nodes
 *   Accent 1: Braik orange #FF7A33 — ~20% of nodes, select short traces
 *   Accent 2: Buildvance green #00C97A — ~15% of nodes, select short traces
 *
 * The SVG is 1400×900 stretched to 100%×100% so it tiles naturally on any
 * viewport size. Traces use stroke-dasharray animation defined in globals.css.
 */

export default function CircuitBackground() {
  return (
    <div className="circuit-overlay" aria-hidden="true">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1400 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ── Main blue horizontal + vertical traces ─────────────────────── */}
        <path
          className="trace-animated"
          d="M0,120 L340,120 L340,60 L780,60"
          fill="none" stroke="#5B9BFF" strokeWidth="1.2" opacity="0.18"
          style={{ animationDelay: '0s' }}
        />
        <path
          className="trace-animated-slow"
          d="M780,60 L780,220 L1100,220 L1100,80 L1400,80"
          fill="none" stroke="#5B9BFF" strokeWidth="1" opacity="0.14"
          style={{ animationDelay: '1.2s' }}
        />
        <path
          className="trace-animated-med"
          d="M0,340 L180,340 L180,240 L520,240 L520,380 L900,380"
          fill="none" stroke="#5B9BFF" strokeWidth="1.2" opacity="0.16"
          style={{ animationDelay: '0.6s' }}
        />
        <path
          className="trace-animated"
          d="M900,380 L900,280 L1240,280 L1240,420 L1400,420"
          fill="none" stroke="#5B9BFF" strokeWidth="1" opacity="0.12"
          style={{ animationDelay: '2s' }}
        />
        <path
          className="trace-animated-slow"
          d="M0,560 L440,560 L440,480 L700,480 L700,620 L1000,620"
          fill="none" stroke="#5B9BFF" strokeWidth="1.2" opacity="0.15"
          style={{ animationDelay: '0.4s' }}
        />
        <path
          className="trace-animated-med"
          d="M1000,620 L1000,520 L1400,520"
          fill="none" stroke="#5B9BFF" strokeWidth="1" opacity="0.13"
          style={{ animationDelay: '1.8s' }}
        />
        <path
          className="trace-animated"
          d="M220,900 L220,720 L560,720 L560,800 L860,800 L860,680 L1140,680 L1140,760 L1400,760"
          fill="none" stroke="#5B9BFF" strokeWidth="1" opacity="0.12"
          style={{ animationDelay: '1s' }}
        />
        {/* Verticals */}
        <path
          className="trace-animated-slow"
          d="M340,120 L340,340"
          fill="none" stroke="#5B9BFF" strokeWidth="1" opacity="0.1"
          style={{ animationDelay: '2.4s' }}
        />
        <path
          className="trace-animated-med"
          d="M700,480 L700,240"
          fill="none" stroke="#5B9BFF" strokeWidth="1" opacity="0.1"
          style={{ animationDelay: '0.8s' }}
        />
        <path
          className="trace-animated"
          d="M1100,220 L1100,520"
          fill="none" stroke="#5B9BFF" strokeWidth="1" opacity="0.1"
          style={{ animationDelay: '1.6s' }}
        />

        {/* ── Braik orange accent traces ─────────────────────────────────── */}
        <path
          className="trace-animated-med"
          d="M560,720 L560,620 L660,620"
          fill="none" stroke="#FF7A33" strokeWidth="1" opacity="0.16"
          style={{ animationDelay: '0.5s' }}
        />
        <path
          className="trace-animated-slow"
          d="M1240,280 L1240,180 L1400,180"
          fill="none" stroke="#FF7A33" strokeWidth="1" opacity="0.14"
          style={{ animationDelay: '2.2s' }}
        />
        <path
          className="trace-animated"
          d="M0,700 L100,700 L100,800"
          fill="none" stroke="#FF7A33" strokeWidth="1" opacity="0.12"
          style={{ animationDelay: '1.4s' }}
        />

        {/* ── Buildvance green accent traces ─────────────────────────────── */}
        <path
          className="trace-animated-slow"
          d="M440,560 L440,660 L280,660 L280,760"
          fill="none" stroke="#00C97A" strokeWidth="1" opacity="0.15"
          style={{ animationDelay: '1.8s' }}
        />
        <path
          className="trace-animated-med"
          d="M900,280 L800,280 L800,180 L1000,180"
          fill="none" stroke="#00C97A" strokeWidth="1" opacity="0.13"
          style={{ animationDelay: '0.3s' }}
        />

        {/* ── Blue junction nodes ────────────────────────────────────────── */}
        <circle className="node-pulse"      cx="340"  cy="120" r="3" fill="#5B9BFF" opacity="0.5"  style={{ animationDelay: '0s'   }} />
        <circle className="node-pulse-slow" cx="780"  cy="60"  r="3" fill="#5B9BFF" opacity="0.4"  style={{ animationDelay: '1s'   }} />
        <circle className="node-pulse"      cx="520"  cy="240" r="3" fill="#5B9BFF" opacity="0.45" style={{ animationDelay: '0.5s' }} />
        <circle className="node-pulse-slow" cx="900"  cy="380" r="3" fill="#5B9BFF" opacity="0.4"  style={{ animationDelay: '2s'   }} />
        <circle className="node-pulse"      cx="1100" cy="220" r="3" fill="#5B9BFF" opacity="0.45" style={{ animationDelay: '1.5s' }} />
        <circle className="node-pulse-slow" cx="700"  cy="480" r="3" fill="#5B9BFF" opacity="0.4"  style={{ animationDelay: '0.8s' }} />
        <circle className="node-pulse"      cx="1240" cy="280" r="3" fill="#5B9BFF" opacity="0.5"  style={{ animationDelay: '2.5s' }} />
        <circle className="node-pulse-slow" cx="860"  cy="680" r="3" fill="#5B9BFF" opacity="0.35" style={{ animationDelay: '1.2s' }} />
        <circle className="node-pulse"      cx="180"  cy="340" r="3" fill="#5B9BFF" opacity="0.4"  style={{ animationDelay: '3s'   }} />
        <circle className="node-pulse-slow" cx="1000" cy="620" r="3" fill="#5B9BFF" opacity="0.4"  style={{ animationDelay: '0.4s' }} />

        {/* ── Braik orange nodes ─────────────────────────────────────────── */}
        <circle className="node-pulse"      cx="560"  cy="620" r="3.5" fill="#FF7A33" opacity="0.55" style={{ animationDelay: '0.6s' }} />
        <circle className="node-pulse-slow" cx="1240" cy="180" r="3"   fill="#FF7A33" opacity="0.45" style={{ animationDelay: '1.8s' }} />
        <circle className="node-pulse"      cx="100"  cy="700" r="3"   fill="#FF7A33" opacity="0.5"  style={{ animationDelay: '2.8s' }} />
        <circle className="node-pulse-slow" cx="660"  cy="620" r="2.5" fill="#FF7A33" opacity="0.4"  style={{ animationDelay: '1.1s' }} />

        {/* ── Buildvance green nodes ─────────────────────────────────────── */}
        <circle className="node-pulse"      cx="440"  cy="660" r="3.5" fill="#00C97A" opacity="0.55" style={{ animationDelay: '0.9s' }} />
        <circle className="node-pulse-slow" cx="800"  cy="180" r="3"   fill="#00C97A" opacity="0.45" style={{ animationDelay: '2.1s' }} />
        <circle className="node-pulse"      cx="280"  cy="760" r="3"   fill="#00C97A" opacity="0.5"  style={{ animationDelay: '0.2s' }} />
        <circle className="node-pulse-slow" cx="1000" cy="180" r="2.5" fill="#00C97A" opacity="0.4"  style={{ animationDelay: '3.2s' }} />

        {/* ── Small SMD pad rectangles (adds PCB authenticity) ──────────── */}
        <rect x="337" y="57"  width="6" height="3" rx="1" fill="#5B9BFF" opacity="0.2"  />
        <rect x="777" y="57"  width="6" height="3" rx="1" fill="#5B9BFF" opacity="0.18" />
        <rect x="897" y="377" width="6" height="3" rx="1" fill="#5B9BFF" opacity="0.2"  />
        <rect x="557" y="617" width="3" height="6" rx="1" fill="#FF7A33" opacity="0.22" />
        <rect x="437" y="657" width="3" height="6" rx="1" fill="#00C97A" opacity="0.22" />
        <rect x="1097" y="217" width="6" height="3" rx="1" fill="#5B9BFF" opacity="0.18" />
        <rect x="697"  y="477" width="3" height="6" rx="1" fill="#5B9BFF" opacity="0.18" />
      </svg>
    </div>
  )
}
