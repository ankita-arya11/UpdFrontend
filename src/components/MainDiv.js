import React from "react";

const MainDiv = ({ messages, username }) => {
  return (
    <div className="messages-container">
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`message ${msg.sender === username ? "sent" : "received"}`}
        >
          {msg.sender === username ? (
            <strong>You:</strong>
          ) : (
            <strong>{msg.sender}:</strong>
          )}{" "}
          {msg.message}
        </div>
      ))}
    </div>
  );
};

export default MainDiv;
