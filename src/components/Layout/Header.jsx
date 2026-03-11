import { retrieveActiveProvider } from '../../lib/storage.js';
import { PROVIDERS } from '../../constants/providers.js';
import UserMenu from '../Auth/UserMenu.jsx';

export default function Header({ currentView, setView, auth }) {
  const providerId = retrieveActiveProvider();
  const provider = PROVIDERS[providerId];

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'generate', label: 'Generate' },
    { id: 'gmail', label: 'Gmail Digest' },
    { id: 'archive', label: 'Archive' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-pulse-bg border-b border-pulse-border flex items-center justify-between px-4 md:px-8">
      <div className="flex items-center gap-6">
        <h1
          className="font-mono text-pulse-accent text-lg tracking-widest cursor-pointer"
          onClick={() => setView('home')}
        >
          PULSE
        </h1>
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`px-3 py-1.5 font-mono text-xs tracking-wide transition-colors ${
                currentView === item.id
                  ? 'text-pulse-accent border-b-2 border-pulse-accent'
                  : 'text-pulse-muted hover:text-pulse-secondary'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden sm:inline font-mono text-xs text-pulse-muted">
          {provider.name}
          <span
            className={`ml-1.5 px-1.5 py-0.5 text-[10px] rounded ${
              provider.isFree
                ? 'bg-green-900/40 text-green-400'
                : provider.badge === 'MIXED'
                  ? 'bg-yellow-900/40 text-yellow-400'
                  : 'bg-pulse-accent/20 text-pulse-accent'
            }`}
          >
            {provider.badge}
          </span>
        </span>
        <UserMenu
          user={auth.user}
          isSignedIn={auth.isSignedIn}
          loading={auth.loading}
          onSignIn={auth.signIn}
          onSignOut={auth.signOut}
        />
      </div>

      {/* Mobile nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-pulse-bg border-t border-pulse-border flex justify-around py-2 z-50">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`px-2 py-1 font-mono text-[10px] tracking-wide ${
              currentView === item.id
                ? 'text-pulse-accent'
                : 'text-pulse-muted'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </header>
  );
}
