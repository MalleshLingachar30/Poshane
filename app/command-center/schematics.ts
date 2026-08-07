/* ============================================================================
   SYSTEM SCHEMATICS — the diagram set, in presentation order.

   The documents themselves live in public/schematics/, cut from the source
   sheets in schematics-src/ by scripts/split-schematics.mjs. This file is only
   the running order and the labels the console shows for them.

   Ordering is deliberate and is NOT the diagram numbering. The numbering is the
   specification's, which groups by section (§2, §3 …); a room being walked
   through the system for the first time needs the narrative instead. So the
   animation opens — it is the whole story in nine steps with no jargon — then
   structure, then identity, then the four data flows, then the controls that
   sit around them. `no` keeps the specification's label visible so anyone
   holding the written spec can still follow along.
   ==========================================================================*/

export type SchematicGroup = "Walkthrough" | "Structure" | "Identity" | "Data Flows" | "Controls";

export interface Schematic {
  id: string;
  /** Specification's own diagram label, e.g. "D7". Empty for the animation. */
  no: string;
  /** Short label for the horizontal strip — kept tight so the strip stays scannable. */
  label: string;
  /** Full heading shown above the diagram. */
  title: string;
  /** Specification cross-reference, shown beside the title. */
  ref: string;
  /** One line on what the diagram answers — the presenter's cue. */
  cue: string;
  group: SchematicGroup;
}

export const SCHEMATICS: Schematic[] = [
  {
    id: "flow",
    no: "▶",
    label: "Parcel → Evidence",
    title: "How a parcel becomes evidence",
    ref: "Animated walkthrough · 9 steps · English / ಕನ್ನಡ",
    cue: "The whole data flow in nine plain-language steps — from an officer walking a boundary to a number nobody can dispute. Use the Play button, or the arrow keys inside the frame.",
    group: "Walkthrough",
  },

  {
    id: "d1",
    no: "D1",
    label: "System Context",
    title: "System Context",
    ref: "Specification §2",
    cue: "Who sits outside the platform boundary, and what crosses it.",
    group: "Structure",
  },
  {
    id: "d2",
    no: "D2",
    label: "Layered Architecture",
    title: "Layered Architecture",
    ref: "Specification §3",
    cue: "The stack from field device to data store, and what each layer is responsible for.",
    group: "Structure",
  },
  {
    id: "d3",
    no: "D3",
    label: "Command Hierarchy",
    title: "Command Hierarchy & Escalation",
    ref: "Specification §4",
    cue: "Who reports to whom, and the path an unresolved issue takes upward.",
    group: "Structure",
  },

  {
    id: "d4",
    no: "D4",
    label: "Parcel Identity",
    title: "Parcel Identity & the Tag Lifecycle",
    ref: "Specification §5",
    cue: "Location ID as the durable identity of a place; Batch ID as a planting event at it.",
    group: "Identity",
  },
  {
    id: "d5",
    no: "D5",
    label: "Parcel Lifecycle",
    title: "Land Parcel Lifecycle & the Approval Gate",
    ref: "Specification §6",
    cue: "The state machine. Nothing can be planted against a parcel that has not cleared state 8.",
    group: "Identity",
  },
  {
    id: "d6",
    no: "D6",
    label: "Data Entry Points",
    title: "Data Entry Points & the Two-Cadre Segregation",
    ref: "Specification §7",
    cue: "All fifteen ways data enters, and the two separately constituted cadres that keep entry honest.",
    group: "Identity",
  },

  {
    id: "d7",
    no: "D7",
    label: "Flow A · Land → Approval",
    title: "Flow A — Land identification to planting approval",
    ref: "Specification §8.1",
    cue: "How a candidate site travels from identification to a sanctioned, plantable parcel.",
    group: "Data Flows",
  },
  {
    id: "d8",
    no: "D8",
    label: "Flow B · Planting → Survival",
    title: "Flow B — Planting to survival assurance",
    ref: "Specification §8.2",
    cue: "From the planting event to an authoritative survival census carrying an audit co-signature.",
    group: "Data Flows",
  },
  {
    id: "d9",
    no: "D9",
    label: "Flow C/D · Audit & Remote Sensing",
    title: "Flow C — Audit & rectification · Flow D — Remote-sensing corroboration",
    ref: "Specification §8.3 · §8.4",
    cue: "How a finding becomes a rectification, and how satellite imagery corroborates without ever overriding the ground count.",
    group: "Data Flows",
  },
  {
    id: "d12",
    no: "D12",
    label: "Offline-First Field Ops",
    title: "Offline-first field operation",
    ref: "Specification §11",
    cue: "What the field device does with no network, and how it reconciles when the network returns.",
    group: "Data Flows",
  },

  {
    id: "d10",
    no: "D10",
    label: "Role-Based Access",
    title: "Role-Based Access Control — Two Axes, One Permission",
    ref: "Specification §9",
    cue: "Permission as role × scope × record state, and the six rules that make self-approval structurally impossible.",
    group: "Controls",
  },
  {
    id: "d11",
    no: "D11",
    label: "Financial Boundary",
    title: "The Financial Boundary — No Funds Transit the Platform",
    ref: "Specification §10",
    cue: "What sits inside the platform and what deliberately does not. No money moves through it.",
    group: "Controls",
  },
  {
    id: "d13",
    no: "D13",
    label: "Audit Log",
    title: "Audit Log & the Evidential Chain",
    ref: "Specification §12",
    cue: "Write-once records and the chain that makes an entry defensible years later.",
    group: "Controls",
  },
  {
    id: "d14",
    no: "D14",
    label: "Deployment & Ownership",
    title: "Deployment, Hosting & Data Ownership",
    ref: "Specification §13",
    cue: "Where the data lives, who owns it, and what happens at the end of the engagement.",
    group: "Controls",
  },
  {
    id: "d15",
    no: "D15",
    label: "Conceptual Data Model",
    title: "Conceptual Data Model — Parcel and Location ID as the Spine",
    ref: "Specification §14",
    cue: "The entities and their cardinalities, hung off Location ID.",
    group: "Controls",
  },
];

export const SCHEMATIC_GROUPS: SchematicGroup[] = [
  "Walkthrough",
  "Structure",
  "Identity",
  "Data Flows",
  "Controls",
];

export const schematicSrc = (id: string) => `/schematics/${id}.html`;
