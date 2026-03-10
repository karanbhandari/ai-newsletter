import { TONE_OPTIONS, DEPTH_OPTIONS } from '../../constants/config.js';
import TopicManager from '../Profile/TopicManager.jsx';

export default function BriefingConfig({
  profile,
  topics,
  setTopics,
  tone,
  setTone,
  depth,
  setDepth,
  onGenerate,
  loading,
}) {
  return (
    <div className="space-y-6">
      <TopicManager selectedTopics={topics} onChange={setTopics} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-mono text-xs text-pulse-secondary mb-2">
            Tone
          </label>
          <div className="flex gap-2">
            {TONE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTone(opt.value)}
                className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${
                  tone === opt.value
                    ? 'bg-pulse-accent text-pulse-bg'
                    : 'bg-pulse-surface border border-pulse-border text-pulse-muted hover:text-pulse-secondary'
                }`}
                title={opt.description}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block font-mono text-xs text-pulse-secondary mb-2">
            Depth
          </label>
          <div className="flex gap-2">
            {DEPTH_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDepth(opt.value)}
                className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${
                  depth === opt.value
                    ? 'bg-pulse-accent text-pulse-bg'
                    : 'bg-pulse-surface border border-pulse-border text-pulse-muted hover:text-pulse-secondary'
                }`}
                title={opt.description}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={onGenerate}
        disabled={loading || topics.length === 0}
        className="w-full py-3 bg-pulse-accent text-pulse-bg font-mono text-sm tracking-wide rounded hover:bg-pulse-accent/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Generating...' : 'Generate Briefing'}
      </button>

      {topics.length === 0 && (
        <p className="font-mono text-xs text-pulse-muted text-center">
          Select at least one topic to generate a briefing.
        </p>
      )}
    </div>
  );
}
