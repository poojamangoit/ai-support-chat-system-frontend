import React from "react";

const MessageBubble = ({ message }) => {

  const isUser = message.sender === "user";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        marginBottom: "10px",
      }}
    >
      <div
        style={{
          background: isUser ? "#4CAF50" : "#f1f1f1",
          color: isUser ? "#fff" : "#000",
          padding: "10px",
          borderRadius: "10px",
          maxWidth: "60%",
        }}
      >
        {message.message}
      </div>
    </div>
  );
};

export default MessageBubble;