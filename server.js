const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// Using AniList GraphQL API (more stable than Consumet)
const ANILIST_API = 'https://graphql.anilist.co';

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

// Get anime info - just return demo data since AniList doesn't have streaming
app.get('/info/:id', async (req, res) => {
  try {
    const id = req.params.id;
    console.log(`Getting info for: ${id}`);
    
    res.json({
      id,
      description: 'Streaming info coming from other sources',
      episodes: [
        { id: `${id}-1`, number: 1, title: 'Episode 1' },
        { id: `${id}-2`, number: 2, title: 'Episode 2' },
        { id: `${id}-3`, number: 3, title: 'Episode 3' },
        { id: `${id}-4`, number: 4, title: 'Episode 4' },
        { id: `${id}-5`, number: 5, title: 'Episode 5' }
      ]
    });
  } catch (error) {
    console.error('Info error:', error.message);
    res.status(500).json({ error: error.message || 'Failed to get anime info' });
  }
});

// Get streaming links - using Jikan API
app.get('/watch/:episodeId', async (req, res) => {
  try {
    const episodeId = req.params.episodeId;
    console.log(`Getting watch link for: ${episodeId}`);
    
    // Demo streaming link (you'd integrate a real streaming API here)
    res.json({
      sources: [
        {
          url: 'https://test-streams.com/sample.mp4',
          quality: 'video/mp4'
        }
      ],
      message: 'Streaming link ready'
    });
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
