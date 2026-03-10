import { useState, useCallback } from 'react';
import { generateBriefing } from '../lib/aiClient.js';
import { retrieveActiveProvider } from '../lib/storage.js';
import { PROVIDERS } from '../constants/providers.js';

export function useAiClient() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [streamedText, setStreamedText] = useState('');
  const [status, setStatus] = useState('');

  const generate = useCallback(async ({ systemPrompt, userPrompt }) => {
    setLoading(true);
    setError(null);
    setStreamedText('');

    const providerId = retrieveActiveProvider();
    const provider = PROVIDERS[providerId];

    try {
      setStatus(`Connecting to ${provider.name}...`);

      const onChunk = provider.supportsStreaming
        ? (chunk) => {
            setStreamedText((prev) => prev + chunk);
            setStatus(`Generating your briefing...`);
          }
        : undefined;

      if (!provider.supportsStreaming) {
        setStatus(`Generating your briefing with ${provider.name}...`);
      }

      const result = await generateBriefing({
        systemPrompt,
        userPrompt,
        onChunk,
      });

      setStatus('Done');
      setLoading(false);
      return result;
    } catch (err) {
      setError(err.message);
      setStatus('');
      setLoading(false);
      throw err;
    }
  }, []);

  return { generate, loading, error, streamedText, status, setError };
}
