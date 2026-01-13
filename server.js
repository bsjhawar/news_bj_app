const express = require('express');
const axios = require('axios');
const cors = require('cors');
const webPush = require('web-push');
const bodyParser = require('body-parser'); // Needed for receiving subscriptions
const xml2js = require('xml2js');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// --- CONFIGURATION ---
// PASTE YOUR KEYS FROM STEP 1 HERE
const publicVapidKey = 'BCQ227xykhxU4uQAb0EIEnrMMEzqGL6aUW925qfdLArQFSNxnqf6fn4lSl98xzb0vKHSSwJcgfkkfyRF0BTHhs0';
const privateVapidKey = 'IhYOMe-pnDAr2Vft0LrtnZHUydcZQjMOveGX-1Dsj_c';

// Identify yourself to the push service (use your email)
webPush.setVapidDetails('mailto:test@test.com', publicVapidKey, privateVapidKey);

const NEWS_API_KEY = process.env.NEWS_API || 'YOUR_NEWS_API_KEY_HERE'; // Keeps Render key working

// Store users (In a real app, this goes in a database. For now, we store in memory)
let subscriptions = []; 

// --- ROUTE 1: SUBSCRIBE USER ---
app.post('/subscribe', (req, res) => {
  const subscription = req.body;
  subscriptions.push(subscription);
  console.log("New User Subscribed!");
  res.status(201).json({});
});

// --- ROUTE 2: SEND NOTIFICATION (Test Trigger) ---
// You can visit https://your-app.onrender.com/trigger-push to test it
app.get('/trigger-push', (req, res) => {
  const payload = JSON.stringify({ title: 'News Alert', body: 'New articles found matching your directives!' });

  subscriptions.forEach(sub => {
    webPush.sendNotification(sub, payload).catch(error => console.error(error));
  });
  
  res.json({ message: "Notifications sent!" });
});

// --- ROUTE 3: NEWS FETCH ---
const NEWS_SOURCES = 'bbc-news,reuters,al-jazeera-english,ars-technica,the-verge';

app.get('/api/news', async (req, res) => {
    const category = req.query.category || 'technology';
    try {
        const url = `https://newsapi.org/v2/everything?q=${category}&sources=${NEWS_SOURCES}&language=en&sortBy=publishedAt&apiKey=${NEWS_API_KEY}`;
        const response = await axios.get(url);
        const articles = response.data.articles.filter(a => a.urlToImage && a.description).slice(0, 10);
        res.json(articles);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch news' });
    }
});

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});