import { PROVIDERS } from '../../constants/providers.js';

export default function ProviderSelector({ activeProvider, onSelect }) {
  return (
    <div>
      <h3 className="font-serif text-lg text-pulse-text mb-3">AI Provider</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {Object.values(PROVIDERS).map((provider) => (
          <button
            key={provider.id}
            onClick={() => onSelect(provider.id)}
            className={`text-left p-4 rounded border transition-all ${
              activeProvider === provider.id
                ? 'border-pulse-accent bg-pulse-accent/10'
                : 'border-pulse-border bg-pulse-surface hover:border-pulse-secondary'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-sm text-pulse-text">
                {provider.name}
              </span>
              <span
                className={`px-2 py-0.5 text-[10px] font-mono rounded ${
                  provider.isFree
                    ? 'bg-green-900/40 text-green-400'
                    : provider.badge === 'MIXED'
                      ? 'bg-yellow-900/40 text-yellow-400'
                      : 'bg-pulse-accent/20 text-pulse-accent'
                }`}
              >
                {provider.badge}
              </span>
            </div>
            <p className="font-mono text-xs text-pulse-muted">
              {provider.description}
            </p>
            <a
              href={provider.apiKeyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 font-mono text-[10px] text-pulse-accent hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              Get API key &rarr;
            </a>
          </button>
        ))}
      </div>
    </div>
  );
}
