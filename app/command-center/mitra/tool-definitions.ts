import type { PoshaneMitraToolName } from "./types";

type JsonSchema = {
  type: string;
  properties?: Record<string, JsonSchema>;
  items?: JsonSchema;
  enum?: string[];
  required?: string[];
  additionalProperties?: boolean;
  description?: string;
};

export type RealtimeToolDefinition = {
  type: "function";
  name: PoshaneMitraToolName;
  description: string;
  parameters: JsonSchema;
};

const emptyParameters: JsonSchema = {
  type: "object",
  properties: {},
  additionalProperties: false,
};

const stringArray = (description: string): JsonSchema => ({
  type: "array",
  description,
  items: { type: "string" },
});

export const POSHANE_MITRA_TOOL_DEFINITIONS: RealtimeToolDefinition[] = [
  {
    type: "function",
    name: "poshane_get_project_brief",
    description:
      "Read the IAFT strategic framework submitted to KSLSA for project-level questions about Poshane, Greening Karnataka, five crore saplings, lake rejuvenation, constitutional context, IAFT role, planning principles, site selection, plantation models, nursery execution, after-care, survival standards, governance, monitoring, departmental convergence, digital platform, training, public awareness, farmer benefits, KAPY, tree patta, carbon, insurance, costing, or project approval status.",
    parameters: {
      type: "object",
      properties: {
        topic: {
          type: "string",
          enum: [
            "overview",
            "constitutional_context",
            "vision",
            "iaft",
            "planning_principles",
            "site_selection",
            "plantation_models",
            "nursery_execution",
            "aftercare_survival",
            "governance_monitoring",
            "department_convergence",
            "digital_platform",
            "training_awareness",
            "farmer_benefits",
            "costing",
            "conclusion",
          ],
          description: "Optional project brief topic to read.",
        },
        query: {
          type: "string",
          description: "User's natural-language project question or keywords.",
        },
      },
      additionalProperties: false,
    },
  },
  {
    type: "function",
    name: "poshane_get_state_overview",
    description:
      "Read state overview KPIs, map progress summary, lowest survival districts, alerts, and mock-data freshness.",
    parameters: emptyParameters,
  },
  {
    type: "function",
    name: "poshane_get_state_trends",
    description:
      "Read cumulative actual-versus-plan planting and survival-rate trend data.",
    parameters: {
      type: "object",
      properties: {
        chart: {
          type: "string",
          enum: ["planting", "survival", "both"],
          description: "Trend chart to return.",
        },
      },
      additionalProperties: false,
    },
  },
  {
    type: "function",
    name: "poshane_get_district_progress",
    description:
      "Read a Karnataka district drill-down including KPIs, land split, timeline, NGO partners, zone, and species.",
    parameters: {
      type: "object",
      properties: {
        district: { type: "string", description: "District name or code." },
        focus: {
          type: "string",
          enum: ["summary", "land_split", "timeline", "ngos", "species"],
        },
      },
      required: ["district"],
      additionalProperties: false,
    },
  },
  {
    type: "function",
    name: "poshane_get_taluk_progress",
    description:
      "Search or read a Karnataka taluk operational split including parent district, programme share, Year-1 target, planted stock, progress, survival, NGOs, volunteers, nurseries, land split, zone, and species.",
    parameters: {
      type: "object",
      properties: {
        taluk: { type: "string", description: "Taluk name or command-center taluk code." },
        district: { type: "string", description: "Optional parent district name or code, used to disambiguate taluk names." },
      },
      required: ["taluk"],
      additionalProperties: false,
    },
  },
  {
    type: "function",
    name: "poshane_compare_districts",
    description:
      "Compare two or more districts using the district metrics available in the command center.",
    parameters: {
      type: "object",
      properties: {
        districts: stringArray("District names or codes to compare."),
      },
      required: ["districts"],
      additionalProperties: false,
    },
  },
  {
    type: "function",
    name: "poshane_get_land_registry",
    description:
      "Read land registry rows using district, land type, status, site name, and minimum area filters.",
    parameters: {
      type: "object",
      properties: {
        district: { type: "string" },
        land_type: { type: "string" },
        status: { type: "string" },
        site: { type: "string" },
        min_area_ac: { type: "number" },
      },
      additionalProperties: false,
    },
  },
  {
    type: "function",
    name: "poshane_get_stakeholders",
    description:
      "Read stakeholder metrics and partner cards by category, district, onboarding status, contract status, or partner name. District filters match declared district stakeholder records and statewide support records.",
    parameters: {
      type: "object",
      properties: {
        category: {
          type: "string",
          enum: ["All", "NGO", "Government agency", "Volunteer network"],
        },
        district: { type: "string" },
        onboarding: { type: "string" },
        contract: { type: "string" },
        partner: { type: "string" },
      },
      additionalProperties: false,
    },
  },
  {
    type: "function",
    name: "poshane_get_species_planning",
    description:
      "Read zone allocation and native species planning by zone or species name.",
    parameters: {
      type: "object",
      properties: {
        zone: { type: "string" },
        species: { type: "string" },
        compare_zones: stringArray("Zone names to compare."),
      },
      additionalProperties: false,
    },
  },
  {
    type: "function",
    name: "poshane_get_nursery_mapping",
    description:
      "Read nursery mapping by nursery name, district, species raised, or operational status.",
    parameters: {
      type: "object",
      properties: {
        nursery: { type: "string" },
        district: { type: "string" },
        species: { type: "string" },
        status: { type: "string" },
      },
      additionalProperties: false,
    },
  },
  {
    type: "function",
    name: "poshane_get_monitoring_calendar",
    description:
      "Read the 2026 monitoring calendar and month activity. Use for monitoring calendar, next monitoring activity, July schedule, and general Monitoring and Audit questions when the user asks what is scheduled.",
    parameters: {
      type: "object",
      properties: {
        month: { type: "string" },
      },
      additionalProperties: false,
    },
  },
  {
    type: "function",
    name: "poshane_get_audit_log",
    description:
      "Read audit inspection rows by date, site, inspection type, visit type, status, or failed/surprise filters. Use for audit, inspections, failed inspections, surprise inspections, findings, and Monitoring and Audit audit questions.",
    parameters: {
      type: "object",
      properties: {
        site: { type: "string" },
        district: { type: "string" },
        inspection_type: { type: "string" },
        visit: { type: "string" },
        status: { type: "string" },
      },
      additionalProperties: false,
    },
  },
  {
    type: "function",
    name: "poshane_get_field_entry_feed",
    description:
      "Read latest field-entry feed rows by district, actor, activity, or nursery/plantation update.",
    parameters: {
      type: "object",
      properties: {
        district: { type: "string" },
        query: { type: "string" },
        limit: { type: "number" },
      },
      additionalProperties: false,
    },
  },
  {
    type: "function",
    name: "poshane_get_complaints",
    description:
      "Read complaints and issues by district, complaint id, severity, status, or unresolved state.",
    parameters: {
      type: "object",
      properties: {
        district: { type: "string" },
        id: { type: "string" },
        severity: { type: "string" },
        status: { type: "string" },
      },
      additionalProperties: false,
    },
  },
  {
    type: "function",
    name: "poshane_get_alerts",
    description:
      "Read state alerts and exceptions, including newest alerts, survival exceptions, nursery alerts, and district alerts.",
    parameters: {
      type: "object",
      properties: {
        district: { type: "string" },
        severity: { type: "string" },
        limit: { type: "number" },
      },
      additionalProperties: false,
    },
  },
  {
    type: "function",
    name: "poshane_navigate_command_center",
    description:
      "Navigate the existing command-center UI to a module, district, or taluk. Use immediately when the user says open, show, display, go to, take me to, or asks about a module such as Monitoring and Audit. Use taluk_drill_down for taluk-level records and data_flow_schematics for architecture diagrams or system data flow. Read-only; never modifies records.",
    parameters: {
      type: "object",
      properties: {
        module: {
          type: "string",
          enum: [
            "state_overview",
            "district_drill_down",
            "taluk_drill_down",
            "land_ownership",
            "stakeholders",
            "species_planning",
            "monitoring_audit",
            "financials",
            "data_flow_schematics",
          ],
        },
        district: { type: "string" },
        taluk: { type: "string" },
      },
      required: ["module"],
      additionalProperties: false,
    },
  },
  {
    type: "function",
    name: "poshane_apply_command_center_filters",
    description:
      "Apply existing read-only UI filters for land registry or stakeholder modules.",
    parameters: {
      type: "object",
      properties: {
        module: { type: "string", enum: ["land_ownership", "stakeholders"] },
        district: { type: "string" },
        land_type: { type: "string" },
        status: { type: "string" },
        category: {
          type: "string",
          enum: ["All", "NGO", "Government agency", "Volunteer network"],
        },
      },
      required: ["module"],
      additionalProperties: false,
    },
  },
  {
    type: "function",
    name: "poshane_highlight_command_center_item",
    description:
      "Scroll to and temporarily highlight an existing command-center card, chart, row, issue, alert, month, zone, species, nursery, or stakeholder item.",
    parameters: {
      type: "object",
      properties: {
        module: { type: "string" },
        item: { type: "string" },
      },
      required: ["module", "item"],
      additionalProperties: false,
    },
  },
];
