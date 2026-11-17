# JIGAR AI — Black Glass v3.0

A minimal black, transparent-glass style AI website for public use on mobile and laptop.

## Included
- Responsive dark black glass UI
- AI chat, web search, coding assistant, image generation and study helper
- Guest-first interface (no login required in this starter)
- English, Gujarati and Hindi interface labels
- Dark/light appearance setting
- Browser-local chat history
- PWA manifest and basic offline shell caching
- Node.js backend with API rate limiting and security headers
- API key is read only from server environment variables

## Run locally
1. Install Node.js 18 or newer.
2. Extract the ZIP and open a terminal in this folder.
3. Run `npm install`.
4. Set `OPENAI_API_KEY` as an environment variable on the server. Do not put it in frontend files.
5. Run `npm start`.
6. Open `http://localhost:3000`.

Optional environment variables:
- `OPENAI_MODEL` (default `gpt-4.1-mini`)
- `OPENAI_IMAGE_MODEL` (default `gpt-image-1`)
- `PORT` (default `3000`)

## Publish for everyone
Deploy this Node.js app to a hosting provider that supports Node.js and HTTPS. Add the environment variables in the provider's private settings, then connect a domain if desired. Test `/api/health` after deployment.

## Important before public launch
This is a working starter project, not a hosted live service. A site owner must configure an AI API key and hosting. AI provider usage can cost money; set billing limits and monitor usage. The included rate limit is a basic safeguard, not full abuse prevention. Before opening it widely, add stronger per-IP/user quotas, monitoring, privacy/terms pages, a contact route, and a plan for storing/deleting user data. Guest chat history currently stays in each visitor's browser and does not sync between devices. The image endpoint returns image data directly to the browser and should have strict quotas on a public site.
