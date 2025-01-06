import requests
import csv
import os

def fetch_json_data(api_url):
    # Gửi yêu cầu GET đến API và nhận dữ liệu JSON
    response = requests.get(api_url)
    
    # Kiểm tra nếu yêu cầu thành công
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error: Unable to fetch data, status code {response.status_code}")
        return []

def update_csv_from_json(json_data, csv_filename):
    # Kiểm tra xem file CSV đã tồn tại hay chưa
    file_exists = os.path.isfile(csv_filename)
    
    # Mở hoặc tạo file CSV
    with open(csv_filename, mode='a', newline='', encoding='utf-8') as csv_file:
        if json_data:
            writer = csv.DictWriter(csv_file, fieldnames=json_data[0].keys())
            
            # Nếu file chưa tồn tại, ghi tiêu đề
            if not file_exists:
                writer.writeheader()

            # Ghi dữ liệu mới vào file CSV
            writer.writerows(json_data)

# API URL để lấy dữ liệu JSON
api_url = "http://localhost:8080/api/product/customer/list"

# Lấy dữ liệu từ API
json_data = fetch_json_data(api_url)

# Nếu có dữ liệu, cập nhật vào file CSV
if json_data:
    update_csv_from_json(json_data, 'data.csv')