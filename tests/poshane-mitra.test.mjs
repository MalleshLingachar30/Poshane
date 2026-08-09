import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const sessionRoute = read("app/command-center/mitra/session/route.ts");
const toolRoute = read("app/command-center/mitra/tool/route.ts");
const auditRoute = read("app/command-center/mitra/audit/route.ts");
const client = read("app/command-center/mitra/PoshaneMitra.tsx");
const provider = read("app/command-center/mitra/provider.ts");
const projectBrief = read("app/command-center/mitra/project-brief.ts");
const definitions = read("app/command-center/mitra/tool-definitions.ts");
const appShell = read("app/command-center/CommandCenterApp.tsx");
const frames = read("app/command-center/components/frames.tsx");
const envExample = read(".env.example");

test("Realtime credentials are created server-side with ephemeral client secrets", () => {
  assert.match(sessionRoute, /\/v1\/realtime\/client_secrets/);
  assert.match(sessionRoute, /OpenAI-Safety-Identifier/);
  assert.match(sessionRoute, /expires_after/);
  assert.match(sessionRoute, /gpt-realtime-2\.1/);
  assert.match(sessionRoute, /cedar/);
  assert.doesNotMatch(client, /process\.env\.OPENAI_API_KEY|sk-proj|Bearer \$\{process\.env/);
});

test("browser client uses WebRTC audio, interruption, mute, reconnect, and text fallback", () => {
  assert.match(client, /RTCPeerConnection/);
  assert.match(client, /navigator\.mediaDevices\.getUserMedia/);
  assert.match(client, /echoCancellation: true/);
  assert.match(client, /noiseSuppression: true/);
  assert.match(client, /autoGainControl: true/);
  assert.match(client, /\/v1\/realtime\/calls/);
  assert.match(client, /output_audio_buffer\.clear/);
  assert.match(client, /IAFT_MEETING_GREETING/);
  assert.match(client, /Respected Chairman of IAFT, honourable Executive Committee members/);
  assert.match(client, /I can answer your questions, explain programme information/);
  assert.match(client, /How may I assist you\?/);
  assert.match(client, /input: \[\]/);
  assert.doesNotMatch(client, /My role is to support this review with clear, concise and source-based answers/);
  assert.match(client, /MITRA_GREETING_TOKENS = 240/);
  assert.match(client, /document\.body\.appendChild\(audio\)/);
  assert.match(client, /keepRemoteAudioAlive/);
  assert.match(client, /audioOutputActiveRef/);
  assert.match(client, /greetingInProgressRef/);
  assert.match(client, /BLUETOOTH_MIC_RESUME_DELAY_MS = 650/);
  assert.match(client, /microphoneLockedForOutputRef/);
  assert.match(client, /lockMicrophoneForOutput/);
  assert.match(client, /releaseMicrophoneAfterOutput/);
  assert.match(client, /setMicrophoneTracksEnabled/);
  assert.match(client, /resumeRemoteAudio/);
  assert.match(client, /MAX_RECONNECTS/);
  assert.match(client, /MAX_SESSION_MS/);
  assert.match(client, /MITRA_MAX_SPOKEN_TOKENS = 360/);
  assert.match(client, /DISCONNECT_GRACE_MS/);
  assert.doesNotMatch(client, /REFRESH_BEFORE_EXPIRY_MS|setSessionExpiresAt/);
  assert.match(client, /setMuted/);
  assert.match(client, /Text fallback command/);
  assert.match(client, /Microphone permission was denied/);
});

test("voice continuity survives reconnects and interrupted output", () => {
  assert.match(client, /buildContinuityNote/);
  assert.match(client, /restoreContinuity/);
  assert.match(client, /lastUserTurnRef/);
  assert.match(client, /lastAssistantTurnRef/);
  assert.match(client, /lastToolRef/);
  assert.match(client, /uiContextRef/);
  assert.match(client, /connectionIdRef/);
  assert.match(client, /response\.cancel/);
  assert.match(client, /output_audio_buffer\.clear/);
  assert.match(client, /The voice connection briefly dropped while you were answering/);
  assert.match(client, /A Command Center lookup finished after a brief voice reconnection/);
  assert.match(client, /Keep it short/);
  assert.match(client, /Session restored/);
});

test("assistant is presented to users as Mitra", () => {
  assert.match(sessionRoute, /Your name is Mitra/);
  assert.match(client, /<b>Mitra<\/b>/);
  assert.match(client, /<h3>Mitra<\/h3>/);
  assert.doesNotMatch(client, />Poshane Mitra<|aria-label="[^"]*Poshane Mitra|title="[^"]*Poshane Mitra/);
});

test("Realtime session is tuned for stable command-center voice continuity", () => {
  assert.match(sessionRoute, /output_modalities: \["audio"\]/);
  assert.match(sessionRoute, /type: "semantic_vad"/);
  assert.match(sessionRoute, /interrupt_response: false/);
  assert.match(sessionRoute, /POSHANE_MITRA_VAD_EAGERNESS \?\? "low"/);
  assert.match(sessionRoute, /reasoning:\s*\{\s*effort:/);
  assert.match(envExample, /POSHANE_MITRA_REASONING_EFFORT=low/);
  assert.match(envExample, /POSHANE_MITRA_VAD_EAGERNESS=low/);
  assert.match(sessionRoute, /Answer short first/);
  assert.match(envExample, /POSHANE_MITRA_MAX_OUTPUT_TOKENS=360/);
  assert.match(sessionRoute, /Do not use technical words such as dataset/);
  assert.match(sessionRoute, /Based on the current demonstration records/);
});

test("assistant understands Poshane and routes monitoring audit requests", () => {
  assert.match(sessionRoute, /Poshane, or ಪೋಷಣೆ/);
  assert.match(sessionRoute, /public landing page explains the programme story/);
  assert.match(sessionRoute, /poshane_get_project_brief before answering/);
  assert.match(projectBrief, /IAFT Strategic Framework & Plan of Action submitted to KSLSA/);
  assert.match(projectBrief, /five crore saplings across Karnataka and rejuvenating lakes and water bodies/);
  assert.match(projectBrief, /no land record, no custodian, no water and protection plan, no Site ID/);
  assert.match(projectBrief, /Rs 125 per surviving seedling over three years/);
  assert.match(provider, /PROJECT_BRIEF_SOURCE/);
  assert.match(provider, /Pending Verification/);
  assert.match(sessionRoute, /three or four natural sentences/);
  assert.match(sessionRoute, /module monitoring_audit/);
  assert.match(definitions, /asks about a module such as Monitoring and Audit/);
  assert.match(definitions, /Monitoring and Audit audit questions/);
  assert.match(provider, /MODULE_LABELS/);
  assert.match(provider, /opening \$\{MODULE_LABELS\[targetModule\]\}/);
  assert.match(provider, /data_flow_schematics: "System Architecture"/);
  assert.match(provider, /highlightId: targetModule === "monitoring_audit" \? "monitoring-calendar"/);
});

test("voice turns can navigate without forcing the transcript drawer open", () => {
  assert.match(client, /lastUiActionRef\.current = payload\.ui_action/);
  assert.match(client, /onUiAction\(payload\.ui_action\)/);
  assert.doesNotMatch(client, /setStatus\("thinking"\);\n\s+setDrawerOpen\(true\);/);
  assert.match(client, /title="Open optional transcript"/);
});

test("server tools stay authenticated, read-only, and backed by provider validation", () => {
  assert.match(toolRoute, /getCommandCenterSession/);
  assert.match(toolRoute, /Unsupported read-only tool/);
  assert.match(provider, /export interface PoshaneCommandCenterDataProvider/);
  assert.match(provider, /Unknown Karnataka district/);
  assert.match(provider, /Unsupported land type/);
  assert.match(provider, /Unsupported read-only Poshane Mitra tool/);
  assert.match(provider, /Based on the current demonstration records/);
  assert.match(auditRoute, /audio_duration_ms/);
  assert.doesNotMatch(auditRoute, /raw_audio|audio_blob|recording_url/);
});

test("all required Poshane Mitra tool definitions are present", () => {
  const tools = [
    "poshane_get_project_brief",
    "poshane_get_state_overview",
    "poshane_get_state_trends",
    "poshane_get_district_progress",
    "poshane_get_taluk_progress",
    "poshane_compare_districts",
    "poshane_get_land_registry",
    "poshane_get_stakeholders",
    "poshane_get_species_planning",
    "poshane_get_nursery_mapping",
    "poshane_get_monitoring_calendar",
    "poshane_get_audit_log",
    "poshane_get_field_entry_feed",
    "poshane_get_complaints",
    "poshane_get_alerts",
    "poshane_navigate_command_center",
    "poshane_apply_command_center_filters",
    "poshane_highlight_command_center_item",
  ];

  for (const tool of tools) {
    assert.match(definitions, new RegExp(`name: "${tool}"`));
    assert.match(provider, new RegExp(`case "${tool}"`));
  }
});

test("assistant is embedded in the existing command-center shell and can target real UI elements", () => {
  assert.match(appShell, /<PoshaneMitra/);
  assert.match(appShell, /uiContext=\{\{/);
  assert.match(appShell, /label: "System Architecture"/);
  assert.match(appShell, /aria-label="System Architecture sections"/);
  assert.match(appShell, /label: "Walkthrough"/);
  assert.match(appShell, /label: "Data Flow"/);
  assert.match(appShell, /label: "Controls"/);
  assert.match(appShell, /label: "GIS"/);
  assert.match(appShell, /setFrame\(action\.frame\)/);
  assert.match(appShell, /setDistrict\(action\.districtCode\)/);
  assert.match(appShell, /CSS\.escape\(voiceHighlight\)/);
  assert.match(frames, /data-mitra-id="state-total-planted"/);
  assert.match(frames, /data-mitra-id="district-land-split"/);
  assert.match(frames, /<DistrictTalukSplit/);
  assert.match(frames, /data-mitra-id="land-registry"/);
  assert.match(frames, /data-mitra-id="stakeholders"/);
  assert.match(frames, /id="stakeholder-district"/);
  assert.match(frames, /voiceFilters\?\.stakeholderDistrict/);
  assert.match(provider, /stakeholderDistrict: district\?\.name/);
  assert.match(provider, /declared_ngos/);
  assert.match(frames, /data-mitra-id="nursery-mapping"/);
  assert.match(frames, /data-mitra-id="monitoring-calendar"/);
  assert.match(frames, /data-mitra-id="complaints"/);
});
