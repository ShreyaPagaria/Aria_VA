# Deployment Checklist

## Accounts
- Vapi account
- Google Cloud project
- Google Calendar API enabled
- Render/Railway account
- Vercel/Netlify account

## Google Cloud
- Create OAuth consent screen
- Create OAuth Client ID (Web application)
- Add callback URL:
  - `https://YOUR-BACKEND-URL/auth/google/callback`
- Enable Google Calendar API

## Backend secrets
- `PORT`
- `BASE_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`
- `GOOGLE_REFRESH_TOKEN`
- `GOOGLE_CALENDAR_ID`
- `DEFAULT_TIMEZONE`
- `VAPI_API_KEY` (optional for future server-side Vapi calls)
- `APP_BASE_URL` (frontend URL for CORS if needed)

## Frontend values
- Vapi public key
- Vapi assistant ID
- backend URL

## Vapi dashboard
- Create assistant
- Add prompt from `assistant-prompt.md`
- Add custom function tool from `vapi-tool-config.json`
- Point tool server URL to deployed backend
- Publish assistant

## Final test
- Open hosted frontend
- Start voice conversation
- Say name, date/time, optional title
- Confirm
- Verify event appears in Google Calendar
