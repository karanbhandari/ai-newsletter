import { useState, useCallback, useEffect } from 'react';
import { retrieveGoogleClientId } from '../lib/storage.js';
import { GMAIL_SCOPES } from '../constants/config.js';

const USER_KEY = '_p_google_user';

function loadStoredUser() {
  try {
    return JSON.parse(sessionStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
}

function storeUser(user) {
  if (user) {
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    sessionStorage.removeItem(USER_KEY);
  }
}

let _accessToken = null;

export function useGoogleAuth() {
  const [user, setUser] = useState(loadStoredUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isSignedIn = !!user && !!_accessToken;

  // Restore token check — if we have a stored user but no token, clear user
  useEffect(() => {
    if (user && !_accessToken) {
      setUser(null);
      storeUser(null);
    }
  }, []);

  const signIn = useCallback(() => {
    const clientId = retrieveGoogleClientId();
    if (!clientId) {
      setError('Google OAuth Client ID not set. Add it in Settings.');
      return;
    }

    if (!window.google?.accounts?.oauth2) {
      setError('Google Identity Services not loaded. Check your internet connection.');
      return;
    }

    setLoading(true);
    setError(null);

    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: GMAIL_SCOPES,
      callback: async (response) => {
        if (response.error) {
          setError(`Sign-in error: ${response.error}`);
          setLoading(false);
          return;
        }

        _accessToken = response.access_token;

        try {
          const res = await fetch(
            'https://www.googleapis.com/oauth2/v3/userinfo',
            { headers: { Authorization: `Bearer ${_accessToken}` } }
          );
          if (!res.ok) throw new Error('Failed to fetch user info');
          const info = await res.json();

          const userData = {
            name: info.name || info.email,
            email: info.email,
            picture: info.picture || null,
          };

          setUser(userData);
          storeUser(userData);
          setError(null);
        } catch (err) {
          setError('Signed in but could not fetch profile. Gmail access is still available.');
          const fallback = { name: 'Google User', email: '', picture: null };
          setUser(fallback);
          storeUser(fallback);
        }

        setLoading(false);
      },
    });

    client.requestAccessToken();
  }, []);

  const signOut = useCallback(() => {
    if (_accessToken && window.google?.accounts?.oauth2) {
      window.google.accounts.oauth2.revoke(_accessToken);
    }
    _accessToken = null;
    setUser(null);
    storeUser(null);
    setError(null);
  }, []);

  const getAccessToken = useCallback(() => {
    return _accessToken;
  }, []);

  return {
    user,
    isSignedIn,
    loading,
    error,
    signIn,
    signOut,
    getAccessToken,
  };
}
