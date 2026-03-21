import { Router } from 'express';
import { exchangeCodeForTokens, getGoogleAuthUrl } from '../lib/googleCalendar.js';

const router = Router();

router.get('/google', (_req, res) => {
  const url = getGoogleAuthUrl();
  res.redirect(url);
});

router.get('/google/callback', async (req, res) => {
  try {
    const code = req.query.code;

    if (!code || typeof code !== 'string') {
      return res.status(400).send('Missing OAuth code');
    }

    const tokens = await exchangeCodeForTokens(code);

    res.setHeader('Content-Type', 'text/html');
    res.send(`
      <html>
        <body style="font-family: Arial, sans-serif; padding: 32px;">
          <h2>Google Calendar connected</h2>
          <p>Copy this refresh token into your backend environment as <code>GOOGLE_REFRESH_TOKEN</code>.</p>
          <pre style="white-space: pre-wrap; word-break: break-word; background: #f5f5f5; padding: 16px; border-radius: 8px;">${tokens.refresh_token || 'No refresh token returned. Try again with prompt=consent.'}</pre>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    res.status(500).send('Failed to complete Google OAuth flow');
  }
});

export default router;
