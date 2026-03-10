import { useState } from 'react';
import { useMemo } from 'react';
import { marked } from 'marked';
import { safeHtml } from '../../lib/sanitize.js';
import { useGmailApi } from '../../hooks/useGmailApi.js';
import { useAiClient } from '../../hooks/useAiClient.js';
import { buildSystemPrompt, buildGmailDigestPrompt, addSearchContext } from '../../lib/prompts.js';
import { retrieveProfile, addToArchive, retrieveActiveProvider } from '../../lib/storage.js';
import { PROVIDERS } from '../../constants/providers.js';
import GmailConnect from './GmailConnect.jsx';

export default function GmailDigest() {
  const gmail = useGmailApi();
  const ai = useAiClient();
  const [digest, setDigest] = useState('');
  const [emailCount, setEmailCount] = useState(0);
  const [daysBack, setDaysBack] = useState(7);

  const digestHtml = useMemo(() => {
    if (!digest) return '';
    return safeHtml(marked.parse(digest));
  }, [digest]);

  async function handleGenerate() {
    const emails = await gmail.fetchEmails(daysBack);
    if (emails.length === 0) {
      ai.setError('No newsletters found in the selected time range.');
      return;
    }

    setEmailCount(emails.length);

    const profile = retrieveProfile() || {};
    const systemPrompt = buildSystemPrompt(profile);
    const userPrompt = buildGmailDigestPrompt(emails);
    const providerId = retrieveActiveProvider();
    const provider = PROVIDERS[providerId];
    const finalPrompt = addSearchContext(userPrompt, provider.supportsWebSearch);

    try {
      const result = await ai.generate({
        systemPrompt,
        userPrompt: finalPrompt,
      });

      const content = provider.supportsStreaming ? ai.streamedText || result : result;
      setDigest(content);

      addToArchive({
        id: Date.now(),
        date: new Date().toISOString(),
        topics: ['Gmail Digest'],
        tone: 'analytical',
        content,
        contentSanitized: safeHtml(marked.parse(content)),
        source: 'gmail-digest',
        ratings: {},
      });
    } catch {
      // error handled by useAiClient
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-xl text-pulse-text mb-2">
          Gmail Newsletter Digest
        </h2>
        <p className="font-mono text-xs text-pulse-muted">
          Fetch your newsletter subscriptions and distill them into a concise
          intelligence digest.
        </p>
      </div>

      <GmailConnect
        connected={gmail.connected}
        onConnect={gmail.connect}
        onDisconnect={gmail.disconnect}
      />

      {gmail.error && (
        <div className="p-3 bg-red-900/20 border border-red-800/40 rounded">
          <p className="font-mono text-xs text-red-400">{gmail.error}</p>
        </div>
      )}

      {gmail.connected && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="font-mono text-xs text-pulse-secondary">
              Look back:
            </label>
            <select
              value={daysBack}
              onChange={(e) => setDaysBack(Number(e.target.value))}
              className="bg-pulse-surface border border-pulse-border rounded px-3 py-1.5 text-pulse-text font-mono text-xs focus:border-pulse-accent focus:outline-none"
            >
              <option value={1}>1 day</option>
              <option value={3}>3 days</option>
              <option value={7}>7 days</option>
              <option value={14}>14 days</option>
            </select>
          </div>

          <button
            onClick={handleGenerate}
            disabled={ai.loading || gmail.loading}
            className="w-full py-3 bg-pulse-accent text-pulse-bg font-mono text-sm rounded hover:bg-pulse-accent/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {gmail.loading
              ? 'Fetching emails...'
              : ai.loading
                ? 'Generating digest...'
                : 'Fetch & Distill Newsletters'}
          </button>

          {ai.status && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-pulse-accent animate-pulse" />
              <span className="font-mono text-xs text-pulse-muted">
                {ai.status}
              </span>
            </div>
          )}

          {emailCount > 0 && !ai.loading && (
            <p className="font-mono text-xs text-pulse-muted">
              Processed {emailCount} newsletter{emailCount !== 1 ? 's' : ''}.
            </p>
          )}

          {ai.error && (
            <div className="p-3 bg-red-900/20 border border-red-800/40 rounded">
              <p className="font-mono text-xs text-red-400">{ai.error}</p>
            </div>
          )}

          {(digest || ai.streamedText) && (
            <div className="p-6 bg-pulse-surface border border-pulse-border rounded">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-pulse-border">
                <span className="font-mono text-[10px] text-pulse-muted">
                  Gmail Newsletter Digest
                </span>
                <span className="font-mono text-[10px] text-pulse-muted">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
              <div
                className="briefing-content font-serif text-[15px] text-pulse-text leading-[1.85]"
                dangerouslySetInnerHTML={{
                  __html: ai.loading && ai.streamedText
                    ? safeHtml(marked.parse(ai.streamedText))
                    : digestHtml,
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
