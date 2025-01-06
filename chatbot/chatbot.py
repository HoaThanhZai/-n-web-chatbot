import google.generativeai as genai
import os
import time
from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import pandas as pd

# Cấu hình API key cho Generative AI
os.environ["API_KEY"] = ""
genai.configure(api_key=os.environ["API_KEY"])

model = genai.GenerativeModel('gemini-1.5-pro-latest')


class ChatbotHandler(BaseHTTPRequestHandler):
    """
    HTTP Server xử lý request từ Node.js backend.
    """

    def _send_response(self, status_code, response):
        """
        Gửi response với status code và nội dung JSON.
        """
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.end_headers()

        # Đảm bảo rằng response luôn ở dạng JSON string
        try:
            response_json = json.dumps(response)
            self.wfile.write(response_json.encode("utf-8"))
        except Exception as e:
            print(f"Error formatting response to JSON: {e}")
            self.wfile.write(json.dumps({"error": "Response formatting error"}).encode("utf-8"))

    def do_POST(self):
        """
        Xử lý POST request từ Node.js.
        """

        if self.path == "/chatbot":
            try:
                # Đọc dữ liệu từ request
                content_length = int(self.headers["Content-Length"])
                post_data = self.rfile.read(content_length)
                data = json.loads(post_data)

                # Lấy prompt từ request
                prompt = data.get("prompt", "")

                if not prompt:
                    self._send_response(400, {"error": "Prompt is required"})
                    return

                # Xử lý logic chatbot
                response_text = self.chat_with_bot(prompt)
                self._send_response(200, {"reply": response_text})

            except json.JSONDecodeError:
                self._send_response(400, {"error": "Invalid JSON in request"})
            except Exception as e:
                print(f"Error processing request: {e}")
                self._send_response(500, {"error": "Internal server error"})

    # Chuyển đổi dữ liệu CSV thành chuỗi ngữ cảnh
    def csv_to_context(file_path):
        try:
            data = pd.read_csv(file_path)
            context = "Here is the data:\n"
            context += data.to_string(index=False)  # Lấy dữ liệu để mô hình xử lý
            return context, data
        except Exception as e:
            return f"Error loading CSV file: {e}"

    # Tìm kiếm dữ liệu liên quan
    def filter_csv_data(data, query):
        try:
            filtered_data = data[data.apply(lambda row: query.lower() in str(row).lower(), axis=1)]
            return filtered_data.to_string(index=False) if not filtered_data.empty else None
        except Exception as e:
            return f"Error filtering data: {e}"

    # Tạo ngữ cảnh từ file CSV
    csv_context, csv_data = csv_to_context("data.csv")

    def chat_with_bot(self, prompt):
        """
        Logic chatbot.
        """
        try:
            # Trả về phản hồi tĩnh cho các câu hỏi cơ bản
            if prompt.lower() in ["hi", "hello", "hey"]:
                return f"Hello!"
            elif prompt.lower() in ["how are you?","hôm nay bạn thế nào","bạn khỏe không?"]:
                return f"I'm doing well, thank you!"
            elif prompt.lower() in ["what is your name?","tên bạn là gì", "bạn là ai?","bạn tên là gì"]:
                return "I'm a Eleven AI model."
            elif prompt.lower() in ["Tôi muốn đổi trả hàng, phải làm thế nào?"]:
                return "Chúng tôi rất sẵn lòng hỗ trợ bạn đổi trả hàng. Bạn vui lòng liên hệ với bộ phận chăm sóc khách hàng để được hướng dẫn cụ thể. Số điện thoại bộ phận chăm sóc khách hàng: 0393275620"
            elif prompt.lower() in ["Tôi muốn biết cách thức thanh toán?","payment"]:
                return  "Chúng tôi hỗ trợ nhiều hình thức thanh toán như: thanh toán khi nhận hàng, thanh toán qua ví điện tử"
            elif prompt.lower() in ["Thời gian giao hàng là bao lâu?","delivery"]:
                return f"Thời gian giao hàng thường từ 2-5 ngày làm việc, tùy thuộc vào địa chỉ nhận hàng. Bạn có thể kiểm tra chi tiết thời gian giao hàng dự kiến khi đặt hàng."

            # Tích hợp ngữ cảnh từ CSV vào prompt
            if self.csv_data is not None and "product" in prompt.lower():
                relevant_data = self.filter_csv_data(self.csv_data, prompt)
                if relevant_data is None:
                    return "Không có sản phẩm cần tìm."
                full_prompt = f"{self.csv_context}\n\nRelevant Data:\n{relevant_data}\n\nUser Question: {prompt}\nBot Answer:"
            else:
                full_prompt = f"{self.csv_context}\n\nUser Question: {prompt}\nBot Answer:"

            # Giả lập typing (nếu cần)
            time.sleep(1)

            # Gọi API Generative AI
            response = model.generate_content(full_prompt)
            return response.text


        except Exception as e:
            print(f"Error in chat logic: {e}")
            return "Sorry, I encountered an error while processing your request."

if __name__ == "__main__":
    host = "0.0.0.0"
    port = 5000

    # Khởi tạo server
    server = HTTPServer((host, port), ChatbotHandler)
    print(f"Chatbot server running on http://{host}:{port}")
    server.serve_forever()