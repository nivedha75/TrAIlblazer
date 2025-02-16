from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient

app = Flask(__name__)
#CORS(app)
#CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)
#CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, allow_headers=["Content-Type"], methods=["GET", "POST", "OPTIONS"])

client = MongoClient("mongodb://localhost:27017/")
db = client["travel_preferences"]
collection = db["survey_responses"]

@app.route('/')
def hello():
    return "Hello from Flask"

@app.route('/api/trailblazer')
def api_trailblazer():
    return jsonify({'message': 'TrAIlblazer'})

@app.route('/submit_preferences', methods=['POST', 'OPTIONS'])
def submit_preferences():
    if request.method == "OPTIONS":
        return jsonify({"message": "CORS preflight passed"}), 200
    try:
        data = request.json  # Get JSON data from request
        if not data:
            return jsonify({"error": "No data provided"}), 400
        print("Received Data:", data)
        # collection.insert_one(data)  # Insert into MongoDB
        return jsonify({"message": "Survey data saved successfully"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
if __name__ == '__main__':
    app.run(debug=True)