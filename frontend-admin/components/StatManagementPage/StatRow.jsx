import React from 'react';

const StatRow = ({ product_id, product_name, sold, input_price, price }) => {
    const addPointToPrice = (value) => {
        if (typeof value === 'number') {
            return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        }
        return 'N/A';
    };

    return (
        <tr className="w-100">
            <td className="fw-bold col-order-id">
                <p className="d-flex align-items-center justify-content-center">
                    {product_id}
                </p>
            </td>
            <td className="text-danger fw-bold col-state">
                <p className="d-flex align-items-center justify-content-center">
                    {product_name}
                </p>
            </td>
            <td className="col-create-at">
                <p className="d-flex align-items-center justify-content-center">
                    {addPointToPrice(input_price)}
                </p>
            </td>
            <td className="text-danger fw-bold col-total-value">
                <p>{addPointToPrice(price)}</p>
            </td>
            <td className="text-danger fw-bold col-total-value">
                <p>{sold}</p>
            </td>
            <td className="text-danger fw-bold col-total-value">
                <p>{addPointToPrice((price - input_price) * sold)}</p>
            </td>
        </tr>
    );
};

export default StatRow;
