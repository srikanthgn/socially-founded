const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: 'org-FMpBRJ6nFH4m8nH5cjJUVdYx'
});

const DIANA_SYSTEM_PROMPT = `You are DIANA, an AI community catalyst for SociallyFounded. Help users with:
1. Community connections across 7 types (Professional, Creative, Neighborhood, Remote Worker, Entrepreneur, Learning, Lifestyle)
2. Startup brainstorming for entrepreneurs
3. Cross-community networking
4. Dubai venue recommendations

Be friendly, helpful, and keep responses under 150 words. Always encourage real-world community connections.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { conversation, userId, userProfile } = req.body;
    
    if (!conversation || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!userProfile || userProfile.gamification.brainstormCredits <= 0) {
      return res.status(429).json({ 
        error: 'No DIANA credits remaining. Earn more through community engagement!',
        creditsRemaining: 0
      });
    }

    const messages = [
      { role: 'system', content: DIANA_SYSTEM_PROMPT },
      ...conversation.slice(1)
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      temperature: 0.7,
      max_tokens: 200
    });

    const dianaResponse = completion.choices[0].message.content;

    return res.status(200).json({
      success: true,
      response: dianaResponse,
      creditsUsed: 1,
      creditsRemaining: userProfile.gamification.brainstormCredits - 1
    });

  } catch (error) {
    console.error('DIANA API Error:', error);
    return res.status(500).json({
      error: 'Sorry, I\'m having trouble thinking right now. Please try again.'
    });
  }
}
