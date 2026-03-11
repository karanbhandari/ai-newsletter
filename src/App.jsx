import { useState, useCallback } from 'react';
import Header from './components/Layout/Header.jsx';
import Footer from './components/Layout/Footer.jsx';
import IntelligenceProfile from './components/Profile/IntelligenceProfile.jsx';
import BriefingConfig from './components/Briefing/BriefingConfig.jsx';
import BriefingCard from './components/Briefing/BriefingCard.jsx';
import GmailDigest from './components/Gmail/GmailDigest.jsx';
import ArchiveList from './components/Archive/ArchiveList.jsx';
import ArchiveReader from './components/Archive/ArchiveReader.jsx';
import ProviderSelector from './components/Settings/ProviderSelector.jsx';
import ApiKeySetup from './components/Settings/ApiKeySetup.jsx';
import { useAiClient } from './hooks/useAiClient.js';
import { useGoogleAuth } from './hooks/useGoogleAuth.js';
import {
  storeProfile,
  retrieveProfile,
  storeActiveProvider,
  retrieveActiveProvider,
  addToArchive,
  exportAllData,
  importAllData,
  clearAllData,
} from './lib/storage.js';
import {
  buildSystemPrompt,
  buildBriefingPrompt,
  addSearchContext,
} from './lib/prompts.js';
import { PROVIDERS } from './constants/providers.js';
import { DEFAULT_PROFILE } from './constants/config.js';
import { marked } from 'marked';
import { safeHtml } from './lib/sanitize.js';

export default function App() {
  const [view, setView] = useState('home');
  const [profile, setProfileState] = useState(
    () => retrieveProfile() || { ...DEFAULT_PROFILE }
  );
  const [activeProvider, setActiveProviderState] = useState(
    retrieveActiveProvider
  );
  const [briefingContent, setBriefingContent] = useState('');
  const [topics, setTopics] = useState(() => profile.topics || []);
  const [tone, setTone] = useState(() => profile.preferredTone || 'analytical');
  const [depth, setDepth] = useState(() => profile.preferredDepth || 'standard');
  const [archiveEntry, setArchiveEntry] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const ai = useAiClient();
  const auth = useGoogleAuth();

  const setProfile = useCallback((p) => {
    setProfileState(p);
    storeProfile(p);
  }, []);

  const setActiveProvider = useCallback((id) => {
    setActiveProviderState(id);
    storeActiveProvider(id);
  }, []);

  const handleRate = useCallback(
    (topic, delta) => {
      const ratings = { ...profile.signalRatings };
      ratings[topic] = (ratings[topic] || 0) + delta;
      setProfile({ ...profile, signalRatings: ratings });
    },
    [profile, setProfile]
  );

  async function handleGenerate() {
    const provider = PROVIDERS[activeProvider];
    const systemPrompt = buildSystemPrompt(profile);
    const rawUserPrompt = buildBriefingPrompt(topics, tone, depth);
    const userPrompt = addSearchContext(
      rawUserPrompt,
      provider.supportsWebSearch
    );

    try {
      const result = await ai.generate({ systemPrompt, userPrompt });
      const content = provider.supportsStreaming
        ? ai.streamedText || result
        : result;
      setBriefingContent(content);

      addToArchive({
        id: Date.now(),
        date: new Date().toISOString(),
        topics: [...topics],
        tone,
        content,
        contentSanitized: safeHtml(marked.parse(content)),
        source: 'ai-generated',
        ratings: {},
      });
    } catch {
      // error handled by useAiClient
    }
  }

  function handleExport() {
    const data = exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pulse-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          importAllData(data);
          window.location.reload();
        } catch {
          alert('Invalid backup file.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  function handleClearAll() {
    clearAllData();
    setShowClearConfirm(false);
    window.location.reload();
  }

  const lowRatedTopics = Object.entries(profile.signalRatings || {}).filter(
    ([, score]) => score < -3
  );

  return (
    <div className="min-h-screen bg-pulse-bg">
      <Header currentView={view} setView={setView} auth={auth} />

      <main className="max-w-3xl mx-auto px-4 md:px-8 pt-20 pb-24 md:pb-12">
        {/* Home View */}
        {view === 'home' && (
          <div className="space-y-8">
            <div className="text-center py-12">
              <h1 className="font-mono text-4xl text-pulse-accent tracking-widest mb-3">
                PULSE
              </h1>
              <p className="font-serif text-lg text-pulse-secondary">
                Your Personal Intelligence Briefing
              </p>
              <p className="font-mono text-xs text-pulse-muted mt-2 max-w-md mx-auto">
                AI-powered briefings tailored to your life — not a generic
                audience. Replace doomscrolling with focused intelligence.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setView('generate')}
                className="p-6 bg-pulse-surface border border-pulse-border rounded hover:border-pulse-accent transition-colors text-left"
              >
                <h3 className="font-mono text-sm text-pulse-accent mb-1">
                  Generate Briefing
                </h3>
                <p className="font-mono text-xs text-pulse-muted">
                  Get a personalized intelligence briefing on your chosen
                  topics.
                </p>
              </button>
              <button
                onClick={() => setView('gmail')}
                className="p-6 bg-pulse-surface border border-pulse-border rounded hover:border-pulse-accent transition-colors text-left"
              >
                <h3 className="font-mono text-sm text-pulse-accent mb-1">
                  Gmail Digest
                </h3>
                <p className="font-mono text-xs text-pulse-muted">
                  Distill your newsletter subscriptions into key insights.
                </p>
              </button>
              <button
                onClick={() => setView('archive')}
                className="p-6 bg-pulse-surface border border-pulse-border rounded hover:border-pulse-accent transition-colors text-left"
              >
                <h3 className="font-mono text-sm text-pulse-accent mb-1">
                  Archive
                </h3>
                <p className="font-mono text-xs text-pulse-muted">
                  Read past briefings and digests.
                </p>
              </button>
              <button
                onClick={() => setView('settings')}
                className="p-6 bg-pulse-surface border border-pulse-border rounded hover:border-pulse-accent transition-colors text-left"
              >
                <h3 className="font-mono text-sm text-pulse-accent mb-1">
                  Settings
                </h3>
                <p className="font-mono text-xs text-pulse-muted">
                  Configure your profile, AI provider, and API keys.
                </p>
              </button>
            </div>

            {!retrieveProfile()?.name && (
              <div className="p-4 bg-pulse-accent/10 border border-pulse-accent/30 rounded text-center">
                <p className="font-mono text-xs text-pulse-accent">
                  Set up your Intelligence Profile in Settings to get
                  personalized briefings.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Generate View */}
        {view === 'generate' && (
          <div className="space-y-6">
            <h2 className="font-serif text-xl text-pulse-text">
              Generate Briefing
            </h2>

            {lowRatedTopics.length > 0 && (
              <div className="p-3 bg-yellow-900/20 border border-yellow-800/40 rounded">
                <p className="font-mono text-xs text-yellow-400">
                  You&apos;ve consistently rated these topics low:{' '}
                  {lowRatedTopics.map(([t]) => t).join(', ')}. Consider removing
                  them.
                </p>
              </div>
            )}

            <BriefingConfig
              profile={profile}
              topics={topics}
              setTopics={setTopics}
              tone={tone}
              setTone={setTone}
              depth={depth}
              setDepth={setDepth}
              onGenerate={handleGenerate}
              loading={ai.loading}
            />

            {ai.error && (
              <div className="p-3 bg-red-900/20 border border-red-800/40 rounded">
                <p className="font-mono text-xs text-red-400">{ai.error}</p>
              </div>
            )}

            <BriefingCard
              content={
                ai.loading && ai.streamedText
                  ? ai.streamedText
                  : briefingContent
              }
              topics={topics}
              signalRatings={profile.signalRatings}
              onRate={handleRate}
              streaming={ai.loading}
              status={ai.status}
            />
          </div>
        )}

        {/* Gmail View */}
        {view === 'gmail' && <GmailDigest auth={auth} />}

        {/* Archive View */}
        {view === 'archive' && (
          <div className="space-y-6">
            <h2 className="font-serif text-xl text-pulse-text">Archive</h2>
            {archiveEntry ? (
              <ArchiveReader
                entry={archiveEntry}
                onBack={() => setArchiveEntry(null)}
              />
            ) : (
              <ArchiveList onSelect={setArchiveEntry} />
            )}
          </div>
        )}

        {/* Settings View */}
        {view === 'settings' && (
          <div className="space-y-8">
            <h2 className="font-serif text-xl text-pulse-text">Settings</h2>

            <ProviderSelector
              activeProvider={activeProvider}
              onSelect={setActiveProvider}
            />

            <ApiKeySetup activeProvider={activeProvider} />

            <div className="border-t border-pulse-border pt-6">
              <IntelligenceProfile
                profile={profile}
                setProfile={setProfile}
              />
            </div>

            <div className="border-t border-pulse-border pt-6 space-y-4">
              <h3 className="font-serif text-lg text-pulse-text">
                Data Management
              </h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleExport}
                  className="px-4 py-2 font-mono text-xs bg-pulse-surface border border-pulse-border rounded hover:border-pulse-accent transition-colors text-pulse-secondary"
                >
                  Export Data (JSON)
                </button>
                <button
                  onClick={handleImport}
                  className="px-4 py-2 font-mono text-xs bg-pulse-surface border border-pulse-border rounded hover:border-pulse-accent transition-colors text-pulse-secondary"
                >
                  Import from Backup
                </button>
                {showClearConfirm ? (
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-pulse-danger">
                      Delete everything?
                    </span>
                    <button
                      onClick={handleClearAll}
                      className="px-3 py-1.5 font-mono text-xs bg-pulse-danger text-white rounded"
                    >
                      Yes, clear all
                    </button>
                    <button
                      onClick={() => setShowClearConfirm(false)}
                      className="px-3 py-1.5 font-mono text-xs border border-pulse-border rounded text-pulse-muted"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="px-4 py-2 font-mono text-xs border border-pulse-danger/30 rounded text-pulse-danger hover:bg-pulse-danger/10 transition-colors"
                  >
                    Clear All Data
                  </button>
                )}
              </div>
            </div>

            <div className="border-t border-pulse-border pt-6">
              <h3 className="font-serif text-lg text-pulse-text mb-2">About</h3>
              <p className="font-mono text-xs text-pulse-muted">
                PULSE v1.0.0 — Personal Intelligence Briefing
              </p>
              <p className="font-mono text-xs text-pulse-muted mt-1">
                All data stays in your browser. No analytics. No telemetry.
              </p>
              <div className="mt-3 space-y-1">
                <p className="font-mono text-[10px] text-pulse-muted">
                  Get API keys:
                </p>
                {Object.values(PROVIDERS).map((p) => (
                  <a
                    key={p.id}
                    href={p.apiKeyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block font-mono text-[10px] text-pulse-accent hover:underline"
                  >
                    {p.name}: {p.apiKeyUrl}
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
