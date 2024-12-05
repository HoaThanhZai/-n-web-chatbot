const { Op } = require('sequelize');
const Product = require('../models/Product');
const Product_Variant = require('../models/product_variant');
const Colour = require('../models/Colour');
const Size = require('../models/Size');
const Product_Image = require('../models/Product_Image');
const Product_Price_History = require('../models/Product_Price_History');

// Xác định intent từ câu hỏi
const intents = {
    searchAll: ['tất cả sản phẩm','all','tất cả'],
    searchProductByCategory: ['áo', 'quần'],
    newProducts: ['mới', 'sản phẩm mới', 'mới nhất'],
};

// Hàm xác định intent từ câu hỏi người dùng
const getIntent = (message) => {
    // Kiểm tra nếu message là một chuỗi hợp lệ
    if (typeof message !== 'string') {
        return 'unknown';
    }

    // Tìm intent dựa trên các từ khóa
    for (let intent in intents) {
        for (let keyword of intents[intent]) {
            // Chuyển cả message và keyword về chữ thường để so sánh
            if (message.toLowerCase().includes(keyword.toLowerCase())) {
                return intent;
            }
        }
    }

    // Nếu không tìm thấy intent nào, trả về 'unknown'
    return 'unknown';
};

const chatbotQuery = async (req, res) => {
    const userMessage = req.body.message;
    console.log(userMessage); // Lấy câu hỏi từ frontend
    
    // Kiểm tra nếu message không tồn tại hoặc không phải chuỗi
    if (!userMessage || typeof userMessage !== 'string') {
        console.log(userMessage);
        return res.status(400).json({ response: 'Câu hỏi không hợp lệ, vui lòng thử lại.' });
    }

    const intent = getIntent(userMessage); // Xác định intent từ câu hỏi

    // Định nghĩa whereClause để sử dụng trong truy vấn
    const whereClause = {
        state: true,  // Ví dụ về điều kiện
        quantity: { [Op.gt]: 0 },  // Kiểm tra số lượng lớn hơn 0
    };

    // Xử lý theo intent đã xác định
    if (intent === 'searchAll') {
        let category_id = Number(req.query.category);
        let whereClause;
        if (category_id != undefined && Number.isInteger(category_id))
            whereClause = { category_id }

        try {


            // Lấy danh sách tất cả sản phẩm ưu tiên sản phẩm mới nhất
            let listProduct = await Product.findAll({
                attributes: ['product_id'],
                order: [['created_at', 'DESC']],
                raw: true
            });

            let listProductVariant = [];

            // Duyệt qua danh sách sản phẩm
            for (let { product_id } of listProduct) {
                // Lấy danh sách tất cả các màu của sản phẩm đó
                let listColor = await Product_Variant.findAll({
                    attributes: ['colour_id'],
                    where: { product_id },
                    group: ['colour_id'],
                    raw: true
                });
                // Duyệt qua danh sách màu
                for (let { colour_id } of listColor) {
                    // Tìm tất cả biến thể sản phẩm có cùng màu với nhau
                    let listProductVariantSameColour = await Product_Variant.findAll({
                        attributes: ['product_variant_id', 'colour_id'],
                        include: [
                            {
                                model: Product, attributes: ['product_id', 'product_name', 'rating', 'sold', 'feedback_quantity'],
                                include: {
                                    model: Product_Price_History,
                                    attributes: ['price'],
                                    separate: true, order: [['created_at', 'DESC']]
                                },
                                where: whereClause
                            },
                            { model: Colour, attributes: ['colour_name'] },
                            { model: Size, attributes: ['size_name'] },
                            { model: Product_Image, attributes: ['path'] },
                        ],
                        where: {
                            [Op.and]: [
                                { colour_id },
                                { state: true },
                                { quantity: { [Op.gt]: 0 } }
                            ]
                        },
                    });
                    // Convert dữ liệu
                    if (listProductVariantSameColour.length) {
                        let productVariant = {
                            product_id: listProductVariantSameColour[0].Product.product_id,
                            product_name: listProductVariantSameColour[0].Product.product_name,
                            rating: listProductVariantSameColour[0].Product.rating,
                            sold: listProductVariantSameColour[0].Product.sold,
                            feedback_quantity: listProductVariantSameColour[0].Product.feedback_quantity,
                            product_variant_id: listProductVariantSameColour[0].product_variant_id,
                            colour_id: listProductVariantSameColour[0].colour_id,
                            colour_name: listProductVariantSameColour[0].Colour.colour_name,
                            price: listProductVariantSameColour[0].Product.Product_Price_Histories[0].price,
                            product_image: listProductVariantSameColour[0].Product_Images[0].path,
                            sizes: []
                        };
                        // Duyệt qua danh sách biến thể sản phẩm có cùng màu để cộng dồn danh sách sizes
                        for (let { Size } of listProductVariantSameColour)
                            productVariant.sizes.push(Size.size_name);
                        listProductVariant.push(productVariant);
                    }
                }
            }
            return res.send(listProductVariant);
        } catch (err) {
            console.log(err);
            return res.status(500).send('Gặp lỗi khi tải dữ liệu vui lòng thử lại');
        }
    }
    else return res.json({ response: "Xin lỗi, tôi không hiểu câu hỏi của bạn." });
};

module.exports = { chatbotQuery };
