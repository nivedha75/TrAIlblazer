from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime
from bson import ObjectId  # Import ObjectId for MongoDB ID conversion for user_id

app = Flask(__name__)
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

@app.route('/load_progress/<user_id>', methods=['GET', 'OPTIONS'])
def load_progress(user_id):
    print("Received user_id:", user_id)
    if request.method == "OPTIONS":
        return jsonify({"message": "CORS preflight passed"}), 200
    
    # Find the document but exclude `_id` and `user_id` from the response
    result = collection.find_one({"user_id": ObjectId(user_id)}, {"_id": 0, "user_id": 0})

    if result:
        print("Survey data found:", result)  # Debugging log
        return jsonify({"exists": True, "surveyData": result}), 200  # Return only survey data
    return jsonify({"exists": False, "message": "No saved progress"}), 200

@app.route('/save_progress', methods=['POST'])
def save_progress():
    data = request.json
    user_id = ObjectId(data["userId"])  # Convert userId to ObjectId for MongoDB

    collection.update_one(
        {"user_id": user_id},  # Find existing entry by user_id
        {"$set": {**data["surveyData"], "user_id": user_id, "lastUpdated": datetime.utcnow()}},  # Update data
        upsert=True  # Create new entry if not found
    )

    return jsonify({"message": "Survey progress saved"}), 200



@app.route('/submit_preferences', methods=['POST', 'OPTIONS'])
def submit_preferences():
    if request.method == "OPTIONS":
        return jsonify({"message": "CORS preflight passed"}), 200
    try:
        data = request.json  # Get JSON data from request
        if not data:
            return jsonify({"error": "No data provided"}), 400
        print("Received data:", data)
        print("Received submissionDateTime:", data["submissionDateTime"])
        print("Received user_id:", data["user_id"])
        if "submissionDateTime" in data:
            data["submissionDateTime"] = datetime.fromisoformat(data["submissionDateTime"])
            print("Converted submissionDateTime:", data["submissionDateTime"])
        # Convert user_id to ObjectId (foreign key reference)
        if "user_id" in data:
            try:
                data["user_id"] = ObjectId(data["user_id"])  # Convert string ID to ObjectId
                print("Converted user_id:", data["user_id"])
            except:
                return jsonify({"error": "Invalid user_id format"}), 400  # Return error if ID is invalid
            print("Received and Modified Data:", data)
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
