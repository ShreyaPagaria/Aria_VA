import { google } from 'googleapis';
import { config, assertGoogleConfig } from '../config.js';

function getOAuthClient() {
  assertGoogleConfig();

  const oauth2Client = new google.auth.OAuth2(
    config.googleClientId,
    config.googleClientSecret,
    config.googleRedirectUri
  );

  if (config.googleRefreshToken) {
    oauth2Client.setCredentials({ refresh_token: config.googleRefreshToken });
  }

  return oauth2Client;
}

export function getGoogleAuthUrl() {
  const oauth2Client = getOAuthClient();

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['https://www.googleapis.com/auth/calendar.events']
  });
}

export async function exchangeCodeForTokens(code) {
  const oauth2Client = getOAuthClient();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

export async function createCalendarEvent({
  name,
  meetingTitle,
  startISO,
  endISO,
  timezone
}) {
  if (!config.googleRefreshToken) {
    throw new Error(
      'GOOGLE_REFRESH_TOKEN is not configured. Run the OAuth flow first.'
    );
  }

  const auth = getOAuthClient();
  const calendar = google.calendar({ version: 'v3', auth });

  const summary = meetingTitle?.trim() || `Meeting with ${name}`;

  const event = {
    summary,
    description: `Scheduled by Voice Scheduling Agent for ${name}`,
    start: {
      dateTime: startISO,
      timeZone: timezone || config.defaultTimezone
    },
    end: {
      dateTime: endISO,
      timeZone: timezone || config.defaultTimezone
    }
  };

  const response = await calendar.events.insert({
    calendarId: config.googleCalendarId,
    requestBody: event
  });

  return {
    id: response.data.id,
    htmlLink: response.data.htmlLink,
    status: response.data.status,
    summary: response.data.summary,
    start: response.data.start,
    end: response.data.end
  };
}
