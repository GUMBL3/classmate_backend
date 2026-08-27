require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize ang Google Gen AI SDK gamit ang API key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// POST Route para sa pag-generate ng Reviewer
app.post('/api/generate', async (req, res) => {
  try {
    const { notes } = req.body;

    if (!notes || notes.trim() === '') {
      return res.status(400).json({ error: 'Kailangan ng notes para mag-generate!' });
    }

    // Isinulat na Prompt para pilitin ang AI na maglabas ng malinis na JSON format
    const prompt = `
      Ikaw si ClassmateAI, isang matalinong Filipino student tutor. 
      Suriin ang mga sumusunod na lecture notes at gumawa ng:
      1. Summary (3 hanggang 5 mahahalagang bullet points sa simpleng Taglish).
      2. Flashcards (3 hanggang 5 Question & Answer pairs).

      I-return ang eksaktong JSON structure na ito nang WALANG markdown formatting o extra text:
      {
        "summary": ["Point 1", "Point 2", "Point 3"],
        "flashcards": [
          { "question": "Tanong 1?", "answer": "Sagot 1" },
          { "question": "Tanong 2?", "answer": "Sagot 2" }
        ]
      }

      Ito ang lecture notes:
      "${notes}"
    `;

    // Tumawag sa Gemini API gamit ang gemini-2.5-flash model
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    });

    let rawText = response.text.trim();

    // Linisin ang output sakaling maglagay ang AI ng markdown code blocks
    if (rawText.startsWith('```json')) {
      rawText = rawText.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (rawText.startsWith('```')) {
      rawText = rawText.replace(/^```/, '').replace(/```$/, '').trim();
    }

    // I-parse ang malinis na string patungong totoong JSON object
    const parsedData = JSON.parse(rawText);

    // Ipadala sa Frontend
    res.json(parsedData);

  } catch (error) {
    console.error('Error sa Gemini API:', error);
    res.status(500).json({ 
      error: 'Nagkaroon ng problema sa pag-generate ng reviewer.',
      details: error.message 
    });
  }
});

// Patakbuhin ang Server
app.listen(PORT, () => {
  console.log('🚀 ClassmateAI Backend Server running on http://localhost:${PORT}');
});