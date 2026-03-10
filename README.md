# PULSE — Personal Intelligence Briefing

AI-powered personal intelligence briefings tailored to your life context. Fully client-side, free to host on GitHub Pages, zero backend infrastructure.

Replace doomscrolling with a single, focused, AI-generated briefing that knows who you are.

## Quick Start

1. Clone the repo
2. `npm install`
3. Choose your AI provider and get a free API key:
   - **Groq (recommended — free):** https://console.groq.com/keys
   - **Gemini Flash (free):** https://aistudio.google.com/app/apikey
   - **Claude (paid, best quality):** https://console.anthropic.com/settings/keys
   - **OpenRouter (free models available):** https://openrouter.ai/keys
4. `npm run dev` to run locally
5. Open the app → Settings → select your provider → paste your API key
6. Set up your Intelligence Profile for personalized briefings

## Provider Comparison

| Provider               | Cost            | Web Search             | Speed     | Quality |
|------------------------|-----------------|------------------------|-----------|---------|
| Groq (Llama 3.3 70B)  | Free            | No (uses training data)| Fastest   | ★★★★    |
| Gemini 1.5 Flash       | Free            | Yes (Google Search)    | Fast      | ★★★★    |
| Claude Sonnet          | ~$0.01/briefing | Yes (web search)       | Fast      | ★★★★★   |
| OpenRouter (free)      | Free            | No                     | Varies    | ★★★     |

**Recommendation:** Start with Groq or Gemini. Upgrade to Claude when you want the highest quality briefings.

## Features

- **Intelligence Profile** — Your role, location, interests, and context injected into every briefing
- **Multi-Provider AI** — Switch between Groq (free), Gemini (free), Claude, or OpenRouter
- **Gmail Newsletter Digest** — Connect Gmail (read-only) to distill your newsletter subscriptions
- **Section Ratings** — Rate each topic section to improve future briefings over time
- **Archive** — All briefings saved locally, up to 30 editions
- **Data Export/Import** — Full backup and restore of all settings and data
- **Dark Editorial UI** — Newspaper broadsheet meets analyst terminal aesthetic

## GitHub Pages Deployment

1. Push to `main` branch
2. Go to repo Settings → Pages → Source: **GitHub Actions**
3. First deploy takes ~2 minutes
4. App available at `https://username.github.io/ai-newsletter`

The included GitHub Actions workflow (`.github/workflows/deploy.yml`) handles build and deployment automatically.

## Google OAuth Setup (for Gmail feature)

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. New project → Enable Gmail API
3. OAuth consent screen: External, add your email as test user
4. Create credentials → OAuth 2.0 Client ID → Web application
5. Add `https://username.github.io` to Authorized JavaScript Origins
6. Copy Client ID → paste into PULSE Settings screen

## Security

- **API keys** are stored only in your browser's localStorage — never sent anywhere except directly to those providers' APIs
- **Gmail access** is read-only and the access token lives in memory only — it's gone when you close the tab
- **No data** ever leaves your browser except the API calls you intentionally trigger
- **Content Security Policy** restricts connections to known AI provider endpoints only
- **All AI output** is sanitized with DOMPurify before rendering
- **Client-side rate limiting** prevents accidental API cost explosion
- You can clear all stored data at any time from Settings → "Clear all data"
- **Never use this app on a public or shared computer**

## Tech Stack

- **React 19** via Vite — builds to static files
- **Tailwind CSS** — utility-first styling
- **DOMPurify** — HTML sanitization
- **Marked** — Markdown to HTML conversion
- No backend, no database, no server-side code

## Architecture

```
User Input → Intelligence Profile (localStorage)
  → Prompt Builder (injects profile context)
  → AI Client Router (Groq / Gemini / Claude / OpenRouter)
  → Content Sanitizer (marked + DOMPurify)
  → Renderer (BriefingCard)
  → Archive (localStorage, max 30 items)
```

## Development

```bash
npm install    # Install dependencies
npm run dev    # Start dev server
npm run build  # Production build
npm run preview # Preview production build
```
