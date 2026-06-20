/**
 * The six navigable sections. Index order matches hex wedge order
 * (wedge 0 = top). Each carries its own telemetry block so the corner
 * readouts can "reflect the section" as required by the brief.
 */

export type Section = {
  index: number;
  num: string; // "01".. used in labels
  id: string;
  label: string;
  /** One-line statement shown when a section is opened. */
  blurb: string;
  /** Short body copy for the minimal expanded content state. */
  body: string;
  /** Telemetry that updates as this section becomes active. */
  telemetry: {
    sys: string;
    vector: string;
    load: string; // e.g. "0.62"
    status: string;
  };
};

export const SECTIONS: Section[] = [
  {
    index: 0,
    num: "01",
    id: "ai",
    label: "AI",
    blurb: "Cognitive systems that hold their nerve under load.",
    body: "Reasoning, perception and control loops engineered for environments where latency is failure. We build models that are legible, bounded and accountable.",
    telemetry: { sys: "CORTEX", vector: "+038.2", load: "0.71", status: "NOMINAL" },
  },
  {
    index: 1,
    num: "02",
    id: "film",
    label: "FILM",
    blurb: "Cinematic pipelines for impossible images.",
    body: "Virtual production, real-time previsualization and physically-based rendering tooling for studios shipping at the edge of the frame rate.",
    telemetry: { sys: "AURA-7", vector: "-012.6", load: "0.44", status: "STREAM" },
  },
  {
    index: 2,
    num: "03",
    id: "technology",
    label: "TECHNOLOGY",
    blurb: "Mission-critical infrastructure for complex worlds.",
    body: "Deterministic runtimes, sensor fusion and the unglamorous plumbing that keeps autonomous systems honest when the network drops.",
    telemetry: { sys: "SPINE", vector: "+004.0", load: "0.88", status: "ARMED" },
  },
  {
    index: 3,
    num: "04",
    id: "about",
    label: "ABOUT",
    blurb: "Control is the future.",
    body: "CTRL Systems Inc. is a retro-futurist engineering house. We design instruments, not interfaces — tools that give operators authority over the systems they run.",
    telemetry: { sys: "ORIGIN", vector: "+000.0", load: "0.20", status: "STABLE" },
  },
  {
    index: 4,
    num: "05",
    id: "contact",
    label: "CONTACT",
    blurb: "Open a channel.",
    body: "Establish a link with mission operations. Procurement, partnership and press all route through a single secured relay.",
    telemetry: { sys: "RELAY", vector: "+021.7", load: "0.33", status: "OPEN" },
  },
  {
    index: 5,
    num: "06",
    id: "careers",
    label: "CAREERS",
    blurb: "Join the crew on console.",
    body: "We hire engineers, designers and operators who would rather build the instrument than read the dashboard. Remote-first, hardware-friendly.",
    telemetry: { sys: "ROSTER", vector: "-007.3", load: "0.56", status: "HIRING" },
  },
];

export const BRAND = {
  name: "CTRL SYSTEMS INC.",
  tagline: "CONTROL IS THE FUTURE.",
  motto: "ACCESS. ALIGN. ADVANCE.",
  sub: "Mission-critical systems for complex worlds.",
};
