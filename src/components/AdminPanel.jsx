import React, { useEffect, useRef, useState } from "react";
import { CheckCircle2, MessageCircle, Send } from "lucide-react";
import {
  getChatHistory,
  getEscalatedConversations,
  resolveConversation,
  sendAgentMessage
} from "../services/api";
import socket from "../services/socket";

const AdminPanel = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("escalated");
  const messagesEndRef = useRef(null);

  const fetchEscalatedConversations = async () => {
    try {
      const { data } = await getEscalatedConversations();
      setConversations(data);
    } catch {
      setError("Unable to load escalated conversations.");
    }
  };

  useEffect(() => {
    fetchEscalatedConversations();

    const handleConversationEscalated = async () => {
      await fetchEscalatedConversations();
    };

    const handleConversationResolved = async ({ conversationId }) => {
      setConversations((current) =>
        current.filter((conversation) => conversation._id !== conversationId)
      );

      if (conversationId === selectedId) {
        setSelectedStatus("resolved");
      }
    };

    const handleReceiveMessage = (message) => {
      if (message.conversationId !== selectedId) {
        return;
      }

      setMessages((currentMessages) => {
        if (currentMessages.some((entry) => entry._id === message._id)) {
          return currentMessages;
        }

        return [...currentMessages, message];
      });
    };

    const handleConversationStatus = ({ conversationId, status }) => {
      if (conversationId === selectedId) {
        setSelectedStatus(status);
      }
    };

    socket.on("conversation_escalated", handleConversationEscalated);
    socket.on("conversation_resolved", handleConversationResolved);
    socket.on("receive_message", handleReceiveMessage);
    socket.on("conversation_status", handleConversationStatus);

    return () => {
      socket.off("conversation_escalated", handleConversationEscalated);
      socket.off("conversation_resolved", handleConversationResolved);
      socket.off("receive_message", handleReceiveMessage);
      socket.off("conversation_status", handleConversationStatus);
    };
  }, [selectedId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selectConversation = async (conversationId) => {
    setSelectedId(conversationId);
    setError("");

    try {
      const { data } = await getChatHistory(conversationId);
      setMessages(data.messages);
      setSelectedStatus(data.conversation.status);
      socket.emit("join_conversation", conversationId);
    } catch {
      setError("Unable to load conversation details.");
    }
  };

  const handleResolve = async () => {
    if (!selectedId || isResolving) {
      return;
    }

    setIsResolving(true);
    setError("");

    try {
      await resolveConversation(selectedId);
      setSelectedStatus("resolved");
      setConversations((current) =>
        current.filter((conversation) => conversation._id !== selectedId)
      );
    } catch (resolveError) {
      setError(
        resolveError.response?.data?.error || "Unable to resolve conversation."
      );
    } finally {
      setIsResolving(false);
    }
  };

  const handleSend = async () => {
    if (!selectedId || !input.trim() || isSending) {
      return;
    }

    setIsSending(true);
    setError("");

    try {
      await sendAgentMessage(selectedId, input);
      setInput("");
    } catch (sendError) {
      setError(
        sendError.response?.data?.error || "Unable to send agent response."
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="admin-layout">
      <div className="sidebar">
        <h3>Escalated Chats</h3>
        {conversations.length === 0 ? (
          <p className="sidebar-empty">No escalated conversations.</p>
        ) : (
          conversations.map((conversation) => (
            <div
              key={conversation._id}
              className={`conversation-item ${
                selectedId === conversation._id ? "active" : ""
              }`}
              onClick={() => selectConversation(conversation._id)}
            >
              <div style={{ fontWeight: "bold" }}>
                ID: {conversation._id.slice(-6)}
              </div>
              <div className="conversation-meta">
                {new Date(conversation.createdAt).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="chat-container">
        {selectedId ? (
          <>
            <div className="chat-header">
              <div>
                <h2 style={{ margin: 0, fontSize: "1.2rem" }}>Agent Chat</h2>
                <span className="header-subtitle">
                  {selectedStatus === "resolved"
                    ? "Conversation resolved"
                    : `Conversation ID: ${selectedId}`}
                </span>
              </div>
              <button
                className="secondary-button"
                onClick={handleResolve}
                disabled={selectedStatus === "resolved" || isResolving}
              >
                <CheckCircle2 size={16} />
                Resolve
              </button>
            </div>

            <div className="messages-list">
              {messages.map((message) => (
                <div key={message._id} className={`message ${message.sender}`}>
                  <div className="message-meta">
                    <span>{message.sender.toUpperCase()}</span>
                  </div>
                  {message.message}
                </div>
              ))}
              {selectedStatus === "resolved" && (
                <div className="message system">
                  This conversation has been marked as resolved.
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {error && <div className="error-banner">{error}</div>}

            <div className="input-area">
              <input
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleSend();
                  }
                }}
                placeholder="Respond as human agent..."
              />
              <button
                onClick={handleSend}
                disabled={isSending || selectedStatus === "resolved"}
              >
                <Send size={18} />
              </button>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <MessageCircle size={48} style={{ opacity: 0.3 }} />
            <p>Select an escalated conversation to respond.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
