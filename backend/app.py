from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime, timezone
from bson import ObjectId  # Import ObjectId for MongoDB ID conversion for user_id


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)
#CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, allow_headers=["Content-Type"], methods=["GET", "POST", "OPTIONS"])

client = MongoClient("mongodb+srv://kumar502:gcstrail1@cluster0.h5zkw.mongodb.net/")
db = client["TrAIlblazer"]
collection = db["survey_preferences"]
trip_collection = db["trips"]
place_collection = db["places"]

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
    data = request.json  # Get JSON from frontend
    user_id = ObjectId(data["userId"])  # Convert userId to ObjectId

    # Extract survey responses
    survey_data = data["surveyData"]  # Only survey responses

    # Ensure user_id is stored in the document
    survey_data["user_id"] = user_id
    survey_data["lastUpdated"] = datetime.now(timezone.utc)  # Add timestamp

    # Update existing document or insert a new one
    collection.update_one(
        {"user_id": user_id},  # Match by user ID
        {"$set": survey_data},  # Update survey fields
        upsert=True  # Insert new document if none exists
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
        
        data["lastUpdated"] = datetime.now(timezone.utc)

        # Convert user_id to ObjectId (foreign key reference)
        if "user_id" in data:
            try:
                # data['user_id'] = Cookies.get('user_id')
                data["user_id"] = ObjectId(data["user_id"])  # Convert string ID to ObjectId
                print("Converted user_id:", data["user_id"])
            except:
                return jsonify({"error": "Invalid user_id format"}), 400  # Return error if ID is invalid
        print("Received and Modified Data:", data)
        #collection.insert_one(data)  # Insert into MongoDB
        # Update existing document or insert a new one
        collection.update_one(
            {"user_id": data["user_id"]},  # Match user_id
            {"$set": data},  # Update document
            upsert=True  # Insert if not exists
        )
        return jsonify({"message": "Survey data saved successfully"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/trips", methods=['GET', 'POST', 'OPTIONS'])
def trips():
    if request.method == 'GET':
        try:
            trips = list(trip_collection.find({}))
            for trip in trips:
                trip["_id"] = str(trip["_id"])
            return jsonify(trips), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    elif request.method == 'POST':
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
    elif request.method == 'OPTIONS':
        return '', 200

@app.route('/trips/<trip_id>', methods=['GET', 'OPTIONS'])
def get_trip(trip_id):
    if request.method == "OPTIONS":
        return jsonify({"message": "CORS preflight passed"}), 200

    try:
        trip = trip_collection.find_one({"_id": ObjectId(trip_id)})
        if trip:
            trip["_id"] = str(trip["_id"])
            return jsonify(trip), 200
        else:
            return jsonify({"error": "Trip not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/places", methods=['GET', 'OPTIONS'])
def places():
    if request.method == 'GET':
        try:
            places = list(place_collection.find({}))
            for place in places:
                place["_id"] = str(place["_id"])
            return jsonify(places), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    elif request.method == 'OPTIONS':
        return '', 200

@app.route('/places/<place_id>', methods=['GET', 'OPTIONS'])
def get_place(place_id):
    if request.method == "OPTIONS":
        return jsonify({"message": "CORS preflight passed"}), 200

    try:
        place = place_collection.find_one({"_id": ObjectId(place_id)})
        if place:
            place["_id"] = str(place["_id"])
            return jsonify(place), 200
        else:
            return jsonify({"error": "Place not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
if __name__ == '__main__':
    app.run(port=55000, debug=True)
