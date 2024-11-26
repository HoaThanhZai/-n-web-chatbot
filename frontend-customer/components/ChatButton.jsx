  import React, { useState } from "react";
  import axios from "axios";
  import { FaRobot } from 'react-icons/fa';
  import { backendAPI } from "@/config";


  const ChatbotButton = () => {
    const [isOpen, setIsOpen] = useState(false);  // Kiểm tra trạng thái mở/đóng chatbot
    const [messages, setMessages] = useState([]); // Lưu lịch sử tin nhắn
    const [userMessage, setUserMessage] = useState(""); // Tin nhắn người dùng

    const sendMessage = async () => {
      if (!userMessage.trim()) return;  // Không gửi nếu tin nhắn trống
    
      const newMessage = { sender: "user", text: userMessage };
      setMessages((prev) => [...prev, newMessage]);
      setUserMessage(""); // Reset ô nhập
    
      try {
        // Gửi tin nhắn đến API của backend
        const response = await axios.post(backendAPI + "/api/chatbot/chat", {
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
      <div className="fixed bottom-4 right-4 z-50">
  {/* Nút mở/đóng chatbot */}
  <button
    onClick={() => setIsOpen(!isOpen)}
    className="bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-full p-4 shadow-lg flex items-center justify-center hover:scale-105 transform transition-all"
    style={{
      position: "fixed",
      bottom: "16px",
      right: "16px",
      zIndex: 1000,
    }}
  >
    <FaRobot size={24} />
  </button>

  {/* Hộp thoại chatbot */}
  {isOpen && (
    <div
      className="bg-white shadow-xl rounded-lg p-4 border"
      style={{
        position: "fixed",
        bottom: "80px",
        right: "16px",
        zIndex: 1000,
        maxHeight: "70vh",
        width: "360px",
        overflowY: "auto",
        backgroundColor: "#ffffff",
      }}
    >
      {/* Header */}
      <div
        className="flex justify-between items-center"
        style={{
          borderBottom: "1px solid #e5e7eb",
          paddingBottom: "8px",
          marginBottom: "12px",
        }}
      >
        <h3 className="text-lg font-bold text-gray-900">Chatbot Hỗ Trợ</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-800 text-lg"
        >
          ×
        </button>
      </div>

      {/* Nội dung tin nhắn */}
      <div
        className="flex flex-col gap-2"
        style={{
          padding: "8px",
          background: "#f9fafb", // Nền xám nhẹ
          borderRadius: "8px",
          maxHeight: "calc(100% - 90px)", // Tránh đè vào input
          overflowY: "auto",
        }}
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className={`p-2 rounded-lg ${
              message.sender === "user"
                ? "bg-blue-500 text-white self-end"
                : "bg-gray-300 text-gray-800 self-start"
            }`}
            style={{
              maxWidth: "75%",
              fontSize: "14px",
              lineHeight: "1.5",
              padding: "10px 14px",
            }}
          >
            {message.text}
          </div>
        ))}
      </div>

      {/* Input */}
      <div
        className="mt-4 flex items-center gap-2"
        style={{
          paddingTop: "12px",
          borderTop: "1px solid #e5e7eb",
        }}
      >
        <input
          type="text"
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          placeholder="Bạn cần gì..."
          className="w-full px-4 py-2 rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{
            background: "#f1f5f9",
            fontSize: "14px",
          }}
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-4 py-2 rounded-full hover:scale-105 transform transition-all"
          style={{
            fontSize: "14px",
          }}
        >
          Gửi
        </button>
      </div>
    </div>
  )}
</div>

    


    );
  };

  export default ChatbotButton;
