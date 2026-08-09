export type CommandCenterFrameId = "f1" | "f2" | "f3" | "f4" | "f5" | "f6" | "f7" | "f8" | "f9";

export type RecordStatus =
  | "Mock"
  | "Illustrative"
  | "Live"
  | "Stale"
  | "Pending Verification"
  | "Pending Device Synchronisation";

export type PoshaneMitraToolName =
  | "poshane_get_project_brief"
  | "poshane_get_state_overview"
  | "poshane_get_state_trends"
  | "poshane_get_district_progress"
  | "poshane_get_taluk_progress"
  | "poshane_compare_districts"
  | "poshane_get_land_registry"
  | "poshane_get_stakeholders"
  | "poshane_get_species_planning"
  | "poshane_get_nursery_mapping"
  | "poshane_get_monitoring_calendar"
  | "poshane_get_audit_log"
  | "poshane_get_field_entry_feed"
  | "poshane_get_complaints"
  | "poshane_get_alerts"
  | "poshane_navigate_command_center"
  | "poshane_apply_command_center_filters"
  | "poshane_highlight_command_center_item";

export type CommandCenterFilterSet = {
  landDistrict?: string;
  landType?: string;
  landStatus?: string;
  stakeholderCategory?: string;
  stakeholderDistrict?: string;
  speciesDistrict?: string;
  speciesQuery?: string;
  speciesModel?: string;
};

export type CommandCenterUiAction = {
  frame?: CommandCenterFrameId;
  districtCode?: string;
  talukCode?: string;
  filters?: CommandCenterFilterSet;
  highlightId?: string;
  highlightLabel?: string;
};

export type ToolResultMeta = {
  source: string;
  record_status: RecordStatus;
  last_updated_at: string;
  is_mock: boolean;
  is_verified: boolean;
  pending_sync_count: number;
  authorization_scope: "super_admin" | "finance_restricted" | "read_only";
};

export type PoshaneMitraToolResult = ToolResultMeta & {
  tool: PoshaneMitraToolName;
  summary: string;
  data: unknown;
  selected_filters?: Record<string, string | number | boolean | null>;
  ui_action?: CommandCenterUiAction;
};

export type PoshaneMitraTranscriptEntry = {
  id: string;
  at: string;
  question: string;
  assistant?: string;
  tool?: PoshaneMitraToolName;
  source?: string;
  selectedFilters?: Record<string, string | number | boolean | null>;
  result?: string;
  recordStatus?: RecordStatus;
  lastUpdatedAt?: string;
  pendingSyncCount?: number;
  error?: string;
  latencyMs?: number;
};

export type PoshaneMitraStatus =
  | "idle"
  | "connecting"
  | "listening"
  | "thinking"
  | "speaking"
  | "interrupted"
  | "muted"
  | "reconnecting"
  | "error";

export type PoshaneMitraAuditEvent = {
  event:
    | "session_start"
    | "session_end"
    | "tool_call"
    | "navigation_action"
    | "error";
  tool?: PoshaneMitraToolName;
  validated_parameters?: Record<string, unknown>;
  result_status?: RecordStatus | "Error";
  navigation_action?: CommandCenterUiAction;
  latency_ms?: number;
  error?: string;
  audio_duration_ms?: number;
  estimated_cost_usd?: number;
};
