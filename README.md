# Project Name

XÂY DỰNG WEBSITE MUA BÁN QUẦN ÁO TÍCH HỢP GENERATIVE - BASE CHATBOT TRONG CHĂM SÓC KHÁCH HÀNG.

## Cài đặt và Chạy Dự Án

### 1. Clone Repository
Để bắt đầu, bạn cần clone repository này về máy tính của mình bằng cách sử dụng lệnh sau:

        git clone

### 2. Cài đặt các thư viện
Cài đặt cho Backend
Di chuyển vào thư mục backend và cài đặt các dependencies bằng npm:

        cd ../backend
        npm install

Cài đặt cho Frontend
Tiếp theo, di chuyển vào các thư mục frontend và cài đặt các dependencies bằng npm:

          cd ../frontend-admin
          npm install

          cd ../frontend-customer
          npm install

### 3. Chạy Dự Án
Quay lại thư mục backend và chạy server với lệnh sau:

          cd ../backend/src
          ../backend/src/node server.js

Sau khi chạy xong server sẽ được mở ở cổng http://localhost:8080
Tiếp tục mở một terminal mới để chạy frontend của trang quản lý:

          cd ../frontend-admin
          npm run dev

Tương tự với frontend của trang khách hàng:

          cd ../frontend-customer
          npm run dev

Sau khi chạy xong, bạn có thể truy cập vào ứng dụng frontend qua trình duyệt tại địa chỉ: http://localhost:3000
