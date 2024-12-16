const express = require('express');
let router = express.Router();
const ChatbotController = require('../controllers/ChatbotController');

// Định nghĩa route cho chatbot
router.post('/bot', ChatbotController.getChatbotResponse);

module.exports = router;
