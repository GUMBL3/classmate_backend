require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Initialize Gemini AI
const googleAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// API Route para sa Reviewer Generation
app.post('/api/generate', async (req, res) => {
  try {
    const { notes } = req.body;

    if (!notes) {
      return res.status(400).json({ error: 'Text notes are required.' });
    }

    const model = googleAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are Classmate AI, an expert study assistant.
Generate a structured study reviewer from the provided text notes.
Include:
1. Summary Points
2. Key Terms & Definitions
3. 3-5 Practice Quiz Questions with Answers.

User Notes: ${notes}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return res.json({ reviewerContent: text });
  } catch (error) {
    console.error('Gemini Generation Error:', error);
    return res.status(500).json({ error: error.message || 'Server Error' });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`ClassmateAI Backend Server running on port ${PORT}`);
});
