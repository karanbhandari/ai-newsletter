import { useState, useEffect } from 'react';
import {
  storeApiKey,
  retrieveApiKey,
  clearApiKey,
  storeGoogleClientId,
  retrieveGoogleClientId,
  clearGoogleClientId,
} from '../../lib/storage.js';
import { PROVIDERS, PROVIDER_RATE_LIMITS } from '../../constants/providers.js';
import { getUsageStats } from '../../lib/storage.js';

export default function ApiKeySetup({ activeProvider }) {
  const [keys, setKeys] = useState({});
  const [inputValues, setInputValues] = useState({});
  const [googleClientId, setGoogleClientId] = useState('');
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const loaded = {};
    for (const id of Object.keys(PROVIDERS)) {
      const key = retrieveApiKey(id);
      loaded[id] = key ? maskKey(key) : null;
    }
    setKeys(loaded);
    setGoogleClientId(retrieveGoogleClientId() ? '••••••••' : '');
  }, []);

  function maskKey(key) {
    if (key.length <= 6) return '••••••';
    return '••••••••••••' + key.slice(-6);
  }

  function handleSave(providerId) {
    const value = inputValues[providerId];
    if (!value?.trim()) return;
    storeApiKey(providerId, value.trim());
    setKeys({ ...keys, [providerId]: maskKey(value.trim()) });
    setInputValues({ ...inputValues, [providerId]: '' });
  }

  function handleClear(providerId) {
    clearApiKey(providerId);
    setKeys({ ...keys, [providerId]: null });
  }

  function handleSaveGoogleId() {
    if (!googleClientId.trim() || googleClientId === '••••••••') return;
    storeGoogleClientId(googleClientId.trim());
    setGoogleClientId('••••••••');
  }

  function handleClearGoogleId() {
    clearGoogleClientId();
    setGoogleClientId('');
  }

  const providersToShow = showAll
    ? Object.keys(PROVIDERS)
    : [activeProvider];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg text-pulse-text">API Keys</h3>
        <button
          onClick={() => setShowAll(!showAll)}
          className="font-mono text-xs text-pulse-accent hover:underline"
        >
          {showAll ? 'Show active only' : 'Show all providers'}
        </button>
      </div>

      <div className="p-3 bg-yellow-900/20 border border-yellow-800/40 rounded">
        <p className="font-mono text-xs text-yellow-400">
          Your API keys are stored locally in your browser only. Never use this
          app on a public or shared computer.
        </p>
      </div>

      {providersToShow.map((id) => {
        const provider = PROVIDERS[id];
        const limits = PROVIDER_RATE_LIMITS[id];
        const usage = getUsageStats(id);

        return (
          <div
            key={id}
            className="p-4 bg-pulse-surface border border-pulse-border rounded"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-sm text-pulse-text">
                {provider.name}
              </span>
              <span className="font-mono text-[10px] text-pulse-muted">
                {usage.thisHour}/{limits.maxCallsPerHour} this hour &middot;{' '}
                {usage.today}/{limits.maxCallsPerDay} today
              </span>
            </div>

            {keys[id] ? (
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-pulse-secondary flex-1">
                  {keys[id]}
                </span>
                <button
                  onClick={() => handleClear(id)}
                  className="px-2 py-1 font-mono text-[10px] text-pulse-danger border border-pulse-danger/30 rounded hover:bg-pulse-danger/10"
                >
                  Clear Key
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="password"
                  value={inputValues[id] || ''}
                  onChange={(e) =>
                    setInputValues({ ...inputValues, [id]: e.target.value })
                  }
                  placeholder={`Paste your ${provider.name} API key (${provider.apiKeyPrefix}...)`}
                  className="flex-1 bg-pulse-bg border border-pulse-border rounded px-3 py-1.5 text-pulse-text font-mono text-xs focus:border-pulse-accent focus:outline-none"
                />
                <button
                  onClick={() => handleSave(id)}
                  className="px-3 py-1.5 bg-pulse-accent text-pulse-bg font-mono text-xs rounded hover:bg-pulse-accent/80"
                >
                  Save
                </button>
              </div>
            )}
          </div>
        );
      })}

      <div className="p-4 bg-pulse-surface border border-pulse-border rounded">
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-sm text-pulse-text">
            Google OAuth Client ID
          </span>
          <span className="font-mono text-[10px] text-pulse-muted">
            For Gmail digest feature
          </span>
        </div>
        {googleClientId === '••••••••' ? (
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-pulse-secondary flex-1">
              ••••••••
            </span>
            <button
              onClick={handleClearGoogleId}
              className="px-2 py-1 font-mono text-[10px] text-pulse-danger border border-pulse-danger/30 rounded hover:bg-pulse-danger/10"
            >
              Clear
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="password"
              value={googleClientId}
              onChange={(e) => setGoogleClientId(e.target.value)}
              placeholder="your-client-id.apps.googleusercontent.com"
              className="flex-1 bg-pulse-bg border border-pulse-border rounded px-3 py-1.5 text-pulse-text font-mono text-xs focus:border-pulse-accent focus:outline-none"
            />
            <button
              onClick={handleSaveGoogleId}
              className="px-3 py-1.5 bg-pulse-accent text-pulse-bg font-mono text-xs rounded hover:bg-pulse-accent/80"
            >
              Save
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
