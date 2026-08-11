"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { dispatchMitraUiAction } from "./ui-action-event";
import type {
  CommandCenterUiAction,
  PoshaneMitraAuditEvent,
  PoshaneMitraStatus,
  PoshaneMitraToolName,
  PoshaneMitraToolResult,
  PoshaneMitraTranscriptEntry,
} from "./types";

type PoshaneMitraProps = {
  uiContext: CommandCenterUiAction;
};

type SessionMeta = {
  model?: string;
  voice: string;
  record_status: string;
};

type SessionErrorPayload = {
  error: string;
  setup_required?: boolean;
};

type RealtimeEvent = {
  type?: string;
  transcript?: string;
  delta?: string;
  item?: {
    type?: string;
    name?: string;
    call_id?: string;
    arguments?: string;
  };
  response?: {
    status?: string;
    status_details?: {
      type?: string;
      reason?: string;
    } | null;
    output?: Array<{
      type?: string;
      name?: string;
      call_id?: string;
      arguments?: string;
      content?: Array<{ transcript?: string; text?: string }>;
    }>;
    usage?: {
      input_tokens?: number;
      output_tokens?: number;
      total_tokens?: number;
    };
  };
  error?: { message?: string };
  name?: string;
  call_id?: string;
  arguments?: string;
};

type RealtimeUsage = NonNullable<RealtimeEvent["response"]>["usage"];
type ConnectReason = "start" | "reconnect" | "refresh";
type LastToolSnapshot = {
  tool: PoshaneMitraToolName;
  source: string;
  summary: string;
  recordStatus: string;
  lastUpdatedAt: string;
  selectedFilters?: Record<string, string | number | boolean | null>;
};

type AudioDeviceOption = {
  deviceId: string;
  label: string;
};

type AudioOutputMediaDevices = MediaDevices & {
  selectAudioOutput?: (options?: { deviceId?: string }) => Promise<MediaDeviceInfo>;
};

type SinkSelectableAudio = HTMLAudioElement & {
  setSinkId?: (sinkId: string) => Promise<void>;
};

const INACTIVE_MS = 5 * 60 * 1000;
const MAX_SESSION_MS = 55 * 60 * 1000;
const MAX_RECONNECTS = 4;
const DISCONNECT_GRACE_MS = 5_000;
const BLUETOOTH_MIC_RESUME_DELAY_MS = 650;
const MITRA_MAX_SPOKEN_TOKENS = 800;
const MITRA_RECOVERY_TOKENS = 480;
const MITRA_GREETING_TOKENS = 480;
const TOOL_ENDPOINT = "/command-center/mitra/tool";
const SESSION_ENDPOINT = "/command-center/mitra/session";
const AUDIT_ENDPOINT = "/command-center/mitra/audit";
const PROGRAMME_TIME_ZONE = "Asia/Kolkata";
const IAFT_MEETING_DATE = "2026-08-10";
const IAFT_MEETING_GREETING = [
  "Say exactly the following welcome, in a warm, dignified and unhurried manner:",
  "Namaskara. Respected Chairman of IAFT, honourable Executive Committee members, and distinguished participants, welcome.",
  "I am Mitra, your voice assistant for the Poshane Command and Control Center. I can answer your questions, explain programme information, and guide you through the Command Center. How may I assist you?",
].join(" ");
const GENERAL_GREETING = [
  "Say exactly the following greeting in a warm, concise manner:",
  "Namaskara. I am Mitra, your voice assistant for the Poshane Command and Control Center. I can answer your questions, explain programme information, and guide you through the Command Center. How may I assist you?",
].join(" ");

function calendarDateInProgrammeTimeZone(now: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: PROGRAMME_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function greetingForDate(now = new Date()) {
  return calendarDateInProgrammeTimeZone(now) === IAFT_MEETING_DATE
    ? IAFT_MEETING_GREETING
    : GENERAL_GREETING;
}

const MICROPHONE_CONSTRAINTS: MediaTrackConstraints = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
};

const BUILT_IN_MICROPHONE_PATTERN = /built[- ]?in|internal|macbook|laptop/i;

const STATUS_COPY: Record<PoshaneMitraStatus, string> = {
  idle: "Idle",
  connecting: "Connecting",
  listening: "Listening",
  thinking: "Thinking",
  speaking: "Speaking",
  interrupted: "Interrupted",
  muted: "Muted",
  reconnecting: "Reconnecting",
  error: "Error",
};

function nowLabel() {
  return new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function transcriptId() {
  return `mitra-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function estimateCostUsd(usage?: RealtimeUsage) {
  if (!usage?.total_tokens) return 0;
  // A conservative UI-only estimate. Billing remains authoritative in OpenAI/Vercel logs.
  return Number(((usage.total_tokens / 1_000_000) * 5).toFixed(5));
}

function compactText(value: string, max = 420) {
  const text = value.replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trim()}...`;
}

function describeFrame(frame?: CommandCenterUiAction["frame"]) {
  switch (frame) {
    case "f1":
      return "State Overview";
    case "f2":
      return "District Drill-Down";
    case "f9":
      return "Taluk Drill-Down";
    case "f3":
      return "Land and Ownership Registry";
    case "f4":
      return "Stakeholder and Onboarding";
    case "f5":
      return "Species and Agro-Climatic Planning";
    case "f6":
      return "Monitoring and Audit";
    case "f7":
      return "Restricted Financials";
    default:
      return "Command Center";
  }
}

function audioInputOptions(devices: MediaDeviceInfo[]) {
  return devices
    .filter((device) => device.kind === "audioinput" && device.deviceId)
    .map((device, index) => ({
      deviceId: device.deviceId,
      label: device.label || `Microphone ${index + 1}`,
    }));
}

function preferredMicrophone(
  inputs: AudioDeviceOption[],
  requestedDeviceId = "",
) {
  return (
    inputs.find((input) => input.deviceId === requestedDeviceId) ??
    inputs.find((input) => BUILT_IN_MICROPHONE_PATTERN.test(input.label)) ??
    inputs.find((input) => input.deviceId === "default") ??
    inputs[0]
  );
}

export default function PoshaneMitra({ uiContext }: PoshaneMitraProps) {
  const [status, setStatus] = useState<PoshaneMitraStatus>("idle");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState("");
  const [sessionMeta, setSessionMeta] = useState<SessionMeta | null>(null);
  const [entries, setEntries] = useState<PoshaneMitraTranscriptEntry[]>([]);
  const [draft, setDraft] = useState("");
  const [reconnectTick, setReconnectTick] = useState(0);
  const [audioInputs, setAudioInputs] = useState<AudioDeviceOption[]>([]);
  const [selectedInputDeviceId, setSelectedInputDeviceId] = useState("");
  const [selectedOutput, setSelectedOutput] = useState<AudioDeviceOption | null>(null);
  const [audioSetupBusy, setAudioSetupBusy] = useState(false);
  const [audioSetupError, setAudioSetupError] = useState("");
  const [audioSetupNote, setAudioSetupNote] = useState(
    "Mitra will prefer the laptop microphone and use your laptop's current speaker output.",
  );

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentQuestionRef = useRef("");
  const responseTextRef = useRef("");
  const sessionStartedAtRef = useRef<number | null>(null);
  const lastActivityRef = useRef(Date.now());
  const lastUserTurnRef = useRef("");
  const lastAssistantTurnRef = useRef("");
  const lastToolRef = useRef<LastToolSnapshot | null>(null);
  const lastUiActionRef = useRef<CommandCenterUiAction | null>(null);
  const uiContextRef = useRef(uiContext);
  const reconnectAttemptRef = useRef(0);
  const manualEndRef = useRef(false);
  const mutedRef = useRef(false);
  const handledCallsRef = useRef(new Set<string>());
  const disconnectTimerRef = useRef<number | null>(null);
  const microphoneResumeTimerRef = useRef<number | null>(null);
  const microphoneLockedForOutputRef = useRef(false);
  const greetingSentRef = useRef(false);
  const greetingInProgressRef = useRef(false);
  const incompleteContinuationCountRef = useRef(0);
  const responseInProgressRef = useRef(false);
  const audioOutputActiveRef = useRef(false);
  const audioResumeTimerRef = useRef<number | null>(null);
  const connectionIdRef = useRef(0);
  const selectedInputDeviceIdRef = useRef("");
  const selectedOutputDeviceIdRef = useRef("");

  const active = status !== "idle" && status !== "error";
  const displayStatus = muted && active ? "muted" : status;
  const statusSummary =
    status === "error" && error
      ? error.includes("OPENAI_API_KEY")
        ? "Setup required"
        : "Error"
      : STATUS_COPY[displayStatus];

  useEffect(() => {
    uiContextRef.current = uiContext;
  }, [uiContext]);

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  useEffect(() => {
    selectedInputDeviceIdRef.current = selectedInputDeviceId;
  }, [selectedInputDeviceId]);

  useEffect(() => {
    selectedOutputDeviceIdRef.current = selectedOutput?.deviceId ?? "";
  }, [selectedOutput]);

  const detectMicrophones = useCallback(async () => {
    if (active) return;
    setAudioSetupBusy(true);
    setAudioSetupError("");
    let permissionStream: MediaStream | null = null;

    try {
      permissionStream = await navigator.mediaDevices.getUserMedia({
        audio: MICROPHONE_CONSTRAINTS,
      });
      const devices = await navigator.mediaDevices.enumerateDevices();
      const inputs = audioInputOptions(devices);
      const preferred = preferredMicrophone(
        inputs,
        selectedInputDeviceIdRef.current,
      );

      setAudioInputs(inputs);
      if (preferred) {
        selectedInputDeviceIdRef.current = preferred.deviceId;
        setSelectedInputDeviceId(preferred.deviceId);
        setAudioSetupNote(
          BUILT_IN_MICROPHONE_PATTERN.test(preferred.label)
            ? "Laptop microphone selected. Bluetooth remains available for Mitra's voice output."
            : "Microphones detected. Select the laptop microphone before starting Mitra.",
        );
      }
    } catch (deviceError) {
      setAudioSetupError(
        deviceError instanceof DOMException && deviceError.name === "NotAllowedError"
          ? "Microphone permission was denied. Allow access, then detect microphones again."
          : "Mitra could not detect the microphones on this laptop.",
      );
    } finally {
      permissionStream?.getTracks().forEach((track) => track.stop());
      setAudioSetupBusy(false);
    }
  }, [active]);

  const chooseAudioOutput = useCallback(async () => {
    if (active) return;
    setAudioSetupBusy(true);
    setAudioSetupError("");

    try {
      const mediaDevices = navigator.mediaDevices as AudioOutputMediaDevices;
      if (!mediaDevices.selectAudioOutput) {
        setSelectedOutput(null);
        selectedOutputDeviceIdRef.current = "";
        setAudioSetupNote(
          "This browser uses the laptop's system output. Keep your Bluetooth speaker selected in the laptop sound menu.",
        );
        return;
      }

      const device = await mediaDevices.selectAudioOutput(
        selectedOutputDeviceIdRef.current
          ? { deviceId: selectedOutputDeviceIdRef.current }
          : undefined,
      );
      const output = {
        deviceId: device.deviceId,
        label: device.label || "Selected Bluetooth speaker",
      };
      selectedOutputDeviceIdRef.current = output.deviceId;
      setSelectedOutput(output);
      setAudioSetupNote(
        "Bluetooth speaker selected. Mitra will keep the microphone and speaker routes separate.",
      );
    } catch (deviceError) {
      setAudioSetupError(
        deviceError instanceof DOMException && deviceError.name === "NotAllowedError"
          ? "Speaker selection was cancelled or not allowed."
          : "Mitra could not select that speaker. Keep it selected in the laptop sound menu.",
      );
    } finally {
      setAudioSetupBusy(false);
    }
  }, [active]);

  const acquireMicrophoneStream = useCallback(async () => {
    const requestedDeviceId = selectedInputDeviceIdRef.current;
    if (requestedDeviceId) {
      return navigator.mediaDevices.getUserMedia({
        audio: {
          ...MICROPHONE_CONSTRAINTS,
          deviceId: { exact: requestedDeviceId },
        },
      });
    }

    const initialStream = await navigator.mediaDevices.getUserMedia({
      audio: MICROPHONE_CONSTRAINTS,
    });
    const devices = await navigator.mediaDevices.enumerateDevices();
    const inputs = audioInputOptions(devices);
    const preferred = preferredMicrophone(inputs);
    setAudioInputs(inputs);

    if (!preferred) return initialStream;

    selectedInputDeviceIdRef.current = preferred.deviceId;
    setSelectedInputDeviceId(preferred.deviceId);
    const currentDeviceId = initialStream.getAudioTracks()[0]?.getSettings().deviceId;
    if (preferred.deviceId === currentDeviceId || preferred.deviceId === "default") {
      return initialStream;
    }

    initialStream.getTracks().forEach((track) => track.stop());
    return navigator.mediaDevices.getUserMedia({
      audio: {
        ...MICROPHONE_CONSTRAINTS,
        deviceId: { exact: preferred.deviceId },
      },
    });
  }, []);

  const buildContinuityNote = useCallback((reason: ConnectReason) => {
    const context = uiContextRef.current;
    const filters = context.filters ? JSON.stringify(context.filters) : "none";
    const lastTool = lastToolRef.current;
    const parts = [
      "Continuity note from the Command Center. Do not read this note aloud.",
      "Use it only to continue naturally after a brief voice connection refresh.",
      `Reconnect reason: ${reason}.`,
      `Current view: ${describeFrame(context.frame)}.`,
      context.districtCode ? `Selected district code: ${context.districtCode}.` : "",
      context.talukCode ? `Selected taluk code: ${context.talukCode}.` : "",
      `Selected filters: ${filters}.`,
      context.highlightLabel ? `Current highlighted item: ${context.highlightLabel}.` : "",
      lastUserTurnRef.current ? `Last question: ${compactText(lastUserTurnRef.current)}.` : "",
      lastAssistantTurnRef.current ? `Last answer: ${compactText(lastAssistantTurnRef.current)}.` : "",
      lastTool
        ? `Last checked record: ${lastTool.source}; ${compactText(lastTool.summary)}; status ${lastTool.recordStatus}; updated ${lastTool.lastUpdatedAt}.`
        : "",
      "If the previous answer was cut off, continue from the useful next sentence. Do not restart with a long introduction.",
    ];
    return parts.filter(Boolean).join("\n");
  }, []);

  const restoreContinuity = useCallback((channel: RTCDataChannel, reason: ConnectReason) => {
    const hasContext =
      lastUserTurnRef.current ||
      lastAssistantTurnRef.current ||
      lastToolRef.current ||
      uiContextRef.current.frame ||
      uiContextRef.current.districtCode;
    if (!hasContext) return;

    channel.send(JSON.stringify({
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [{ type: "input_text", text: buildContinuityNote(reason) }],
      },
    }));

    if (reason === "reconnect" && responseInProgressRef.current && responseTextRef.current) {
      channel.send(JSON.stringify({
        type: "response.create",
        response: {
          output_modalities: ["audio"],
          max_output_tokens: MITRA_RECOVERY_TOKENS,
          instructions:
            "The voice connection briefly dropped while you were answering. Continue the unfinished answer naturally and complete only the useful point. Keep it short. Do not mention the connection, do not use technical wording, and do not repeat the full answer from the beginning.",
        },
      }));
    }
  }, [buildContinuityNote]);

  const appendEntry = useCallback((entry: Omit<PoshaneMitraTranscriptEntry, "id" | "at">) => {
    setEntries((current) => [
      {
        id: transcriptId(),
        at: nowLabel(),
        ...entry,
      },
      ...current,
    ].slice(0, 30));
  }, []);

  const audit = useCallback((payload: PoshaneMitraAuditEvent) => {
    fetch(AUDIT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => undefined);
  }, []);

  const closePeer = useCallback(() => {
    if (disconnectTimerRef.current != null) {
      window.clearTimeout(disconnectTimerRef.current);
      disconnectTimerRef.current = null;
    }
    if (audioResumeTimerRef.current != null) {
      window.clearTimeout(audioResumeTimerRef.current);
      audioResumeTimerRef.current = null;
    }
    if (microphoneResumeTimerRef.current != null) {
      window.clearTimeout(microphoneResumeTimerRef.current);
      microphoneResumeTimerRef.current = null;
    }
    microphoneLockedForOutputRef.current = false;
    audioOutputActiveRef.current = false;
    const channel = dcRef.current;
    dcRef.current = null;
    channel?.close();
    const peer = pcRef.current;
    pcRef.current = null;
    peer?.getSenders().forEach((sender) => sender.track?.stop());
    peer?.close();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.srcObject = null;
      audioRef.current.remove();
      audioRef.current = null;
    }
  }, []);

  const setMicrophoneTracksEnabled = useCallback((enabled: boolean) => {
    streamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = enabled && !mutedRef.current;
    });
  }, []);

  const lockMicrophoneForOutput = useCallback(() => {
    if (microphoneResumeTimerRef.current != null) {
      window.clearTimeout(microphoneResumeTimerRef.current);
      microphoneResumeTimerRef.current = null;
    }
    microphoneLockedForOutputRef.current = true;
    setMicrophoneTracksEnabled(false);
  }, [setMicrophoneTracksEnabled]);

  const releaseMicrophoneAfterOutput = useCallback(() => {
    if (microphoneResumeTimerRef.current != null) {
      window.clearTimeout(microphoneResumeTimerRef.current);
    }
    microphoneResumeTimerRef.current = window.setTimeout(() => {
      microphoneResumeTimerRef.current = null;
      microphoneLockedForOutputRef.current = false;
      if (manualEndRef.current) return;
      setMicrophoneTracksEnabled(true);
      setStatus("listening");
    }, BLUETOOTH_MIC_RESUME_DELAY_MS);
  }, [setMicrophoneTracksEnabled]);

  const resumeRemoteAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.play().catch(() => undefined);
  }, []);

  const keepRemoteAudioAlive = useCallback(() => {
    if (!audioOutputActiveRef.current || manualEndRef.current) return;
    resumeRemoteAudio();
  }, [resumeRemoteAudio]);

  const markAudioOutputActive = useCallback(() => {
    audioOutputActiveRef.current = true;
    if (audioResumeTimerRef.current != null) {
      window.clearTimeout(audioResumeTimerRef.current);
      audioResumeTimerRef.current = null;
    }
    resumeRemoteAudio();
  }, [resumeRemoteAudio]);

  const releaseAudioOutputSoon = useCallback(() => {
    if (audioResumeTimerRef.current != null) window.clearTimeout(audioResumeTimerRef.current);
    audioResumeTimerRef.current = window.setTimeout(() => {
      audioOutputActiveRef.current = false;
      audioResumeTimerRef.current = null;
    }, 3_000);
  }, []);

  const sendEvent = useCallback((event: Record<string, unknown>) => {
    const channel = dcRef.current;
    if (!channel || channel.readyState !== "open") return false;
    channel.send(JSON.stringify(event));
    return true;
  }, []);

  const requestToolResultSpeech = useCallback(() => sendEvent({
    type: "response.create",
    response: {
      output_modalities: ["audio"],
      max_output_tokens: MITRA_MAX_SPOKEN_TOKENS,
      instructions:
        "All requested Command Center lookups are now complete. Answer only from their results. Speak naturally and avoid technical wording. Give a complete core answer in three to five sentences, usually 45 to 90 spoken words. Finish every sentence and include the requested facts and material caveats before offering more detail. For the guided district species workflow, if a planting type is still required, state the district and zone and ask the single planting-type question without listing species. If a planting model has been selected, speak every recommended species returned for that district and model, even when the list is longer than the usual response. Do not say that you are retrieving, checking, loading or waiting for data.",
    },
  }), [sendEvent]);

  const endSession = useCallback((reason = "ended") => {
    manualEndRef.current = true;
    connectionIdRef.current += 1;
    const duration = sessionStartedAtRef.current
      ? Date.now() - sessionStartedAtRef.current
      : 0;
    closePeer();
    setMuted(false);
    setStatus("idle");
    setError("");
    reconnectAttemptRef.current = 0;
    greetingSentRef.current = false;
    greetingInProgressRef.current = false;
    incompleteContinuationCountRef.current = 0;
    responseInProgressRef.current = false;
    audioOutputActiveRef.current = false;
    responseTextRef.current = "";
    currentQuestionRef.current = "";
    lastUserTurnRef.current = "";
    lastAssistantTurnRef.current = "";
    lastToolRef.current = null;
    lastUiActionRef.current = null;
    audit({
      event: "session_end",
      result_status: "Illustrative",
      audio_duration_ms: duration,
      estimated_cost_usd: 0,
      error: reason === "ended" ? undefined : reason,
    });
  }, [audit, closePeer]);

  const handleToolCall = useCallback(async (
    tool: PoshaneMitraToolName,
    argsJson: string,
    callId: string
  ) => {
    if (!callId || handledCallsRef.current.has(callId)) return false;
    handledCallsRef.current.add(callId);
    const callConnectionId = connectionIdRef.current;
    responseInProgressRef.current = true;
    setStatus("thinking");
    const startedAt = performance.now();
    let parsedArgs: Record<string, unknown> = {};

    try {
      parsedArgs = argsJson ? JSON.parse(argsJson) : {};
    } catch {
      parsedArgs = {};
    }

    try {
      const response = await fetch(TOOL_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool, arguments: parsedArgs }),
      });
      const payload = (await response.json()) as PoshaneMitraToolResult | { error: string };
      if (!response.ok || "error" in payload) {
        throw new Error("error" in payload ? payload.error : "Tool failed.");
      }

      lastToolRef.current = {
        tool,
        source: payload.source,
        summary: payload.summary,
        recordStatus: payload.record_status,
        lastUpdatedAt: payload.last_updated_at,
        selectedFilters: payload.selected_filters,
      };
      if (payload.ui_action) {
        lastUiActionRef.current = payload.ui_action;
        dispatchMitraUiAction(payload.ui_action);
      }

      appendEntry({
        question: currentQuestionRef.current || "Voice request",
        tool,
        source: payload.source,
        selectedFilters: payload.selected_filters,
        result: payload.summary,
        recordStatus: payload.record_status,
        lastUpdatedAt: payload.last_updated_at,
        pendingSyncCount: payload.pending_sync_count,
        latencyMs: Math.round(performance.now() - startedAt),
      });

      if (connectionIdRef.current !== callConnectionId) {
        const channel = dcRef.current;
        if (channel?.readyState === "open") {
          channel.send(JSON.stringify({
            type: "conversation.item.create",
            item: {
              type: "message",
              role: "user",
              content: [{ type: "input_text", text: buildContinuityNote("reconnect") }],
            },
          }));
          channel.send(JSON.stringify({
            type: "response.create",
            response: {
              output_modalities: ["audio"],
              max_output_tokens: MITRA_RECOVERY_TOKENS,
              instructions:
                "A Command Center lookup finished after a brief voice reconnection. Give the result now in a short, natural spoken answer. Do not mention technical details.",
            },
          }));
        }
        return false;
      }

      sendEvent({
        type: "conversation.item.create",
        item: {
          type: "function_call_output",
          call_id: callId,
          output: JSON.stringify(payload),
        },
      });
      return true;
    } catch (toolError) {
      const message =
        toolError instanceof Error ? toolError.message : "Tool call failed.";
      appendEntry({
        question: currentQuestionRef.current || "Voice request",
        tool,
        error: message,
        latencyMs: Math.round(performance.now() - startedAt),
      });
      sendEvent({
        type: "conversation.item.create",
        item: {
          type: "function_call_output",
          call_id: callId,
          output: JSON.stringify({ error: message }),
        },
      });
      return true;
    }
  }, [appendEntry, buildContinuityNote, sendEvent]);

  const handleRealtimeEvent = useCallback((event: RealtimeEvent) => {
    lastActivityRef.current = Date.now();

    if (event.type === "session.created" || event.type === "session.updated") {
      setStatus((current) => (current === "connecting" || current === "reconnecting" ? "listening" : current));
      return;
    }

    if (event.type === "input_audio_buffer.speech_started") {
      if (microphoneLockedForOutputRef.current) return;
      const wasResponding = responseInProgressRef.current || status === "speaking";
      if (responseTextRef.current) {
        lastAssistantTurnRef.current = compactText(responseTextRef.current);
      }
      responseInProgressRef.current = false;
      currentQuestionRef.current = "";
      responseTextRef.current = "";
      setStatus((current) => (current === "speaking" ? "interrupted" : "listening"));
      if (wasResponding) {
        sendEvent({ type: "response.cancel" });
        sendEvent({ type: "output_audio_buffer.clear" });
        audioRef.current?.pause();
      }
      return;
    }

    if (event.type === "input_audio_buffer.speech_stopped") {
      setStatus("thinking");
      return;
    }

    if (event.type === "conversation.item.input_audio_transcription.completed") {
      currentQuestionRef.current = event.transcript ?? currentQuestionRef.current;
      lastUserTurnRef.current = currentQuestionRef.current;
      incompleteContinuationCountRef.current = 0;
      responseInProgressRef.current = true;
      return;
    }

    if (event.type === "response.created") {
      responseInProgressRef.current = true;
      lockMicrophoneForOutput();
      markAudioOutputActive();
      return;
    }

    if (
      event.type === "response.output_audio_transcript.delta" ||
      event.type === "response.audio_transcript.delta" ||
      event.type === "response.audio.delta" ||
      event.type === "response.output_text.delta"
    ) {
      responseTextRef.current += event.delta ?? "";
      responseInProgressRef.current = true;
      setStatus("speaking");
      markAudioOutputActive();
      return;
    }

    if (event.type === "response.done") {
      const usage = event.response?.usage;
      const cancelled = event.response?.status === "cancelled";
      const stoppedAtTokenLimit =
        event.response?.status === "incomplete" &&
        event.response.status_details?.reason === "max_output_tokens";
      const calls = event.response?.output?.filter((item) => item.type === "function_call") ?? [];

      const assistantText =
        responseTextRef.current ||
        event.response?.output
          ?.flatMap((item) => item.content ?? [])
          .map((part) => part.transcript ?? part.text ?? "")
          .join(" ")
          .trim();

      if (cancelled) {
        if (assistantText) lastAssistantTurnRef.current = compactText(assistantText);
        incompleteContinuationCountRef.current = 0;
        responseInProgressRef.current = false;
        releaseMicrophoneAfterOutput();
        releaseAudioOutputSoon();
        responseTextRef.current = "";
        return;
      }

      if (calls.length > 0) {
        responseTextRef.current = "";
        responseInProgressRef.current = true;
        setStatus("thinking");
        audit({
          event: "tool_call",
          result_status: "Illustrative",
          estimated_cost_usd: estimateCostUsd(usage),
        });
        void Promise.all(calls.map((call) => {
          if (!call.name || !call.call_id) return Promise.resolve(false);
          return handleToolCall(
            call.name as PoshaneMitraToolName,
            call.arguments ?? "{}",
            call.call_id,
          );
        })).then((completedCalls) => {
          if (completedCalls.some(Boolean)) {
            requestToolResultSpeech();
          }
        });
        return;
      }

      if (
        stoppedAtTokenLimit &&
        calls.length === 0 &&
        incompleteContinuationCountRef.current < 1
      ) {
        incompleteContinuationCountRef.current += 1;
        audit({
          event: "tool_call",
          result_status: "Illustrative",
          estimated_cost_usd: estimateCostUsd(usage),
        });
        setStatus("thinking");
        responseInProgressRef.current = true;
        const continuationSent = sendEvent({
          type: "response.create",
          response: {
            output_modalities: ["audio"],
            max_output_tokens: MITRA_RECOVERY_TOKENS,
            instructions:
              "Your previous spoken response reached its output limit. Continue naturally from the exact point where it stopped, complete the unfinished sentence and the requested answer, and then stop. Do not repeat the introduction or any completed point. Use no more than three short sentences.",
          },
        });
        if (continuationSent) return;
      }

      incompleteContinuationCountRef.current = 0;

      if (assistantText && calls.length === 0) {
        lastAssistantTurnRef.current = compactText(assistantText);
        appendEntry({
          question: currentQuestionRef.current || "Voice request",
          assistant: assistantText,
          result: assistantText,
          recordStatus: "Illustrative",
          lastUpdatedAt: sessionMeta ? new Date().toISOString() : undefined,
          latencyMs: 0,
        });
      }
      audit({
        event: "tool_call",
        result_status: "Illustrative",
        estimated_cost_usd: estimateCostUsd(usage),
      });
      if (greetingInProgressRef.current) {
        greetingInProgressRef.current = false;
      }
      responseInProgressRef.current = false;
      releaseMicrophoneAfterOutput();
      releaseAudioOutputSoon();
      responseTextRef.current = "";
      return;
    }

    if (event.type === "error") {
      const message = event.error?.message ?? "Realtime session error.";
      responseInProgressRef.current = false;
      setError(message);
      setStatus("error");
      appendEntry({ question: currentQuestionRef.current || "Realtime session", error: message });
    }
  }, [appendEntry, audit, handleToolCall, lockMicrophoneForOutput, markAudioOutputActive, releaseAudioOutputSoon, releaseMicrophoneAfterOutput, requestToolResultSpeech, sendEvent, sessionMeta, status]);

  const connect = useCallback(async (reason: ConnectReason = "start") => {
    const reconnecting = reason !== "start";
    const connectionId = connectionIdRef.current + 1;
    connectionIdRef.current = connectionId;
    manualEndRef.current = false;
    setError("");
    setStatus(reconnecting ? "reconnecting" : "connecting");
    if (!reconnecting) greetingSentRef.current = false;
    closePeer();

    try {
      lastActivityRef.current = Date.now();
      handledCallsRef.current.clear();

      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      const audio = document.createElement("audio");
      audio.autoplay = true;
      audio.muted = false;
      audio.volume = 1;
      audio.preload = "auto";
      audio.setAttribute("playsinline", "true");
      audio.style.display = "none";
      audio.addEventListener("pause", keepRemoteAudioAlive);
      audio.addEventListener("stalled", keepRemoteAudioAlive);
      audio.addEventListener("waiting", keepRemoteAudioAlive);
      const selectedOutputDeviceId = selectedOutputDeviceIdRef.current;
      if (selectedOutputDeviceId) {
        const sinkSelectableAudio = audio as SinkSelectableAudio;
        if (!sinkSelectableAudio.setSinkId) {
          throw new Error(
            "This browser cannot route Mitra directly to the selected speaker. Use the laptop sound menu instead.",
          );
        }
        try {
          await sinkSelectableAudio.setSinkId(selectedOutputDeviceId);
        } catch {
          throw new Error(
            "The selected speaker is unavailable. Open Audio setup and choose the Bluetooth speaker again.",
          );
        }
      }
      document.body.appendChild(audio);
      audioRef.current = audio;
      pc.ontrack = (event) => {
        audio.srcObject = event.streams[0];
        audio.play().catch(() => undefined);
      };

      const stream = await acquireMicrophoneStream();
      streamRef.current = stream;
      stream.getAudioTracks().forEach((track) => {
        track.enabled = reconnecting ? !mutedRef.current : false;
        pc.addTrack(track, stream);
      });

      const channel = pc.createDataChannel("oai-events");
      dcRef.current = channel;
      channel.addEventListener("open", () => {
        if (dcRef.current !== channel || connectionIdRef.current !== connectionId) return;
        setStatus("listening");
        if (!reconnecting && !greetingSentRef.current) {
          greetingSentRef.current = true;
          greetingInProgressRef.current = true;
          channel.send(JSON.stringify({
            type: "response.create",
            response: {
              input: [],
              output_modalities: ["audio"],
              max_output_tokens: MITRA_GREETING_TOKENS,
              instructions: greetingForDate(),
            },
          }));
        } else {
          setMicrophoneTracksEnabled(true);
        }
        if (reconnecting) {
          restoreContinuity(channel, reason);
        }
      });
      channel.addEventListener("message", (message) => {
        if (dcRef.current !== channel || connectionIdRef.current !== connectionId) return;
        try {
          handleRealtimeEvent(JSON.parse(message.data));
        } catch {
          setError("Could not parse a Realtime event.");
        }
      });
      channel.addEventListener("close", () => {
        if (
          dcRef.current === channel &&
          connectionIdRef.current === connectionId &&
          !manualEndRef.current
        ) {
          setStatus("reconnecting");
        }
      });

      pc.onconnectionstatechange = () => {
        if (
          pcRef.current !== pc ||
          connectionIdRef.current !== connectionId ||
          manualEndRef.current
        ) return;
        if (["failed", "closed"].includes(pc.connectionState)) {
          setStatus("reconnecting");
          return;
        }
        if (pc.connectionState === "connected") {
          if (disconnectTimerRef.current != null) {
            window.clearTimeout(disconnectTimerRef.current);
            disconnectTimerRef.current = null;
          }
          setStatus((current) => current === "reconnecting" ? "listening" : current);
          return;
        }
        if (pc.connectionState === "disconnected" && disconnectTimerRef.current == null) {
          disconnectTimerRef.current = window.setTimeout(() => {
            disconnectTimerRef.current = null;
            if (!manualEndRef.current && pc.connectionState === "disconnected") {
              setStatus("reconnecting");
            }
          }, DISCONNECT_GRACE_MS);
        }
      };

      pc.oniceconnectionstatechange = () => {
        if (
          pcRef.current === pc &&
          connectionIdRef.current === connectionId &&
          !manualEndRef.current &&
          (pc.iceConnectionState === "failed" || pc.iceConnectionState === "closed")
        ) {
          setStatus("reconnecting");
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      const sdpResponse = await fetch(SESSION_ENDPOINT, {
        method: "POST",
        body: offer.sdp,
        headers: {
          "Content-Type": "application/sdp",
        },
      });
      const responseBody = await sdpResponse.text();
      if (!sdpResponse.ok) {
        let message = `Realtime connection failed with status ${sdpResponse.status}.`;
        try {
          const payload = JSON.parse(responseBody) as SessionErrorPayload;
          if (payload.error) message = payload.error;
        } catch {
          // The same-origin endpoint normally returns JSON for errors.
        }
        throw new Error(message);
      }
      if (connectionIdRef.current !== connectionId || pcRef.current !== pc) {
        return;
      }

      await pc.setRemoteDescription({
        type: "answer",
        sdp: responseBody,
      });

      const connectedSession: SessionMeta = {
        model: sdpResponse.headers.get("X-Mitra-Model") ?? "gpt-realtime-2.1",
        voice: sdpResponse.headers.get("X-Mitra-Voice") ?? "cedar",
        record_status:
          sdpResponse.headers.get("X-Mitra-Record-Status") ?? "Illustrative",
      };
      setSessionMeta(connectedSession);
      sessionStartedAtRef.current = Date.now();
      reconnectAttemptRef.current = 0;
      appendEntry({
        question: reconnecting ? "Session restored" : "Session started",
        result: reconnecting
          ? "Mitra restored the recent Command Center context."
          : `Mitra connected with ${connectedSession.voice} voice.`,
        recordStatus: "Illustrative",
        lastUpdatedAt: new Date().toISOString(),
      });
    } catch (connectError) {
      if (connectionIdRef.current !== connectionId) return;
      closePeer();
      const nonRetryableDeviceError =
        connectError instanceof DOMException &&
        ["NotAllowedError", "OverconstrainedError", "NotFoundError"].includes(
          connectError.name,
        );
      const message =
        connectError instanceof DOMException && connectError.name === "NotAllowedError"
          ? "Microphone permission was denied. Use text mode or allow microphone access."
          : connectError instanceof DOMException && connectError.name === "OverconstrainedError"
          ? "The selected microphone is unavailable. Open Audio setup and choose the laptop microphone again."
          : connectError instanceof DOMException && connectError.name === "NotFoundError"
          ? "The selected microphone or speaker is no longer connected. Open Audio setup and choose it again."
          : connectError instanceof Error
          ? connectError.message
          : "Could not connect Mitra.";
      setError(message);
      if (
        reconnecting &&
        !nonRetryableDeviceError &&
        reconnectAttemptRef.current < MAX_RECONNECTS
      ) {
        setStatus("reconnecting");
        appendEntry({ question: "Connection restore", error: message });
        setReconnectTick((tick) => tick + 1);
      } else {
        setStatus("error");
        setDrawerOpen(true);
        appendEntry({ question: "Connection attempt", error: message });
      }
      audit({ event: "error", result_status: "Error", error: message });
    }
  }, [acquireMicrophoneStream, appendEntry, audit, closePeer, handleRealtimeEvent, keepRemoteAudioAlive, restoreContinuity, setMicrophoneTracksEnabled]);

  useEffect(() => {
    if (status !== "reconnecting" || manualEndRef.current) return;
    if (reconnectAttemptRef.current >= MAX_RECONNECTS) {
      closePeer();
      setStatus("error");
      setError("The voice connection was lost. Start a new Mitra session.");
      return;
    }
    const delay = Math.min(12_000, 800 * 2 ** reconnectAttemptRef.current);
    reconnectAttemptRef.current += 1;
    const timeout = window.setTimeout(() => void connect("reconnect"), delay);
    return () => window.clearTimeout(timeout);
  }, [closePeer, connect, reconnectTick, status]);

  useEffect(() => {
    if (!active || !sessionStartedAtRef.current || manualEndRef.current) return;
    const refreshIn = sessionStartedAtRef.current + MAX_SESSION_MS - Date.now();
    const timeout = window.setTimeout(() => {
      if (!manualEndRef.current) void connect("refresh");
    }, Math.max(10_000, refreshIn));
    return () => window.clearTimeout(timeout);
  }, [active, connect]);

  useEffect(() => {
    if (!active) return;
    const interval = window.setInterval(() => {
      if (Date.now() - lastActivityRef.current > INACTIVE_MS) {
        endSession("inactive-timeout");
      }
    }, 15_000);
    return () => window.clearInterval(interval);
  }, [active, endSession]);

  useEffect(() => () => closePeer(), [closePeer]);

  const toggleMute = useCallback(() => {
    const next = !muted;
    mutedRef.current = next;
    setMuted(next);
    setMicrophoneTracksEnabled(
      !greetingInProgressRef.current && !microphoneLockedForOutputRef.current
    );
    setStatus(next ? "muted" : "listening");
  }, [muted, setMicrophoneTracksEnabled]);

  const sendText = useCallback(() => {
    const text = draft.trim();
    if (!text) return;
    currentQuestionRef.current = text;
    lastUserTurnRef.current = text;
    incompleteContinuationCountRef.current = 0;
    setDraft("");
    setDrawerOpen(true);
    if (!active || !sendEvent({
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [{ type: "input_text", text }],
      },
    })) {
      appendEntry({
        question: text,
        error: "Start Mitra before sending text fallback requests.",
      });
      return;
    }
    sendEvent({
      type: "response.create",
      response: { output_modalities: ["audio"], max_output_tokens: MITRA_MAX_SPOKEN_TOKENS },
    });
    setStatus("thinking");
  }, [active, appendEntry, draft, sendEvent]);

  const statusTitle = useMemo(() => {
    if (error) return error;
    if (!sessionMeta) return "Mitra voice assistant";
    return `${sessionMeta.model ?? "Realtime"} · ${sessionMeta.voice} · ${sessionMeta.record_status}`;
  }, [error, sessionMeta]);

  return (
    <div className="mitra" data-state={displayStatus}>
      <div className="mitra-control" aria-label="Mitra voice controls">
        <button
          type="button"
          className="mitra-mic"
          aria-label={active ? "End Mitra session" : "Start Mitra"}
          title={active ? "End Mitra" : "Start Mitra"}
          onClick={() => (active ? endSession() : void connect("start"))}
        >
          <span className="mitra-wheel" aria-hidden="true">
            <span className="mitra-ring mitra-ring-a" />
            <span className="mitra-ring mitra-ring-b" />
            <span className="mitra-ring mitra-ring-c" />
            <span className="mitra-spokes" />
            <span className="mitra-core">
              <span className="mitra-dot" />
            </span>
          </span>
          <span className="mitra-label">
            <b>Mitra</b>
            <small>{statusSummary}</small>
          </span>
        </button>
        <button
          type="button"
          className="mitra-iconbtn"
          aria-label={muted ? "Unmute microphone" : "Mute microphone"}
          title={muted ? "Unmute" : "Mute"}
          disabled={!active}
          onClick={toggleMute}
        >
          {muted ? "Unmute" : "Mute"}
        </button>
        <button
          type="button"
          className="mitra-iconbtn"
          aria-label="Open Mitra audio setup"
          title="Choose microphone and speaker"
          onClick={() => {
            setDrawerOpen(true);
            void detectMicrophones();
          }}
        >
          Audio
        </button>
        <button
          type="button"
          className="mitra-iconbtn"
          aria-label="Open Mitra transcript"
          title="Open optional transcript"
          onClick={() => setDrawerOpen(true)}
        >
          Log
        </button>
      </div>

      <div className="mitra-sr" role="status" aria-live="polite">
        {statusTitle}
      </div>

      {drawerOpen && (
        <aside className="mitra-drawer" aria-label="Mitra transcript drawer">
          <div className="mitra-drawer-head">
            <div>
              <h3>Mitra</h3>
              <p>{statusTitle}</p>
            </div>
            <button type="button" onClick={() => setDrawerOpen(false)} aria-label="Close transcript">
              Close
            </button>
          </div>
          <section className="mitra-audio-setup" aria-label="Audio device setup">
            <div className="mitra-audio-heading">
              <div>
                <span>Room audio</span>
                <strong>Laptop mic → Bluetooth speaker</strong>
              </div>
              <button
                type="button"
                disabled={active || audioSetupBusy}
                onClick={() => void detectMicrophones()}
              >
                {audioSetupBusy ? "Working…" : "Detect"}
              </button>
            </div>
            <label className="mitra-audio-field">
              <span>Microphone</span>
              <select
                value={selectedInputDeviceId}
                disabled={active || audioSetupBusy || audioInputs.length === 0}
                onChange={(event) => {
                  selectedInputDeviceIdRef.current = event.target.value;
                  setSelectedInputDeviceId(event.target.value);
                  setAudioSetupError("");
                  const input = audioInputs.find(
                    (device) => device.deviceId === event.target.value,
                  );
                  setAudioSetupNote(
                    input && BUILT_IN_MICROPHONE_PATTERN.test(input.label)
                      ? "Laptop microphone selected. Bluetooth remains available for Mitra's voice output."
                      : "Selected microphone will be used when the next Mitra session starts.",
                  );
                }}
              >
                {audioInputs.length === 0 && (
                  <option value="">Detect microphones first</option>
                )}
                {audioInputs.map((input) => (
                  <option key={input.deviceId} value={input.deviceId}>
                    {input.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="mitra-audio-output">
              <div>
                <span>Speaker</span>
                <strong>{selectedOutput?.label ?? "Laptop system output"}</strong>
              </div>
              <button
                type="button"
                disabled={active || audioSetupBusy}
                onClick={() => void chooseAudioOutput()}
              >
                Choose
              </button>
            </div>
            <p>{audioSetupNote}</p>
            {active && <small>End the Mitra session to change audio devices.</small>}
            {audioSetupError && <div className="mitra-audio-error">{audioSetupError}</div>}
          </section>
          <div className="mitra-textbox">
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") sendText();
              }}
              placeholder="Type a read-only command..."
              aria-label="Text fallback command"
            />
            <button type="button" onClick={sendText}>Send</button>
          </div>
          {error && <div className="mitra-error">{error}</div>}
          <div className="mitra-disclosure">
            Illustrative prototype — mock data for demonstration. Not live operational data.
          </div>
          <div className="mitra-entries">
            {entries.length ? entries.map((entry) => (
              <article key={entry.id} className="mitra-entry">
                <div className="mitra-entry-top">
                  <span>{entry.at}</span>
                  {entry.recordStatus && <b>{entry.recordStatus}</b>}
                </div>
                <h4>{entry.question}</h4>
                {entry.tool && <p><strong>Tool</strong> {entry.tool}</p>}
                {entry.source && <p><strong>Source</strong> {entry.source}</p>}
                {entry.selectedFilters && Object.keys(entry.selectedFilters).length > 0 && (
                  <p><strong>Filters</strong> {JSON.stringify(entry.selectedFilters)}</p>
                )}
                {entry.result && <p><strong>Result</strong> {entry.result}</p>}
                {entry.assistant && <p><strong>Assistant</strong> {entry.assistant}</p>}
                {entry.lastUpdatedAt && <p><strong>Timestamp</strong> {entry.lastUpdatedAt}</p>}
                {entry.pendingSyncCount != null && <p><strong>Pending sync</strong> {entry.pendingSyncCount}</p>}
                {entry.latencyMs != null && <p><strong>Latency</strong> {entry.latencyMs} ms</p>}
                {entry.error && <p className="mitra-entry-error"><strong>Error</strong> {entry.error}</p>}
              </article>
            )) : (
              <div className="mitra-empty">No transcript entries yet.</div>
            )}
          </div>
        </aside>
      )}
    </div>
  );
}
