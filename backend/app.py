from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient

app = Flask(__name__)
#CORS(app)
#CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)
#CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, allow_headers=["Content-Type"], methods=["GET", "POST", "OPTIONS"])

client = MongoClient("mongodb+srv://kumar502:gcstrail1@cluster0.h5zkw.mongodb.net/")
db = client["TrAIlblazer"]
collection = db["survey_preferences"]
trip_collection = db["trips"]

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
        collection.insert_one(data)  # Insert into MongoDB
        return jsonify({"message": "Survey data saved successfully"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/trips", methods=['POST'])
def trips():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No data provided"}), 400
        print("Received timeRanges:", data.get("timeRanges")) 
        trip_collection.insert_one({
            "location": data["location"],
            "days": data["days"],
            "startDate": data["startDate"],
            "endDate": data["endDate"],
            "timeRanges": data["timeRanges"],
            "people": data["people"]
        })
        return jsonify({"message": "Trip data saved successfully"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500 

    
if __name__ == '__main__':
    app.run(port=55000, debug=True)
