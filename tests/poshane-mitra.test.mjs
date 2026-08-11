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
const uiActionEvent = read("app/command-center/mitra/ui-action-event.ts");
const frames = read("app/command-center/components/frames.tsx");
const financials = read("app/command-center/components/financials.tsx");
const schematics = read("app/command-center/components/schematics.tsx");
const commandCenterCss = read("app/command-center/command-center.css");
const envExample = read(".env.example");

test("Realtime WebRTC calls are established server-side through the unified interface", () => {
  assert.match(sessionRoute, /\/v1\/realtime\/calls/);
  assert.match(sessionRoute, /formData\.set\("sdp", sdp\)/);
  assert.match(sessionRoute, /formData\.set\("session", JSON\.stringify\(realtimeSessionConfig\(\)\)\)/);
  assert.match(sessionRoute, /OpenAI-Safety-Identifier/);
  assert.match(sessionRoute, /gpt-realtime-2\.1/);
  assert.match(sessionRoute, /cedar/);
  assert.doesNotMatch(sessionRoute, /\/v1\/realtime\/client_secrets/);
  assert.match(client, /fetch\(SESSION_ENDPOINT/);
  assert.doesNotMatch(client, /https:\/\/api\.openai\.com\/v1\/realtime\/calls/);
  assert.doesNotMatch(client, /process\.env\.OPENAI_API_KEY|sk-proj|Bearer \$\{process\.env/);
});

test("browser client uses WebRTC audio, interruption, mute, reconnect, and text fallback", () => {
  assert.match(client, /RTCPeerConnection/);
  assert.match(client, /navigator\.mediaDevices\.getUserMedia/);
  assert.match(client, /echoCancellation: true/);
  assert.match(client, /noiseSuppression: true/);
  assert.match(client, /autoGainControl: true/);
  assert.match(client, /fetch\(SESSION_ENDPOINT, \{/);
  assert.match(client, /"Content-Type": "application\/sdp"/);
  assert.match(client, /connectionIdRef\.current !== connectionId/);
  assert.match(client, /dcRef\.current === channel/);
  assert.match(client, /pcRef\.current !== pc/);
  assert.match(client, /output_audio_buffer\.clear/);
  assert.match(client, /IAFT_MEETING_GREETING/);
  assert.match(client, /IAFT_MEETING_DATE = "2026-08-10"/);
  assert.match(client, /PROGRAMME_TIME_ZONE = "Asia\/Kolkata"/);
  assert.match(client, /calendarDateInProgrammeTimeZone/);
  assert.match(client, /function greetingForDate/);
  assert.match(client, /\? IAFT_MEETING_GREETING\s+: GENERAL_GREETING/);
  assert.match(client, /instructions: greetingForDate\(\)/);
  assert.match(client, /Respected Chairman of IAFT, honourable Executive Committee members/);
  assert.match(client, /Namaskara\. I am Mitra, your voice assistant/);
  assert.match(client, /I can answer your questions, explain programme information/);
  assert.match(client, /How may I assist you\?/);
  assert.match(client, /input: \[\]/);
  assert.doesNotMatch(client, /My role is to support this review with clear, concise and source-based answers/);
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
  assert.match(client, /MITRA_MAX_SPOKEN_TOKENS = 800/);
  assert.match(client, /MITRA_RECOVERY_TOKENS = 480/);
  assert.match(client, /MITRA_GREETING_TOKENS = 480/);
  assert.match(client, /DISCONNECT_GRACE_MS/);
  assert.doesNotMatch(client, /REFRESH_BEFORE_EXPIRY_MS|setSessionExpiresAt/);
  assert.match(client, /setMuted/);
  assert.match(client, /Text fallback command/);
  assert.match(client, /Microphone permission was denied/);
  assert.match(client, /navigator\.mediaDevices\.enumerateDevices/);
  assert.match(client, /BUILT_IN_MICROPHONE_PATTERN/);
  assert.match(client, /deviceId: \{ exact: requestedDeviceId \}/);
  assert.match(client, /selectAudioOutput/);
  assert.match(client, /setSinkId/);
  assert.match(client, /Laptop mic → Bluetooth speaker/);
  assert.match(client, /End the Mitra session to change audio devices/);
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
  assert.match(sessionRoute, /three to five natural spoken sentences/);
  assert.match(sessionRoute, /Never stop mid-sentence merely to be brief/);
  assert.match(client, /status_details/);
  assert.match(client, /stoppedAtTokenLimit/);
  assert.match(client, /reason === "max_output_tokens"/);
  assert.match(client, /incompleteContinuationCountRef/);
  assert.match(client, /Continue naturally from the exact point where it stopped/);
  assert.match(envExample, /POSHANE_MITRA_MAX_OUTPUT_TOKENS=800/);
  assert.match(sessionRoute, /Do not use technical words such as dataset/);
  assert.match(sessionRoute, /Answer directly from the current Command Center records/);
  assert.match(sessionRoute, /Do not add qualifiers such as illustrative, mock, demonstration, prototype or not live/);
  assert.match(sessionRoute, /Mention the source module or freshness only when the user asks/);
  assert.doesNotMatch(sessionRoute, /Begin relevant factual answers with: Based on the current demonstration records/);
  assert.doesNotMatch(client, /Illustrative prototype — mock data for demonstration/);
  assert.doesNotMatch(appShell, /Illustrative prototype — mock data for demonstration/);
  assert.doesNotMatch(financials, /All figures illustrative/);
  assert.doesNotMatch(schematics, /Illustrative of system structure/);
  assert.doesNotMatch(commandCenterCss, /proto-flag|mitra-disclosure/);
  assert.match(client, /toolResultForAssistant/);
  assert.doesNotMatch(client, /X-Mitra-Record-Status|recordStatus/);
  assert.match(sessionRoute, /call the appropriate read-only lookup silently/);
  assert.match(sessionRoute, /Speak only after the lookup result has been returned/);
  assert.match(client, /All requested Command Center lookups are now complete/);
  assert.match(client, /Promise\.all\(calls\.map/);
  assert.match(client, /requestToolResultSpeech\(\)/);
  assert.doesNotMatch(client, /event\.type === "response\.function_call_arguments\.done"/);
  assert.doesNotMatch(client, /event\.type === "response\.output_item\.done"/);
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

test("district species questions open Species Planning with the district filter applied", () => {
  assert.match(sessionRoute, /guided two-turn workflow for every species question that names a district/);
  assert.match(sessionRoute, /Retain the district from the immediately preceding species lookup/);
  assert.match(sessionRoute, /Bellary as Ballari/);
  assert.match(sessionRoute, /If the user answers only common land, do not guess/);
  assert.match(sessionRoute, /every recommended species returned for that model/);
  assert.match(definitions, /Always pass district when the user names one/);
  assert.match(definitions, /district: \{/);
  assert.match(definitions, /planting_model: \{/);
  assert.match(definitions, /enum: \["bund", "block", "linear", "gua", "institutional"\]/);
  assert.match(provider, /function speciesPlanning\(args: Args\) \{\n\s+const district = findDistrict\(args\.district\)/);
  assert.match(provider, /SILVI_ZONES\.flatMap/);
  assert.match(provider, /norm\(district\.source\) === q/);
  assert.match(provider, /requires_planting_type: requiresPlantingType/);
  assert.match(provider, /Which planting type is needed/);
  assert.match(provider, /spoken_species: spokenSpecies/);
  assert.match(provider, /speciesDistrict: district\?\.name/);
  assert.match(provider, /speciesModel: plantingModel\?\.key/);
  assert.match(provider, /districtCode: district\?\.code/);
  assert.match(appShell, /<Frame5 voiceFilters=\{voiceFilters\} \/>/);
  assert.match(frames, /export function Frame5\(\{ voiceFilters \}/);
  assert.match(frames, /setDistrictF\(district \?\? ""\)/);
  assert.match(frames, /setModelF\(model \?\? ""\)/);
  assert.match(client, /if a planting type is still required/);
  assert.match(client, /speak every recommended species returned/);
});

test("voice turns can navigate without forcing the transcript drawer open", () => {
  assert.match(client, /lastUiActionRef\.current = payload\.ui_action/);
  assert.match(client, /dispatchMitraUiAction\(payload\.ui_action\)/);
  assert.match(uiActionEvent, /poshane:mitra-ui-action/);
  assert.match(uiActionEvent, /window\.dispatchEvent/);
  assert.match(appShell, /window\.addEventListener\(MITRA_UI_ACTION_EVENT/);
  assert.match(appShell, /applyMitraAction\(\(event as MitraUiActionEvent\)\.detail\)/);
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
  assert.doesNotMatch(provider, /Based on the current demonstration records/);
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
  assert.match(commandCenterCss, /\.pcc \.topbar \.ttl\{display:flex;flex:1 1 240px/);
  assert.match(commandCenterCss, /\.pcc \.demo-link\{display:inline-flex;flex:none/);
  assert.doesNotMatch(commandCenterCss, /\.pcc \.demo-link\{position:absolute/);
  assert.match(commandCenterCss, /\.pcc \.userchip\{display:flex;flex:none/);
  assert.match(commandCenterCss, /@media \(min-width:981px\) and \(max-width:1200px\)/);
  assert.match(commandCenterCss, /\.topbar \.ttl \.t2,\.pcc \.userchip \.urole\{display:none\}/);
});
