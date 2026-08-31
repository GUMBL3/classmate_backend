require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');

const app = express();
app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI();

app.post('/api/generate', async (req, res) => {
  try {
    const { notes } = req.body;

    if (!notes) {
      return res.status(400).json({ error: 'Text notes are required.' });
    }

    // Prompt na nag-o-require ng Pure JSON
    const prompt = `You are Classmate AI, an expert study assistant.
Analyze the user notes and return ONLY a valid JSON object without markdown formatting or markdown code blocks (do not wrap in \`\`\`json).

Return this exact structure:
{
  "summary": [
    "Summary point 1",
    "Summary point 2",
    "Summary point 3"
  ],
  "flashcards": [
    {
      "question": "Question 1 here?",
      "answer": "Answer 1 here"
    },
    {
      "question": "Question 2 here?",
      "answer": "Answer 2 here"
    }
  ]
}

User Notes: ${notes}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json', // Pilitin ang API na mag-return ng totoong JSON
      },
    });

    // Clean-up response text bago i-parse
    let rawText = response.text || '';
    rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

    const parsedContent = JSON.parse(rawText);

    return res.json({ reviewerContent: parsedContent });
  } catch (error) {
    console.error('Gemini Error:', error);
    return res.status(500).json({ error: error.message || 'Server Error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`ClassmateAI Backend Server running on port ${PORT}`));
