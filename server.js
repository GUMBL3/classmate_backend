require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Initialize GenAI SDK (kusa nitong babasahin ang GEMINI_API_KEY mula sa env)
const ai = new GoogleGenAI();

// API Route para sa Reviewer Generation
app.post('/api/generate', async (req, res) => {
  try {
    const { notes } = req.body;

    if (!notes) {
      return res.status(400).json({ error: 'Text notes are required.' });
    }

    const prompt = `You are Classmate AI, an expert study assistant.
Generate a structured study reviewer from the provided text notes.
Include:
1. Summary Points
2. Key Terms & Definitions
3. 3-5 Practice Quiz Questions with Answers.

User Notes: ${notes}`;

    // Syntax para sa @google/genai package
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    });

    return res.json({ reviewerContent: response.text });
  } catch (error) {
    console.error('Gemini Error:', error);
    return res.status(500).json({ error: error.message || 'Server Error' });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`ClassmateAI Backend Server running on port ${PORT}`);
});
