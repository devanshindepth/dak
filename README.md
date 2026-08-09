# Dak - Personal Developer Dashboard

A high-performance, modular developer dashboard built with Next.js 16, React 19, TypeScript, and Tailwind CSS. **Dak** aggregates real-time technical news, competitive programming metrics, GitHub activity, financial markets, AI benchmarks, weather, and developer tools into a unified, customizable interface.

---

## Features

- **JSON-Driven Layout Engine**: Customize tabs, columns, widget sizing, and feed sources via [`app/config/dashboard.json`](file:///d:/coding/dak/app/config/dashboard.json).
- **Minimalist Aesthetic**: Designed with a high-contrast black-and-white theme system engineered for zero visual distraction.
- **Competitive Programming & GitHub Analytics**:
  - **Codeforces**: Live rating tracking and upcoming contest schedule.
  - **LeetCode**: Daily challenge monitor and user stats.
  - **GitHub Heatmap**: Contribution graph visualization and active project updates.
  - **Framework Releases**: Tracks updates across core projects like Next.js, React, and Tailwind CSS.
- **AI Integration & Benchmarks**:
  - **AI Benchmarks**: Evaluation suite tracking state-of-the-art frontier models.
  - **Groq & xAI Grok Integration**: AI-assisted search and query endpoints.
- **Multi-Source News & Media Feed**:
  - **Hacker News & Reddit**: Configurable subreddits and story rankings.
  - **RSS Feed Aggregator**: Real-time articles from tech publications (Ars Technica, The Verge, TechCrunch).
  - **Stock & Crypto News**: Dedicated financial news tracker.
  - **YouTube Media Hub**: Live channel feed integration for tech content creators.
- **Productivity & Monitoring Tools**:
  - **Markets Watch**: Real-time ticker for crypto and equities (BTC, ETH, SPY, NVDA, AAPL).
  - **World Clock**: Multi-timezone time monitoring.
  - **Weather Widget**: Metric and imperial forecasts powered by Open-Meteo.
  - **Uptime Monitor**: Live HTTP health checks for hosted services.
  - **Tasks & Typing**: Built-in task manager and typing speed progress tracker.
  - **Design & Engineering Catalog**: Curated tools directory for developers.

---

## Tech Stack

| Category | Technology |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router), React 19, TypeScript |
| **Styling** | Tailwind CSS v4, Custom CSS variables |
| **Data Fetching & APIs** | Server-side proxy API routes (`app/api/*`), RSS Parser, Open-Meteo, Yahoo Finance, GitHub GraphQL/REST APIs |
| **AI Providers** | Groq API (`llama-3.3-70b-versatile`), xAI (`grok-2-latest`) |
| **Deployment** | Zerops (`zerops.yaml`), Vercel, Node.js 20+ |

---

## Project Structure

```
dak/
├── app/
│   ├── api/                 # Server-side API proxies (Codeforces, HackerNews, RSS, Weather, etc.)
│   ├── components/
│   │   ├── layout/          # Dashboard grid, navigation, and column containers
│   │   ├── theme/           # Theme provider and design tokens
│   │   ├── ui/              # Reusable UI primitives
│   │   └── widgets/         # Modular widget implementations (25+ widgets)
│   ├── config/
│   │   └── dashboard.json   # Primary dashboard layout and widget configuration
│   ├── types/               # TypeScript interfaces for widgets and data structures
│   ├── utils/               # AI client callers, scrapers, and formatting helpers
│   ├── globals.css          # Core CSS variables and Tailwind setup
│   ├── layout.tsx           # Root layout definition
│   └── page.tsx             # Main dashboard entrance page
├── public/                  # Static assets and icons
├── zerops.yaml              # Deployment configuration for Zerops cloud runtime
├── package.json             # Dependencies and build scripts
└── tsconfig.json            # TypeScript compiler configuration
```

---

## Getting Started

### Prerequisites

Ensure you have the following installed on your environment:
- **Node.js**: `v20.0.0` or higher
- **npm**, **pnpm**, or **yarn**

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/dak.git
   cd dak
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file in the root directory:
   ```env
   # AI Key (Supports Groq or xAI Grok)
   GROQ_API_KEY=your_groq_api_key_here
   # Or:
   GROK_API_KEY=your_grok_api_key_here
   ```

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```

5. **Open Dashboard**:
   Navigate to [http://localhost:3000](http://localhost:3000) in your web browser.

---

## Configuration (`dashboard.json`)

The entire layout, active tabs, and widget instances are configured in [`app/config/dashboard.json`](file:///d:/coding/dak/app/config/dashboard.json).

### Example Tab Configuration

```json
{
  "name": "Dev",
  "columns": [
    {
      "size": "full",
      "widgets": [
        {
          "type": "releases",
          "id": "dev-framework-releases",
          "title": "Framework Releases",
          "repositories": ["vercel/next.js", "facebook/react"]
        },
        {
          "type": "github-heatmap",
          "id": "dev-github-heatmap",
          "title": "Developer GitHub Heatmap",
          "username": "your-github-username"
        }
      ]
    }
  ]
}
```

### Available Widgets

- `markets`: Stock and Cryptocurrency ticker bar
- `calendar`: Interactive monthly calendar
- `weather`: Meteorological conditions and multi-day forecast
- `bookmarks`: Categorized link launcher
- `hacker-news`: Trending Hacker News stories
- `reddit`: Subreddit post feed
- `rss`: Multi-source RSS feed collector
- `clock`: Multi-timezone digital clocks
- `codeforces`: Profile metrics and contest countdowns
- `leetcode`: Problem solver statistics and daily problem
- `todo`: Persistent local task list
- `typing-progress`: Typing speed metric logger
- `videos`: YouTube channel updates
- `releases`: GitHub repository release tracker
- `github-heatmap`: Contribution activity calendar
- `monitor`: Endpoint availability and ping monitor
- `stock-news`: Financial market news feed
- `tools`: Engineering software and utility index
- `ai-benchmark`: Model benchmarking suite

---

## Deployment

### Zerops

This project includes a native [`zerops.yaml`](file:///d:/coding/dak/zerops.yaml) configuration for single-command deployment on Zerops:

```yaml
zerops:
  - setup: dak-app
    build:
      base: nodejs@20
      buildCommands:
        - npm ci
        - npm run build
      deployFiles:
        - .next
        - node_modules
        - package.json
        - public
        - app
    run:
      base: nodejs@20
      start: npm run start
```

### Vercel / Standard Node.js

To build and run in a standard production environment:

```bash
npm run build
npm run start
```

---

## Command Reference

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts the Next.js development server at `localhost:3000` |
| `npm run build` | Compiles the production build |
| `npm run start` | Serves the compiled production build |
| `npm run lint` | Runs ESLint check across project files |

---

## License

This project is open source and available under the [MIT License](LICENSE).
