export const APP_NAME = 'PULSE';
export const APP_VERSION = '1.0.0';
export const APP_TAGLINE = 'Personal Intelligence Briefing';

export const TONE_OPTIONS = [
  { value: 'analytical', label: 'Analytical', description: 'Data-driven, precise language' },
  { value: 'conversational', label: 'Conversational', description: 'Casual yet informative' },
  { value: 'executive', label: 'Executive', description: 'Brief, decision-focused' },
];

export const DEPTH_OPTIONS = [
  { value: 'quick', label: 'Quick', description: '2 bullets per topic' },
  { value: 'standard', label: 'Standard', description: '2 paragraphs per topic' },
  { value: 'deep', label: 'Deep Dive', description: '4+ paragraphs with analysis' },
];

export const GMAIL_SCOPES = 'https://www.googleapis.com/auth/gmail.readonly';

export const DEFAULT_PROFILE = {
  name: '',
  role: '',
  location: '',
  lifeContext: '',
  topics: [],
  preferredTone: 'analytical',
  preferredDepth: 'standard',
  signalRatings: {},
};
