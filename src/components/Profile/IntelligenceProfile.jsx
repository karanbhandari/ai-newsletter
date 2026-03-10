import { TONE_OPTIONS, DEPTH_OPTIONS } from '../../constants/config.js';
import TopicManager from './TopicManager.jsx';

export default function IntelligenceProfile({ profile, setProfile }) {
  const update = (field, value) => {
    setProfile({ ...profile, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-xl text-pulse-text mb-4">
          Intelligence Profile
        </h2>
        <p className="font-mono text-xs text-pulse-muted mb-6">
          This context is injected into every briefing to make it personal to
          you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-mono text-xs text-pulse-secondary mb-1">
            First Name
          </label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="Kai"
            className="w-full bg-pulse-surface border border-pulse-border rounded px-3 py-2 text-pulse-text font-serif text-sm focus:border-pulse-accent focus:outline-none"
          />
        </div>
        <div>
          <label className="block font-mono text-xs text-pulse-secondary mb-1">
            Role
          </label>
          <input
            type="text"
            value={profile.role}
            onChange={(e) => update('role', e.target.value)}
            placeholder="Software Engineer"
            className="w-full bg-pulse-surface border border-pulse-border rounded px-3 py-2 text-pulse-text font-serif text-sm focus:border-pulse-accent focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block font-mono text-xs text-pulse-secondary mb-1">
          Location
        </label>
        <input
          type="text"
          value={profile.location}
          onChange={(e) => update('location', e.target.value)}
          placeholder="Toronto, ON"
          className="w-full bg-pulse-surface border border-pulse-border rounded px-3 py-2 text-pulse-text font-serif text-sm focus:border-pulse-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block font-mono text-xs text-pulse-secondary mb-1">
          Life Context
        </label>
        <textarea
          value={profile.lifeContext}
          onChange={(e) => update('lifeContext', e.target.value)}
          placeholder="Investing in tech stocks, learning Rust, training for a marathon, interested in Canadian housing market..."
          rows={3}
          className="w-full bg-pulse-surface border border-pulse-border rounded px-3 py-2 text-pulse-text font-serif text-sm focus:border-pulse-accent focus:outline-none resize-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-mono text-xs text-pulse-secondary mb-1">
            Preferred Tone
          </label>
          <div className="flex gap-2">
            {TONE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => update('preferredTone', opt.value)}
                className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${
                  profile.preferredTone === opt.value
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
          <label className="block font-mono text-xs text-pulse-secondary mb-1">
            Preferred Depth
          </label>
          <div className="flex gap-2">
            {DEPTH_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => update('preferredDepth', opt.value)}
                className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${
                  profile.preferredDepth === opt.value
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

      <TopicManager
        selectedTopics={profile.topics}
        onChange={(topics) => update('topics', topics)}
      />
    </div>
  );
}
