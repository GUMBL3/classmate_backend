require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Pinadami ang limit para sa malaking Base64 Image!
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/generate', async (req, res) => {
  try {
    const { notes, image } = req.body;

    if (!notes && !image) {
      return res.status(400).json({ error: 'Text notes or an image is required.' });
    }

    const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are Classmate AI, an expert study assistant.
Generate a structured study reviewer from the provided input. 
Include:
1. Summary Points
2. Key Terms & Definitions
3. 3-5 Practice Quiz Questions with Answers.

User Notes: ${notes || 'Analyze the attached image and generate the reviewer.'}`;

    let contents = [prompt];

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
    console.error('Gemini Error:', error);
    return res.status(500).json({ error: error.message || 'Server Error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Patakbuhin ang Server
app.listen(PORT, () => {
  console.log('🚀 ClassmateAI Backend Server running on http://localhost:${PORT}');
});
