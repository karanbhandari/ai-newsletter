import { useMemo } from 'react';
import { marked } from 'marked';
import { safeHtml } from '../../lib/sanitize.js';

export default function ArchiveReader({ entry, onBack }) {
  const html = useMemo(() => {
    if (entry.contentSanitized) return entry.contentSanitized;
    return safeHtml(marked.parse(entry.content || ''));
  }, [entry]);

  const wordCount = entry.content?.split(/\s+/).length || 0;
  const readTime = Math.max(1, Math.round(wordCount / 200));

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="font-mono text-xs text-pulse-accent hover:underline"
      >
        &larr; Back to archive
      </button>

      <div className="p-6 bg-pulse-surface border border-pulse-border rounded">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-pulse-border">
          <span className="font-mono text-[10px] text-pulse-muted">
            {new Date(entry.date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
          <div className="flex items-center gap-2">
            <span
              className={`px-1.5 py-0.5 text-[10px] font-mono rounded ${
                entry.source === 'gmail-digest'
                  ? 'bg-blue-900/40 text-blue-400'
                  : 'bg-pulse-accent/20 text-pulse-accent'
              }`}
            >
              {entry.source === 'gmail-digest' ? 'Gmail Digest' : 'AI Briefing'}
            </span>
            <span className="font-mono text-[10px] text-pulse-muted">
              {readTime} min read
            </span>
          </div>
        </div>

        {entry.topics?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {entry.topics.map((topic) => (
              <span
                key={topic}
                className="px-2 py-0.5 text-[10px] font-mono bg-pulse-bg border border-pulse-border rounded-full text-pulse-muted"
              >
                {topic}
              </span>
            ))}
          </div>
        )}

        <div
          className="briefing-content font-serif text-[15px] text-pulse-text leading-[1.85]"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}
