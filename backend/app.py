from datetime import timedelta
from flask import Flask, request, jsonify, session
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime, timezone
from bson import ObjectId  # Import ObjectId for MongoDB ID conversion for user_id


import sqlite3
import hashlib
import re
import smtplib
import uuid
from email.message import EmailMessage

app = Flask(__name__)

# app.config['SESSION_COOKIE_NAME'] = 'session'
# app.config['SESSION_COOKIE_HTTPONLY'] = True
# app.config['SESSION_COOKIE_SECURE'] = False  # False for development, True for production with HTTPS
# app.config['SESSION_PERMANENT'] = True
# app.config['SESSION_COOKIE_SAMESITE'] = 'None'
# app.config['SECRET_KEY'] = 'your_secret_key'  # This is critical for session encryption

#CORS(app, supports_credentials=True)

#CORS(app)
#CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)
#CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, allow_headers=["Content-Type"], methods=["GET", "POST", "OPTIONS"])

SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
EMAIL_SENDER = "noreply.trailblazer@gmail.com"
EMAIL_PASSWORD = "Test@1234"

PORT = 55000

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
                "people": data["people"],
                "images": data["images"]
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
    
# @app.route('/is_authenticated', methods=['GET'])
# def is_authenticated():
#     print('user_id' in session)
#     print(session)
#     return jsonify({'authenticated': 'user_id' in session})


def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def is_valid_email(email):
    return re.match(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$", email)

def is_strong_password(password):
    return len(password) >= 8 and any(c.isdigit() for c in password) and any(c.isupper() for c in password)

def send_verification_email(email, token):
    msg = EmailMessage()
    msg.set_content(f"Click the link to verify your email: http://localhost:{PORT}/verify?token={token}")
    msg["Subject"] = "Verify Your Email"
    msg["From"] = EMAIL_SENDER
    msg["To"] = email
    
    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
        server.starttls()
        server.login(EMAIL_SENDER, EMAIL_PASSWORD)
        server.send_message(msg)

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    
    if not username or not email or not password:
        return jsonify({'error': 'All fields are required'}), 400
    
    if not is_valid_email(email):
        return jsonify({'error': 'Invalid email format'}), 400
    
    if not is_strong_password(password):
        return jsonify({'error': 'Password must be at least 8 characters long, contain a digit and an uppercase letter'}), 400
    
    hashed_pw = hash_password(password)
    verification_token = str(uuid.uuid4())
    
    conn = sqlite3.connect("main.db")
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM UserTable WHERE email = ?", (email,))
    if cursor.fetchone():
        conn.close()
        return jsonify({'error': 'Email already registered'}), 400
    
    cursor.execute("INSERT INTO UserTable (username, email, hashed_pw, verified, verification_token) VALUES (?, ?, ?, ?, ?)", (username, email, hashed_pw, 1, verification_token))
    user_id = cursor.lastrowid
    conn.commit()
    conn.close()

    # session["user_id"] = user_id
    # session.permanent = True  # Ensure the session lasts longer

    
    #send_verification_email(email, verification_token)
    
    return jsonify({'message': 'Registration successful. Please check your email to verify your account.', 'user_id': user_id}), 201

@app.route('/verify', methods=['GET'])
def verify():
    token = request.args.get('token')
    
    if not token:
        return jsonify({'error': 'Invalid token'}), 400
    
    conn = sqlite3.connect("main.db")
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM UserTable WHERE verification_token = ?", (token,))
    user = cursor.fetchone()
    
    if not user:
        conn.close()
        return jsonify({'error': 'Invalid or expired token'}), 400
    
    cursor.execute("UPDATE UserTable SET verified = 1, verification_token = NULL WHERE verification_token = ?", (token,))
    conn.commit()
    conn.close()

    # session["user"] = user[0]
    
    return jsonify({'message': 'Email verified successfully. You can now log in.'}), 200

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400
    
    conn = sqlite3.connect("main.db")
    cursor = conn.cursor()
    
    cursor.execute("SELECT user_id, hashed_pw, verified FROM UserTable WHERE email = ?", (email,))
    user = cursor.fetchone()
    conn.close()
    
    if not user or user[1] != hash_password(password):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    if user[2] == 0:
        return jsonify({'error': 'Please verify your email before logging in'}), 403
    
    # session["user_id"] = user[0]
    # session.permanent = True  # Ensure the session lasts longer
    # print(session)
    # print(session['user_id'])
    # print('user_id' in session)

    print(user[0])
    
    return jsonify({'message': 'Login successful', 'user_id': user[0]}), 200
    
# @app.route('/logout', methods=['POST'])
# def logout():
#     session.clear()
#     return jsonify({'message': 'Logged out'})

# Sample activities data (In a real application, this would be retrieved from an external API)
top_preferences = [
    {"id": 1, "title": "Scenic Hike", "rating": 4.9, "location": "Portland", "image": "https://www.rei.com/dam/parrish_091412_0679_main_lg.jpg"},
    {"id": 2, "title": "City Tour", "rating": 4.8, "location": "Portland", "image": "https://upload.wikimedia.org/wikipedia/commons/9/90/City_Sightseeing_Gozo_Hop-On_Hop-Off_open_top_bus_FPY_004.jpg"},
    {"id": 3, "title": "Wine Tasting", "rating": 4.7, "location": "Portland", "image": "https://www.wienscellars.com/wp-content/uploads/2024/06/960x0-1.jpg"},
    {"id": 4, "title": "Boat Cruise", "rating": 4.7, "location": "Portland", "image": "https://media.architecturaldigest.com/photos/5654e91c587d37cb3479de02/16:9/w_2560%2Cc_limit/regent-seven-seas-lede.jpg"},
    {"id": 5, "title": "Hot Air Balloon Ride", "rating": 4.9, "location": "Portland", "image": "https://nvaloft.com/wp-content/uploads/2015/04/balloon-family-web.jpg"},
    {"id": 6, "title": "Mountain Biking", "rating": 4.6, "location": "Portland", "image": "https://images.squarespace-cdn.com/content/v1/6020d1ea9c6bdd6741edae39/1712933910425-AZOHP7LDYF41WFO0CRNU/types-of-mtb-trails.jpg?format=500w"},
    {"id": 7, "title": "Scuba Diving", "rating": 4.8, "location": "Portland", "image": "https://upload.wikimedia.org/wikipedia/commons/2/29/Underwater_photograph_of_a_recreational_scuba_diver_in_Playa_del_Carmen_2006.jpg"},
    {"id": 8, "title": "Cultural Show", "rating": 4.5, "location": "Portland", "image": "https://dnwp63qf32y8i.cloudfront.net/49c23488bc70e81faf2ef936a95e6c6589dbcac9"},
    {"id": 9, "title": "Cooking Class", "rating": 4.6, "location": "Portland", "image": "https://spartanspeaks.com/wp-content/uploads/2023/03/9uw2wfTT5X9SVohUw7E7KJzZ41yyDkSv5c3UXqnc.jpg"},
    {"id": 10, "title": "Wildlife Safari", "rating": 4.7, "location": "Portland", "image": "https://sdzsafaripark.org/sites/default/files/2024-07/6242_wildlife-safari-thumb_668x540.jpg"}
]

next_best_preferences = [
    {"id": 11, "title": "Kayaking", "rating": 4.5, "location": "Portland", "image": "https://res.cloudinary.com/gofjords-com/images/c_scale,w_448,h_299,dpr_2/f_auto,q_auto:eco/v1683890721/Experiences/XXLofoten/Kayaking/Evening%20kayaking%202020/Evening-kayaking-Svolvaer-Lofoten-XXlofoten-1/Evening-kayaking-Svolvaer-Lofoten-XXlofoten-1.jpg?_i=AA"},
    {"id": 12, "title": "Zip Lining", "rating": 4.4, "location": "Portland", "image": "https://www.begripped.com/media/uqxptd5d/istock-1157735556.jpg?rxy=0.5369316873186236,0.4318488529014845&width=1000&height=1000&rnd=132996903195930000"},
    {"id": 13, "title": "Rock Climbing", "rating": 4.3, "location": "Portland", "image": "https://alpineairadventures.com/wp-content/uploads/2019/03/rock-climbing-Banff.jpg"},
    {"id": 14, "title": "Fishing Trip", "rating": 4.2, "location": "Portland", "image": "https://assets.simpleviewinc.com/simpleview/image/upload/c_fill,f_jpg,h_358,q_65,w_639/v1/clients/southshore/Big_Lake_Equals_Big_Fish_Charter_Fishing_fc285f5f-300c-4a49-8e33-e931dd7a814c.jpg"},
    {"id": 15, "title": "Amusement Park", "rating": 4.1, "location": "Portland", "image": "https://s3-media0.fl.yelpcdn.com/bphoto/6v_1shpFJrAUOde4ZifKUw/1000s.jpg"},
    {"id": 16, "title": "Museum Visit", "rating": 4.0, "location": "Portland", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSyYrLtBFpiv7QpzyMKf3A4YHjJxHYdm0Xu4Q&s"},
    {"id": 17, "title": "Botanical Garden Tour", "rating": 4.2, "location": "Portland", "image": "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/10/a3/0a/4e/beautiful-botanical-garden.jpg?w=800&h=500&s=1"},
    {"id": 18, "title": "Horseback Riding", "rating": 4.3, "location": "Portland", "image": "https://rjclassics.com/cdn/shop/articles/English-riding-dressage-rider.jpg?v=1715610957"},
    {"id": 19, "title": "ATV Adventure", "rating": 4.4, "location": "Portland", "image": "https://aceraft.com/wp-content/uploads/2019/05/new-river-gorge-atv-tour-ace-adventure-resort-3-scaled.jpg"},
    {"id": 20, "title": "Escape Room", "rating": 4.1, "location": "Portland", "image": "https://m.media-amazon.com/images/I/91CVLmjQVJL.jpg"}
]

@app.route("/get_activities", methods=["POST"])
def get_activities():
    #data = request.get_json()
    #trip_id = data.get("trip_id")
    
    #if not trip_id:
    #    return jsonify({"error": "Missing trip_id"}), 400
    
    activities = {
        "top_preferences": [
            {
                "id": activity["id"],
                "title": activity["title"],
                "rating": activity["rating"],
                "image": activity["image"],
                "location": activity["location"]
            }
            for activity in top_preferences
        ],
        "next_best_preferences": [
            {
                "id": activity["id"],
                "title": activity["title"],
                "rating": activity["rating"],
                "image": activity["image"],
                "location": activity["location"]
            }
            for activity in next_best_preferences
        ]
    }

    trip_id = str(uuid.uuid4())

    return jsonify({"trip_id": trip_id, "activities": activities})

if __name__ == '__main__':
    app.run(port=PORT, debug=True)
