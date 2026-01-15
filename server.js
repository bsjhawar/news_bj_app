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

// --- HELPER: SHUFFLE & PICK ---
function getRandomStories(array, count) {
    if (!array) return [];
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// --- EXPANDED DATABASE ---
const mockNews = {
    'AI': [
        { title: "DeepMind's AlphaFold 3", source: "The Verge", description: "Predicts DNA structure with 98% accuracy.", url: "#", urlToImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995" },
        { title: "OpenAI vs Google", source: "TechCrunch", description: "The battle for search dominance heats up.", url: "#", urlToImage: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485" },
        { title: "Nvidia's New Chip", source: "Wired", description: "H200 chip crushes LLM training speeds.", url: "#", urlToImage: "https://images.unsplash.com/photo-1555255707-c07966088b7b" }
    ],
    'Space': [
        { title: "Starship Success", source: "Space.com", description: "SpaceX catches booster in mid-air.", url: "#", urlToImage: "https://images.unsplash.com/photo-1516849841032-87cbac4d88f7" },
        { title: "Mars Water Found", source: "NASA", description: "Rover detects ice just below surface.", url: "#", urlToImage: "https://images.unsplash.com/photo-1614728853975-69c770d14313" }
    ],
    'Politics': [
        { title: "Global Summit", source: "BBC", description: "Leaders agree on new climate targets.", url: "#", urlToImage: "https://images.unsplash.com/photo-1529101091760-61493900799c" }
    ],
    // --- NEW CATEGORIES ---
    'Iran': [
        { title: "Nuclear Talks Resume", source: "Al Jazeera", description: "Diplomats meet in Vienna for renewed discussions.", url: "#", urlToImage: "https://images.unsplash.com/photo-1569337672224-b37117c72808" },
        { title: "Tech Startup Boom in Tehran", source: "TechCrunch", description: "Young entrepreneurs navigating sanctions.", url: "#", urlToImage: "https://images.unsplash.com/photo-1518655048521-f130df041f66" },
        { title: "New Oil Field Discovery", source: "Reuters", description: "Massive reserve found in southern province.", url: "#", urlToImage: "https://images.unsplash.com/photo-1581093196277-9f608beda3d4" }
    ],
    'Fareed': [
        { title: "The Post-American World?", source: "GPS on CNN", description: "Fareed discusses the shifting geopolitical landscape.", url: "#", urlToImage: "https://images.unsplash.com/photo-1557992260-ec58e38d363c" },
        { title: "Lesson from History", source: "Washington Post", description: "Op-Ed: What 1914 tells us about today.", url: "#", urlToImage: "https://images.unsplash.com/photo-1505664194779-8beaceb930b5" },
        { title: "AI and the Future of Work", source: "GPS", description: "Interview with Sam Altman on economic shifts.", url: "#", urlToImage: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e" }
    ],
    'AIMed': [
        { title: "AI Diagnoses Sepsis Early", source: "Nature Medicine", description: "Algorithm predicts sepsis 24 hours before symptoms.", url: "#", urlToImage: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d" },
        { title: "Generative AI for Pathology", source: "HIMSS", description: "Creating synthetic data to train cancer models.", url: "#", urlToImage: "https://images.unsplash.com/photo-1579684385136-137af7549091" },
        { title: "Google Med-PaLM 2", source: "The Verge", description: "LLM passes US Medical Licensing Exam with expert scores.", url: "#", urlToImage: "https://images.unsplash.com/photo-1531650375464-6e66e8c4e0f4" }
    ],
    'NeuroTech': [
        { title: "Neuralink Human Trial", source: "Wired", description: "First patient controls mouse cursor with thought alone.", url: "#", urlToImage: "https://images.unsplash.com/photo-1555449372-e5659779df3f" },
        { title: "Robotic Spine Surgery", source: "MedTech Dive", description: "New arm improves screw placement accuracy to 99%.", url: "#", urlToImage: "https://images.unsplash.com/photo-1551076805-e1869033e561" },
        { title: "Focused Ultrasound Therapy", source: "NeuroNews", description: "Non-invasive treatment for essential tremor approved.", url: "#", urlToImage: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063" }
    ]
};

const mockMedical = {
    'Neurology': [
        { title: "ICH Triage Protocol", source: "NEJM", description: "Rapid assessment improves survival rates.", isMedical: true, url: "https://www.nejm.org" },
        { title: "Glioblastoma Trials", source: "The Lancet", description: "Immunotherapy phase 2 results.", isMedical: true, url: "https://www.thelancet.com" }
    ],
    'Immunotherapy': [
        { title: "CAR-T Advances", source: "Nature", description: "Targeting solid tumors.", isMedical: true, url: "https://www.nature.com" }
    ]
};

// --- ROUTES ---

app.get('/api/news', (req, res) => {
    const category = req.query.category || 'Briefing'; 

    if (category === 'Briefing') {
        // Updated Briefing Mix
        const brief = [
            getRandomStories(mockNews['NeuroTech'], 1)[0], // Prioritize your field
            getRandomStories(mockNews['AIMed'], 1)[0],
            getRandomStories(mockNews['Iran'], 1)[0],
            getRandomStories(mockNews['Fareed'], 1)[0],
            getRandomStories(mockNews['AI'], 1)[0]
        ];
        return res.json(brief);
    }

    const allStories = mockNews[category] || mockNews['AI'];
    res.json(getRandomStories(allStories, 3));
});

app.get('/api/medical', (req, res) => {
    const keyword = req.query.keyword || 'Neurology';
    const allPapers = mockMedical[keyword] || mockMedical['Neurology'];
    res.json(getRandomStories(allPapers, 3));
});

// Subscribe & Trigger
app.post('/subscribe', (req, res) => {
  const subscription = req.body;
  res.status(201).json({});
  webpush.sendNotification(subscription, JSON.stringify({ title: 'Welcome!', body: 'News Alerts Active.' })).catch(err => console.error(err));
});
app.get('/trigger-push', (req, res) => res.json({ message: "Trigger received" }));

const port = 10000;
app.listen(port, () => console.log(`Server running on port ${port}`));
