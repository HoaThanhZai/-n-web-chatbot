import google.generativeai as genai
import os
import time
from http.server import BaseHTTPRequestHandler, HTTPServer
import json

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
            elif prompt.lower() in ["what is your name?","tên bạn là gì", "bạn là ai?"]:
                return "I'm a Eleven AI model."

            # Giả lập typing (nếu cần)
            time.sleep(1)

            # Gọi API Generative AI
            response = model.generate_content(prompt)
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