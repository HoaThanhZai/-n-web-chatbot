import React from 'react';
import { parseISO, format, isValid } from 'date-fns';

const StatRow = ({ productName, sellingPrice, quantitySold, revenue, soldDate }) => {
    const addPointToPrice = (value) => {
        if (typeof value === 'number') {
            return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        }
        return 'N/A';
    };

    const formatDate = (date) => {
        if (!date) {
            return 'N/A'; // Xử lý trường hợp date là null hoặc undefined
        }

        try {
            const parsedDate = parseISO(date); // Phân tích cú pháp chuỗi ISO 8601

            if (!isValid(parsedDate)) {
                console.error("Ngày không hợp lệ:", date);
                return 'N/A'; // Xử lý trường hợp ngày không hợp lệ
            }

            return format(parsedDate, 'dd/MM/yyyy'); // Định dạng ngày tháng
        } catch (error) {
            console.error("Lỗi khi định dạng ngày:", error);
            return 'N/A'; // Xử lý lỗi trong quá trình phân tích cú pháp
        }
    };

    return (
        <tr className="w-100">
            <td className="fw-bold col-state">
                <p className="d-flex align-items-center justify-content-center">{productName}</p>
            </td>
            <td className="fw-bold col-total-value">
                <p>{addPointToPrice(sellingPrice)}</p>
            </td>
            <td className="fw-bold col-total-value">
                <p>{quantitySold}</p>
            </td>
            <td className="text-danger fw-bold col-total-value">
                <p>{addPointToPrice(revenue)}</p>
            </td>
            <td className="col-sold-date">
                <p>{formatDate(soldDate)}</p>
            </td>
        </tr>
    );
};

export default StatRow;
