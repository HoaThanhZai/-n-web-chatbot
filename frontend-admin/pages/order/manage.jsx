import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Router from 'next/router'
import { Empty } from 'antd'
import axios from 'axios'
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

import Header from '@/components/Header';
import Heading from '@/components/Heading';
import OrderRow from '@/components/OrderManagementPage/OrderRow';


const OrderManagementPage = () => {
    let [orderList, setOrderList] = useState([]);
    let [sortConfig, setSortConfig] = useState({ key: '', direction: 'ascending' });
    const dispatch = useDispatch();

    useEffect(() => {
        const getOrderList = async () => {
            try {
                const result = await axios.get('http://localhost:8080/api/order/admin/list')
                setOrderList(result.data)
            } catch (err) {
                console.log(err);
            }
        }
        getOrderList();
    }, [])

    const refreshOrderTable = async () => {
        try {
            const result = await axios.get('http://localhost:8080/api/order/admin/list')
            setOrderList(result.data)
        } catch (err) {
            console.log(err);
        }
    }

    const sortedOrderList = React.useMemo(() => {
        let sortableItems = [...orderList];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [orderList, sortConfig]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) {
            return null;
        }
        if (sortConfig.direction === 'ascending') {
            return <ArrowUpOutlined />;
        } else {
            return <ArrowDownOutlined />;
        }
    };

    return (
        <div className="">
            <Header title="Quản Lý Đơn Hàng" />
            <div className="wrapper manager-box">
                <Heading title="Tất cả đơn hàng" />
                <div className="wrapper-product-admin table-responsive">
                    <table className='table order-manage-table w-100'>
                        <thead className="w-100 align-middle text-center">
                            <tr className="fs-6 w-100">
                                <th title='Mã đơn hàng' className="col-order-id" onClick={() => requestSort('order_id')}>
                                    Mã đơn hàng {getSortIcon('order_id')}
                                </th>
                                <th title='Trạng thái' className="col-state" onClick={() => requestSort('state_name')}>
                                    Trạng thái {getSortIcon('state_name')}
                                </th>
                                <th title="Ngày tạo" className="col-create-at" onClick={() => requestSort('created_at')}>
                                    Ngày tạo {getSortIcon('created_at')}
                                </th>
                                <th title='Tổng giá trị' className="col-total-value" onClick={() => requestSort('total_order_value')}>
                                    Tổng giá trị {getSortIcon('total_order_value')}
                                </th>
                                <th title="Thao tác" className="col-action manipulation">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                    </table>
                    {
                        sortedOrderList.length ?
                            sortedOrderList.map((order, index) => {
                                return (
                                    <OrderRow
                                        key={index}
                                        order_id={order.order_id}
                                        state_id={order.state_id}
                                        state_name={order.state_name}
                                        created_at={order.created_at}
                                        total_order_value={order.total_order_value}
                                        refreshOrderTable={refreshOrderTable}
                                    />
                                );
                            })
                            :
                            <table className="table w-100 table-hover align-middle table-bordered" style={{ height: "400px" }}>
                                <tbody>
                                    <tr><td colSpan={6}><Empty /></td></tr>
                                </tbody>
                            </table>
                    }
                </div>
            </div>
        </div>
    )
}

export default OrderManagementPage
