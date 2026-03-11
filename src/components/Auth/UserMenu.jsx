import { useState, useRef, useEffect } from 'react';
import { retrieveGoogleClientId } from '../../lib/storage.js';

export default function UserMenu({ user, isSignedIn, loading, onSignIn, onSignOut }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const hasClientId = !!retrieveGoogleClientId();

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isSignedIn) {
    return (
      <button
        onClick={onSignIn}
        disabled={loading || !hasClientId}
        className="px-3 py-1.5 font-mono text-xs bg-pulse-accent text-pulse-bg rounded hover:bg-pulse-accent/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        title={!hasClientId ? 'Add Google OAuth Client ID in Settings first' : 'Sign in with Google'}
      >
        {loading ? 'Signing in...' : 'Sign in with Google'}
      </button>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2 py-1 rounded hover:bg-pulse-surface transition-colors"
      >
        {user.picture ? (
          <img
            src={user.picture}
            alt=""
            className="w-6 h-6 rounded-full"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-pulse-accent/30 flex items-center justify-center">
            <span className="font-mono text-[10px] text-pulse-accent">
              {(user.name || '?')[0].toUpperCase()}
            </span>
          </div>
        )}
        <span className="font-mono text-xs text-pulse-secondary hidden sm:inline max-w-[120px] truncate">
          {user.name}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-56 bg-pulse-surface border border-pulse-border rounded shadow-lg z-50">
          <div className="px-3 py-2 border-b border-pulse-border">
            <p className="font-mono text-xs text-pulse-text truncate">{user.name}</p>
            {user.email && (
              <p className="font-mono text-[10px] text-pulse-muted truncate">{user.email}</p>
            )}
          </div>
          <button
            onClick={() => {
              setOpen(false);
              onSignOut();
            }}
            className="w-full px-3 py-2 text-left font-mono text-xs text-pulse-danger hover:bg-pulse-danger/10 transition-colors"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
