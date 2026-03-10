import { getArchive } from '../../lib/storage.js';

export default function ArchiveList({ onSelect }) {
  const archive = getArchive();

  if (archive.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="font-mono text-sm text-pulse-muted">
          No briefings archived yet.
        </p>
        <p className="font-mono text-xs text-pulse-muted mt-1">
          Generate your first briefing to see it here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {archive.map((entry) => {
        const wordCount = entry.content?.split(/\s+/).length || 0;
        const readTime = Math.max(1, Math.round(wordCount / 200));

        return (
          <button
            key={entry.id}
            onClick={() => onSelect(entry)}
            className="w-full text-left p-4 bg-pulse-surface border border-pulse-border rounded hover:border-pulse-accent transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs text-pulse-secondary">
                {new Date(entry.date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
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
                  {entry.source === 'gmail-digest' ? 'Gmail' : 'AI'}
                </span>
                <span className="font-mono text-[10px] text-pulse-muted">
                  {readTime} min read
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              {entry.topics?.map((topic) => (
                <span
                  key={topic}
                  className="px-2 py-0.5 text-[10px] font-mono bg-pulse-bg border border-pulse-border rounded-full text-pulse-muted"
                >
                  {topic}
                </span>
              ))}
            </div>
          </button>
        );
      })}
    </div>
  );
}
