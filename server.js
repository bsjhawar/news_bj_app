const express = require('express');
const webpush = require('web-push');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

// --- CONFIGURATION ---
const publicVapidKey = process.env.VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY;

if (!publicVapidKey || !privateVapidKey) {
  console.error("ERROR: VAPID Keys are missing in Render Environment Variables!");
} else {
  webpush.setVapidDetails('mailto:test@test.com', publicVapidKey, privateVapidKey);
}

// --- FAKE DATA (To simulate fresh news) ---
const mockNews = {
    'AI': [
        { title: "DeepMind's New Model", source: "The Verge", description: "AlphaFold 3 predicts DNA structure with 98% accuracy.", url: "#", urlToImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995" },
        { title: "OpenAI vs Google", source: "TechCrunch", description: "The battle for search dominance heats up with Gemini 1.5.", url: "#", urlToImage: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485" }
    ],
    'Space': [
        { title: "Starship Launch Success", source: "Space.com", description: "SpaceX successfully catches the booster in mid-air.", url: "#", urlToImage: "https://images.unsplash.com/photo-1516849841032-87cbac4d88f7" }
    ],
    'Politics': [
        { title: "Global Summit Results", source: "BBC", description: "Leaders agree on new climate targets for 2030.", url: "#", urlToImage: "https://images.unsplash.com/photo-1529101091760-61493900799c" }
    ]
};

const mockMedical = {
    'Neurology': [
        { title: "Intracerebral Hemorrhage Triage", source: "NEJM", description: "New protocols for rapid assessment in emergency settings.", isMedical: true, url: "#" },
        { title: "Glioblastoma Trials", source: "The Lancet", description: "Immunotherapy shows promise in phase 2 clinical trials.", isMedical: true, url: "#" }
    ],
    'Immunotherapy': [
        { title: "CAR-T Cell Therapy", source: "Nature", description: "Advances in targeting solid tumors.", isMedical: true, url: "#" }
    ]
};

// --- ENDPOINTS ---

// 1. Subscribe Route (For Notifications)
app.post('/subscribe', (req, res) => {
  const subscription = req.body;
  res.status(201).json({});
  
  // Send a welcome ping
  const payload = JSON.stringify({ title: 'Welcome!', body: 'News Alerts Active.' });
  webpush.sendNotification(subscription, payload).catch(err => console.error(err));
});

// 2. Trigger Route (Manual Test)
app.get('/trigger-push', (req, res) => {
    // This is a placeholder. In a real app, you'd save subscribers to a database.
    // For now, this just proves the route works.
    res.json({ message: "To test this, you need a database of users! For now, rely on the 'Welcome' message." });
});

// 3. GET NEWS Route (Handles your "Tech: AI" buttons)
app.get('/api/news', (req, res) => {
    const category = req.query.category || 'AI';
    const data = mockNews[category] || mockNews['AI'];
    res.json(data);
});

// 4. GET MEDICAL Route (Handles your "Med: Neurology" buttons)
app.get('/api/medical', (req, res) => {
    const keyword = req.query.keyword || 'Neurology';
    const data = mockMedical[keyword] || mockMedical['Neurology'];
    res.json(data);
});

// Start Server
const port = 10000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
