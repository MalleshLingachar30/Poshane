import "server-only";

import {
  AUDITS,
  DISTRICTS,
  FEED,
  ISSUES,
  LAND_TYPES,
  MONTHS,
  MONTH_ACTS,
  NURSERIES,
  SITES,
  STK,
  TOT_ALLOC,
  TOT_NUR,
  TOT_Y1,
  UTIL_TOTAL,
  ZONES,
  fmtIN,
  lakhFix,
  lakhToStr,
  plantedOf,
  y1Of,
} from "../data";
import { TALUKS, buildTalukMetrics } from "../taluks";
import { MODELS, SILVI_ZONES, type ModelKey } from "../silvi";
import type {
  CommandCenterFrameId,
  CommandCenterUiAction,
  PoshaneMitraToolName,
  PoshaneMitraToolResult,
  ToolResultMeta,
} from "./types";
import {
  PROJECT_BRIEF_LAST_UPDATED_AT,
  PROJECT_BRIEF_SECTIONS,
  PROJECT_BRIEF_SOURCE,
  projectBriefTopics,
  type ProjectBriefTopic,
} from "./project-brief";

type Args = Record<string, unknown>;
type BootstrapPayload = {
  districts: { name: string; code: string }[];
  taluks: { name: string; code: string; district: string; districtCode: string }[];
  zones: string[];
  project_brief_topics: ProjectBriefTopic[];
  land_types: readonly string[];
  site_names: string[];
  stakeholder_names: string[];
  nursery_names: string[];
  issue_ids: string[];
  last_updated_at: string;
  formats: { saplings: string; lakh: string };
};

export interface PoshaneCommandCenterDataProvider {
  executeTool(tool: PoshaneMitraToolName, args: Args): PoshaneMitraToolResult;
  bootstrap(): BootstrapPayload;
}

const LAKH = 100_000;
const LAST_UPDATED_AT = "2026-07-08T14:22:00+05:30";

const TOOL_TO_SOURCE: Record<PoshaneMitraToolName, string> = {
  poshane_get_project_brief: PROJECT_BRIEF_SOURCE,
  poshane_get_state_overview: "State Overview",
  poshane_get_state_trends: "State Overview / Trends",
  poshane_get_district_progress: "District Drill-Down",
  poshane_get_taluk_progress: "Taluk Drill-Down",
  poshane_compare_districts: "District Drill-Down",
  poshane_get_land_registry: "Land & Ownership Registry",
  poshane_get_stakeholders: "Stakeholder & Onboarding",
  poshane_get_species_planning: "Species & Agro-Climatic Planning",
  poshane_get_nursery_mapping: "Nursery to Species Mapping",
  poshane_get_monitoring_calendar: "Monitoring Calendar",
  poshane_get_audit_log: "Audit Log",
  poshane_get_field_entry_feed: "Field Data-Entry Feed",
  poshane_get_complaints: "Complaints & Issues",
  poshane_get_alerts: "Alerts & Exceptions",
  poshane_navigate_command_center: "Command Center Navigation",
  poshane_apply_command_center_filters: "Command Center Filters",
  poshane_highlight_command_center_item: "Command Center Highlight",
};

const FRAME_BY_MODULE: Record<string, CommandCenterFrameId> = {
  state_overview: "f1",
  district_drill_down: "f2",
  taluk_drill_down: "f9",
  land_ownership: "f3",
  stakeholders: "f4",
  species_planning: "f5",
  monitoring_audit: "f6",
  financials: "f7",
  data_flow_schematics: "f8",
};

const MODULE_LABELS: Record<string, string> = {
  state_overview: "State Overview",
  district_drill_down: "District Drill-Down",
  taluk_drill_down: "Taluk Drill-Down",
  land_ownership: "Land and Ownership Registry",
  stakeholders: "Stakeholder and Onboarding",
  species_planning: "Species and Agro-Climatic Planning",
  monitoring_audit: "Monitoring and Audit",
  financials: "Restricted Financials",
  data_flow_schematics: "System Architecture",
};

function meta(tool: PoshaneMitraToolName): ToolResultMeta {
  if (tool === "poshane_get_project_brief") {
    return {
      source: TOOL_TO_SOURCE[tool],
      record_status: "Pending Verification",
      last_updated_at: PROJECT_BRIEF_LAST_UPDATED_AT,
      is_mock: false,
      is_verified: false,
      pending_sync_count: 0,
      authorization_scope: "read_only",
    };
  }
  return {
    source: TOOL_TO_SOURCE[tool],
    record_status: "Illustrative",
    last_updated_at: LAST_UPDATED_AT,
    is_mock: true,
    is_verified: false,
    pending_sync_count: 0,
    authorization_scope: "super_admin",
  };
}

function result(
  tool: PoshaneMitraToolName,
  summary: string,
  data: unknown,
  selectedFilters?: Record<string, string | number | boolean | null>,
  uiAction?: CommandCenterUiAction
): PoshaneMitraToolResult {
  return {
    tool,
    ...meta(tool),
    summary:
      tool === "poshane_get_project_brief"
        ? `Based on the IAFT strategic framework submitted to KSLSA, ${summary}`
        : summary,
    data,
    selected_filters: selectedFilters,
    ui_action: uiAction,
  };
}

function norm(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function slug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function text(value: unknown, field: string) {
  const out = String(value ?? "").trim();
  if (!out) throw new Error(`${field} is required.`);
  return out;
}

function optionalText(value: unknown) {
  const out = String(value ?? "").trim();
  return out || undefined;
}

function optionalNumber(value: unknown) {
  if (value == null || value === "") return undefined;
  const n = Number(value);
  if (!Number.isFinite(n)) throw new Error("Expected a number.");
  return n;
}

function findDistrict(value: unknown) {
  const q = norm(value).replace(/\s+district$/, "");
  if (!q) return undefined;
  const silviAlias = SILVI_ZONES.flatMap((zone) => zone.agroZones)
    .flatMap((zone) => zone.districts)
    .find(
      (district) =>
        norm(district.source) === q || norm(district.district) === q,
    )?.district;
  const canonicalQuery = silviAlias ? norm(silviAlias) : q;
  const district = DISTRICTS.find(
    (d) => norm(d.name) === canonicalQuery || norm(d.code) === canonicalQuery
  );
  if (!district) throw new Error(`Unknown Karnataka district: ${value}`);
  return district;
}

function resolvePlantingModel(value: unknown) {
  const query = norm(value);
  if (!query) return undefined;
  const aliases: Record<string, ModelKey> = {
    bund: "bund",
    strip: "bund",
    "shelter belt": "bund",
    hedge: "bund",
    "alley planting": "bund",
    block: "block",
    cluster: "block",
    linear: "linear",
    roadside: "linear",
    "canal bank": "linear",
    gua: "gua",
    "urban greening": "gua",
    "greening of urban area": "gua",
    school: "institutional",
    institute: "institutional",
    temple: "institutional",
    "grave yard": "institutional",
    graveyard: "institutional",
    institutional: "institutional",
  };
  const key = aliases[query] ?? query;
  const model = MODELS.find((candidate) => candidate.key === key);
  if (!model) throw new Error(`Unsupported planting type: ${value}`);
  return model;
}

function silviZonesForDistrict(districtName: string) {
  return SILVI_ZONES.filter((zone) =>
    zone.agroZones.some((agroZone) =>
      agroZone.districts.some((district) => district.district === districtName),
    ),
  );
}

function findDistrictByName(value: string) {
  return DISTRICTS.find((d) => d.name === value);
}

function findTaluk(value: unknown, districtValue?: unknown) {
  const query = norm(value);
  if (!query) return undefined;
  const district = findDistrict(districtValue);
  const matches = TALUKS.filter((taluk) =>
    (!district || taluk.districtCode === district.code) &&
    (norm(taluk.name) === query || norm(taluk.code) === query)
  );
  if (!matches.length) {
    throw new Error(`Unknown Karnataka taluk${district ? ` in ${district.name}` : ""}: ${value}`);
  }
  if (matches.length > 1) {
    throw new Error(`Taluk name is ambiguous; include its parent district: ${value}`);
  }
  return matches[0];
}

function validateLandType(value: unknown) {
  const candidate = optionalText(value);
  if (!candidate) return undefined;
  const matched = LAND_TYPES.find((t) => norm(t) === norm(candidate));
  if (!matched) throw new Error(`Unsupported land type: ${candidate}`);
  return matched;
}

function validateStatus(value: unknown, allowed: string[], label: string) {
  const candidate = optionalText(value);
  if (!candidate) return undefined;
  const matched = allowed.find((s) => norm(s) === norm(candidate));
  if (!matched) throw new Error(`Unsupported ${label}: ${candidate}`);
  return matched;
}

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, "");
}

function validateProjectBriefTopic(value: unknown) {
  const candidate = optionalText(value);
  if (!candidate) return undefined;
  const matched = projectBriefTopics().find((topic) => norm(topic) === norm(candidate));
  if (!matched) throw new Error(`Unsupported project brief topic: ${candidate}`);
  return matched;
}

function projectBrief(args: Args) {
  const topic = validateProjectBriefTopic(args.topic);
  const query = optionalText(args.query);
  const queryNorm = norm(query);
  const sections = topic
    ? PROJECT_BRIEF_SECTIONS.filter((section) => section.topic === topic)
    : PROJECT_BRIEF_SECTIONS.filter((section) => {
        if (!queryNorm) return section.topic === "overview" || section.topic === "vision";
        const haystack = norm([
          section.topic,
          section.title,
          section.keywords.join(" "),
          section.answer,
          section.bullets.join(" "),
        ].join(" "));
        return queryNorm
          .split(/\s+/)
          .filter((word) => word.length > 2)
          .some((word) => haystack.includes(word));
      }).slice(0, 4);
  const rows = sections.length
    ? sections
    : PROJECT_BRIEF_SECTIONS.filter((section) => section.topic === "overview" || section.topic === "vision");
  const primary = rows[0];
  return result(
    "poshane_get_project_brief",
    `${primary.answer} Source: ${primary.title}, pages ${primary.pages}.`,
    {
      source_document: PROJECT_BRIEF_SOURCE,
      approval_status: "Indicative and subject to KSLSA approval",
      matched_sections: rows.map((section) => ({
        topic: section.topic,
        title: section.title,
        pages: section.pages,
        answer: section.answer,
        points: section.bullets,
      })),
    },
    { topic: topic ?? null, query: query ?? null }
  );
}

function districtPayload(district: (typeof DISTRICTS)[number]) {
  const planted = plantedOf(district);
  const target = y1Of(district);
  const progress = target ? (planted / target) * 100 : 0;
  const zone = ZONES[district.zone];
  const governmentLandPct = 52 + ((district.name.length * 7) % 31);
  const ngoPartners = STK.filter(
    (s) => s[1] === "NGO" && s[2] === district.name
  ).map((s) => ({
    partner: s[0],
    assigned_scope: s[4],
    onboarding_status: s[3],
    contract_status: s[5],
    volunteers: s[6],
  }));

  return {
    district: district.name,
    code: district.code,
    programme_share_lakh: district.alloc,
    year_one_target_lakh: Number(target.toFixed(2)),
    planted_to_date_lakh: Number(planted.toFixed(2)),
    planted_to_date_saplings: Math.round(planted * LAKH),
    progress_percent_of_y1: Number(progress.toFixed(1)),
    survival_percent: district.survival,
    active_ngos: district.ngos,
    volunteers: district.volunteers,
    nurseries: district.nurseries,
    allocation_land_split: {
      government_and_community_land_percent: governmentLandPct,
      private_or_institutional_percent: 100 - governmentLandPct,
    },
    monitoring_timeline_2026: [
      ["Jan-Feb", "Site survey & pit marking", "done"],
      ["Mar", "Soil work, pitting & fencing", "done"],
      ["Apr-May", "Nursery hardening & site handover", "done"],
      ["Jun", "Monsoon planting wave 1", "done"],
      ["Jul", "Planting wave 2 + first casualty check", "now"],
      ["Aug-Oct", "Watering roster & weeding cycle", "pending"],
      ["Nov-Dec", "First survival census (Y1)", "pending"],
    ],
    ngo_partners: ngoPartners,
    agro_climatic_zone: zone.name,
    recommended_species: zone.species.map(([common, botanical]) => ({
      common,
      botanical,
    })),
  };
}

function talukPayload(taluk: (typeof TALUKS)[number]) {
  const district = DISTRICTS.find((item) => item.code === taluk.districtCode);
  if (!district) throw new Error(`Parent district is missing for taluk: ${taluk.name}`);
  const metrics = buildTalukMetrics(district).find((row) => row.code === taluk.code);
  if (!metrics) throw new Error(`Operational split is missing for taluk: ${taluk.name}`);
  const zone = ZONES[district.zone];
  return {
    taluk: metrics.name,
    code: metrics.code,
    parent_district: metrics.districtName,
    parent_district_code: metrics.districtCode,
    programme_share_lakh: metrics.programmeShare,
    year_one_target_lakh: Number(metrics.yearOneTarget.toFixed(3)),
    planted_to_date_lakh: Number(metrics.planted.toFixed(3)),
    planted_to_date_saplings: Math.round(metrics.planted * LAKH),
    progress_percent_of_y1: Number(metrics.progress.toFixed(1)),
    survival_percent: Number(metrics.survival.toFixed(1)),
    active_ngos: metrics.ngos,
    volunteers: metrics.volunteers,
    nurseries: metrics.nurseries,
    allocation_land_split: {
      government_and_community_land_percent: Number(metrics.governmentLandPct.toFixed(1)),
      private_or_institutional_percent: Number((100 - metrics.governmentLandPct).toFixed(1)),
    },
    agro_climatic_zone: zone.name,
    recommended_species: zone.species.map(([common, botanical]) => ({ common, botanical })),
    reconciliation: {
      district_programme_share_lakh: district.alloc,
      district_year_one_target_lakh: Number(y1Of(district).toFixed(2)),
      district_planted_to_date_lakh: Number(plantedOf(district).toFixed(2)),
    },
  };
}

function stateOverview(tool: PoshaneMitraToolName) {
  const planted = DISTRICTS.reduce((s, d) => s + plantedOf(d), 0);
  const weightedSurvival =
    DISTRICTS.reduce((s, d) => s + d.survival * plantedOf(d), 0) / planted;
  const lowSurvival = DISTRICTS.filter((d) => d.survival < 95).sort(
    (a, b) => a.survival - b.survival
  );

  return result(
    tool,
    `${lakhFix(planted, 2)} saplings have been planted against the five-crore programme target; weighted survival is ${weightedSurvival.toFixed(1)}%.`,
    {
      total_planted_lakh: Number(planted.toFixed(2)),
      total_planted_saplings: Math.round(planted * LAKH),
      programme_target_lakh: TOT_ALLOC,
      programme_target_saplings: TOT_ALLOC * LAKH,
      programme_completion_percent: Number(((planted / TOT_ALLOC) * 100).toFixed(1)),
      year_one_target_lakh: Number(TOT_Y1.toFixed(2)),
      year_one_completion_percent: Number(((planted / TOT_Y1) * 100).toFixed(1)),
      overall_survival_percent: Number(weightedSurvival.toFixed(1)),
      survival_standard_percent: 95,
      districts_active: DISTRICTS.length,
      nurseries_operational: TOT_NUR,
      funds_utilised_crore: UTIL_TOTAL,
      below_survival_standard: lowSurvival.map((d) => ({
        district: d.name,
        survival_percent: d.survival,
      })),
    },
    undefined,
    { frame: "f1", highlightId: "state-total-planted", highlightLabel: "Total Planted" }
  );
}

function stateTrends(args: Args) {
  const chart = validateStatus(args.chart, ["planting", "survival", "both"], "chart") ?? "both";
  const planted = DISTRICTS.reduce((s, d) => s + plantedOf(d), 0);
  const weightedSurvival =
    DISTRICTS.reduce((s, d) => s + d.survival * plantedOf(d), 0) / planted;
  const data = {
    planting:
      chart === "survival"
        ? undefined
        : {
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
            plan_lakh: [2.5, 5, 10, 17, 26, 36, 46],
            actual_lakh: [1.8, 4.2, 7.6, 13.1, 21.9, 33.4, Number(planted.toFixed(1))],
          },
    survival:
      chart === "planting"
        ? undefined
        : {
            labels: ["Feb", "Mar", "Apr", "May", "Jun", "Jul"],
            survival_percent: [97.4, 96.8, 96.1, 95.4, 95.9, Number(weightedSurvival.toFixed(1))],
            standard_percent: 95,
          },
  };
  return result(
    "poshane_get_state_trends",
    chart === "survival"
      ? `the survival trend is at ${weightedSurvival.toFixed(1)}% against the 95% standard.`
      : chart === "planting"
      ? `actual planting is ${lakhFix(planted, 1)} in July against a 46 L plan line.`
      : `actual planting is ${lakhFix(planted, 1)} and survival is ${weightedSurvival.toFixed(1)}%.`,
    data,
    { chart },
    {
      frame: "f1",
      highlightId: chart === "survival" ? "state-survival-trend" : "state-planting-trend",
      highlightLabel: chart === "survival" ? "Survival Rate Trend" : "Cumulative Planting",
    }
  );
}

function districtProgress(args: Args) {
  const district = findDistrict(text(args.district, "district"));
  if (!district) throw new Error("District is required.");
  const payload = districtPayload(district);
  const focus = optionalText(args.focus) ?? "summary";
  const focusToHighlight: Record<string, string> = {
    summary: "district-kpis",
    land_split: "district-land-split",
    timeline: "district-timeline",
    ngos: "district-ngo-partners",
    species: "district-zone",
  };
  return result(
    "poshane_get_district_progress",
    `${district.name} has planted ${lakhFix(payload.planted_to_date_lakh)} with ${district.survival}% survival.`,
    payload,
    { district: district.name, focus },
    {
      frame: "f2",
      districtCode: district.code,
      highlightId: focusToHighlight[focus] ?? "district-kpis",
      highlightLabel: district.name,
    }
  );
}

function talukProgress(args: Args) {
  const taluk = findTaluk(text(args.taluk, "taluk"), args.district);
  if (!taluk) throw new Error("Taluk is required.");
  const payload = talukPayload(taluk);
  return result(
    "poshane_get_taluk_progress",
    `${payload.taluk} taluk in ${payload.parent_district} has planted ${lakhFix(payload.planted_to_date_lakh, 2)} with ${payload.survival_percent}% survival.`,
    payload,
    { taluk: payload.taluk, district: payload.parent_district },
    {
      frame: "f9",
      districtCode: payload.parent_district_code,
      talukCode: payload.code,
      highlightId: "taluk-kpis",
      highlightLabel: `${payload.taluk}, ${payload.parent_district}`,
    }
  );
}

function compareDistricts(args: Args) {
  const districtsArg = Array.isArray(args.districts) ? args.districts : [];
  if (districtsArg.length < 2) throw new Error("At least two districts are required.");
  const districts = districtsArg.map(findDistrict);
  const rows = districts.map((d) => districtPayload(d!));
  return result(
    "poshane_compare_districts",
    `${rows.map((r) => `${r.district}: ${lakhFix(r.planted_to_date_lakh)}`).join("; ")}.`,
    rows,
    { districts: rows.map((r) => r.district).join(", ") },
    { frame: "f2", districtCode: districts[0]!.code, highlightId: "district-kpis", highlightLabel: "District comparison" }
  );
}

function landRegistry(args: Args) {
  const district = findDistrict(args.district);
  const landType = validateLandType(args.land_type);
  const status = validateStatus(args.status, ["Available", "Selected", "Planted"], "land status");
  const siteQuery = optionalText(args.site);
  const minArea = optionalNumber(args.min_area_ac);
  const rows = SITES.filter((s) => {
    return (
      (!district || s[0] === district.name) &&
      (!landType || s[2] === landType) &&
      (!status || s[4] === status) &&
      (!siteQuery || norm(s[1]).includes(norm(siteQuery))) &&
      (minArea == null || s[3] >= minArea)
    );
  }).map((s) => {
    const d = findDistrictByName(s[0])!;
    return {
      site: s[1],
      district: s[0],
      land_type: s[2],
      area_ac: s[3],
      agro_climatic_zone: ZONES[d.zone].name,
      status: s[4],
      post_plantation_ownership: s[5],
    };
  });
  const first = rows[0];
  return result(
    "poshane_get_land_registry",
    rows.length
      ? `${rows.length} site${rows.length === 1 ? "" : "s"} match; ${first.site} is ${first.status}.`
      : "no land registry rows match those filters.",
    rows,
    {
      district: district?.name ?? null,
      land_type: landType ?? null,
      status: status ?? null,
      min_area_ac: minArea ?? null,
    },
    {
      frame: "f3",
      filters: { landDistrict: district?.name, landType, landStatus: status },
      highlightId: first ? `site-${slug(first.site)}` : "land-registry",
      highlightLabel: first?.site ?? "Land registry",
    }
  );
}

function stakeholders(args: Args) {
  const category =
    validateStatus(args.category, ["All", "NGO", "Government agency", "Volunteer network"], "stakeholder category") ??
    "All";
  const district = findDistrict(args.district);
  const onboarding = validateStatus(args.onboarding, ["Onboarded", "Verifying", "Invited"], "onboarding status");
  const contract = validateStatus(args.contract, ["Active", "Signed", "Drafted", "—"], "contract status");
  const partner = optionalText(args.partner);
  const rows = STK.filter(
    (s) =>
      (category === "All" || s[1] === category) &&
      (!district || s[2] === district.name || s[2] === "All districts") &&
      (!onboarding || s[3] === onboarding) &&
      (!contract || s[5] === contract) &&
      (!partner || norm(s[0]).includes(norm(partner)))
  ).map((s) => ({
    partner: s[0],
    category: s[1],
    district: s[2],
    onboarding_status: s[3],
    assigned_scope: s[4],
    contract_status: s[5],
    volunteers: s[6],
  }));
  const first = rows[0];
  const declaredNgos = STK.filter((s) => s[1] === "NGO" && (!district || s[2] === district.name)).length;
  return result(
    "poshane_get_stakeholders",
    `${rows.length} partner${rows.length === 1 ? "" : "s"} match${district ? ` in ${district.name}` : ""}; ${declaredNgos} declared NGO${declaredNgos === 1 ? "" : "s"}.`,
    {
      metrics: {
        total_partners: rows.length,
        onboarded: rows.filter((s) => s.onboarding_status === "Onboarded").length,
        verifying: rows.filter((s) => s.onboarding_status === "Verifying").length,
        invited: rows.filter((s) => s.onboarding_status === "Invited").length,
        contracts_active: rows.filter((s) => s.contract_status === "Active").length,
        registered_volunteers: rows.reduce((a, s) => a + s.volunteers, 0),
        declared_ngos: declaredNgos,
        district_declared_ngo_total: district?.ngos ?? null,
      },
      rows,
    },
    { category, district: district?.name ?? null, onboarding: onboarding ?? null, contract: contract ?? null },
    {
      frame: "f4",
      filters: { stakeholderCategory: category, stakeholderDistrict: district?.name },
      highlightId: first ? `stakeholder-${slug(first.partner)}` : "stakeholders",
      highlightLabel: first?.partner ?? "Stakeholders",
    }
  );
}

function speciesPlanning(args: Args) {
  const district = findDistrict(args.district);
  const zoneQuery = optionalText(args.zone);
  const speciesQuery = optionalText(args.species);
  const plantingModel = resolvePlantingModel(args.planting_model);
  const compareZones = Array.isArray(args.compare_zones) ? args.compare_zones.map(String) : [];
  let matchedZones = district ? silviZonesForDistrict(district.name) : [...SILVI_ZONES];

  if (zoneQuery) {
    const found = SILVI_ZONES.find(
      (zone) =>
        norm(zone.key) === norm(zoneQuery) ||
        norm(zone.name).includes(norm(zoneQuery)),
    );
    if (!found) throw new Error(`Unknown silvi zone: ${zoneQuery}`);
    matchedZones = matchedZones.filter((zone) => zone.key === found.key);
  } else if (compareZones.length) {
    const comparedKeys = compareZones.map((requestedZone) => {
      const found = SILVI_ZONES.find(
        (zone) =>
          norm(zone.key) === norm(requestedZone) ||
          norm(zone.name).includes(norm(requestedZone)),
      );
      if (!found) throw new Error(`Unknown silvi zone: ${requestedZone}`);
      return found.key;
    });
    matchedZones = matchedZones.filter((zone) => comparedKeys.includes(zone.key));
  }

  if (speciesQuery) {
    matchedZones = matchedZones.filter((zone) =>
      MODELS.some((model) =>
        zone.species[model.key].some(([botanical, local]) =>
          norm(`${botanical} ${local}`).includes(norm(speciesQuery)),
        ),
      ),
    );
  }

  const zones = matchedZones.map((zone) => {
    const districtRows = zone.agroZones.flatMap((agroZone) =>
      agroZone.districts
        .filter((row) => !district || row.district === district.name)
        .map((row) => ({
          agro_climatic_zone: agroZone.name,
          district: row.district,
          source_district_name: row.source,
          taluks: row.taluks,
        })),
    );
    const models = (plantingModel ? [plantingModel] : MODELS).map((model) => ({
      key: model.key,
      name: model.name,
      short: model.short,
      seedling: model.seedling,
      spacing: model.spacing,
      species_type: model.speciesType,
      common_land: model.commonLand,
      species: zone.species[model.key].map(([botanical, local]) => ({
        botanical,
        local,
      })),
    }));
    return {
      zone: zone.name,
      zone_key: zone.key,
      source_sheet: zone.sheet,
      district_mappings: districtRows,
      planting_models: models,
    };
  });
  const zoneNames = zones.map((zone) => zone.zone).join(" and ");
  const plantingQuestion = MODELS.map((model) => model.name).join("; ");
  const spokenSpecies = plantingModel
    ? matchedZones.map((zone) => ({
        zone: zone.name,
        species: zone.species[plantingModel.key].map(
          ([botanical, local]) => `${local} (${botanical})`,
        ),
      }))
    : [];
  const speciesSummary = spokenSpecies
    .map(({ zone, species }) => `${zone}: ${species.join(", ")}`)
    .join("; ");
  const requiresPlantingType = Boolean(district && !plantingModel && !speciesQuery);
  const summary = !zones.length
    ? district
      ? `no silvi-zone species record was found for ${district.name}.`
      : "no silvi-zone species record matched that request."
    : requiresPlantingType
    ? `${district!.name} belongs to ${zoneNames}. Which planting type is needed: ${plantingQuestion}?`
    : plantingModel
    ? `${district ? `${district.name} belongs to ${zoneNames}. ` : ""}For ${plantingModel.name}, the recommended species are ${speciesSummary}.`
    : speciesQuery
    ? `${speciesQuery} appears in ${zoneNames}; open the filtered Species Planning view for the matching planting models.`
    : `${zoneNames} matched the requested Species Planning view.`;

  return result(
    "poshane_get_species_planning",
    summary,
    {
      requires_planting_type: requiresPlantingType,
      district: district?.name ?? null,
      zones,
      available_planting_models: MODELS.map((model) => ({
        key: model.key,
        name: model.name,
        common_land: model.commonLand,
      })),
      selected_planting_model: plantingModel
        ? { key: plantingModel.key, name: plantingModel.name }
        : null,
      spoken_species: spokenSpecies,
    },
    {
      district: district?.name ?? null,
      zone: zoneQuery ?? null,
      species: speciesQuery ?? null,
      planting_model: plantingModel?.key ?? null,
    },
    {
      frame: "f5",
      districtCode: district?.code,
      filters: {
        speciesDistrict: district?.name,
        speciesQuery,
        speciesModel: plantingModel?.key,
      },
      highlightId: "species-search",
      highlightLabel: district
        ? `${district.name} ${plantingModel?.short ?? "species plan"}`
        : plantingModel?.name ?? zones[0]?.zone ?? "Species planning",
    }
  );
}

function nurseryMapping(args: Args) {
  const district = findDistrict(args.district);
  const nursery = optionalText(args.nursery);
  const species = optionalText(args.species);
  const status = validateStatus(args.status, ["Operational", "Stocking"], "nursery status");
  const rows = NURSERIES.filter(
    (n) =>
      (!district || n[1] === district.name) &&
      (!nursery || norm(n[0]).includes(norm(nursery))) &&
      (!species || norm(n[3]).includes(norm(species))) &&
      (!status || n[4] === status)
  ).map((n) => ({
    nursery: n[0],
    district: n[1],
    capacity: n[2],
    species_raised: n[3],
    status: n[4],
  }));
  const first = rows[0];
  return result(
    "poshane_get_nursery_mapping",
    rows.length
      ? `${rows.length} nurser${rows.length === 1 ? "y" : "ies"} match; ${first.nursery} capacity is ${first.capacity}.`
      : "no nurseries match those filters.",
    rows,
    { district: district?.name ?? null, species: species ?? null, status: status ?? null },
    {
      frame: "f5",
      highlightId: first ? `nursery-${slug(first.nursery)}` : "nursery-mapping",
      highlightLabel: first?.nursery ?? "Nursery mapping",
    }
  );
}

function monitoringCalendar(args: Args) {
  const month = optionalText(args.month);
  const rows = MONTHS.map((m, i) => ({
    month: m,
    activity: MONTH_ACTS[i],
    status: i < 6 ? "done" : i === 6 ? "current" : "pending",
  })).filter((row) => !month || norm(row.month).startsWith(norm(month)) || norm(row.activity).includes(norm(month)));
  const first = rows[0];
  return result(
    "poshane_get_monitoring_calendar",
    first ? `${first.month} is scheduled for ${first.activity}.` : "no monitoring calendar month matches that request.",
    rows,
    { month: month ?? null },
    { frame: "f6", highlightId: first ? `month-${slug(first.month)}` : "monitoring-calendar", highlightLabel: first?.month ?? "Monitoring calendar" }
  );
}

function auditLog(args: Args) {
  const site = optionalText(args.site);
  const district = findDistrict(args.district);
  const inspectionType = validateStatus(args.inspection_type, ["Plantation", "Nursery"], "inspection type");
  const visit = validateStatus(args.visit, ["Surprise", "Scheduled"], "visit type");
  const status = validateStatus(args.status, ["Pass", "Flag"], "audit status");
  const rows = AUDITS.filter(
    (a) =>
      (!site || norm(a[1]).includes(norm(site))) &&
      (!district || norm(a[1]).includes(norm(district.name))) &&
      (!inspectionType || a[2] === inspectionType) &&
      (!visit || a[3] === visit) &&
      (!status || a[5] === status)
  ).map((a) => ({
    date: a[0],
    site: a[1],
    inspection_type: a[2],
    visit_type: a[3],
    finding: a[4],
    status: a[5],
  }));
  const first = rows[0];
  return result(
    "poshane_get_audit_log",
    rows.length
      ? `${rows.length} audit row${rows.length === 1 ? "" : "s"} match; ${first.site} is marked ${first.status}.`
      : "no audit findings match those filters.",
    rows,
    { district: district?.name ?? null, visit: visit ?? null, status: status ?? null },
    { frame: "f6", highlightId: first ? `audit-${slug(first.site)}` : "audit-log", highlightLabel: first?.site ?? "Audit log" }
  );
}

function fieldEntryFeed(args: Args) {
  const district = findDistrict(args.district);
  const query = optionalText(args.query);
  const limit = Math.max(1, Math.min(8, optionalNumber(args.limit) ?? 8));
  const rows = FEED.filter(
    (f) =>
      (!district || norm(`${f[1]} ${f[2]} ${f[3]}`).includes(norm(district.name))) &&
      (!query || norm(`${f[1]} ${stripHtml(f[2])} ${f[3]}`).includes(norm(query)))
  )
    .slice(0, limit)
    .map((f) => ({
      time: f[0],
      actor: f[1],
      activity: stripHtml(f[2]),
      detail: f[3],
    }));
  const first = rows[0];
  return result(
    "poshane_get_field_entry_feed",
    first ? `the latest entry is ${first.actor} at ${first.time}: ${first.activity}.` : "no field-entry feed rows match that request.",
    rows,
    { district: district?.name ?? null, query: query ?? null },
    { frame: "f6", highlightId: first ? `feed-${slug(first.actor + "-" + first.time)}` : "field-feed", highlightLabel: first?.actor ?? "Field feed" }
  );
}

function complaints(args: Args) {
  const district = findDistrict(args.district);
  const id = optionalText(args.id);
  const severity = validateStatus(args.severity, ["High", "Medium", "Low"], "severity");
  const status = validateStatus(args.status, ["Open", "In progress", "Closed"], "complaint status");
  const rows = ISSUES.filter(
    (iss) =>
      (!district || iss[1] === district.name) &&
      (!id || norm(iss[0]) === norm(id)) &&
      (!severity || iss[3] === severity) &&
      (!status || iss[4] === status)
  ).map((iss) => ({
    id: iss[0],
    district: iss[1],
    issue: iss[2],
    severity: iss[3],
    status: iss[4],
  }));
  const first = rows[0];
  return result(
    "poshane_get_complaints",
    rows.length
      ? `${rows.length} complaint${rows.length === 1 ? "" : "s"} match; ${first.id} is ${first.status}.`
      : "no complaints match those filters.",
    rows,
    { district: district?.name ?? null, severity: severity ?? null, status: status ?? null },
    { frame: "f6", highlightId: first ? `issue-${slug(first.id)}` : "complaints", highlightLabel: first?.id ?? "Complaints" }
  );
}

function alerts(args: Args) {
  const district = findDistrict(args.district);
  const limit = Math.max(1, Math.min(8, optionalNumber(args.limit) ?? 5));
  const alertRows = [
    ...DISTRICTS.filter((d) => d.survival < 95)
      .sort((a, b) => a.survival - b.survival)
      .map((d) => ({
        severity: "red",
        district: d.name,
        message: `${d.name} below survival threshold — ${d.survival}% vs 95% standard.`,
        source_detail: "Survival watch · updated today",
      })),
    {
      severity: "amber",
      district: "Raichur",
      message: "Audit flagged Raichur Krishna Nursery — shade-net gap on Bevu beds.",
      source_detail: "Nursery audit · 03 Jul",
    },
    {
      severity: "amber",
      district: "Tumakuru",
      message: "Sira Block 12 casualty replacement pending on 2.1% of pits.",
      source_detail: "Plantation audit · 04 Jul",
    },
    {
      severity: "blue",
      district: "Bengaluru Urban",
      message: "Corporate Volunteer Pool invitation pending acceptance — 3,100 volunteers offered.",
      source_detail: "Onboarding",
    },
  ].filter((row) => !district || row.district === district.name);
  const rows = alertRows.slice(0, limit);
  const first = rows[0];
  return result(
    "poshane_get_alerts",
    first ? `${rows.length} alert${rows.length === 1 ? "" : "s"} returned; newest relevant alert is ${first.message}` : "no alerts match that filter.",
    rows,
    { district: district?.name ?? null, limit },
    { frame: "f1", highlightId: first ? `alert-${slug(first.district)}` : "alerts", highlightLabel: first?.district ?? "Alerts" }
  );
}

function navigate(args: Args) {
  const targetModule = text(args.module, "module");
  const frame = FRAME_BY_MODULE[targetModule];
  if (!frame) throw new Error(`Unsupported module: ${targetModule}`);
  const taluk = findTaluk(args.taluk, args.district);
  const district = taluk ? findDistrict(taluk.districtCode) : findDistrict(args.district);
  if (frame === "f7") {
    return result(
      "poshane_navigate_command_center",
      "the financials module is restricted; I can navigate there for an authorised super admin, but I cannot read or alter finance records by voice.",
      { module: targetModule },
      { module: targetModule },
      { frame }
    );
  }
  return result(
    "poshane_navigate_command_center",
    `opening ${MODULE_LABELS[targetModule]}${taluk ? ` for ${taluk.name}, ${district?.name}` : district ? ` for ${district.name}` : ""}.`,
    { module: targetModule, district: district?.name ?? null, taluk: taluk?.name ?? null },
    { module: targetModule, district: district?.name ?? null, taluk: taluk?.name ?? null },
    {
      frame,
      districtCode: district?.code,
      talukCode: taluk?.code,
      highlightId: targetModule === "monitoring_audit" ? "monitoring-calendar" : undefined,
      highlightLabel: MODULE_LABELS[targetModule],
    }
  );
}

function applyFilters(args: Args) {
  const targetModule = text(args.module, "module");
  if (targetModule === "land_ownership") {
    const district = findDistrict(args.district);
    const landType = validateLandType(args.land_type);
    const status = validateStatus(args.status, ["Available", "Selected", "Planted"], "land status");
    return result(
      "poshane_apply_command_center_filters",
      "the land registry filters have been applied in read-only mode.",
      { module: targetModule, district: district?.name ?? null, land_type: landType ?? null, status: status ?? null },
      { module: targetModule, district: district?.name ?? null, land_type: landType ?? null, status: status ?? null },
      { frame: "f3", filters: { landDistrict: district?.name, landType, landStatus: status }, highlightId: "land-registry" }
    );
  }
  if (targetModule === "stakeholders") {
    const category =
      validateStatus(args.category, ["All", "NGO", "Government agency", "Volunteer network"], "stakeholder category") ??
      "All";
    const district = findDistrict(args.district);
    return result(
      "poshane_apply_command_center_filters",
      "the stakeholder filters have been applied in read-only mode.",
      { module: targetModule, category, district: district?.name ?? null },
      { module: targetModule, category, district: district?.name ?? null },
      { frame: "f4", filters: { stakeholderCategory: category, stakeholderDistrict: district?.name }, highlightId: "stakeholders" }
    );
  }
  throw new Error(`Filters are not supported for module: ${targetModule}`);
}

function highlight(args: Args) {
  const targetModule = text(args.module, "module");
  const item = text(args.item, "item");
  const frame = FRAME_BY_MODULE[targetModule] ?? "f1";
  return result(
    "poshane_highlight_command_center_item",
    `highlighting ${item} in the current command-center interface.`,
    { module: targetModule, item },
    { module: targetModule, item },
    { frame, highlightId: `${targetModule}-${slug(item)}`, highlightLabel: item }
  );
}

function executeMockTool(tool: PoshaneMitraToolName, args: Args): PoshaneMitraToolResult {
  switch (tool) {
    case "poshane_get_project_brief":
      return projectBrief(args);
    case "poshane_get_state_overview":
      return stateOverview(tool);
    case "poshane_get_state_trends":
      return stateTrends(args);
    case "poshane_get_district_progress":
      return districtProgress(args);
    case "poshane_get_taluk_progress":
      return talukProgress(args);
    case "poshane_compare_districts":
      return compareDistricts(args);
    case "poshane_get_land_registry":
      return landRegistry(args);
    case "poshane_get_stakeholders":
      return stakeholders(args);
    case "poshane_get_species_planning":
      return speciesPlanning(args);
    case "poshane_get_nursery_mapping":
      return nurseryMapping(args);
    case "poshane_get_monitoring_calendar":
      return monitoringCalendar(args);
    case "poshane_get_audit_log":
      return auditLog(args);
    case "poshane_get_field_entry_feed":
      return fieldEntryFeed(args);
    case "poshane_get_complaints":
      return complaints(args);
    case "poshane_get_alerts":
      return alerts(args);
    case "poshane_navigate_command_center":
      return navigate(args);
    case "poshane_apply_command_center_filters":
      return applyFilters(args);
    case "poshane_highlight_command_center_item":
      return highlight(args);
    default:
      throw new Error(`Unsupported read-only Poshane Mitra tool: ${tool}`);
  }
}

function buildBootstrap(): BootstrapPayload {
  return {
    districts: DISTRICTS.map((d) => ({ name: d.name, code: d.code })),
    taluks: TALUKS.map((taluk) => ({
      name: taluk.name,
      code: taluk.code,
      district: taluk.districtName,
      districtCode: taluk.districtCode,
    })),
    zones: SILVI_ZONES.map((zone) => zone.name),
    project_brief_topics: projectBriefTopics(),
    land_types: LAND_TYPES,
    site_names: SITES.map((s) => s[1]),
    stakeholder_names: STK.map((s) => s[0]),
    nursery_names: NURSERIES.map((n) => n[0]),
    issue_ids: ISSUES.map((i) => i[0]),
    last_updated_at: LAST_UPDATED_AT,
    formats: { saplings: fmtIN(1_00_000), lakh: lakhToStr(1) },
  };
}

export const mockPoshaneDataProvider: PoshaneCommandCenterDataProvider = {
  executeTool: executeMockTool,
  bootstrap: buildBootstrap,
};

export function executePoshaneMitraTool(
  tool: PoshaneMitraToolName,
  args: Args
): PoshaneMitraToolResult {
  return mockPoshaneDataProvider.executeTool(tool, args);
}

export function getPoshaneMitraBootstrap() {
  return mockPoshaneDataProvider.bootstrap();
}
