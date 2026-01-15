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

// --- HELPER: SHUFFLE & PICK 3 ---
function getRandomStories(array, count) {
    if (!array) return [];
    // Shuffle the array and take the first 'count' items
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// --- EXPANDED FAKE DATABASE ---
const mockNews = {
    'AI': [
        { title: "DeepMind's AlphaFold 3", source: "The Verge", description: "Predicts DNA structure with 98% accuracy.", url: "#", urlToImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995" },
        { title: "OpenAI vs Google", source: "TechCrunch", description: "The battle for search dominance heats up.", url: "#", urlToImage: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485" },
        { title: "Nvidia's New Chip", source: "Wired", description: "H200 chip crushes LLM training speeds.", url: "#", urlToImage: "https://images.unsplash.com/photo-1555255707-c07966088b7b" },
        { title: "AI in Law", source: "Bloomberg", description: "Lawyers using GPT-4 see 30% productivity boost.", url: "#", urlToImage: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73" },
        { title: "Robotics Breakthrough", source: "MIT Tech", description: "Figure 01 robot learns to make coffee.", url: "#", urlToImage: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e" }
    ],
    'Space': [
        { title: "Starship Success", source: "Space.com", description: "SpaceX catches booster in mid-air.", url: "#", urlToImage: "https://images.unsplash.com/photo-1516849841032-87cbac4d88f7" },
        { title: "Mars Water Found", source: "NASA", description: "Rover detects ice just below surface.", url: "#", urlToImage: "https://images.unsplash.com/photo-1614728853975-69c770d14313" },
        { title: "Voyager 1 Update", source: "CNN", description: "Probe sends readable data from interstellar space.", url: "#", urlToImage: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa" },
        { title: "Blue Origin Launch", source: "Reuters", description: "New tourist flight scheduled for next month.", url: "#", urlToImage: "https://images.unsplash.com/photo-1541873676-a18131494184" }
    ],
    'Politics': [
        { title: "Global Summit", source: "BBC", description: "Leaders agree on new climate targets.", url: "#", urlToImage: "https://images.unsplash.com/photo-1529101091760-61493900799c" },
        { title: "Election Update", source: "AP News", description: "Polls show tight race in swing states.", url: "#", urlToImage: "https://images.unsplash.com/photo-1540910419868-474947ce5ade" },
        { title: "Trade Deal Signed", source: "WSJ", description: "US and EU agree on new tariff rules.", url: "#", urlToImage: "https://images.unsplash.com/photo-1526304640152-d4619684e484" },
        { title: "Tech Regulation", source: "Politico", description: "Senate proposes ban on algorithmic bias.", url: "#", urlToImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b" }
    ]
};

const mockMedical = {
    'Neurology': [
        { title: "ICH Triage Protocol", source: "NEJM", description: "Rapid assessment improves survival rates.", isMedical: true, url: "https://www.nejm.org" },
        { title: "Glioblastoma Trials", source: "The Lancet", description: "Immunotherapy phase 2 results promising.", isMedical: true, url: "https://www.thelancet.com" },
        { title: "Alzheimer's Drug", source: "JAMA", description: "FDA approves new plaque-clearing treatment.", isMedical: true, url: "https://jamanetwork.com" },
        { title: "Stroke Recovery", source: "Nature Med", description: "Brain-computer interface restores speech.", isMedical: true, url: "https://www.nature.com" },
        { title: "Deep Brain Stimulation", source: "Brain Journal", description: "Effective for treatment-resistant depression.", isMedical: true, url: "https://academic.oup.com/brain" }
    ],
    'Immunotherapy': [
        { title: "CAR-T Advances", source: "Nature", description: "Targeting solid tumors successfully.", isMedical: true, url: "https://www.nature.com" },
        { title: "Cancer Vaccine", source: "Science", description: "mRNA technology pivots to oncology.", isMedical: true, url: "https://www.science.org" },
        { title: "Melanoma Study", source: "Cell", description: "Combination therapy doubles survival.", isMedical: true, url: "https://www.cell.com" },
        { title: "CRISPR Editing", source: "NEJM", description: "First patient cured of sickle cell.", isMedical: true, url: "https://www.nejm.org" }
    ]
};

// --- ROUTES ---

app.get('/api/news', (req, res) => {
    const category = req.query.category || 'Briefing'; 

    if (category === 'Briefing') {
        // Pick 1 RANDOM story from each category for variety
        const brief = [
            getRandomStories(mockNews['AI'], 1)[0],
            getRandomStories(mockNews['Space'], 1)[0],
            getRandomStories(mockNews['Politics'], 1)[0],
            getRandomStories(mockMedical['Neurology'], 1)[0],
            getRandomStories(mockMedical['Immunotherapy'], 1)[0]
        ];
        return res.json(brief);
    }

    // Pick 3 RANDOM stories for specific categories
    const allStories = mockNews[category] || mockNews['AI'];
    res.json(getRandomStories(allStories, 3));
});

app.get('/api/medical', (req, res) => {
    const keyword = req.query.keyword || 'Neurology';
    // Pick 3 RANDOM medical papers
    const allPapers = mockMedical[keyword] || mockMedical['Neurology'];
    res.json(getRandomStories(allPapers, 3));
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
    res.json({ message: "Trigger received" });
});

// Start
const port = 10000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
