import { useState, useMemo } from 'react';
import { marked } from 'marked';
import { safeHtml } from '../../lib/sanitize.js';
import { useAiClient } from '../../hooks/useAiClient.js';
import { buildSystemPrompt, buildGmailDigestPrompt, addSearchContext } from '../../lib/prompts.js';
import { retrieveProfile, addToArchive, retrieveActiveProvider } from '../../lib/storage.js';
import { PROVIDERS } from '../../constants/providers.js';
import { fetchNewsletters } from '../../lib/gmail.js';

const DAYS_BACK = 7;

export default function GmailDigest({ auth }) {
  const ai = useAiClient();
  const [digest, setDigest] = useState('');
  const [emailCount, setEmailCount] = useState(0);
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const digestHtml = useMemo(() => {
    if (!digest) return '';
    return safeHtml(marked.parse(digest));
  }, [digest]);

  async function handleGenerate() {
    const token = auth.getAccessToken();
    if (!token) {
      setFetchError('Please sign in with Google first.');
      return;
    }

    setFetching(true);
    setFetchError(null);

    let emails;
    try {
      emails = await fetchNewsletters(token, DAYS_BACK);
    } catch (err) {
      setFetchError(err.message);
      setFetching(false);
      if (err.message.includes('expired')) {
        auth.signOut();
      }
      return;
    }

    setFetching(false);

    if (emails.length === 0) {
      setFetchError('No newsletters found in the past 7 days.');
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
          Fetch your newsletter subscriptions from the past 7 days and distill
          them into a concise intelligence digest.
        </p>
      </div>

      {!auth.isSignedIn && (
        <div className="p-4 bg-pulse-surface border border-pulse-border rounded">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-mono text-sm text-pulse-text">Sign in required</h3>
              <p className="font-mono text-[10px] text-pulse-muted mt-1">
                Sign in with Google to access your newsletters. PULSE only
                requests read-only access.
              </p>
            </div>
            <button
              onClick={auth.signIn}
              disabled={auth.loading}
              className="px-3 py-1.5 font-mono text-xs bg-pulse-accent text-pulse-bg rounded hover:bg-pulse-accent/80 disabled:opacity-40 transition-colors"
            >
              {auth.loading ? 'Signing in...' : 'Sign in with Google'}
            </button>
          </div>
          <div className="mt-3 p-2 bg-pulse-bg rounded">
            <p className="font-mono text-[10px] text-pulse-muted">
              <strong className="text-pulse-secondary">Scope requested:</strong>{' '}
              gmail.readonly — read-only access. PULSE will never write, send, or
              delete emails. The access token is stored in memory only and is
              cleared when you close the tab.
            </p>
          </div>
        </div>
      )}

      {auth.error && (
        <div className="p-3 bg-red-900/20 border border-red-800/40 rounded">
          <p className="font-mono text-xs text-red-400">{auth.error}</p>
        </div>
      )}

      {fetchError && (
        <div className="p-3 bg-red-900/20 border border-red-800/40 rounded">
          <p className="font-mono text-xs text-red-400">{fetchError}</p>
        </div>
      )}

      {auth.isSignedIn && (
        <div className="space-y-4">
          <div className="p-3 bg-pulse-surface border border-pulse-border rounded flex items-center gap-3">
            {auth.user.picture && (
              <img
                src={auth.user.picture}
                alt=""
                className="w-8 h-8 rounded-full"
                referrerPolicy="no-referrer"
              />
            )}
            <div>
              <p className="font-mono text-xs text-pulse-text">{auth.user.name}</p>
              {auth.user.email && (
                <p className="font-mono text-[10px] text-pulse-muted">{auth.user.email}</p>
              )}
            </div>
            <span className="ml-auto flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              <span className="font-mono text-[10px] text-pulse-muted">Connected</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="font-mono text-xs text-pulse-secondary">
              Fetching newsletters from the past 7 days
            </span>
          </div>

          <button
            onClick={handleGenerate}
            disabled={ai.loading || fetching}
            className="w-full py-3 bg-pulse-accent text-pulse-bg font-mono text-sm rounded hover:bg-pulse-accent/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {fetching
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
              Processed {emailCount} newsletter{emailCount !== 1 ? 's' : ''} from
              the past 7 days.
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
