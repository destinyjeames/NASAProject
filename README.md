# Droid Stats

A full-stack space data dashboard built on top of NASA's public APIs. It has two main sections: a real-time asteroid tracker that pulls from NASA's Near-Earth Object Web Service, and a daily astronomy picture viewer using the APOD API. The whole thing runs on a Node/Express backend that keeps the API key server-side, with a React frontend handling all the visualisation.

**Live Demo:** [droidstats.vercel.app](https://droidstats.vercel.app) &nbsp;·&nbsp; **API:** [droidstats-api.onrender.com](https://droidstats-api.onrender.com)

---

## What it does

### Asteroid Tracker

The main page pulls near-Earth asteroid data for a selected date window and gives you four different ways to look at it:

- **Risk Distribution** — A donut chart splitting asteroids into hazardous vs safe. Click a segment to filter the list below to just that group.
- **Distance Histogram** — Real distance bins (every 10 million km) showing how many asteroids sit in each band. Click a bar to filter the list to just that distance range.
- **Speed vs Distance** — A scatter plot where each dot represents one asteroid, sized by diameter. Hazardous objects are orange, safe ones are green. Click any dot to highlight it across all charts.
- **Orbital Proximity Map** — A canvas-rendered radar map with Earth at the centre. Asteroids are plotted radially by distance and spread evenly by angle so nothing overlaps. Hazardous ones pulse. The radar arm sweeps continuously. Hover for a tooltip; click to select.

All four charts share a selection state — selecting an asteroid on any chart or in the list highlights it everywhere.

**Sidebar (Mission Control):**
- Closest approach distance and largest object diameter at a glance
- Live rotating alert messages when hazardous objects are present
- Threat Overview with a colour-coded level badge and distance distribution mini-bars
- Risk Index — a 0–100 composite score calculated from hazard percentage, closest approach proximity, and close-zone density, displayed as a ring gauge
- Velocity Spread — a gradient bar showing the full speed range from slowest to fastest, with a marker at the average

**Filtering and interactivity:**
- Date range presets (Today / 3 days / 7 days) or a custom date picker with NASA's 7-day window enforced client-side before the request goes out
- Hazardous-only toggle
- Sort by distance, speed, or diameter — with an ascending/descending toggle that appears when a sort is active
- Name search
- Clicking any asteroid card in the list selects it and highlights it on the Orbital Map and scatter chart simultaneously

### Astronomy Picture of the Day

A clean viewer for NASA's APOD feed with full date navigation back to 16 June 1995 (the first APOD). It handles both image and video entries. Long explanations collapse to a 150-character preview with a smooth animated expand. A skeleton loader shows while data is loading and there's a retry button if the request fails.

---

## Tech stack

| Layer      | Technology                                         |
|------------|----------------------------------------------------|
| Frontend   | React 19, Vite 8, React Router v7                  |
| Charts     | ECharts 6 via echarts-for-react, HTML Canvas       |
| Backend    | Node.js, Express 5                                 |
| HTTP       | Axios (server), Fetch API (client)                 |
| Styling    | Plain CSS with custom properties                   |
| APIs       | NASA NeoWs, NASA APOD                              |
| Deployment | Vercel (frontend), Render (backend)                |

---

## Project structure

```
NASAProject/
├── backend/
│   ├── controllers/
│   │   ├── asteroidController.js   # GET /api/asteroids — fetches, transforms, returns NEO data
│   │   └── apodController.js       # GET /api/apod — fetches and returns APOD for a given date
│   ├── routes/
│   │   ├── asteroidRoutes.js
│   │   └── apodRoutes.js
│   ├── services/
│   │   └── nasaService.js          # All NASA API calls live here — API key never leaves the server
│   ├── utils/
│   │   └── formatters.js           # toNumber() and averageDiameter() helpers
│   ├── app.js                      # Express app, CORS, route registration
│   └── .env                        # NASA_API_KEY, PORT
│
└── frontend/
    └── src/
        ├── components/
        │   ├── AsteroidCard.jsx        # Single asteroid row in the list
        │   ├── Chart.jsx               # Composes all four chart components
        │   ├── DateRangeBar.jsx        # Date preset buttons + custom range picker
        │   ├── FilterBar.jsx           # Hazardous toggle, sort buttons, sort direction, count
        │   ├── Sidebar.jsx             # Mission Control panel
        │   ├── EChartsPie.jsx          # Risk Distribution donut chart
        │   ├── EChartsBar.jsx          # Distance Histogram bar chart
        │   ├── EChartsScatter.jsx      # Speed vs Distance scatter chart
        │   ├── OrbitalMap.jsx          # Animated canvas radar map
        │   ├── APODControls.jsx        # Prev / date input / Next navigation
        │   ├── APODViewer.jsx          # Image or video renderer
        │   ├── APODMeta.jsx            # Title, date, copyright, and media-type chips
        │   └── APODDescription.jsx     # Expandable explanation text
        ├── hooks/
        │   └── useAsteroidInsights.js  # Derives closest, fastest, slowest, averages, counts
        ├── pages/
        │   ├── Asteroids.jsx           # Main asteroid tracking page
        │   └── Dashboard.jsx           # APOD page
        ├── services/
        │   └── api.js                  # fetch() wrappers for both API endpoints
        ├── App.jsx                     # BrowserRouter, Navbar, routes
        └── index.css                   # Global dark theme CSS design system
```

---

## Running locally

**Prerequisites:** Node.js 18+, a NASA API key (free at [api.nasa.gov](https://api.nasa.gov/) — no credit card needed)

### 1. Clone

```bash
git clone git@github.com:destinyjeames/NASAProject.git
cd NASAProject
```

### 2. Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
NASA_API_KEY=your_key_here
PORT=5001
```

```bash
npm run dev
```

The API runs at `http://localhost:5001`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. Vite proxies all `/api` requests to `localhost:5001` automatically — no extra config needed for local development.

---

## Environment variables

### Backend (`backend/.env`)

| Variable        | Required | Description                       |
|-----------------|----------|-----------------------------------|
| `NASA_API_KEY`  | Yes      | Your NASA API key                 |
| `PORT`          | No       | Server port (defaults to `5001`)  |

### Frontend (production only)

Create `frontend/.env` for production builds:

```env
VITE_API_URL=https://your-render-service.onrender.com
```

In development this is not needed — the Vite dev proxy handles it.

---

## API reference

### `GET /api/asteroids`

Returns near-Earth asteroid data for the requested date window, flattened and normalised from NASA's raw NeoWs response.

**Query parameters:**

| Param        | Type    | Description                                       |
|--------------|---------|---------------------------------------------------|
| `start_date` | string  | `YYYY-MM-DD` — defaults to today                  |
| `end_date`   | string  | `YYYY-MM-DD` — max 7 days after `start_date`      |

**Response:**

```json
{
  "count": 73,
  "asteroids": [
    {
      "id": "54341050",
      "name": "(2021 QM1)",
      "hazardous": true,
      "diameter": 312.5,
      "distance_km": 1234567.89,
      "speed_kph": 45231.12
    }
  ]
}
```

### `GET /api/apod`

Returns NASA's Astronomy Picture of the Day. Omit `date` for today's entry.

**Query parameters:**

| Param  | Type   | Description                                          |
|--------|--------|------------------------------------------------------|
| `date` | string | `YYYY-MM-DD` — any date from `1995-06-16` to today  |

**Response:**

```json
{
  "title": "The Milky Way over the Atacama",
  "url": "https://apod.nasa.gov/apod/image/...",
  "explanation": "...",
  "media_type": "image",
  "date": "2025-04-13",
  "copyright": "Photographer Name"
}
```

---

## Deployment

### Backend → Render

1. Push the repo to GitHub
2. Create a new **Web Service** on [render.com](https://render.com) pointing at the repo
3. Set **Root Directory** to `backend`
4. Set **Build Command**: `npm install`
5. Set **Start Command**: `node app.js`
6. Add environment variable: `NASA_API_KEY`

### Frontend → Vercel

1. Import the repo on [vercel.com](https://vercel.com)
2. Set **Root Directory** to `frontend`
3. Add environment variable: `VITE_API_URL` → your Render service URL

Vercel will detect Vite automatically and configure the build.

---

## License

MIT
