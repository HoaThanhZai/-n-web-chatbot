const { Op } = require("sequelize");

const Product_Variant = require('../models/product_variant');
const Product = require('../models/Product');
const Colour = require('../models/Colour');
const Size = require('../models/Size');
const Product_Price_History = require('../models/product_price_history');
const Product_Image = require('../models/Product_Image');
const Category = require("../models/category");
const Order = require("../models/order");
const Order_Status_Change_History = require("../models/order_status_change_history");
const Order_Item = require("../models/order_item");

let create = async (req, res, next) => {
    let product_name = req.body.product_name;
    if (product_name === undefined) return res.status(400).send('Trường product_name không tồn tại');
    let category_id = req.body.category_id;
    if (category_id === undefined) return res.status(400).send('Trường category_id không tồn tại');
    let price = parseInt(req.body.price);
    if (price === undefined) return res.status(400).send('Trường price không tồn tại');
    let description = req.body.description;
    if (description === undefined) return res.status(400).send('Trường description không tồn tại');

    try {
        let newProduct = await Product.create({ product_name, description, category_id });
        let newProductPriceHistory = await Product_Price_History.create({
            product_id: newProduct.product_id,
            price: price
        });
        return res.send(newProduct);
    } catch (e) {
        console.log(e);
        return res.status(500).send(e);
    }
}

let update = async (req, res, next) => {
    let product_id = req.body.product_id;
    if (product_id === undefined) return res.status(400).send('Trường product_id không tồn tại');
    let product_name = req.body.product_name;
    if (product_name === undefined) return res.status(400).send('Trường product_name không tồn tại');
    let category_id = req.body.category_id;
    if (category_id === undefined) return res.status(400).send('Trường category_id không tồn tại');
    let price = parseInt(req.body.price);
    if (price === undefined) return res.status(400).send('Trường price không tồn tại');
    let description = req.body.description;
    if (description === undefined) return res.status(400).send('Trường description không tồn tại');
    try {
        let category = await Category.findOne({ where: { category_id } });
        if (category == null) return res.status(400).send('Danh mục này không tồn tại');
        let product = await Product.findOne({ where: { product_id } });
        if (product == null) return res.status(400).send('Sản phẩm này không tồn tại');

        await Product_Price_History.create({ product_id, price })
        await product.update({ product_name, category_id, description })

        return res.send("Success")
    } catch (err) {
        console.log(err);
        return res.status(500).send('Gặp lỗi khi tạo đơn hàng vui lòng thử lại');
    }
}

let listAdminSide = async (req, res, next) => {
    let listProductVariant = await Product_Variant.findAll({
        attributes: ['product_variant_id', 'quantity', 'state', 'created_at'],
        include: [
            {
                model: Product, attributes: ['product_id', 'product_name'],
                include: { model: Product_Price_History, attributes: ['price','input_price'],
                separate: true, 
                order: [['created_at', 'DESC']] }
            },
            { model: Colour, attributes: ['colour_name'] },
            { model: Size, attributes: ['size_name'] },
            { model: Product_Image, attributes: ['path'] },
        ],
        order: [['created_at', 'DESC']]
    });
    listProductVariant = listProductVariant.map((productVariant) => {
        let newProductVariant = {
            product_id: productVariant.Product.product_id,
            product_variant_id: productVariant.product_variant_id,
            product_name: productVariant.Product.product_name,
            colour_name: productVariant.Colour.colour_name,
            size_name: productVariant.Size.size_name,
            product_image: productVariant.Product_Images[0].path,
            input_price:productVariant.Product.Product_Price_Histories[0].input_price,
            price: productVariant.Product.Product_Price_Histories[0].price,
            quantity: productVariant.quantity,
            state: productVariant.state,
            created_at: productVariant.created_at
        }
        
        return newProductVariant;
    });
    console.log(listProductVariant);
    return res.send(listProductVariant);
}

const StatSide = async (req, res, next) => {
    try {
        const ordersWithState4 = await Order_Status_Change_History.findAll({
            where: { state_id: 4 },
            attributes: ['order_id', 'created_at'],
            raw: true,
        });

        if (!ordersWithState4.length) return [];

        const orderIds = ordersWithState4.reduce((acc, order) => {
            acc[order.order_id] = order.created_at;
            return acc;
        }, {});

        const soldProducts = await Order_Item.findAll({
            where: { order_id: { [Op.in]: Object.keys(orderIds) } },
            attributes: ['order_id', 'product_variant_id', 'price', 'quantity', 'total_value'],
            include: [
                {
                    model: Product_Variant,
                    attributes: ['product_id'],
                    include: [
                        {
                            model: Product,
                            attributes: ['product_name'],
                        },
                    ],
                },
            ],
            raw: true,
        });

        const results = Object.values(
            soldProducts.reduce((acc, product) => {
                const productName = product['product_variant.Product.product_name'];
                const soldDate = orderIds[product.order_id];
                const key = `${productName}-${soldDate}`;

                if (!acc[key]) {
                    acc[key] = {
                        productName,
                        sellingPrice: product.price,
                        quantitySold: 0,
                        revenue: 0,
                        soldDate,
                    };
                }

                acc[key].quantitySold += product.quantity;
                acc[key].revenue += product.total_value;

                return acc;
            }, {})
        );
        console.log(results);
        return res.send(results);
    } catch (error) {
        console.error('Error in StatSide:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};


const listCustomerSide = async (req, res, next) => {
    const category_id = Number(req.query.category);
    const whereClause = category_id && Number.isInteger(category_id) ? { category_id } : {};

    try {
        const listProductVariant = await Product_Variant.findAll({
            attributes: ['product_variant_id', 'colour_id'],
            include: [
                {
                    model: Product,
                    attributes: ['product_id', 'product_name', 'rating', 'sold', 'feedback_quantity'],
                    include: {
                        model: Product_Price_History,
                        attributes: ['price'],
                        separate: true,
                        order: [['created_at', 'DESC']],
                    },
                    where: whereClause,
                },
                { model: Colour, attributes: ['colour_name'] },
                { model: Size, attributes: ['size_name'] },
                { model: Product_Image, attributes: ['path'] },
            ],
            where: {
                [Op.and]: [
                    { state: true },
                    { quantity: { [Op.gt]: 0 } },
                ],
            },
            order: [['created_at', 'DESC']],
            raw: false,
        });
        const productMap = new Map();

        listProductVariant.forEach((variant) => {
            const {
                Product: { product_id, product_name, rating, sold, feedback_quantity, Product_Price_Histories },
                Colour: { colour_name },
                Product_Images,
                Size,
                product_variant_id,
                colour_id,
            } = variant;

            const price = Product_Price_Histories?.[0]?.price || null;
            const product_image = Product_Images?.[0]?.path || null;

            const key = `${product_id}-${colour_id}`;

            if (productMap.has(key)) {
                const existingProduct = productMap.get(key);
                existingProduct.sizes.add(Size.size_name);
            } else {
                const newProduct = {
                    product_id,
                    product_name,
                    rating,
                    sold,
                    feedback_quantity,
                    colour_id,
                    colour_name,
                    price,
                    product_image,
                    sizes: new Set([Size.size_name]),
                };
                productMap.set(key, newProduct);
            }
        });

        const finalProductVariants = Array.from(productMap.values()).map((product) => ({
            ...product,
            sizes: Array.from(product.sizes),
        }));

        return res.send(finalProductVariants);
    } catch (err) {
        console.error(err);
        return res.status(500).send('Gặp lỗi khi tải dữ liệu, vui lòng thử lại.');
    }
};


let detailCustomerSide = async (req, res, next) => {
    let product_id = req.params.product_id;
    if (product_id === undefined) return res.status(400).send('Trường product_id không tồn tại');

    try {
        let productDetail = await Product.findOne({
            attributes: ['product_id', 'product_name', 'description', 'rating', 'sold', 'feedback_quantity'],
            where: { product_id },
            raw: true
        });
        return res.send(productDetail);
    } catch (err) {
        console.log(err);
        return res.status(500).send('Gặp lỗi khi tải dữ liệu vui lòng thử lại');
    }
}

let detailAdminSide = async (req, res, next) => {
    let product_id = req.params.product_id;
    if (product_id === undefined) return res.status(400).send('Trường product_id không tồn tại');

    try {
        let productDetail = await Product.findOne({
            attributes: ['product_id', 'product_name', 'category_id', 'description'],
            include: [
                { model: Category, attributes: ['title'] },
                { model: Product_Price_History, attributes: ['price'], separate: true, order: [['created_at', 'DESC']] },
                {
                    model: Product_Variant, attributes: ['product_variant_id', 'colour_id', 'size_id', 'quantity'],
                    include: [
                        { model: Colour, attributes: ['colour_name'] },
                        { model: Size, attributes: ['size_name'] },
                        { model: Product_Image, attributes: ['path'] }
                    ]
                }
            ],
            where: { product_id },
        });

        if (productDetail) {
            let productVariantList = productDetail.product_variants.map((productVariant) => {
                let productImages = productVariant.Product_Images.map(({ path }) => { return { path } })
                return {
                    product_variant_id: productVariant.product_variant_id,
                    colour_id: productVariant.colour_id,
                    colour_name: productVariant.Colour.colour_name,
                    size_id: productVariant.size_id,
                    size_name: productVariant.Size.size_name,
                    quantity: productVariant.quantity,
                    product_images: productImages
                }
            })
            productDetail = {
                product_id: productDetail.product_id,
                product_name: productDetail.product_name,
                category_id: productDetail.category_id,
                category_name: productDetail.Category.title,
                price: productDetail.Product_Price_Histories[0].price,
                description: productDetail.description,
                product_variant_list: productVariantList
            }
            return res.send(productDetail);
        } else {
            return res.status(400).send('Biến thể sản phẩm này không tồn tại');
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send('Gặp lỗi khi tải dữ liệu vui lòng thử lại');
    }
}

let listColour = async (req, res, next) => {
    let product_id = req.params.product_id;
    if (product_id === undefined) return res.status(400).send('Trường product_id không tồn tại');

    try {
        let listColour = await Product_Variant.findAll({
            attributes: ['colour_id'],
            include: [
                { model: Colour, attributes: ['colour_name'] },
            ],
            where: { product_id },
            group: ['colour_id'],
        });

        listColour = listColour.map((colour) => {
            let newColour = {
                colour_id: colour.colour_id,
                colour_name: colour.Colour.colour_name
            }
            return newColour;
        });

        return res.send(listColour);
    } catch (err) {
        console.log(err);
        return res.status(500).send('Gặp lỗi khi tải dữ liệu vui lòng thử lại');
    }
}

let listSize = async (req, res, next) => {
    let product_id = req.params.product_id;
    if (product_id === undefined) return res.status(400).send('Trường product_id không tồn tại');
    let colour_id = req.params.colour_id;
    if (colour_id === undefined) return res.status(400).send('Trường colour_id không tồn tại');

    try {
        let listSize = await Product_Variant.findAll({
            attributes: ['size_id'],
            include: [
                { model: Size, attributes: ['size_name'] },
            ],
            where: { product_id, colour_id, state: true },
        });

        listSize = listSize.map((size) => {
            let newSize = {
                size_id: size.size_id,
                size_name: size.Size.size_name
            }
            return newSize;
        });

        return res.send(listSize);
    } catch (err) {
        console.log(err);
        return res.status(500).send('Gặp lỗi khi tải dữ liệu vui lòng thử lại');
    }
}

module.exports = {
    create,
    update,
    listAdminSide,
    listCustomerSide,
    detailCustomerSide,
    detailAdminSide,
    listColour,
    listSize,
    StatSide
};
