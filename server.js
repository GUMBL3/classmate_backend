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
    const { notes, image } = req.body;

    if (!notes && !image) {
      return res.status(400).json({ error: 'Text notes or an image is required.' });
    }

    // Gamitin ang Gemini multimodal model
    const model = googleAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are Classmate AI, an expert study assistant.
Generate a structured study reviewer from the provided input. 
Include:
1. Summary Points
2. Key Terms & Definitions
3. 3-5 Practice Quiz Questions with Answers.

User Notes: ${notes || 'Analyze the attached image and generate the reviewer.'}`;

    let contents = [prompt];

    // Kapag may image payload mula sa app
    if (image) {
      contents.push({
        inlineData: {
          data: image,
          mimeType: 'image/jpeg',
        },
      });
    }

    const result = await model.generateContent(contents);
    const response = await result.response;
    const text = response.text();

    return res.json({ reviewerContent: text });
  } catch (error) {
    console.error('Gemini Generation Error:', error);
    return res.status(500).json({ error: 'Failed to generate reviewer content.' });
  }
});

// Patakbuhin ang Server
app.listen(PORT, () => {
  console.log('🚀 ClassmateAI Backend Server running on http://localhost:${PORT}');
});
