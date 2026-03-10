import { useMemo } from 'react';
import { marked } from 'marked';
import { safeHtml } from '../../lib/sanitize.js';
import SectionRating from './SectionRating.jsx';
import { retrieveActiveProvider } from '../../lib/storage.js';
import { PROVIDERS } from '../../constants/providers.js';

export default function BriefingCard({
  content,
  topics,
  signalRatings,
  onRate,
  streaming,
  status,
}) {
  const providerId = retrieveActiveProvider();
  const provider = PROVIDERS[providerId];

  const html = useMemo(() => {
    if (!content) return '';
    return safeHtml(marked.parse(content));
  }, [content]);

  const sections = useMemo(() => {
    if (!content) return [];
    // Split by ## headings to identify topic sections
    const parts = content.split(/^## /m);
    return parts.slice(1).map((part) => {
      const firstLine = part.split('\n')[0];
      return firstLine.trim();
    });
  }, [content]);

  if (!content && !streaming) return null;

  return (
    <div className="space-y-4">
      {status && (
        <div className="flex items-center gap-2 py-2">
          {streaming && (
            <div className="w-2 h-2 rounded-full bg-pulse-accent animate-pulse" />
          )}
          <span className="font-mono text-xs text-pulse-muted">{status}</span>
        </div>
      )}

      <div className="p-6 bg-pulse-surface border border-pulse-border rounded">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-pulse-border">
          <span className="font-mono text-[10px] text-pulse-muted">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
          <span className="font-mono text-[10px] text-pulse-muted">
            Generated with {provider.name} &middot;{' '}
            {provider.isFree ? 'Free' : 'Paid'}
          </span>
        </div>

        <div
          className="briefing-content font-serif text-[15px] text-pulse-text leading-[1.85]"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>

      {!streaming && content && topics.length > 0 && (
        <div className="space-y-2 p-4 bg-pulse-surface border border-pulse-border rounded">
          <p className="font-mono text-xs text-pulse-secondary mb-3">
            Rate each section to improve future briefings:
          </p>
          {sections.map((section) => {
            const matchedTopic = topics.find(
              (t) =>
                section.toLowerCase().includes(t.toLowerCase()) ||
                t.toLowerCase().includes(section.toLowerCase().slice(0, 10))
            );
            const ratingKey = matchedTopic || section;
            return (
              <div
                key={section}
                className="flex items-center justify-between py-1"
              >
                <span className="font-mono text-xs text-pulse-text truncate mr-3">
                  {section}
                </span>
                <SectionRating
                  topic={ratingKey}
                  currentScore={signalRatings?.[ratingKey]}
                  onRate={onRate}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
