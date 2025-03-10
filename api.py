from flask import Flask, request, render_template, jsonify
import urllib.request
import json

app = Flask(__name__)

AZURE_ML_URL = "http://3c4ddc13-5fc5-42d4-97d7-2bfef080986b.westeurope.azurecontainer.io/score"
API_KEY = "wbWPj7AwD81x870kQgz1ILJxGF7zb0A8"

# min-max values
MIN_PRICE = 6.1269
MAX_PRICE = 332.0436887

def denormalize(normalized_value, min_value=MIN_PRICE, max_value=MAX_PRICE):
    return normalized_value * (max_value - min_value) + min_value

@app.route('/')
def index():
    return render_template("index.html")

@app.route('/predict', methods=['POST'])
def predict():
    try:
        json_text = request.form['json_data']
        input_data = json.loads(json_text)

        payload = {
            "Inputs": {
                "input1": [input_data]
            },
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

        # Extract the "Scored Labels" and denormalize
        trip_price = "N/A"  # Default value in case of error
        if "Results" in result and "WebServiceOutput0" in result["Results"]:
            predictions = result["Results"]["WebServiceOutput0"]
            if predictions and "Scored Labels" in predictions[0]:
                normalized_price = predictions[0]["Scored Labels"]
                trip_price = denormalize(normalized_price)

        return render_template("index.html", trip_price=trip_price)

    except Exception as e:
        return render_template("index.html", trip_price=f"Error: {str(e)}")


if __name__ == "__main__":
    app.run(debug=True)