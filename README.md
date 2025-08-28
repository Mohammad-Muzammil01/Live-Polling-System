## Live Polling System

A real-time classroom polling and chat application with separate backend (Node.js/Express + Socket.IO) and frontend (React + Redux). Teachers can create polls, students can vote live, and everyone can see real-time results and chat updates.

### Features
- Real-time polls and live results via WebSockets (Socket.IO)
- Teacher and student dashboards
- In-app chat
- Poll history and active poll management
- Graceful handling for waiting/paused states and kicked-out users

### Tech Stack
- **Frontend**: React, Redux, Socket.IO client
- **Backend**: Node.js, Express, Socket.IO
- **Logging**: Winston (files in `backend/logs/`)

### Repository Structure
```
.
├─ backend/
│  ├─ controllers/
│  ├─ middleware/
│  ├─ routes/
│  ├─ services/
│  ├─ socket/
│  ├─ utils/
│  ├─ server.js
│  └─ env.example
├─ frontend/
│  ├─ public/
│  └─ src/
└─ package-lock.json
```

---

## Getting Started (Local Development)

### Prerequisites
- Node.js 18+ and npm 9+
- Two terminals (one for backend, one for frontend)

### 1) Backend setup
```
cd backend
npm ci
```

Create a `.env` file in `backend/` using `env.example` as reference.

Common variables (your project may use a subset):
```
PORT=5000
CLIENT_URL=http://localhost:3000
# Add any other vars from backend/env.example
```

Start the backend:
```
npm start
# or
node server.js
```
The server will listen on `PORT` (default `5000`) and expose HTTP + Socket.IO.

### 2) Frontend setup
```
cd frontend
npm ci
```

Create a `.env` file in `frontend/` if not present and set the backend URL:
```
REACT_APP_BACKEND_URL=http://localhost:5000
```

Start the frontend:
```
npm start
```
The app will open at `http://localhost:3000` and connect to the backend via `REACT_APP_BACKEND_URL`.

---

## Environment Variables

### Backend (`backend/.env`)
- `PORT`: Port for the Express/Socket.IO server (e.g., `5000`).
- `CLIENT_URL`: Allowed CORS origin for the frontend (e.g., `http://localhost:3000`).
- Any additional variables listed in `backend/env.example`.

### Frontend (`frontend/.env`)
- `REACT_APP_BACKEND_URL`: Base URL of the backend (e.g., `http://localhost:5000`).

---

## Scripts

### Backend (from `backend/`)
- `npm start` — start the server
- `npm run dev` — if available, start in watch mode (optional)

### Frontend (from `frontend/`)
- `npm start` — start React dev server
- `npm run build` — production build

---

## Deployment

You can deploy the backend and frontend separately. Below are battle-tested defaults.

### Backend (Render)
1. Create a new Web Service from your Git repository.
2. Root directory: `backend/`
3. Build command: `npm ci`
4. Start command: `npm start` (or `node server.js`)
5. Environment variables:
   - `PORT` — Render will provide one; ensure your code reads `process.env.PORT`.
   - `CLIENT_URL` — set to your frontend deployed URL.
   - Any others from `backend/env.example`.
6. WebSockets are supported out-of-the-box.

After deploy, note the backend URL (e.g., `https://your-api.onrender.com`).

### Frontend (Netlify or Vercel)
Netlify
- Base directory: `frontend/`
- Build command: `npm ci && npm run build`
- Publish directory: `frontend/build`
- Env: `REACT_APP_BACKEND_URL` = your backend URL

Vercel
- Project root: `frontend/`
- Build command: `npm run build`
- Output directory: `build`
- Env: `REACT_APP_BACKEND_URL` = your backend URL

### CORS
Ensure the backend allows the frontend origin. In `backend/server.js` or the CORS middleware, set `origin` to your deployed frontend URL (and `credentials` if required).

---

## Project Internals

- HTTP routes are defined under `backend/routes/` and wired in `backend/routes/index.js`.
- Controllers live in `backend/controllers/` and business logic in `backend/services/`.
- Socket event handlers are implemented in `backend/socket/socketHandlers.js`.
- Logging is configured in `backend/utils/logger.js` and writes to `backend/logs/`.
- Frontend state management is in `frontend/src/store/` with slices for chat, poll, and user.
- UI components are in `frontend/src/components/` (e.g., `TeacherDashboard`, `StudentDashboard`, `ChatPopup`).

For detailed behavior, consult the relevant files above.

---

## Troubleshooting
- Frontend can’t connect: verify `REACT_APP_BACKEND_URL` and backend CORS `CLIENT_URL`.
- WebSocket not connecting in production: check that your host supports WebSockets and that CORS is configured for both HTTP and Socket.IO.
- Mixed-content errors: if frontend is HTTPS, backend must also be HTTPS.
- Stale envs on frontend: re-deploy after changing env vars so the build picks them up.

---

## Assignment Submission Template
```
Subject: SDE INTERN ASSIGNMENT SUBMISSION

Name: <Your Full Name>
Phone Number: <Your Contact Number>
Email ID: <Your Email Address>
LinkedIn URL: <Your LinkedIn Profile Link>
APPLIED VIA GOOGLE FORM: YES/NO

Assignment Link (Frontend): <Hosted/Deployed Link>
Backend API Link (optional): <Hosted/Deployed Link>
GitHub Repo: <Repository URL>
```

---

## License
This project is for educational and evaluation purposes. Add a license here if you intend to distribute.


