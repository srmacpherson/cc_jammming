const clientID = 'e661d051136f41029689837a26b6eaf2';
const redirectURI = 'https://codecademyjammmingproject.netlify.app/'
let accessToken = '';

const Spotify = {
  async getAccessToken() {
    if (accessToken) return accessToken;

    const code = new URLSearchParams(window.location.search).get('code');

    if (!code) {
      // No code yet: begin authorization
      const codeVerifier = Spotify.generateCodeVerifier(128);
      localStorage.setItem('code_verifier', codeVerifier);

      const codeChallenge = await Spotify.generateCodeChallenge(codeVerifier);
      const scope = 'playlist-modify-public';

      const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientID}&scope=${encodeURIComponent(
        scope
      )}&redirect_uri=${encodeURIComponent(
        redirectURI
      )}&code_challenge_method=S256&code_challenge=${codeChallenge}`;

      window.location = authUrl;
    } else {
      // Exchange code for access token
      const codeVerifier = localStorage.getItem('code_verifier');

      const body = new URLSearchParams({
        client_id: clientID,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectURI,
        code_verifier: codeVerifier,
      });

      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
      });

      const data = await response.json();
      accessToken = data.access_token;

      // Clean up the URL (remove ?code=...)
      window.history.pushState({}, document.title, '/');
      return accessToken;
    }
  },

  async search(term) {
    const token = await Spotify.getAccessToken();
    const response = await fetch(
      `https://api.spotify.com/v1/search?type=track&q=${encodeURIComponent(term)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const jsonResponse = await response.json();
    if (!jsonResponse.tracks) return [];

    return jsonResponse.tracks.items.map((t) => ({
      id: t.id,
      name: t.name,
      artist: t.artists[0].name,
      album: t.album.name,
      uri: t.uri,
    }));
  },

  async savePlaylist(name, trackUris) {
    if (!name || !trackUris) return;

    const token = await Spotify.getAccessToken();
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    const userResponse = await fetch(`https://api.spotify.com/v1/me`, {
      headers,
    });
    const userData = await userResponse.json();
    const userId = userData.id;

    const playlistResponse = await fetch(
      `https://api.spotify.com/v1/users/${userId}/playlists`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ name }),
      }
    );
    const playlistData = await playlistResponse.json();
    const playlistId = playlistData.id;

    await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ uris: trackUris }),
      }
    );
  },

  generateCodeVerifier(length) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
  },

  async generateCodeChallenge(codeVerifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  },
};

export { Spotify };