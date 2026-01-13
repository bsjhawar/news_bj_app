const express = require('express');
const axios = require('axios');
const cors = require('cors');
const xml2js = require('xml2js');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.static('public')); // Serves the frontend

// --- CONFIGURATION ---
const API_KEYS = {
    NEWS_API: 'd119f7b08a714c23a5e3574fc0f3f779', 
    // NCBI Key is optional but recommended for speed. Leave blank if you don't have one yet.
    NCBI_KEY: '' 
};

// Your "Allowlist" of Free Reputable Sources
const NEWS_SOURCES = 'bbc-news,reuters,al-jazeera-english,ars-technica,the-verge,politico';

// --- ROUTE 1: GET GENERAL NEWS ---
app.get('/api/news', async (req, res) => {
    const category = req.query.category || 'technology'; // Default to tech
    try {
        const url = `https://newsapi.org/v2/everything?q=${category}&sources=${NEWS_SOURCES}&language=en&sortBy=publishedAt&apiKey=${API_KEYS.NEWS_API}`;
        const response = await axios.get(url);
        
        // Filter: Must have image and description
        const articles = response.data.articles.filter(a => a.urlToImage && a.description).slice(0, 10);
        res.json(articles);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch news' });
    }
});

// --- ROUTE 2: GET MEDICAL DIRECTIVES (NLM/PubMed) ---
app.get('/api/medical', async (req, res) => {
    const keyword = req.query.keyword; 
    const frequency = req.query.frequency || '30'; // Days back
    
    // NLM API URLs
    const baseUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
    
    // 1. Search for IDs (Free Full Text ONLY)
    const term = `${keyword} AND "free full text"[sb]`;
    const searchUrl = `${baseUrl}/esearch.fcgi?db=pubmed&term=${term}&reldate=${frequency}&datetype=pdat&retmode=json${API_KEYS.NCBI_KEY ? `&api_key=${API_KEYS.NCBI_KEY}` : ''}`;

    try {
        const searchResp = await axios.get(searchUrl);
        const ids = searchResp.data.esearchresult.idlist;

        if (!ids || ids.length === 0) return res.json([]);

        // 2. Fetch Details for top 3
        const fetchIds = ids.slice(0, 3).join(',');
        const fetchUrl = `${baseUrl}/efetch.fcgi?db=pubmed&id=${fetchIds}&retmode=xml${API_KEYS.NCBI_KEY ? `&api_key=${API_KEYS.NCBI_KEY}` : ''}`;
        const fetchResp = await axios.get(fetchUrl);

        // Parse XML
        const parser = new xml2js.Parser();
        const result = await parser.parseStringPromise(fetchResp.data);

        // Format for App
        const papers = result.PubmedArticleSet.PubmedArticle.map(art => {
            const citation = art.MedlineCitation[0];
            const pmid = citation.PMID[0]._;
            const title = citation.Article[0].ArticleTitle[0];
            
            // Construct Link to PubMed Central (Free version)
            return {
                title: title,
                source: "National Library of Medicine",
                url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
                isMedical: true // Flag for frontend styling
            };
        });

        res.json(papers);

    } catch (error) {
        console.error("NLM Error:", error);
        res.json([]); // Return empty on error to keep app running
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});