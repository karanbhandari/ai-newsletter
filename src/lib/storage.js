const OBFUSCATION_SALT = 'pulse_v1_';

const KEY_NAMES = {
  groq: '_p_cfg_k1',
  gemini: '_p_cfg_k2',
  claude: '_p_cfg_k3',
  openrouter: '_p_cfg_k4',
  activeProvider: '_p_cfg_ap',
  googleClientId: '_p_cfg_gc',
};

export function storeApiKey(provider, key) {
  const encoded = btoa(OBFUSCATION_SALT + key);
  localStorage.setItem(KEY_NAMES[provider], encoded);
}

export function retrieveApiKey(provider) {
  const encoded = localStorage.getItem(KEY_NAMES[provider]);
  if (!encoded) return null;
  try {
    const decoded = atob(encoded);
    if (!decoded.startsWith(OBFUSCATION_SALT)) return null;
    return decoded.slice(OBFUSCATION_SALT.length);
  } catch {
    return null;
  }
}

export function clearApiKey(provider) {
  localStorage.removeItem(KEY_NAMES[provider]);
}

export function storeActiveProvider(provider) {
  localStorage.setItem(KEY_NAMES.activeProvider, provider);
}

export function retrieveActiveProvider() {
  return localStorage.getItem(KEY_NAMES.activeProvider) || 'groq';
}

export function storeGoogleClientId(clientId) {
  const encoded = btoa(OBFUSCATION_SALT + clientId);
  localStorage.setItem(KEY_NAMES.googleClientId, encoded);
}

export function retrieveGoogleClientId() {
  const encoded = localStorage.getItem(KEY_NAMES.googleClientId);
  if (!encoded) return null;
  try {
    const decoded = atob(encoded);
    if (!decoded.startsWith(OBFUSCATION_SALT)) return null;
    return decoded.slice(OBFUSCATION_SALT.length);
  } catch {
    return null;
  }
}

export function clearGoogleClientId() {
  localStorage.removeItem(KEY_NAMES.googleClientId);
}

// Profile storage
const PROFILE_KEY = '_p_profile';

export function storeProfile(profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function retrieveProfile() {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY));
  } catch {
    return null;
  }
}

// Archive storage
const ARCHIVE_KEY = '_p_archive';
const MAX_ARCHIVE = 30;

export function getArchive() {
  try {
    return JSON.parse(localStorage.getItem(ARCHIVE_KEY)) || [];
  } catch {
    return [];
  }
}

export function addToArchive(entry) {
  const archive = getArchive();
  archive.unshift(entry);
  if (archive.length > MAX_ARCHIVE) {
    archive.length = MAX_ARCHIVE;
  }
  localStorage.setItem(ARCHIVE_KEY, JSON.stringify(archive));
}

export function deleteArchiveEntry(id) {
  const archive = getArchive().filter((e) => e.id !== id);
  localStorage.setItem(ARCHIVE_KEY, JSON.stringify(archive));
}

// Rate limiting
export function isRateLimited(provider, limits) {
  const storageKey = `_p_rl_${provider}`;
  const record = JSON.parse(localStorage.getItem(storageKey) || '{"calls":[]}');
  const now = Date.now();
  const oneHourAgo = now - 3_600_000;
  const oneDayAgo = now - 86_400_000;

  const callsThisHour = record.calls.filter((t) => t > oneHourAgo);
  const callsToday = record.calls.filter((t) => t > oneDayAgo);

  if (callsThisHour.length >= limits.maxCallsPerHour)
    return { limited: true, reason: 'hourly' };
  if (callsToday.length >= limits.maxCallsPerDay)
    return { limited: true, reason: 'daily' };

  record.calls = [...callsToday, now];
  localStorage.setItem(storageKey, JSON.stringify(record));
  return { limited: false };
}

export function getUsageStats(provider) {
  const storageKey = `_p_rl_${provider}`;
  const record = JSON.parse(localStorage.getItem(storageKey) || '{"calls":[]}');
  const now = Date.now();
  const oneHourAgo = now - 3_600_000;
  const oneDayAgo = now - 86_400_000;

  return {
    thisHour: record.calls.filter((t) => t > oneHourAgo).length,
    today: record.calls.filter((t) => t > oneDayAgo).length,
  };
}

// Export/import all data
export function exportAllData() {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('_p_')) {
      data[key] = localStorage.getItem(key);
    }
  }
  return data;
}

export function importAllData(data) {
  for (const [key, value] of Object.entries(data)) {
    if (key.startsWith('_p_')) {
      localStorage.setItem(key, value);
    }
  }
}

export function clearAllData() {
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('_p_')) keys.push(key);
  }
  keys.forEach((key) => localStorage.removeItem(key));
}
