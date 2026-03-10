import {
  retrieveApiKey,
  retrieveActiveProvider,
  isRateLimited,
} from './storage.js';
import { callGroq } from './providers/groq.js';
import { callGemini } from './providers/gemini.js';
import { callClaude } from './providers/claude.js';
import { callOpenRouter } from './providers/openrouter.js';
import { PROVIDERS, PROVIDER_RATE_LIMITS } from '../constants/providers.js';

const CALLERS = {
  groq: callGroq,
  gemini: callGemini,
  claude: callClaude,
  openrouter: callOpenRouter,
};

export async function generateBriefing({ systemPrompt, userPrompt, onChunk }) {
  const providerId = retrieveActiveProvider();
  const apiKey = retrieveApiKey(providerId);

  if (!apiKey) {
    throw new Error(
      `No API key set for ${PROVIDERS[providerId].name}. Go to Settings to add one.`
    );
  }

  const rateCheck = isRateLimited(providerId, PROVIDER_RATE_LIMITS[providerId]);
  if (rateCheck.limited) {
    throw new Error(
      `Rate limit reached (${rateCheck.reason}). Check Settings for usage details.`
    );
  }

  const caller = CALLERS[providerId];
  if (!caller) throw new Error(`Unknown provider: ${providerId}`);

  return caller({
    apiKey,
    systemPrompt,
    userPrompt,
    onChunk,
    model: PROVIDERS[providerId].model,
  });
}
