"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  CommandCenterUiAction,
  PoshaneMitraAuditEvent,
  PoshaneMitraStatus,
  PoshaneMitraToolName,
  PoshaneMitraToolResult,
  PoshaneMitraTranscriptEntry,
} from "./types";

type PoshaneMitraProps = {
  onUiAction: (action: CommandCenterUiAction) => void;
  uiContext: CommandCenterUiAction;
};

type SessionPayload = {
  client_secret: string;
  expires_at: number;
  session: {
    id?: string;
    model?: string;
    voice: string;
    record_status: string;
    is_mock: boolean;
    disclosure: string;
  };
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

const INACTIVE_MS = 5 * 60 * 1000;
const MAX_SESSION_MS = 55 * 60 * 1000;
const MAX_RECONNECTS = 4;
const DISCONNECT_GRACE_MS = 5_000;
const BLUETOOTH_MIC_RESUME_DELAY_MS = 650;
const MITRA_MAX_SPOKEN_TOKENS = 360;
const MITRA_RECOVERY_TOKENS = 240;
const MITRA_GREETING_TOKENS = 240;
const TOOL_ENDPOINT = "/command-center/mitra/tool";
const SESSION_ENDPOINT = "/command-center/mitra/session";
const AUDIT_ENDPOINT = "/command-center/mitra/audit";
const IAFT_MEETING_GREETING = [
  "Say exactly the following welcome, in a warm, dignified and unhurried manner:",
  "Namaskara. Respected Chairman of IAFT, honourable Executive Committee members, and distinguished participants, welcome.",
  "I am Mitra, your voice assistant for the Poshane Command and Control Center. I can answer your questions, explain programme information, and guide you through the Command Center. How may I assist you?",
].join(" ");

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

export default function PoshaneMitra({ onUiAction, uiContext }: PoshaneMitraProps) {
  const [status, setStatus] = useState<PoshaneMitraStatus>("idle");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState("");
  const [sessionMeta, setSessionMeta] = useState<SessionPayload["session"] | null>(null);
  const [entries, setEntries] = useState<PoshaneMitraTranscriptEntry[]>([]);
  const [draft, setDraft] = useState("");
  const [reconnectTick, setReconnectTick] = useState(0);

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
  const responseInProgressRef = useRef(false);
  const audioOutputActiveRef = useRef(false);
  const audioResumeTimerRef = useRef<number | null>(null);
  const connectionIdRef = useRef(0);

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
    dcRef.current?.close();
    dcRef.current = null;
    pcRef.current?.getSenders().forEach((sender) => sender.track?.stop());
    pcRef.current?.close();
    pcRef.current = null;
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

  const endSession = useCallback((reason = "ended") => {
    manualEndRef.current = true;
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
    if (!callId || handledCallsRef.current.has(callId)) return;
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
        onUiAction(payload.ui_action);
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
        return;
      }

      sendEvent({
        type: "conversation.item.create",
        item: {
          type: "function_call_output",
          call_id: callId,
          output: JSON.stringify(payload),
        },
      });
      sendEvent({
        type: "response.create",
        response: {
          output_modalities: ["audio"],
          max_output_tokens: MITRA_MAX_SPOKEN_TOKENS,
          instructions:
            "Answer from the provided Command Center result. Speak naturally, avoid technical wording, and answer short first. Use one to three sentences, then offer to show more detail if useful.",
        },
      });
    } catch (toolError) {
      const message =
        toolError instanceof Error ? toolError.message : "Tool call failed.";
      responseInProgressRef.current = false;
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
      sendEvent({ type: "response.create", response: { output_modalities: ["audio"] } });
    }
  }, [appendEntry, buildContinuityNote, onUiAction, sendEvent]);

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

    if (event.type === "response.function_call_arguments.done") {
      if (event.name && event.call_id) {
        void handleToolCall(
          event.name as PoshaneMitraToolName,
          event.arguments ?? "{}",
          event.call_id
        );
      }
      return;
    }

    if (event.type === "response.output_item.done" && event.item?.type === "function_call") {
      if (event.item.name && event.item.call_id) {
        void handleToolCall(
          event.item.name as PoshaneMitraToolName,
          event.item.arguments ?? "{}",
          event.item.call_id
        );
      }
      return;
    }

    if (event.type === "response.done") {
      const usage = event.response?.usage;
      const cancelled = event.response?.status === "cancelled";
      const calls = event.response?.output?.filter((item) => item.type === "function_call") ?? [];
      calls.forEach((call) => {
        if (call.name && call.call_id) {
          void handleToolCall(call.name as PoshaneMitraToolName, call.arguments ?? "{}", call.call_id);
        }
      });

      const assistantText =
        responseTextRef.current ||
        event.response?.output
          ?.flatMap((item) => item.content ?? [])
          .map((part) => part.transcript ?? part.text ?? "")
          .join(" ")
          .trim();

      if (cancelled) {
        if (assistantText) lastAssistantTurnRef.current = compactText(assistantText);
        responseInProgressRef.current = false;
        releaseMicrophoneAfterOutput();
        releaseAudioOutputSoon();
        responseTextRef.current = "";
        return;
      }

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
  }, [appendEntry, audit, handleToolCall, lockMicrophoneForOutput, markAudioOutputActive, releaseAudioOutputSoon, releaseMicrophoneAfterOutput, sendEvent, sessionMeta, status]);

  const connect = useCallback(async (reason: ConnectReason = "start") => {
    const reconnecting = reason !== "start";
    manualEndRef.current = false;
    setError("");
    setStatus(reconnecting ? "reconnecting" : "connecting");
    if (!reconnecting) greetingSentRef.current = false;
    closePeer();

    try {
      const tokenResponse = await fetch(SESSION_ENDPOINT, { method: "POST" });
      const tokenData = (await tokenResponse.json()) as SessionPayload | SessionErrorPayload;
      if (!tokenResponse.ok || "error" in tokenData) {
        throw new Error("error" in tokenData ? tokenData.error : "Could not start Mitra.");
      }

      setSessionMeta(tokenData.session);
      sessionStartedAtRef.current = Date.now();
      lastActivityRef.current = Date.now();
      handledCallsRef.current.clear();
      connectionIdRef.current += 1;

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
      document.body.appendChild(audio);
      audioRef.current = audio;
      pc.ontrack = (event) => {
        audio.srcObject = event.streams[0];
        audio.play().catch(() => undefined);
      };

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;
      stream.getAudioTracks().forEach((track) => {
        track.enabled = reconnecting ? !mutedRef.current : false;
        pc.addTrack(track, stream);
      });

      const channel = pc.createDataChannel("oai-events");
      dcRef.current = channel;
      channel.addEventListener("open", () => {
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
              instructions: IAFT_MEETING_GREETING,
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
        try {
          handleRealtimeEvent(JSON.parse(message.data));
        } catch {
          setError("Could not parse a Realtime event.");
        }
      });
      channel.addEventListener("close", () => {
        if (!manualEndRef.current) setStatus("reconnecting");
      });

      pc.onconnectionstatechange = () => {
        if (manualEndRef.current) return;
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
          !manualEndRef.current &&
          (pc.iceConnectionState === "failed" || pc.iceConnectionState === "closed")
        ) {
          setStatus("reconnecting");
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      const sdpResponse = await fetch("https://api.openai.com/v1/realtime/calls", {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${tokenData.client_secret}`,
          "Content-Type": "application/sdp",
        },
      });
      if (!sdpResponse.ok) {
        throw new Error("Realtime WebRTC connection failed.");
      }

      await pc.setRemoteDescription({
        type: "answer",
        sdp: await sdpResponse.text(),
      });

      reconnectAttemptRef.current = 0;
      appendEntry({
        question: reconnecting ? "Session restored" : "Session started",
        result: reconnecting
          ? "Mitra restored the recent Command Center context."
          : `Mitra connected with ${tokenData.session.voice} voice.`,
        recordStatus: "Illustrative",
        lastUpdatedAt: new Date().toISOString(),
      });
    } catch (connectError) {
      closePeer();
      const message =
        connectError instanceof DOMException && connectError.name === "NotAllowedError"
          ? "Microphone permission was denied. Use text mode or allow microphone access."
          : connectError instanceof Error
          ? connectError.message
          : "Could not connect Mitra.";
      setError(message);
      if (
        reconnecting &&
        !(connectError instanceof DOMException && connectError.name === "NotAllowedError") &&
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
  }, [appendEntry, audit, closePeer, handleRealtimeEvent, keepRemoteAudioAlive, restoreContinuity, setMicrophoneTracksEnabled]);

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
