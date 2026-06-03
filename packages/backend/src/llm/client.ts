import { LifeState, Action } from '@snack/engine';

const LM_STUDIO_URL = process.env.LM_STUDIO_URL ?? 'http://localhost:1234/v1';
const LLM_TIMEOUT_MS = 8000;

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

async function chatComplete(messages: ChatMessage[], temperature = 0.3): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), LLM_TIMEOUT_MS);

  try {
    const res = await fetch(`${LM_STUDIO_URL}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'local-model',
        messages,
        temperature,
        max_tokens: 300,
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { choices: Array<{ message: { content: string } }> };
    return data.choices[0]?.message?.content ?? null;
  } catch {
    return null; // LM Studio not running → graceful fallback
  } finally {
    clearTimeout(timer);
  }
}

// Parse free German text into a structured Action
export async function parseFreetextAction(input: string, state: LifeState): Promise<Action | null> {
  const systemPrompt = `Du bist ein Action-Parser für eine Lebenssimulation.
Konvertiere deutschen Freitext in exakt eine dieser JSON-Aktionen.
Erlaubte Typen: WORK, SLEEP, LEARN, EXERCISE, SOCIALIZE, JOB_CHANGE, INVEST, REST, EAT, MEDITATE

Aktuelle Relationships IDs: ${state.relationships.map((r) => `${r.id}(${r.name})`).join(', ')}
Aktueller Stress: ${state.vitals.stress}, Cash: ${state.finance.cash}€

Beispiele:
- "ich will 8h arbeiten intensiv" → {"type":"WORK","intensity":"HIGH","hours":8}
- "schlafen 7 stunden" → {"type":"SLEEP","hours":7}
- "sport leicht 30 minuten" → {"type":"EXERCISE","intensity":"LOW","minutes":30}
- "mit jonas treffen" → {"type":"SOCIALIZE","targetRelId":"rel_jonas","mode":"MEET","hours":2}
- "job wechseln aggressiv" → {"type":"JOB_CHANGE","strategy":"AGGRESSIVE"}
- "200 euro in etf investieren" → {"type":"INVEST","instrument":"ETF","amount":200,"risk":0.3}
- "lernen programmierung 2h" → {"type":"LEARN","skill":"programming","hours":2}
- "meditieren 20 min" → {"type":"MEDITATE","minutes":20}
- "gesund essen" → {"type":"EAT","quality":"HEALTHY"}
- "ausruhen 3h" → {"type":"REST","hours":3}

Antworte NUR mit dem JSON-Objekt, ohne Erklärung.`;

  const result = await chatComplete(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: input },
    ],
    0.1,
  );

  if (!result) return null;

  try {
    const json = result.trim().replace(/```json?|```/g, '').trim();
    return JSON.parse(json) as Action;
  } catch {
    return null;
  }
}

// Generate immersive event narration in German
export async function narrateEvent(
  title: string,
  trigger: string,
  state: LifeState,
): Promise<string | null> {
  const stateSum = `Stress:${state.vitals.stress.toFixed(0)}, Energie:${state.vitals.energy.toFixed(0)}, Stimmung:${state.vitals.mood.toFixed(0)}, Cash:${state.finance.cash.toFixed(0)}€`;

  const result = await chatComplete(
    [
      {
        role: 'system',
        content: `Du bist ein Erzähler für eine realistische Lebenssimulation.
Schreibe 2-3 immersive Sätze auf Deutsch in der 2. Person Singular (Du).
Kein Urteil, keine Moral. Nur beschreiben was der Charakter erlebt.
Zustand: ${stateSum}`,
      },
      { role: 'user', content: `Event: "${title}" — Auslöser: ${trigger}` },
    ],
    0.7,
  );

  return result;
}

// Life coach reflection on recent audit entries
export async function coachReflection(
  auditSummary: string,
  state: LifeState,
): Promise<string | null> {
  const result = await chatComplete(
    [
      {
        role: 'system',
        content: `Du bist ein nüchterner, ehrlicher Life Coach.
Analysiere die letzten Entscheidungen und nenne 2 konkrete Muster — keine Phrasen.
Zustand: Stress ${state.vitals.stress.toFixed(0)}, Health ${state.vitals.health.toFixed(0)}, Cash ${state.finance.cash.toFixed(0)}€`,
      },
      { role: 'user', content: auditSummary },
    ],
    0.5,
  );

  return result;
}
