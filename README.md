# CONCEPTPE — Educational Platform

> **Tagline:** “Unlock Your Potential”

CONCEPTPE is an academic learning platform built with a concept-first pedagogy across Mathematics, Science, Computer Science, and Exam Preparation.

---

## Architecture Overview

```
CONCETPE/
├── frontend/                     # Frontend Application (HTML5, CSS3, Vanilla JS)
│   ├── index.html                # Semantic HTML5 layout & components
│   ├── style.css                 # Academic design system (Light & Dark modes)
│   ├── script.js                 # UI interactions, navigation, modals & API fetch
│   └── assets/
│       └── images/
│           └── conceptpe-logo.png # Official CONCEPTPE logo
│
├── backend/                      # Node.js + Express.js REST API
│   ├── server.js                 # Express server & static asset mount
│   ├── package.json              # Backend dependencies (express, cors, dotenv)
│   ├── .env                      # Active environment configuration
│   ├── .env.example              # Environment variables template
│   ├── config/
│   │   └── environment.js        # Config loader
│   ├── controllers/
│   │   ├── healthController.js   # Health check handler
│   │   ├── courseController.js   # Educational courses handler
│   │   ├── videoController.js    # Video lectures handler
│   │   ├── resourceController.js # Study resources handler
│   │   └── contactController.js  # Contact inquiry handler
│   ├── services/
│   │   ├── courseService.js      # Courses data & syllabus service
│   │   ├── videoService.js       # Video repository service
│   │   ├── resourceService.js    # Academic resources service
│   │   └── contactService.js     # Contact validation & storage service
│   └── routes/
│       ├── healthRoutes.js       # /api/health
│       ├── courseRoutes.js       # /api/courses
│       ├── videoRoutes.js        # /api/videos
│       ├── resourceRoutes.js     # /api/resources
│       ├── contactRoutes.js      # /api/contact
│       └── index.js              # Aggregator router
│
└── README.md                     # Documentation & setup guide
```

---

## Getting Started

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 2. Install Backend Dependencies
Open your terminal and navigate to the `backend` directory:

```bash
cd backend
npm install
```

### 3. Configure Environment Variables
A default `.env` file is already created. To adjust settings, copy from `.env.example`:

```bash
cp .env.example .env
```

Default variables:
```env
PORT=5000
NODE_ENV=development
CLIENT_ORIGIN=*
API_PREFIX=/api
```

### 4. Start the Backend Server

To start in standard mode:
```bash
npm start
```

To start with file watching (auto-reload on code edits):
```bash
npm run dev
```

To run the automated API verification test suite:
```bash
npm test
```

The server will initialize on:
- **Backend API & App URL:** `http://localhost:5000`
- **Frontend App:** `http://localhost:5000/`

---

## Available REST API Endpoints

All API endpoints return clean, consistent JSON responses.

### 1. System Health Check
- **Endpoint:** `GET /api/health`
- **Description:** Verifies server health, timestamp, and process uptime.
- **Example Response:**
  ```json
  {
    "status": "ok",
    "service": "conceptpe-backend",
    "timestamp": "2026-09-27T04:20:00.000Z",
    "uptime": 12.4
  }
  ```

### 2. Courses API
- **Endpoint:** `GET /api/courses`
- **Optional Query Parameter:** `?category=math|science|cs|exam|revision`
- **Description:** Retrieves all educational courses or filters by category.
- **Single Course:** `GET /api/courses/:id` (e.g. `GET /api/courses/math-foundations`)
- **Example Response:**
  ```json
  {
    "success": true,
    "count": 6,
    "data": [
      {
        "id": "math-foundations",
        "title": "Calculus, Algebra & Geometry",
        "description": "Master functions, differential & integral calculus...",
        "category": "math",
        "categoryLabel": "Mathematics",
        "badge": "Core Subject",
        "image": "/assets/images/conceptpe-logo.png",
        "status": "active",
        "highlights": [ ... ],
        "modules": [ ... ]
      }
    ]
  }
  ```

### 3. Videos API
- **Endpoint:** `GET /api/videos`
- **Optional Query Parameter:** `?category=math|science|cs|strategy`
- **Description:** Retrieves video lectures with duration, topics, and YouTube links.
- **Single Video:** `GET /api/videos/:id` (e.g. `GET /api/videos/vid-math-01`)
- **Example Response:**
  ```json
  {
    "success": true,
    "count": 6,
    "data": [
      {
        "id": "vid-math-01",
        "title": "Calculus Fundamentals: Geometric Meaning of Derivatives",
        "duration": "18:45",
        "category": "math",
        "level": "Foundation",
        "youtubeUrl": "https://www.youtube.com/@Conceptpe",
        "channel": "@Conceptpe",
        "status": "available"
      }
    ]
  }
  ```

### 4. Study Resources API
- **Endpoint:** `GET /api/resources`
- **Optional Query Parameter:** `?category=notes|practice|revision|concepts|exam`
- **Description:** Retrieves structured study notes, practice problem sets, formula maps, and exam blueprints.
- **Single Resource:** `GET /api/resources/:id`
- **Example Response:**
  ```json
  {
    "success": true,
    "count": 5,
    "data": [
      {
        "id": "res-notes-01",
        "title": "Chapter-wise Comprehensive Notes",
        "category": "notes",
        "type": "Structured PDF",
        "tags": ["All Subjects", "Chapter Summaries"],
        "status": "available",
        "downloadable": true
      }
    ]
  }
  ```

### 5. Contact Inquiries API
- **Endpoint:** `POST /api/contact`
- **Headers:** `Content-Type: application/json`
- **Body:**
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "subject": "math",
    "message": "I would love to request a lecture on multi-variable limits."
  }
  ```
- **Validation Rules:**
  - `name`: String, minimum 2 characters (required).
  - `email`: Valid email format (required).
  - `message`: String, between 10 and 500 characters (required).
  - `subject`: Optional string.
- **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Thank you, Jane Doe! Your message has been received.",
    "data": {
      "id": "msg_1727410000000_abc123",
      "createdAt": "2026-09-27T04:22:00.000Z",
      "status": "received"
    }
  }
  ```
- **Error Response (400 Bad Request):**
  ```json
  {
    "success": false,
    "error": "Validation failed",
    "details": [
      { "field": "email", "message": "Please provide a valid email address." }
    ]
  }
  ```
- **Recent Inquiries (Internal):** `GET /api/contact`

---

## Security & Best Practices

1. **Environment Separation**: Sensitive values and port bindings are managed via `backend/.env`.
2. **Never Expose Credentials**: No API keys, credentials, or private tokens are placed into client-side code.
3. **CORS Configured**: Cross-Origin Resource Sharing is enabled for seamless frontend-backend communication.
4. **Safe Fallback**: The frontend is built resiliently — it interacts with the REST API when the backend is active, and degrades gracefully with local confirmation if offline.
