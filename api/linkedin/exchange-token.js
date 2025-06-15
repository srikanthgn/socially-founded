// LinkedIn OAuth Backend API for SociallyFounded
// Deploy this as a serverless function or Express.js endpoint

// Environment Variables Required:
// LINKEDIN_CLIENT_ID=77tpngrlwmwnz7
// LINKEDIN_CLIENT_SECRET=your_client_secret_here

// Option 1: Vercel Serverless Function (/api/linkedin/exchange-token.js)
export default async function handler(req, res) {
  // CORS headers for sociallyfounded.com
  res.setHeader('Access-Control-Allow-Origin', 'https://sociallyfounded.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code, state, redirectUri } = req.body;

    // Validate input
    if (!code || !state || !redirectUri) {
      return res.status(400).json({ 
        error: 'Missing required parameters: code, state, redirectUri' 
      });
    }

    // Validate redirect URI
    const allowedRedirectUris = [
      'https://sociallyfounded.com/linkedin-callback.html',
      'https://sociallyfounded.com/linkedin-elevation.html'
    ];
    
    if (!allowedRedirectUris.includes(redirectUri)) {
      return res.status(400).json({ error: 'Invalid redirect URI' });
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET,
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('LinkedIn token exchange failed:', error);
      return res.status(400).json({ 
        error: 'Token exchange failed',
        details: error 
      });
    }

    const tokenData = await tokenResponse.json();

    // Fetch user profile using access token
    const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });

    if (!profileResponse.ok) {
      const error = await profileResponse.text();
      console.error('LinkedIn profile fetch failed:', error);
      return res.status(400).json({ 
        error: 'Profile fetch failed',
        details: error 
      });
    }

    const profileData = await profileResponse.json();

    // Structure professional profile data
    const structuredProfile = {
      linkedin: {
        id: profileData.sub,
        verified: true,
        connectedAt: new Date().toISOString()
      },
      professional: {
        fullName: profileData.name,
        email: profileData.email,
        headline: profileData.headline || 'LinkedIn Professional',
        picture: profileData.picture || null,
        locale: profileData.locale || 'en_US',
        // Calculate experience level and expertise from available data
        experienceLevel: calculateExperienceLevel(profileData),
        credibilityScore: calculateCredibilityScore(profileData)
      }
    };

    // Return structured profile data (never return raw access token to frontend)
    return res.status(200).json({
      success: true,
      profile: structuredProfile,
      tokenExpiry: tokenData.expires_in
    });

  } catch (error) {
    console.error('LinkedIn OAuth error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

// Helper functions
function calculateExperienceLevel(profileData) {
  // Simple logic based on available data
  if (profileData.email?.includes('ceo') || profileData.email?.includes('founder')) {
    return 'Senior';
  }
  return 'Professional';
}

function calculateCredibilityScore(profileData) {
  let score = 60; // Base score
  
  if (profileData.email_verified) score += 10;
  if (profileData.picture) score += 10;
  if (profileData.name && profileData.name.split(' ').length >= 2) score += 10;
  if (profileData.locale) score += 5;
  
  return Math.min(score, 95); // Max 95
}

// Option 2: Express.js Backend Route
/*
app.post('/api/linkedin/exchange-token', async (req, res) => {
  // Same logic as above, but using Express.js syntax
  // res.json() instead of res.status().json()
  // etc.
});
*/

// Option 3: Node.js Standalone Function
/*
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors({
  origin: 'https://sociallyfounded.com'
}));

app.post('/api/linkedin/exchange-token', async (req, res) => {
  // Same implementation as Vercel function above
});

app.listen(3001, () => {
  console.log('LinkedIn OAuth API running on port 3001');
});
*/
