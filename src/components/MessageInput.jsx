 import React, { useState } from "react";

const MessageInput = ({ onSend }) => {

  const [message, setMessage] = useState("");

  const handleSend = () => {

    if (!message.trim()) return;

    onSend(message);

    setMessage("");
  };

  return (
    <div style={{ display: "flex" }}>

      <input
        style={{ flex: 1, padding: "10px" }}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
      />

      <button
        style={{ padding: "10px 20px" }}
        onClick={handleSend}
      >
        Send
      </button>

    </div>
  );
};

export default MessageInput;