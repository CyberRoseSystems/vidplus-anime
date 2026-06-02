const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');

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

// Get streaming links - using multiple sources
app.get('/watch/:episodeId', async (req, res) => {
  try {
    const episodeId = req.params.episodeId;
    console.log(`Getting watch link for: ${episodeId}`);
    
    // Return streaming sources from various providers
    const sources = [
      {
        url: 'https://example.com/stream1.mp4',
        quality: 'video/mp4',
        provider: 'Primary'
      }
    ];

    // Try to get real streaming link from GogoAnime via reverse proxy
    try {
      const gogoanimeLink = await getGogoAnimeLink(episodeId);
      if (gogoanimeLink) {
        sources.push({
          url: gogoanimeLink,
          quality: 'video/mp4',
          provider: 'GogoAnime'
        });
      }
    } catch (err) {
      console.log('GogoAnime source unavailable:', err.message);
    }

    console.log(`Found ${sources.length} streaming sources`);
    res.json({ sources });
  } catch (error) {
    console.error('Watch error:', error.message);
    res.status(500).json({ error: error.message || 'Failed to get streaming link' });
  }
});

// Helper function to get GogoAnime streaming link
async function getGogoAnimeLink(episodeId) {
  try {
    // This is a placeholder - real implementation would scrape GogoAnime
    // For now, return a demo link
    return 'https://video.cdn.example.com/anime-stream.mp4';
  } catch (error) {
    throw new Error('Could not fetch GogoAnime link');
  }
}

// Alternative: Use direct streaming API
app.get('/stream/:animeTitle/:episode', async (req, res) => {
  try {
    const { animeTitle, episode } = req.params;
    console.log(`Streaming: ${animeTitle} - Episode ${episode}`);
    
    // Get from Jikan first
    const animeResponse = await axios.get(`${JIKAN_API}/anime?query=${animeTitle}&limit=1`, {
      timeout: 10000
    });

    if (animeResponse.data.data.length > 0) {
      const anime = animeResponse.data.data[0];
      
      // Build a streaming URL (this is a placeholder)
      const streamingUrl = `https://stream.example.com/${anime.mal_id}/${episode}`;
      
      res.json({
        success: true,
        anime: anime.title,
        episode: episode,
        url: streamingUrl,
        source: 'anime-streaming-api'
      });
    } else {
      res.status(404).json({ error: 'Anime not found' });
    }
  } catch (error) {
    console.error('Stream error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running with Jikan integration' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Using AniList for search + Jikan for anime data');
});
