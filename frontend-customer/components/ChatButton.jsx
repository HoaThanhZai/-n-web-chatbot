  import React, { useState, useEffect } from "react";
  import axios from "axios";
  import { FaRobot } from 'react-icons/fa';
  import { backendAPI } from "@/config";


  const ChatbotButton = () => {
    const [isOpen, setIsOpen] = useState(false);  // Kiểm tra trạng thái mở/đóng chatbot
    const [messages, setMessages] = useState([]); // Lưu lịch sử tin nhắn
    const [userMessage, setUserMessage] = useState(""); // Tin nhắn người dùng


    useEffect(() => {
      // Chỉ thêm câu chat mở đầu khi chatbot mở lần đầu tiên và chưa có tin nhắn
      if (isOpen && messages.length === 0) {
        setMessages([
          { sender: "bot", text: "Xin chào bạn! Tớ là trợ lý ảo của elevenShop" },
          { sender: "bot", text: "Tớ có thể giúp gì cho bạn ạ" },
        ]);
      }
    }, [isOpen]); // Mỗi khi trạng thái isOpen thay đổi

    const sendMessage = async () => {
      if (!userMessage.trim()) return;  // Không gửi nếu tin nhắn trống
    
      const newMessage = { sender: "user", text: userMessage };
      setMessages((prev) => [...prev, newMessage]);
      setUserMessage(""); // Reset ô nhập
    
      try {
        // Gửi tin nhắn đến API của backend
        const response = await axios.post(backendAPI + "/api/chatbot/bot", {
          message: userMessage,  // Dữ liệu tin nhắn người dùng
        }, {
          headers: {
            'Content-Type': 'application/json',  // Đảm bảo sử dụng đúng Content-Type
          }
        });
        
    
        console.log("Phản hồi từ backend:", response.data);
        
        // Hiển thị phản hồi từ API (tin nhắn bot)
        const botMessage = { sender: "bot", text: response.data.reply };
        setMessages((prev) => [...prev, botMessage]);
    
      } catch (error) {
        console.error("Error sending message:", error);
        const errorMessage = { sender: "bot", text: "Xin lỗi, em không thể trả lời ngay lúc này." };
        setMessages((prev) => [...prev, errorMessage]);
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
        {/* Nút mở/đóng chatbot */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="chatbot-button"
      >
        <FaRobot size={27} />
      </button>
  
        {/* Hộp thoại chatbot */}
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
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  sendMessage();
                }
              }}
            />
            <button onClick={sendMessage}>Gửi</button>
          </div>
        </div>
      )}
      </div>
    );
  };

  export default ChatbotButton;