import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Empty } from 'antd';

import ProductItem from '@/components/CollectionPage/ProductItem';
import { backendAPI } from '@/config';

const CollectionPage = () => {
    const router = useRouter();
    const { category, search } = router.query;
    const [productList, setProductList] = useState([]);
    const [filteredProductList, setFilteredProductList] = useState([]);

    useEffect(() => {
        const getProductList = async () => {
            try {
                let url = `${backendAPI}/api/product/customer/list`;
                if (category) {
                    url += `?category=${category}`;
                }
                const result = await axios.get(url);
                setProductList(result.data);
            } catch (err) {
                console.log(err);
            }
        };
        getProductList();
    }, [category]);

    useEffect(() => {
        if (search) {
            const filteredProducts = productList.filter(product =>
                product.product_name.toLowerCase().includes(search.toLowerCase())
            );
            setFilteredProductList(filteredProducts);
        } else {
            setFilteredProductList(productList);
        }
    }, [search, productList]);

    return (
        <div className="product-page">
            <div className="product-box d-flex flex-row flex-wrap justify-content-start">
                {
                    filteredProductList.length ?
                        filteredProductList.map((product, index) => (
                            <ProductItem
                                key={index}
                                product_id={product.product_id}
                                name={product.product_name}
                                img={product.product_image}
                                price={product.price}
                                quantity={product.quantity}
                                colour_id={product.colour_id}
                                sizes={product.sizes}
                                rating={product.rating}
                                feedback_quantity={product.feedback_quantity}
                            />
                        ))
                        :
                        <div className='d-flex' style={{ width: "100%", height: "400px" }}>
                            <Empty style={{ margin: "auto" }} />
                        </div>
                }
            </div>
        </div>
    );
};

export default CollectionPage;
