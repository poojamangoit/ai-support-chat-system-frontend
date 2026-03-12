import React, { useEffect, useRef, useState } from "react";
import { AlertCircle, Cpu, Plus, Send, User } from "lucide-react";
import { getChatHistory, sendMessage, startChat } from "../services/api";
import socket from "../services/socket";

const ChatWindow = () => {
  const [conversationId, setConversationId] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("active");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  const loadConversation = async (conversationIdToLoad = "") => {
    const { data } = conversationIdToLoad
      ? await getChatHistory(conversationIdToLoad)
      : await startChat();

    const conversation = data.conversation;

    setConversationId(conversation._id);
    setMessages(data.messages);
    setStatus(conversation.status);
    localStorage.setItem("chat_id", conversation._id);
    socket.emit("join_conversation", conversation._id);
  };

  useEffect(() => {
    let isMounted = true;

    const bootstrapConversation = async () => {
      try {
        const savedId = localStorage.getItem("chat_id");

        if (savedId) {
          if (!isMounted) {
            return;
          }

          await loadConversation(savedId);
          return;
        }

        if (!isMounted) {
          return;
        }

        await loadConversation();
      } catch {
        if (isMounted) {
          setError("Unable to load the chat right now.");
        }
      }
    };

    bootstrapConversation();

    const handleReceiveMessage = (message) => {
      setMessages((currentMessages) => {
        if (currentMessages.some((entry) => entry._id === message._id)) {
          return currentMessages;
        }

        return [...currentMessages, message];
      });
    };

    const handleConversationStatus = (payload) => {
      setStatus(payload.status);
    };

    socket.on("receive_message", handleReceiveMessage);
    socket.on("conversation_status", handleConversationStatus);

    return () => {
      isMounted = false;
      socket.off("receive_message", handleReceiveMessage);
      socket.off("conversation_status", handleConversationStatus);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!conversationId || !input.trim() || isSending) {
      return;
    }

    setIsSending(true);
    setError("");

    try {
      await sendMessage({
        conversationId,
        message: input
      });
      setInput("");
    } catch (sendError) {
      setError(
        sendError.response?.data?.error || "Unable to send your message."
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleNewChat = async () => {
    if (isSending) {
      return;
    }

    setError("");
    localStorage.removeItem("chat_id");

    try {
      await loadConversation();
    } catch {
      setError("Unable to start a new conversation.");
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div>
          <h2 style={{ margin: 0, fontSize: "1.2rem" }}>AI Support Chat</h2>
          <span className="header-subtitle">
            {status === "resolved"
              ? "Conversation resolved"
              : status === "escalated"
                ? "Escalated to human agent"
                : "AI assistant online"}
          </span>
        </div>
        <div className="header-actions">
          <button className="secondary-button" onClick={handleNewChat}>
            <Plus size={16} />
            New Chat
          </button>
          {status === "escalated" && <AlertCircle color="#fbbf24" size={20} />}
        </div>
      </div>

      <div className="messages-list">
        {messages.map((message) => (
          <div key={message._id} className={`message ${message.sender}`}>
            <div className="message-meta">
              {message.sender === "user" ? (
                <User size={12} />
              ) : message.sender === "ai" ? (
                <Cpu size={12} />
              ) : (
                <User size={12} color="#93c5fd" />
              )}
              <span>{message.sender.toUpperCase()}</span>
            </div>
            {message.message}
          </div>
        ))}
        {status === "escalated" && (
          <div className="message system">
            A human agent can now reply in this conversation.
          </div>
        )}
        {status === "resolved" && (
          <div className="message system">
            This conversation has been resolved. Start a new chat anytime.
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
          placeholder="Type your message..."
        />
        <button onClick={handleSend} disabled={isSending || !conversationId}>
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
