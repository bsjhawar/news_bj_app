const express = require('express');
const webpush = require('web-push');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

// --- KEYS ---
const publicVapidKey = process.env.VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY;

if (publicVapidKey && privateVapidKey) {
  webpush.setVapidDetails('mailto:test@test.com', publicVapidKey, privateVapidKey);
}

// --- DATA ---
const mockNews = {
    'AI': [ { title: "DeepMind's New Model", source: "The Verge", description: "AlphaFold 3 predicts DNA structure.", url: "#", urlToImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995" } ],
    'Space': [ { title: "Starship Launch Success", source: "Space.com", description: "SpaceX catches booster.", url: "#", urlToImage: "https://images.unsplash.com/photo-1516849841032-87cbac4d88f7" } ],
    'Politics': [ { title: "Global Summit", source: "BBC", description: "Leaders agree on targets.", url: "#", urlToImage: "https://images.unsplash.com/photo-1529101091760-61493900799c" } ]
};

// THIS IS THE PART YOU MIGHT BE MISSING
const mockMedical = {
    'Neurology': [
        { title: "Intracerebral Hemorrhage Triage", source: "NEJM", description: "New protocols for rapid assessment.", isMedical: true, url: "https://www.nejm.org" },
        { title: "Glioblastoma Trials", source: "The Lancet", description: "Immunotherapy phase 2 results.", isMedical: true, url: "https://www.thelancet.com" }
    ],
    'Immunotherapy': [
        { title: "CAR-T Cell Advances", source: "Nature", description: "Targeting solid tumors.", isMedical: true, url: "https://www.nature.com" }
    ]
};

// --- ROUTES ---
// 3. GET NEWS Route (Handles "Tech" buttons AND the "Briefing")
app.get('/api/news', (req, res) => {
    const category = req.query.category || 'Briefing'; // Default to Briefing

    if (category === 'Briefing') {
        // Combine 1 top story from every category
        const brief = [
            mockNews['AI'][0],
            mockNews['Space'][0],
            mockNews['Politics'][0],
            mockMedical['Neurology'][0],
            mockMedical['Immunotherapy'][0]
        ];
        return res.json(brief);
    }

    // Standard behavior for specific buttons
    const data = mockNews[category] || mockNews['AI'];
    res.json(data);
});

app.get('/api/medical', (req, res) => {
    const keyword = req.query.keyword || 'Neurology';
    // Fallback to Neurology if keyword doesn't exist
    const data = mockMedical[keyword] || mockMedical['Neurology'];
    res.json(data);
});

// Subscribe Route
app.post('/subscribe', (req, res) => {
  const subscription = req.body;
  res.status(201).json({});
  const payload = JSON.stringify({ title: 'Welcome!', body: 'News Alerts Active.' });
  webpush.sendNotification(subscription, payload).catch(err => console.error(err));
});

// Trigger Route
app.get('/trigger-push', (req, res) => {
    res.json({ message: "Trigger received (Database needed for broadcast)" });
});

// Start
const port = 10000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
