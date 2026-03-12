
import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL;

const API = axios.create({
  baseURL: API_URL,
});

export const startChat = () => API.post("/chat/start");

export const sendMessage = (data) => API.post("/chat/message", data);

export const getChatHistory = (id) => API.get(`/chat/${id}`);

export const getEscalatedConversations = () => API.get("/chat/escalated");

export const sendAgentMessage = (conversationId, message) =>
  API.post(`/chat/${conversationId}/agent-message`, { message });

export const resolveConversation = (conversationId) =>
  API.patch(`/chat/${conversationId}/resolve`);
