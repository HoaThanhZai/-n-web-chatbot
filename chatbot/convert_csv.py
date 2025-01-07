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

def filter_json_data(json_data, excluded_columns):
    # Loại bỏ các cột không mong muốn trong dữ liệu JSON
    filtered_data = []
    for item in json_data:
        filtered_item = {key: value for key, value in item.items() if key not in excluded_columns}
        filtered_data.append(filtered_item)
    return filtered_data

def update_csv_from_json(json_data, csv_filename):
    # Mở file CSV ở chế độ ghi ('w') để xóa dữ liệu cũ
    with open(csv_filename, mode='w', newline='', encoding='utf-8') as csv_file:
        if json_data:
            writer = csv.DictWriter(csv_file, fieldnames=json_data[0].keys())
            
            # Ghi tiêu đề
            writer.writeheader()

            # Ghi dữ liệu mới vào file CSV
            writer.writerows(json_data)

# API URL để lấy dữ liệu JSON
api_url = "http://localhost:8080/api/product/customer/list"

# Lấy dữ liệu từ API
json_data = fetch_json_data(api_url)

# Các cột cần loại bỏ
excluded_columns = ["sold", "feedback_quantity", "colour_id", "product_image"]

# Lọc dữ liệu để loại bỏ các cột không mong muốn
filtered_data = filter_json_data(json_data, excluded_columns)

# Nếu có dữ liệu, cập nhật vào file CSV
if filtered_data:
    update_csv_from_json(filtered_data, 'data.csv')
