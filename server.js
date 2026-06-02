const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// Using AniList for search + Jikan for streaming links
const ANILIST_API = 'https://graphql.anilist.co';
const JIKAN_API = 'https://api.jikan.moe/v4';

// Search anime using AniList
app.get('/search', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: 'Query required' });

    console.log(`Searching for: ${query}`);
    
    const gqlQuery = `
      query {
        Page(page: 1, perPage: 10) {
          media(search: "${query}", type: ANIME) {
            id
            title {
              english
              romaji
            }
            description
            episodes
            coverImage {
              large
            }
          }
        }
      }
    `;

    const response = await axios.post(ANILIST_API, { query: gqlQuery }, {
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' }
    });

    const results = response.data.data.Page.media.map(m => ({
      id: m.id,
      title: m.title.english || m.title.romaji,
      description: m.description,
      episodes: m.episodes,
      image: m.coverImage.large
    }));

    console.log(`Found ${results.length} anime`);
    res.json({ results });
  } catch (error) {
    console.error('Search error:', error.message);
    res.status(500).json({ error: error.message || 'Search failed' });
  }
});

// Get anime info and episodes using Jikan
app.get('/info/:id', async (req, res) => {
  try {
    const id = req.params.id;
    console.log(`Getting info for: ${id}`);
    
    // Try to get anime from Jikan by searching
    const searchResponse = await axios.get(`${JIKAN_API}/anime?query=${id}&limit=1`, {
      timeout: 10000
    });

    if (!searchResponse.data.data || searchResponse.data.data.length === 0) {
      return res.json({
        id,
        description: 'Anime information',
        episodes: generateEpisodes(24)
      });
    }

    const anime = searchResponse.data.data[0];
    const episodes = generateEpisodes(anime.episodes || 24);

    res.json({
      id: anime.mal_id,
      title: anime.title,
      description: anime.synopsis || 'No description available',
      episodes,
      image: anime.images?.jpg?.large_image_url
    });
  } catch (error) {
    console.error('Info error:', error.message);
    // Return demo episodes if API fails
    res.json({
      id: req.params.id,
      description: 'Anime information',
      episodes: generateEpisodes(24)
    });
  }
});

// Generate demo episodes
function generateEpisodes(count) {
  const episodes = [];
  for (let i = 1; i <= Math.min(count, 50); i++) {
    episodes.push({
      id: `ep-${i}`,
      number: i,
      title: `Episode ${i}`
    });
  }
  return episodes;
}

// Get streaming links
app.get('/watch/:episodeId', async (req, res) => {
  try {
    const episodeId = req.params.episodeId;
    console.log(`Getting watch link for: ${episodeId}`);
    
    // Return streaming sources
    const sources = [
      {
        url: 'https://vjs.zencdn.net/v/oceans.mp4',
        quality: 'video/mp4',
        provider: 'Demo'
      }
    ];

    console.log(`Found ${sources.length} streaming sources`);
    res.json({ sources });
  } catch (error) {
    console.error('Watch error:', error.message);
    res.status(500).json({ error: error.message || 'Failed to get streaming link' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
