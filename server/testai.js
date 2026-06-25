require('dotenv').config();
const Groq = require('groq-sdk');

const test = async () => {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: 'Say hello in one sentence' }],
      max_tokens: 50,
    });
    console.log('SUCCESS:', completion.choices[0]?.message?.content);
  } catch (e) {
    console.log('ERROR:', e.message);
  }
};

test();