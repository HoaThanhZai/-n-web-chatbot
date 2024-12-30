const { Op } = require('sequelize');
const Product = require('../models/Product');
const Product_Variant = require('../models/product_variant');
const Colour = require('../models/Colour');
const Size = require('../models/Size');
const Product_Image = require('../models/Product_Image');
const Product_Price_History = require('../models/Product_Price_History');

const axios = require('axios');

const getChatbotResponse = async (req, res) => {

    const { message } = req.body;

    if (!message) {
        return res.status(400).send('Prompt is required');
    }

    try {
        // Gửi request tới server Python
        const response = await axios.post('http://0.0.0.0:5000/chatbot', { prompt: message });
        res.json(response.data); // Trả về dữ liệu từ server Python
    } catch (error) {
        console.error("Error calling chatbot server:", error.message);

        // Log chi tiết nếu có response từ server Python
        if (error.response) {
            console.error("Server responded with:", error.response.data);
            return res.status(error.response.status).json({ error: error.response.data.error || 'Server error' });
        }

        // Lỗi không có response (do kết nối thất bại hoặc timeout)
        res.status(500).json({ error: 'Failed to process request' });
    }
};

module.exports = { getChatbotResponse };