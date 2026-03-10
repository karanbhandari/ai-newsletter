import { useState, useCallback } from 'react';
import { hasToken, setToken, clearToken, getToken, fetchNewsletters } from '../lib/gmail.js';
import { retrieveGoogleClientId } from '../lib/storage.js';
import { GMAIL_SCOPES } from '../constants/config.js';

export function useGmailApi() {
  const [connected, setConnected] = useState(hasToken());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const connect = useCallback(() => {
    const clientId = retrieveGoogleClientId();
    if (!clientId) {
      setError('Google OAuth Client ID not set. Add it in Settings.');
      return;
    }

    if (!window.google?.accounts?.oauth2) {
      setError('Google Identity Services not loaded. Check your internet connection.');
      return;
    }

    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: GMAIL_SCOPES,
      callback: (response) => {
        if (response.error) {
          setError(`OAuth error: ${response.error}`);
          return;
        }
        setToken(response.access_token);
        setConnected(true);
        setError(null);
      },
    });

    client.requestAccessToken();
  }, []);

  const disconnect = useCallback(() => {
    const token = getToken();
    if (token && window.google?.accounts?.oauth2) {
      window.google.accounts.oauth2.revoke(token);
    }
    clearToken();
    setConnected(false);
  }, []);

  const fetchEmails = useCallback(async (daysBack = 7) => {
    if (!hasToken()) {
      setError('Not connected to Gmail.');
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const messages = await fetchNewsletters(getToken(), daysBack);
      setLoading(false);
      return messages;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      if (err.message.includes('expired')) {
        setConnected(false);
      }
      return [];
    }
  }, []);

  return { connected, connect, disconnect, fetchEmails, loading, error };
}
