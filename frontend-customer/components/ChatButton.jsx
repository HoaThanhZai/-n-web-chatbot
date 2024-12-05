import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaRobot } from 'react-icons/fa';
import { backendAPI } from "@/config";
import ChatbotImage from '../public/img/ai.jpg';

const ChatbotButton = () => {
  const [isOpen, setIsOpen] = useState(false);  // Kiểm tra trạng thái mở/đóng chatbot
  const [messages, setMessages] = useState([]); // Lưu lịch sử tin nhắn
  const [userMessage, setUserMessage] = useState(""); // Tin nhắn người dùng

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        { sender: "bot", text: "Xin chào bạn! Tớ là trợ lý ảo của elevenShop" },
        { sender: "bot", text: "Tớ có thể giúp gì cho bạn ạ" },
      ]);
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!userMessage.trim()) return;

    const newMessage = { sender: "user", text: userMessage };
    setMessages((prev) => [...prev, newMessage]);
    setUserMessage("");

    try {
      const response = await axios.post(backendAPI + "/api/chatbot/chat", {
        message: userMessage,
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log("Phản hồi từ backend:", response.data);

      const botMessage = { sender: "bot", text: response.data.reply };
      setMessages((prev) => [...prev, botMessage]);

    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = { sender: "bot", text: "Xin lỗi, em không thể trả lời ngay lúc này." };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && userMessage.trim() !== "") {
      e.preventDefault();  // Ngừng hành động mặc định (không xuống dòng)
      sendMessage(); // Gửi tin nhắn
    }
  };

  return (
    <div
      className="chatbot-wrapper"
      style={{
        position: "fixed",
        bottom: "16px",
        right: "16px", 
        zIndex: 1000,
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="chatbot-button"
      >
        <img 
          src="/img/ai.jpg" 
          alt="Chatbot Avatar" 
          style={{
            width: "70px",
            height: "70px",
            borderRadius: "50%",
          }}
        />
      </button>
  
      {isOpen && (
        <div className="chatbot-box">
          <div className="chatbot-header">
            <h3>E-Chatbot</h3>
            <button onClick={() => setIsOpen(false)}>×</button>
          </div>
          <div className="chatbot-messages">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`chatbot-message ${
                  message.sender === "user" ? "chatbot-user" : "chatbot-bot"
                }`}
              >
                {message.text}
              </div>
            ))}
          </div>
          <div className="chatbot-input">
            <input
              type="text"
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              placeholder="Bạn cần gì..."
              onKeyDown={handleKeyDown} // Gọi hàm xử lý khi nhấn phím
            />
            <button onClick={sendMessage}>Gửi</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotButton;
