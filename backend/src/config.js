import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  baseUrl: process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`,
  appBaseUrl: process.env.APP_BASE_URL || 'http://localhost:5173',
  defaultTimezone: process.env.DEFAULT_TIMEZONE || 'America/New_York',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  googleRedirectUri:
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback',
  googleRefreshToken: process.env.GOOGLE_REFRESH_TOKEN || '',
  googleCalendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
  vapiApiKey: process.env.VAPI_API_KEY || ''
};

export function assertGoogleConfig() {
  const missing = [];

  if (!config.googleClientId) missing.push('GOOGLE_CLIENT_ID');
  if (!config.googleClientSecret) missing.push('GOOGLE_CLIENT_SECRET');
  if (!config.googleRedirectUri) missing.push('GOOGLE_REDIRECT_URI');

  if (missing.length) {
    throw new Error(`Missing required Google config: ${missing.join(', ')}`);
  }
}
