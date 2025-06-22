// FIXED: api/linkedin/exchange-token.js
// Replace your existing file with this version

export default async function handler(req, res) {
  // ENHANCED CORS configuration - supports all your domains
  const allowedOrigins = [
    'https://sociallyfounded.com',
    'https://www.sociallyfounded.com', 
    'https://socially-founded.vercel.app',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ];

  const origin = req.headers.origin;
  console.log('Request origin:', origin); // Debug logging
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    console.log('Origin not allowed:', origin);
    // For debugging, log what origins are trying to access
  }
  
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

    // Enhanced validation with better error messages
    if (!code || !state || !redirectUri) {
      return res.status(400).json({ 
        error: 'Missing required parameters',
        received: { 
          code: !!code, 
          state: !!state, 
          redirectUri: !!redirectUri 
        },
        message: 'LinkedIn OAuth requires code, state, and redirectUri parameters'
      });
    }

    // Expanded allowed redirect URIs (matches your LinkedIn app config)
    const allowedRedirectUris = [
      'https://sociallyfounded.com/linkedin-callback.html',
      'https://www.sociallyfounded.com/linkedin-callback.html',
      'https://socially-founded.vercel.app/linkedin-callback.html',
      'https://sociallyfounded.com/linkedin-elevation.html',
      'https://www.sociallyfounded.com/linkedin-elevation.html',
      'http://localhost:3000/linkedin-callback.html'
    ];
    
    if (!allowedRedirectUris.includes(redirectUri)) {
      return res.status(400).json({ 
        error: 'Invalid redirect URI',
        received: redirectUri,
        allowed: allowedRedirectUris
      });
    }

    // Check environment variables with better error handling
    if (!process.env.LINKEDIN_CLIENT_SECRET) {
      console.error('LINKEDIN_CLIENT_SECRET not found in environment variables');
      return res.status(500).json({ 
        error: 'Server configuration error',
        message: 'LinkedIn client secret not configured'
      });
    }

    console.log('Attempting LinkedIn token exchange...');

    // LinkedIn token exchange with proper Content-Type
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded', // CRITICAL: LinkedIn requires this
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
        client_id: process.env.LINKEDIN_CLIENT_ID || '77tpngrlwmwnz7',
        client_secret: process.env.LINKEDIN_CLIENT_SECRET,
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('LinkedIn token exchange failed:', {
        status: tokenResponse.status,
        error: error
      });
      
      return res.status(400).json({ 
        error: 'LinkedIn token exchange failed',
        details: error,
        status: tokenResponse.status,
        message: 'LinkedIn rejected the authorization code'
      });
    }

    const tokenData = await tokenResponse.json();
    console.log('LinkedIn token exchange successful');

    // Fetch user profile using access token
    const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });

    if (!profileResponse.ok) {
      const error = await profileResponse.text();
      console.error('LinkedIn profile fetch failed:', {
        status: profileResponse.status,
        error: error
      });
      
      return res.status(400).json({ 
        error: 'LinkedIn profile fetch failed',
        details: error,
        status: profileResponse.status,
        message: 'Failed to retrieve user profile from LinkedIn'
      });
    }

    const profileData = await profileResponse.json();
    console.log('LinkedIn profile fetch successful for user:', profileData.sub);

    // Structure professional profile data
    const structuredProfile = {
      linkedin: {
        id: profileData.sub,
        verified: true,
        connectedAt: new Date().toISOString()
      },
      professional: {
        fullName: profileData.name || `${profileData.given_name || ''} ${profileData.family_name || ''}`.trim(),
        email: profileData.email,
        headline: profileData.headline || 'LinkedIn Professional',
        picture: profileData.picture || null,
        locale: profileData.locale || 'en_US',
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
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

// Helper functions (enhanced)
function calculateExperienceLevel(profileData) {
  // Simple logic based on available data
  const email = profileData.email?.toLowerCase() || '';
  const name = profileData.name?.toLowerCase() || '';
  
  if (email.includes('ceo') || email.includes('founder') || 
      name.includes('ceo') || name.includes('founder')) {
    return 'Senior';
  }
  
  if (email.includes('director') || email.includes('vp') || 
      name.includes('director') || name.includes('senior')) {
    return 'Senior';
  }
  
  return 'Professional';
}

function calculateCredibilityScore(profileData) {
  let score = 60; // Base score
  
  if (profileData.email_verified !== false) score += 10; // LinkedIn emails are typically verified
  if (profileData.picture) score += 10;
  if (profileData.name && profileData.name.split(' ').length >= 2) score += 10;
  if (profileData.locale) score += 5;
  if (profileData.given_name && profileData.family_name) score += 5;
  if (profileData.email && !profileData.email.includes('temp') && !profileData.email.includes('test')) score += 5;
  
  return Math.min(score, 95); // Max 95 to leave room for additional verification
}
