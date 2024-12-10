import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import ChatInput from "./components/ChatInput";
import MainDiv from "./components/MainDiv";
import Allusers from "./components/AllUsers";

function App() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState({});
  const [step, setStep] = useState(1);
  const [authMode, setAuthMode] = useState("");
  const [showAddOptions, setShowAddOptions] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupMembers, setGroupMembers] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [groups, setGroups] = useState([]);

  const socketRef = useRef(null);

  const users = Allusers;

  useEffect(() => {
    socketRef.current = io("http://192.168.101.32:4000", {
      transports: ["websocket"],
      reconnection: true,
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      console.log("Connected to socket server");
    });

    socket.on("receiveMessage", ({ sender, message }) => {
      setMessages((prevMessages) => ({
        ...prevMessages,
        [sender]: [...(prevMessages[sender] || []), { sender, message }],
      }));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleAuthSubmit = () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/; 
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,}$/; 
  
    if (authMode === "signup") {
      if (!username.trim() || !email.trim() || !password.trim()) {
        alert("Please fill out all fields.");
        return;
      }
      if (!emailRegex.test(email)) {
        alert("Please enter a valid Gmail address.");
        return;
      }
      if (!passwordRegex.test(password)) {
        alert("Password must be at least 6 characters long, contain at least 1 special character, and 1 number.");
        return;
      }
      alert("User signed up successfully!");
      setStep(2);
    } else if (authMode === "login") {
      if (!email.trim() || !password.trim()) {
        alert("Please fill out all fields.");
        return;
      }
      if (!emailRegex.test(email)) {
        alert("Please enter a valid Gmail address.");
        return;
      }
      if (!passwordRegex.test(password)) {
        alert("Password must be at least 6 characters long, contain at least 1 special character, and 1 number.");
        return;
      }
      alert("User logged in successfully!");
      setStep(2);
    }
  };
  

  const handleSendMessage = (msg) => {
    const socket = socketRef.current;
    if (msg.trim() && selectedUser) {
      socket.emit("sendMessage", { sender: username, recipient: selectedUser.name, message: msg });

      setMessages((prevMessages) => ({
        ...prevMessages,
        [selectedUser.name]: [...(prevMessages[selectedUser.name] || []), { sender: username, message: msg }],
      }));
    }
  };

  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      alert("Please enter a group name.");
      return;
    }

    if (groupMembers.length === 0) {
      alert("Please select at least one member for the group.");
      return;
    }

    const newGroup = { id: `group-${groups.length + 1}`, name: groupName, members: groupMembers };
    setGroups((prevGroups) => [...prevGroups, newGroup]);
    setGroupMembers([]);
    setGroupName("");
    setShowGroupModal(false);
  };

  if (step === 1) {
    return (
      <div className="welcome-container">
        <h1>Welcome to Chat App</h1>
        {!authMode && (
          <div className="button-container">
            <button onClick={() => setAuthMode("signup")}>Signup</button>
            <button onClick={() => setAuthMode("login")}>Login</button>
          </div>
        )}
        {authMode === "signup" && (
          <>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleAuthSubmit}>Signup</button>
          </>
        )}
        {authMode === "login" && (
          <>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleAuthSubmit}>Login</button>
          </>
        )}
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="chat-app">
        <div className="left-panel">
          <header>
            Chats
            <button id="addPeople" onClick={() => setShowAddOptions(true)}>
              +
            </button>
          </header>
          {groups.map((group) => (
            <div
              key={group.id}
              className={`user-item ${group.id === selectedUser?.id ? "active" : ""}`}
              onClick={() => setSelectedUser(group)}
            >
              <p>{group.name} (Group)</p>
            </div>
          ))}
          {users.map((user) => (
            <div
              key={user.id}
              className={`user-item ${user.id === selectedUser?.id ? "active" : ""}`}
              onClick={() => setSelectedUser(user)}
            >
              <p>{user.name}</p>
            </div>
          ))}
        </div>
        <div className="right-panel">
          {selectedUser ? (
            <>
              <header>{selectedUser.name}</header>
              <MainDiv messages={messages[selectedUser.name] || []} username={username} />
              <ChatInput sendMessage={handleSendMessage} />
            </>
          ) : (
            <div className="no-chat-selected">
              <p>Select a user to start chatting</p>
            </div>
          )}
        </div>

        {showAddOptions && (
          <div className="modal-overlay">
            <div className="modal-content">
              <button className="close-btn" onClick={() => setShowAddOptions(false)}>
                &times;
              </button>
              <button className="modal-btn" onClick={() => alert("Add New User functionality here")}>
                Add New User
              </button>
              <button className="modal-btn" onClick={() => setShowGroupModal(true)}>
                Create Group
              </button>
            </div>
          </div>
        )}

        {showGroupModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <button className="close-btn" onClick={() => setShowGroupModal(false)}>
                &times; 
              </button>
              <h2>Create Group</h2>
              <input
                type="text"
                placeholder="Enter group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
              <h3>Select Members</h3>
              {users.map((user) => (
                <div key={user.id} className="checkbox-container">
                  <input
                    type="checkbox"
                    value={user.name}
                    onChange={(e) => {
                      const selected = e.target.value;
                      setGroupMembers((prev) =>
                        prev.includes(selected)
                          ? prev.filter((member) => member !== selected)
                          : [...prev, selected]
                      );
                    }}
                  />
                  <label>{user.name}</label>
                </div>
              ))}
              <div className="modal-btn-container">
                <button className="modal-btn" onClick={handleCreateGroup}>Create Group</button>
                <button className="cancel-btn" onClick={() => setShowGroupModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}

export default App;
