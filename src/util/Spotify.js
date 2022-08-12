const clientId = 'adc32ff6c4d846ba996b415b6d2ea2bf';
const redirectUri = 'http://localhost:3000/';
let accessToken = undefined;
let expiresIn = undefined;
const accessUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectUri}`;


const Spotify = {
    getAccessToken() {
        if (accessToken) {
            return accessToken;
        }

        // Check for access token and expiration match
        const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
        const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);

        if (accessTokenMatch && expiresInMatch) {
            accessToken = accessTokenMatch[1];
            expiresIn = Number(expiresInMatch[1]);

            window.setTimeout(() => accessToken = '', expiresIn * 1000);
            window.history.pushState('Access Token', null, '/');
            return accessToken;
        } else {
            window.location = accessUrl;
        }
    },

    search(term) {
        return fetch(`https://api.spotify.com/v1/search?type=track&q=${term.replace(' ', '%20')}`, {
            headers: {
                Authorization: ` Bearer ${accessToken} `
            }
        }).then(response => {
            return response.json();
        }).then(jsonRespose => {
            if (!jsonRespose.tracks) {
                return [];
            }
            return jsonRespose.tracks.items.map(track => {
                return {
                    id: track.id,
                    name: track.name,
                    artist: track.artists[0].name,
                    album: track.album.name,
                    uri: track.uri
                }
            })
        });
    },

    savePlayList(name, trackUris) {
        if (!name || trackUris.length === 0 || !trackUris) {
            return;
        }

        const headers = {
            Authorization: `Bearer ${accessToken}`
        };

        let userId = undefined;
        let playlistId = undefined;

        fetch('https://api.spotify.com/v1/me', { headers: headers }
        ).then(response => response.json()
        ).then(jsonRespose => userId = jsonRespose.id)
        .then(() => {
            fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
                headers: headers,
                method: 'POST',
                body: JSON.stringify({
                    name: name
                })
            }).then(response => response.json()
            ).then(jsonRespose => playlistId = jsonRespose.id)
            .then(() => {
                fetch(`https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`, {
                    headers: headers,
                    method: 'POST',
                    body: JSON.stringify({
                        uris: trackUris
                    })
                });
            })
        })
    }
};

export default Spotify;


