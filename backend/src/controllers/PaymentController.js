const axios = require('axios').default;
const CryptoJS = require('crypto-js');
const moment = require('moment');
const orderid = require('order-id')('key');
const Order = require('../models/order');
const User = require('../models/user');
const Order_State = require('../models/order_state');
const Product_Variant = require('../models/product_variant');
const Product = require('../models/Product');
const Product_Price_History = require('../models/Product_Price_History');
const Order_Item = require('../models/order_item');
const Feedback = require('../models/feedback');
const Order_Status_Change_History = require('../models/order_status_change_history');

const config = {
    app_id: "2554",
    key1: "sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn",
    key2: "trMrHtvjo6myautxDUiAcYsVtaeQ8nhf",
    endpoint: "https://sb-openapi.zalopay.vn/v2/create"
};

let createPayment = async (req, res, next) => {
    try {
        const { user_id, customer_name, email, phone_number, address, order_items, totalPrice } = req.body;

        const embed_data = {
            redirecturl: "http://localhost:3000/account/orders",
            user_id,
            customer_name,
            email,
            phone_number,
            address,
        };

        const items = order_items;
        const transID = Math.floor(Math.random() * 1000000);
        const order = {
            app_id: config.app_id,
            app_trans_id: `${moment().format('YYMMDD')}_${transID}`,
            app_user: customer_name,
            app_time: Date.now(),
            item: JSON.stringify(items),
            embed_data: JSON.stringify(embed_data),
            amount: totalPrice,
            description: `ElevenT - Payment for the order #${transID}`,
            bank_code: "",
            callback_url: "https://5d4d-27-72-28-125.ngrok-free.app/api/payment/callback"
        };

        const data = config.app_id + "|" + order.app_trans_id + "|" + order.app_user + "|" + order.amount + "|" + order.app_time + "|" + order.embed_data + "|" + order.item;
        order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

        const result = await axios.post(config.endpoint, null, { params: order });
        res.status(200).json(result.data.order_url)

    } catch (err) {
        console.log(err)
        return res.status(500).send('Gặp lỗi khi tải dữ liệu vui lòng thử lại');
    }
}

let callbackPayment = async (req, res, next) => {
    let result = {};

    try {
        let dataStr = req.body.data;
        let reqMac = req.body.mac;
        let mac = CryptoJS.HmacSHA256(dataStr, config.key2).toString();
        if (reqMac !== mac) {
            result.return_code = -1;
            result.return_message = "mac not equal";
        }
        else {
            let dataJson = JSON.parse(dataStr, config.key2);
            const embed_data = JSON.parse(dataJson.embed_data);
            console.log('data: ', dataJson)

            let user_id = embed_data.user_id;
            if (user_id === undefined) return res.status(400).send('Trường user_id không tồn tại');
            try {
                let user = await User.findOne({ where: { user_id, role_id: 2 } });
                if (user == null) return res.status(400).send('User này không tồn tại');
            } catch (err) {
                console.log(err);
                return res.status(500).send('Gặp lỗi khi tạo đơn hàng vui lòng thử lại');
            }
            let customer_name = embed_data.customer_name;
            if (customer_name === undefined) return res.status(400).send('Trường customer_name không tồn tại');
            let email = embed_data.email;
            if (email === undefined) return res.status(400).send('Trường email không tồn tại');
            let phone_number = embed_data.phone_number;
            if (phone_number === undefined) return res.status(400).send('Trường phone_number không tồn tại');
            let address = embed_data.address;
            if (address === undefined) return res.status(400).send('Trường address không tồn tại');
            let order_items = JSON.parse(dataJson.item);
            if (order_items === undefined) return res.status(400).send('Trường order_items không tồn tại');

            let order_id = orderid.generate().replace(/-/g, "");
            var newOrder = await Order.create({
                user_id,
                order_id,
                customer_name,
                email,
                phone_number,
                address,
                total_product_value: 0,
                delivery_charges: 0,
                total_order_value: 0,
            });

            let total_product_value = 0;
            for (let i = 0; i < order_items.length; i++) {
                let order_item = order_items[i];
                let product_variant = await Product_Variant.findOne({
                    attributes: ['product_variant_id', 'quantity', 'state'],
                    include: [
                        {
                            model: Product, attributes: ['product_id'],
                            include: { model: Product_Price_History, attributes: ['price'], separate: true, order: [['created_at', 'DESC']] }
                        },
                    ],
                    where: { product_variant_id: order_item.product_variant_id }
                });
                if (product_variant == null)
                    return res.status(400).send("Sản phẩm này không tồn tại");
                if (product_variant.state != true)
                    return res.status(400).send("Sản phẩm này chưa được mở bán");
                if (order_item.quantity > product_variant.quantity)
                    return res.status(400).send("Số lượng sản phẩm không hợp lệ");
                let productVariantPrice = product_variant.Product.Product_Price_Histories[0].price;
                let total_value = productVariantPrice * order_item.quantity;
                let newOrderItem = {
                    order_id: newOrder.order_id,
                    product_variant_id: product_variant.product_variant_id,
                    order_item_index: i,
                    price: productVariantPrice,
                    quantity: order_item.quantity,
                    total_value
                }
                await Order_Item.create(newOrderItem);
                newProductVariantQuantity = product_variant.quantity - order_item.quantity;
                product_variant.update({ quantity: newProductVariantQuantity });
                total_product_value += total_value;
            }

            let delivery_charges = 20000
            let total_order_value = total_product_value + delivery_charges;
            await newOrder.update({ total_product_value, delivery_charges, total_order_value });
            let state = await Order_State.findOne({ where: { state_id: 1, state_name: "Chờ Xác Nhận" } });
            await newOrder.addOrder_State(state);
        }
    } catch (ex) {
        console.log('error: ', ex)
    }
}
module.exports = {
    createPayment,
    callbackPayment
};
