let _accessToken = null;

export function setToken(token) {
  _accessToken = token;
}

export function clearToken() {
  _accessToken = null;
}

export function hasToken() {
  return !!_accessToken;
}

export function getToken() {
  return _accessToken;
}

export async function fetchNewsletters(token, daysBack = 7) {
  const query = encodeURIComponent(`unsubscribe newer_than:${daysBack}d`);
  const listRes = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${query}&maxResults=20`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (listRes.status === 401) {
    clearToken();
    throw new Error('Gmail token expired. Please reconnect Gmail.');
  }

  if (listRes.status === 429) {
    throw new Error('Gmail rate limit hit. Try again in a few minutes.');
  }

  if (!listRes.ok) {
    throw new Error(`Gmail error: ${listRes.status}`);
  }

  const listData = await listRes.json();
  if (!listData.messages) return [];

  const messages = await Promise.all(
    listData.messages.map((m) =>
      fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=full`,
        { headers: { Authorization: `Bearer ${token}` } }
      ).then((r) => r.json())
    )
  );

  return messages.map((msg) => {
    const headers = msg.payload?.headers || [];
    const subject =
      headers.find((h) => h.name === 'Subject')?.value || 'No subject';
    const from = headers.find((h) => h.name === 'From')?.value || 'Unknown';
    const body = extractBody(msg.payload);
    return { subject, from, body, id: msg.id };
  });
}

function extractBody(payload) {
  if (!payload) return '';

  if (payload.body?.data) {
    return decodeBase64(payload.body.data);
  }

  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        return decodeBase64(part.body.data);
      }
    }
    for (const part of payload.parts) {
      const nested = extractBody(part);
      if (nested) return nested;
    }
  }

  return '';
}

function decodeBase64(data) {
  try {
    const decoded = atob(data.replace(/-/g, '+').replace(/_/g, '/'));
    return decoded;
  } catch {
    return '';
  }
}
