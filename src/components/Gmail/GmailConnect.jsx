import { retrieveGoogleClientId } from '../../lib/storage.js';

export default function GmailConnect({ connected, onConnect, onDisconnect }) {
  const hasClientId = !!retrieveGoogleClientId();

  return (
    <div className="p-4 bg-pulse-surface border border-pulse-border rounded">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-mono text-sm text-pulse-text">Gmail Connection</h3>
          <p className="font-mono text-[10px] text-pulse-muted mt-1">
            {connected
              ? 'Connected — read-only access to your newsletters'
              : 'Connect to fetch and distill your newsletter subscriptions'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              connected ? 'bg-green-400' : 'bg-pulse-muted'
            }`}
          />
          {connected ? (
            <button
              onClick={onDisconnect}
              className="px-3 py-1.5 font-mono text-xs text-pulse-danger border border-pulse-danger/30 rounded hover:bg-pulse-danger/10 transition-colors"
            >
              Disconnect
            </button>
          ) : (
            <button
              onClick={onConnect}
              disabled={!hasClientId}
              className="px-3 py-1.5 font-mono text-xs bg-pulse-accent text-pulse-bg rounded hover:bg-pulse-accent/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Connect Gmail
            </button>
          )}
        </div>
      </div>

      {!hasClientId && !connected && (
        <p className="mt-2 font-mono text-[10px] text-yellow-400">
          Add your Google OAuth Client ID in Settings first.
        </p>
      )}

      {!connected && hasClientId && (
        <div className="mt-3 p-2 bg-pulse-bg rounded">
          <p className="font-mono text-[10px] text-pulse-muted">
            <strong className="text-pulse-secondary">Scope requested:</strong>{' '}
            gmail.readonly — read-only access. PULSE will never write, send, or
            delete emails. The access token is stored in memory only and is
            cleared when you close the tab.
          </p>
        </div>
      )}
    </div>
  );
}
