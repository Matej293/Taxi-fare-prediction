from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import urllib.request
import json
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, static_folder='build')
CORS(app)

AZURE_ML_URL = os.getenv("AZURE_ML_URL")
API_KEY = os.getenv("API_KEY")

MIN_PRICE = 6.1269
MAX_PRICE = 332.0436887

def denormalize(normalized_value, min_value=MIN_PRICE, max_value=MAX_PRICE):
    return normalized_value * (max_value - min_value) + min_value

@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        json_text = request.get_json()
        input_data = json_text

        payload = {
            "Inputs": {"input1": [input_data]},
            "GlobalParameters": {}
        }

        body = json.dumps(payload).encode("utf-8")
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {API_KEY}"
        }
        req = urllib.request.Request(AZURE_ML_URL, body, headers)

        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode("utf-8"))

        trip_price = "N/A"
        if "Results" in result and "WebServiceOutput0" in result["Results"]:
            predictions = result["Results"]["WebServiceOutput0"]
            if predictions and "Scored Labels" in predictions[0]:
                normalized_price = predictions[0]["Scored Labels"]
                trip_price = denormalize(normalized_price)

        return jsonify({"Trip_Price": trip_price})

    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    app.run(debug=True)
