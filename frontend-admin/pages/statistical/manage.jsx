import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { Empty } from 'antd';

import Header from '@/components/Header';
import Heading from '@/components/Heading';
import StatRow from '@/components/StatManagementPage/StatRow';

const StatManagementPage = () => {
    const [listStat, setListStat] = useState([]);
    const dispatch = useDispatch();

    useEffect(() => {
        const getListStat = async () => {
            try {
                const result = await axios.get('http://localhost:8080/api/product/admin/stat/list');
                const sortedList = result.data.sort((a, b) => (b.price -b.input_price)*b.sold - (a.price -a.input_price)*a.sold);
                setListStat(sortedList);
            } catch (err) {
                console.log(err);
            }
        };

        getListStat();
    }, []);

    return (
        <div className="">
            <Header title="Thống kê" />
            <div className="wrapper manager-box">
                <Heading title="Theo doanh thu" />
                <div className="wrapper-product-admin table-responsive">
                    <table className='table order-manage-table w-100'>
                        <thead className="w-100 align-middle text-center">
                            <tr className="fs-6 w-100">
                                <th title='Mã mặt hàng' className="col-order-id" >
                                    Mã mặt hàng
                                </th>
                                <th title='Tên mặt hàng' className="col-state" >
                                    Tên mặt hàng
                                </th>
                                <th title="Giá nhập" className="col-create-at" >
                                    Giá nhập
                                </th>
                                <th title='Giá bán' className="col-total-value" >
                                    Giá bán
                                </th>
                                <th title='Đã bán' className="col-total-value" >
                                    Đã bán
                                </th>
                                <th title='Doanh thu' className="col-total-value" >
                                    Doanh thu
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {listStat.length > 0 ? (
                                listStat.map((productStat, index) => (
                                    <StatRow
                                        key={index}
                                        product_id={productStat.product_id}
                                        product_name={productStat.product_name}
                                        input_price={productStat.input_price}
                                        price={productStat.price}
                                        sold={productStat.sold}
                                    />
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6}><Empty /></td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StatManagementPage;
