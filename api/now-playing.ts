export const config = {
  runtime: 'edge'
};

export default async function handler(request: Request) {
  try {
    // Get new access token
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(
            `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: process.env.SPOTIFY_REFRESH_TOKEN
      })
    });

    const { access_token } = await tokenResponse.json();

    // Get current song
    const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    });

    // No song currently playing
    if (response.status === 204) {
      return new Response(JSON.stringify({
        isPlaying: false,
        title: '',
        artist: '',
        album: '',
        coverArt: ''
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    const data = await response.json();

    return new Response(JSON.stringify({
      isPlaying: data.is_playing,
      title: data.item?.name || '',
      artist: data.item?.artists?.[0]?.name || '',
      album: data.item?.album?.name || '',
      coverArt: data.item?.album?.images?.[0]?.url || ''
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Error fetching song',
      isPlaying: false,
      title: '',
      artist: '',
      album: '',
      coverArt: ''
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

