// routes/chatbotRoutes.js
const express = require('express');
const chatbotController = require('../controllers/ChatbotController');
let router = express.Router();

router.post('/chat', chatbotController.chatbotQuery);

module.exports = router;
