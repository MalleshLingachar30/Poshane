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
    "Reply in the same language as the user. Automatically handle Kannada and English. Keep spoken responses short first, natural, complete and suitable for spoken delivery.",
    "Do not use technical words such as dataset, JSON, schema, tool call, function call or API response in speech. Say records, programme view, or current figures instead.",
    "Every programme number, survival percentage, finance value, site status, audit conclusion, district comparison, alert, nursery fact or stakeholder fact must come from an available Poshane read-only lookup. Never invent operational figures.",
    "The current records are illustrative for demonstration. Begin relevant factual answers with: Based on the current demonstration records. Never describe demonstration records as operationally live.",
    "Answer short first. For normal Command Center questions, use one to three sentences and then offer to show more detail. Use longer answers only when the user explicitly asks for detail, explanation, walkthrough or summary.",
    "Complete the requested answer in one response whenever possible. Do not say Continue, continuing, or ask the user to continue unless the user explicitly asks for a long step-by-step explanation.",
    "For module-opening requests such as open, show, go to, take me to, display, or tell me about a module, first call poshane_navigate_command_center with the matching module. For monitoring, audit, monitoring and audit, inspection, field entries, complaints, issues, or monitoring calendar, use module monitoring_audit.",
    "For any named taluk or taluk-level operational question, call poshane_get_taluk_progress. Include the parent district when the same taluk name may be ambiguous. Use module taluk_drill_down when opening the taluk view.",
    "You may navigate, filter, scroll and highlight the existing command-center UI through read-only lookups. You must not create, edit, approve, reject, verify, delete, close, invite, onboard, sign contracts, change finance records or modify operational records.",
    "If the user asks for a restricted or write action, briefly say that Mitra can display the relevant module but cannot modify records.",
    "For restricted Financials, navigate only if authorised and do not speak detailed fund rows unless a permitted lookup explicitly allows it.",
    "First state the answer, then mention the source module and freshness. Offer expanded information only when requested.",
    `Allowed districts: ${bootstrap.districts.map((d) => `${d.name} (${d.code})`).join(", ")}.`,
    `Taluk lookup covers ${bootstrap.taluks.length} taluks, each linked to its parent district.`,
    `Allowed zones: ${bootstrap.zones.join(", ")}.`,
  ].join("\n");
}

function openAIErrorMessage(payload: unknown) {
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
  return "Realtime credential creation failed.";
}

async function createRealtimeClientSecret(session: Awaited<ReturnType<typeof getCommandCenterSession>>) {
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
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const realtimeResponse = await fetch(
      "https://api.openai.com/v1/realtime/client_secrets",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "OpenAI-Safety-Identifier": safetyIdentifierForSession(session!),
        },
        body: JSON.stringify({
          expires_after: { anchor: "created_at", seconds: 600 },
          session: {
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
              process.env.POSHANE_MITRA_MAX_OUTPUT_TOKENS ?? 360
            ),
            truncation: "auto",
            tracing: null,
          },
        }),
        signal: controller.signal,
      }
    );

    const data = await realtimeResponse.json().catch(() => null);
    if (!realtimeResponse.ok) {
      return {
        response: NextResponse.json(
          { error: openAIErrorMessage(data), detail: data },
          { status: realtimeResponse.status }
        ),
      };
    }

    return { data };
  } catch (error) {
    return {
      response: NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Realtime credential creation failed.",
        },
        { status: 502 }
      ),
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST() {
  const session = await getCommandCenterSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
  }

  const startedAt = performance.now();
  const { response, data } = await createRealtimeClientSecret(session);
  if (response) return response;

  logPoshaneMitraAudit(session, {
    event: "session_start",
    result_status: "Illustrative",
    latency_ms: Math.round(performance.now() - startedAt),
    estimated_cost_usd: 0,
  });

  return NextResponse.json({
    client_secret: data.value,
    expires_at: data.expires_at,
    session: {
      id: data.session?.id,
      model: data.session?.model,
      voice: configuredVoice(),
      record_status: "Illustrative",
      is_mock: true,
      disclosure:
        "Illustrative prototype — mock data for demonstration. Not live operational data.",
    },
    bootstrap: getPoshaneMitraBootstrap(),
    tools: POSHANE_MITRA_TOOL_DEFINITIONS.map((tool) => tool.name),
  });
}
