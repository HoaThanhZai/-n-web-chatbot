import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { Empty, DatePicker, Pagination } from 'antd';
import dayjs from 'dayjs';

import Header from '@/components/Header';
import Heading from '@/components/Heading';
import StatRow from '@/components/StatManagementPage/StatRow';

const StatManagementPage = () => {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.products);

  const [listStat, setListStat] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [filterMonth, setFilterMonth] = useState(null);

  const fetchStatData = async () => {
    try {
      const result = await axios.get('http://localhost:8080/api/product/admin/stat/list');
      setListStat(result.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStatData();
  }, []);

  const filteredList = React.useMemo(() => {
    let filteredData = listStat.slice();

    if (filterMonth) {
      filteredData = filteredData.filter((item) => dayjs(item.soldDate).month() === filterMonth - 1);
    }

    return filteredData;
  }, [listStat, filterMonth]);

  const paginatedList = filteredList.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleFilterChange = (date, dateString) => {
    if (date) {
      setFilterMonth(dayjs(date).month() + 1);
    } else {
      setFilterMonth(null);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const totalPages = Math.ceil(filteredList.length / pageSize);

  const pickerStyle = {
    width: '25%',
    marginBottom: 16
  };

  return (
    <div className="stat-page">
      <Header title="Thống kê" />
      <div className="wrapper manager-box">
        <Heading title="Theo doanh thu" />
        <div className="wrapper-product-admin table-responsive">
          <DatePicker.MonthPicker
            style={pickerStyle}
            onChange={handleFilterChange}
            placeholder="Chọn tháng thống kê"
          />
          <table className="table order-manage-table w-100">
            <thead>
              <tr className="fs-5 w-100">
                <th title="Tên mặt hàng" className="col-state">Tên mặt hàng</th>
                <th title="Giá bán" className="col-total-value">Giá bán</th>
                <th title="Đã bán" className="col-total-value">Đã bán</th>
                <th title="Doanh thu" className="col-total-value">Doanh thu</th>
                <th title="Ngày bán" className="col-sold-date">Ngày bán</th>
              </tr>
            </thead>
            <tbody>
              {paginatedList.length > 0 ? (
                paginatedList.map((productStat, index) => (
                  <StatRow
                    key={index}
                    productName={productStat.productName}
                    sellingPrice={productStat.sellingPrice}
                    quantitySold={productStat.quantitySold}
                    revenue={productStat.revenue}
                    soldDate={productStat.soldDate}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center">
                    <div className="my-3">
                      <Empty description="Không có dữ liệu" />
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {filteredList.length > pageSize && ( // Chỉ hiển thị phân trang nếu có nhiều hơn 1 trang
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={filteredList.length}
              onChange={handlePageChange}
              style={{ marginTop: 16,marginBottom:16, display: 'flex', justifyContent: 'center' }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default StatManagementPage;