# AI Support Chat System

Full-stack MERN support chat with:

- MongoDB persistence for conversations and messages
- AI replies generated on the backend with Google Gemini
- Automatic escalation to a human agent for low-confidence AI replies
- Real-time updates via Socket.IO
- Admin panel for viewing escalated conversations and replying as an agent

## Project Structure

- `../backend`: Express, MongoDB, Socket.IO, OpenAI integration
- `./src`: React frontend for user chat and admin panel

## Backend Setup

1. Copy [`.env.example`](/home/pooja/Desktop/Task-Mern/ai-support-chat-system/backend/.env.example) to `.env` inside `backend`.
2. Set `MONGO_URI` and `GEMINI_API_KEY`.
3. Install dependencies in `backend` if needed.
4. Start the server:

```bash
cd ../backend
npm start
```

## Frontend Setup

1. Copy `.env.example` to `.env` inside `frontend`.
2. Set `VITE_API_URL` to your backend base URL.
3. Install dependencies in `frontend` if needed.
4. Start the frontend:

```bash
npm run dev
```

Use the API URL in `VITE_API_URL`, for example `http://localhost:5000`.

## Architecture Notes

- User and agent messages are written through REST endpoints so every message is persisted before the UI updates.
- Socket.IO is used for room-based real-time delivery of new messages and conversation status changes.
- Conversation status is stored in MongoDB using `active`, `escalated`, and `resolved`.
- When the AI reply is low confidence or the LLM call fails, the conversation is escalated and becomes visible in the admin panel.
