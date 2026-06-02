const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const CONSUMET_API = 'https://api.consumet.org/anime/gogoanime';

// Search anime
app.get('/search', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: 'Query required' });

    console.log(`Searching for: ${query}`);
    const response = await axios.get(`${CONSUMET_API}/search?query=${encodeURIComponent(query)}`, {
      timeout: 10000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    
    console.log(`Search results for ${query}: ${response.data.results?.length || 0} found`);
    res.json(response.data);
  } catch (error) {
    console.error('Search error:', error.message);
    res.status(500).json({ error: error.message || 'Search failed' });
  }
});

// Get anime info and episodes
app.get('/info/:id', async (req, res) => {
  try {
    const id = req.params.id;
    console.log(`Getting info for: ${id}`);
    
    const response = await axios.get(`${CONSUMET_API}/info/${encodeURIComponent(id)}`, {
      timeout: 10000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    
    console.log(`Got info for ${id}: ${response.data.episodes?.length || 0} episodes`);
    res.json(response.data);
  } catch (error) {
    console.error('Info error:', error.message);
    res.status(500).json({ error: error.message || 'Failed to get anime info' });
  }
});

// Get streaming links for episode
app.get('/watch/:episodeId', async (req, res) => {
  try {
    const episodeId = req.params.episodeId;
    console.log(`Getting watch link for: ${episodeId}`);
    
    const response = await axios.get(`${CONSUMET_API}/watch/${encodeURIComponent(episodeId)}`, {
      timeout: 10000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    
    console.log(`Got watch link for ${episodeId}: ${response.data.sources?.length || 0} sources`);
    res.json(response.data);
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
