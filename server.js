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

    const response = await axios.get(`${CONSUMET_API}/search?query=${query}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get anime info and episodes
app.get('/info/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const response = await axios.get(`${CONSUMET_API}/info/${id}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get streaming links for episode
app.get('/watch/:episodeId', async (req, res) => {
  try {
    const episodeId = req.params.episodeId;
    const response = await axios.get(`${CONSUMET_API}/watch/${episodeId}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});