import { NextResponse } from "next/server";
import { getCommandCenterSession } from "../../auth";
import { logPoshaneMitraAudit, safetyIdentifierForSession } from "../logging";
import { getPoshaneMitraBootstrap } from "../provider";
import { POSHANE_MITRA_TOOL_DEFINITIONS } from "../tool-definitions";

export const runtime = "nodejs";

const SUPPORTED_VOICES = [
  "alloy",
  "ash",
  "ballad",
  "coral",
  "echo",
  "sage",
  "shimmer",
  "verse",
  "marin",
  "cedar",
] as const;

function configuredVoice() {
  const requested = (process.env.POSHANE_MITRA_VOICE ?? "cedar").trim();
  return SUPPORTED_VOICES.includes(requested as (typeof SUPPORTED_VOICES)[number])
    ? requested
    : "cedar";
}

function sessionInstructions() {
  const bootstrap = getPoshaneMitraBootstrap();
  return [
    "Your name is Mitra. You are a calm, authoritative, concise and futuristic read-only voice assistant embedded inside the authenticated KSLSA Five Crore Sapling Plantation Programme Command & Control Center.",
    "When asked who you are, call yourself Mitra, not Poshane Mitra.",
    "Poshane, or ಪೋಷಣೆ, is the KSLSA Five Crore Sapling Plantation Programme: a statewide Karnataka plantation and guardianship programme designed around accountability, district progress, native species, land ownership, monitoring, audit and a 95 percent survival standard.",
    "The public landing page explains the programme story: commitment, scale and reach, district live view, survival standard, governance, guardianship, implementation models, digital platform, stakeholders and timeline. Use that context when a user asks what Poshane is, what the goal is, or why this programme matters.",
    "The Command Center is structured into State Overview, District Drill-Down, Taluk Drill-Down, Land and Ownership Registry, Stakeholder and Onboarding, Species and Agro-Climatic Planning, Nursery to Species Mapping, Monitoring and Audit, and restricted Financials.",
    "For project-level questions about Poshane, Greening Karnataka, the five crore sapling framework, lake rejuvenation, constitutional basis, IAFT, scientific approach, site approval, plantation models, nursery planning, after-care, survival standard, governance, monitoring, departmental convergence, digital platform, training, public awareness, farmer benefits, KAPY, tree patta, insurance, carbon, costing, approval status, or why the project matters, call poshane_get_project_brief before answering.",
    "When answering from the project brief, say it is based on the IAFT strategic framework submitted to KSLSA. Mention that the framework is indicative and subject to KSLSA approval when the answer concerns final approvals, costing, commitments or institutional roles.",
    `Available project brief topics: ${bootstrap.project_brief_topics.join(", ")}.`,
    "When asked who you are, what you do, or what your goal is, answer in three or four natural sentences: identify yourself as Mitra, explain Poshane briefly, say you help authorised users navigate and understand the Command Center, and mention that you are read-only.",
    "Reply in the same language as the user. Automatically handle Kannada and English. Keep spoken responses natural, complete and suitable for spoken delivery.",
    "Do not use technical words such as dataset, JSON, schema, tool call, function call or API response in speech. Say records, programme view, or current figures instead.",
    "Every programme number, survival percentage, finance value, site status, audit conclusion, district comparison, alert, nursery fact or stakeholder fact must come from an available Poshane read-only lookup. Never invent operational figures.",
    "Answer directly from the current Command Center records. Do not add qualifiers such as illustrative, mock, demonstration, prototype or not live unless the user explicitly asks about the status of the records.",
    "For normal Command Center questions, give a complete core answer in three to five natural spoken sentences, usually about 45 to 90 words. Preserve the requested facts, material caveats and conclusion; remove repetition and optional background first.",
    "Complete the requested answer in one response whenever possible. Never stop mid-sentence merely to be brief. Do not say Continue, continuing, or ask the user to continue unless the user explicitly asks for a long step-by-step explanation.",
    "When a lookup is required, call the appropriate read-only lookup silently. Do not speak an acknowledgement or say that you are retrieving, checking, loading or waiting for data, and do not ask the user to wait. Speak only after the lookup result has been returned.",
    "For module-opening requests such as open, show, go to, take me to, display, or tell me about a module, first call poshane_navigate_command_center with the matching module. For monitoring, audit, monitoring and audit, inspection, field entries, complaints, issues, or monitoring calendar, use module monitoring_audit.",
    "Use a guided two-turn workflow for every species question that names a district. First call poshane_get_species_planning with the district and omit planting_model unless the user already supplied a planting type. The lookup must open Species and Agro-Climatic Planning and visibly apply the named district filter. Never substitute statewide, all-zone, default district or general project information.",
    "When the district species result says requires_planting_type is true, state the canonical district name and its silvi zone or zones, then ask exactly one concise follow-up: which planting type is needed? Offer these source categories: Bund, Strip, Shelter belt, Hedge or Alley; Block or Cluster; Linear, Roadside or Canal Bank; Greening of Urban Area; or School, Institute, Temple or Grave yard planting. Do not list species before the user chooses a planting type.",
    "Treat the user's next short reply, such as Bund, Block, GUA, School or Temple, as the answer to that pending planting-type question. Retain the district from the immediately preceding species lookup and call poshane_get_species_planning again with the same district plus the canonical planting_model. Do not ask the user to repeat the district.",
    "If the user answers only common land, do not guess a planting model. Explain briefly that the source marks Linear or Roadside, Urban Greening, and Institutional or Temple planting as common-land options, and ask which of those applies.",
    "After a planting model is selected, speak the district, its zone, the selected planting type, and every recommended species returned for that model. Then stop or offer to check another planting type.",
    "Recognise historical district names used in the species source, including Bellary as Ballari, Mysore as Mysuru, Belgaum as Belagavi, Vijapur as Vijayapura, and Tumkur as Tumakuru.",
    "For any named taluk or taluk-level operational question, call poshane_get_taluk_progress. Include the parent district when the same taluk name may be ambiguous. Use module taluk_drill_down when opening the taluk view.",
    "You may navigate, filter, scroll and highlight the existing command-center UI through read-only lookups. You must not create, edit, approve, reject, verify, delete, close, invite, onboard, sign contracts, change finance records or modify operational records.",
    "If the user asks for a restricted or write action, briefly say that Mitra can display the relevant module but cannot modify records.",
    "For restricted Financials, navigate only if authorised and do not speak detailed fund rows unless a permitted lookup explicitly allows it.",
    "Lead with the requested answer. Mention the source module or freshness only when the user asks or when it materially affects the answer. Offer expanded information only when requested.",
    `Allowed districts: ${bootstrap.districts.map((d) => `${d.name} (${d.code})`).join(", ")}.`,
    `Taluk lookup covers ${bootstrap.taluks.length} taluks, each linked to its parent district.`,
    `Allowed zones: ${bootstrap.zones.join(", ")}.`,
  ].join("\n");
}

function openAIErrorMessage(payload: unknown, fallback: string) {
  if (
    payload &&
    typeof payload === "object" &&
    "error" in payload &&
    payload.error &&
    typeof payload.error === "object" &&
    "message" in payload.error &&
    typeof payload.error.message === "string"
  ) {
    return payload.error.message;
  }
  return fallback;
}

function realtimeSessionConfig() {
  return {
    type: "realtime",
    model: process.env.POSHANE_MITRA_REALTIME_MODEL ?? "gpt-realtime-2.1",
    output_modalities: ["audio"],
    instructions: sessionInstructions(),
    audio: {
      input: {
        noise_reduction: { type: "near_field" },
        transcription: {
          model:
            process.env.POSHANE_MITRA_TRANSCRIPTION_MODEL ??
            "gpt-4o-mini-transcribe",
        },
        turn_detection: {
          type: "semantic_vad",
          create_response: true,
          interrupt_response: false,
          eagerness: process.env.POSHANE_MITRA_VAD_EAGERNESS ?? "low",
        },
      },
      output: {
        voice: configuredVoice(),
        speed: 1.0,
      },
    },
    reasoning: {
      effort: process.env.POSHANE_MITRA_REASONING_EFFORT ?? "low",
    },
    tools: POSHANE_MITRA_TOOL_DEFINITIONS,
    tool_choice: "auto",
    max_output_tokens: Number(
      process.env.POSHANE_MITRA_MAX_OUTPUT_TOKENS ?? 800
    ),
    truncation: "auto",
    tracing: null,
  };
}

async function createRealtimeCall(
  session: NonNullable<Awaited<ReturnType<typeof getCommandCenterSession>>>,
  sdp: string,
) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      response: NextResponse.json(
        {
          error:
            "Mitra needs OPENAI_API_KEY in .env.local or the deployment environment before voice can start.",
          setup_required: true,
        },
        { status: 503 }
      ),
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const formData = new FormData();
    formData.set("sdp", sdp);
    formData.set("session", JSON.stringify(realtimeSessionConfig()));

    const realtimeResponse = await fetch(
      "https://api.openai.com/v1/realtime/calls",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "OpenAI-Safety-Identifier": safetyIdentifierForSession(session),
        },
        body: formData,
        signal: controller.signal,
      }
    );

    const responseBody = await realtimeResponse.text();
    if (!realtimeResponse.ok) {
      const payload = (() => {
        try {
          return JSON.parse(responseBody) as unknown;
        } catch {
          return null;
        }
      })();
      const message = openAIErrorMessage(
        payload,
        `Realtime connection failed with status ${realtimeResponse.status}.`,
      );
      logPoshaneMitraAudit(session, {
        event: "error",
        result_status: "Error",
        error: `OpenAI Realtime handshake ${realtimeResponse.status}: ${message}`,
      });
      return {
        response: NextResponse.json(
          { error: message },
          { status: realtimeResponse.status }
        ),
      };
    }

    return { answer: responseBody };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Realtime connection failed.";
    logPoshaneMitraAudit(session, {
      event: "error",
      result_status: "Error",
      error: `OpenAI Realtime handshake exception: ${message}`,
    });
    return {
      response: NextResponse.json(
        { error: message },
        { status: 502 }
      ),
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(request: Request) {
  const session = await getCommandCenterSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
  }

  if (!request.headers.get("content-type")?.includes("application/sdp")) {
    return NextResponse.json({ error: "Expected an SDP offer." }, { status: 415 });
  }

  const sdp = await request.text();
  if (!sdp.trim().startsWith("v=0")) {
    return NextResponse.json({ error: "Invalid SDP offer." }, { status: 400 });
  }

  const startedAt = performance.now();
  const { response, answer } = await createRealtimeCall(session, sdp);
  if (response) return response;

  logPoshaneMitraAudit(session, {
    event: "session_start",
    result_status: "Illustrative",
    latency_ms: Math.round(performance.now() - startedAt),
    estimated_cost_usd: 0,
  });

  return new Response(answer, {
    status: 200,
    headers: {
      "Content-Type": "application/sdp",
      "Cache-Control": "no-store",
      "X-Mitra-Model": realtimeSessionConfig().model,
      "X-Mitra-Voice": configuredVoice(),
    },
  });
}
