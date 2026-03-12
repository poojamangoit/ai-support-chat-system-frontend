import React, { useState } from "react";
import AdminPanel from "./components/AdminPanel";
import ChatWindow from "./components/ChatWindow";

function App() {
  const [isAdmin, setIsAdmin] = useState(false);

  return (
    <div className="app-shell">
      <div className="mode-switch">
        <button
          className={!isAdmin ? "active" : ""}
          onClick={() => setIsAdmin(false)}
        >
          User UI
        </button>
        <button
          className={isAdmin ? "active" : ""}
          onClick={() => setIsAdmin(true)}
        >
          Admin Panel
        </button>
      </div>

      {isAdmin ? <AdminPanel /> : <ChatWindow />}

      <div className="app-footer">Real-Time AI Support Chat System</div>
    </div>
  );
}

export default App;
