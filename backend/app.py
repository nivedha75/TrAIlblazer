from datetime import timedelta
from flask import Flask, request, jsonify, session, make_response
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime, timezone
from itertools import count
from bson import ObjectId  # Import ObjectId for MongoDB ID conversion for user_id
import os

import sqlite3
import hashlib
import re
import smtplib
import uuid
from email.message import EmailMessage
import requests
import json

from chains.travel_chain import get_langchain_agent

import logging

logging.basicConfig(level=logging.INFO)

from dotenv import load_dotenv
import os


load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
IMAGE_API_KEY = os.getenv("IMAGE_API_KEY")
IMAGE_CX = os.getenv("IMAGE_CX")


app = Flask(__name__)

DB_PATH = os.path.join(os.path.dirname(__file__), "main.db")
print(">>> Using database at:", DB_PATH)

# app.config['SESSION_COOKIE_NAME'] = 'session'
# app.config['SESSION_COOKIE_HTTPONLY'] = True
# app.config['SESSION_COOKIE_SECURE'] = False  # False for development, True for production with HTTPS
# app.config['SESSION_PERMANENT'] = True
# app.config['SESSION_COOKIE_SAMESITE'] = 'None'
# app.config['SECRET_KEY'] = 'your_secret_key'  # This is critical for session encryption

# CORS(app, supports_credentials=True)

# CORS(app)
# CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})
CORS(
    app,
    resources={r"/*": {"origins": "http://localhost:3000"}},
    supports_credentials=True,
)
# CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, allow_headers=["Content-Type"], methods=["GET", "POST", "OPTIONS"])

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
activity_collection = db["activities"]
itinerary_collection = db["itineraries"]
restaurant_collection = db["restaurants"]
messages_collection = db["messages"]


@app.route("/")
def hello():
    return "Hello from Flask"


@app.route("/api/trailblazer")
def api_trailblazer():
    return jsonify({"message": "TrAIlblazer"})


@app.route("/load_progress/<user_id>", methods=["GET", "OPTIONS"])
def load_progress(user_id):
    print("Received user_id:", user_id)
    if request.method == "OPTIONS":
        return jsonify({"message": "CORS preflight passed"}), 200

    # Find the document but exclude `_id` and `user_id` from the response
    # result = collection.find_one({"user_id": ObjectId(user_id)}, {"_id": 0, "user_id": 0})
    result = collection.find_one({"user_id": user_id}, {"_id": 0, "user_id": 0})

    if result:
        print("Survey data found:", result)  # Debugging log
        return (
            jsonify({"exists": True, "surveyData": result}),
            200,
        )  # Return only survey data
    return jsonify({"exists": False, "message": "No saved progress"}), 200


@app.route("/save_progress", methods=["POST"])
def save_progress():
    data = request.json  # Get JSON from frontend
    # user_id = ObjectId(data["userId"])  # Convert userId to ObjectId
    user_id = data["userId"]
    # Extract survey responses
    survey_data = data["surveyData"]  # Only survey responses

    # Ensure user_id is stored in the document
    survey_data["user_id"] = user_id
    survey_data["lastUpdated"] = datetime.now(timezone.utc)  # Add timestamp

    # Update existing document or insert a new one
    collection.update_one(
        {"user_id": user_id},  # Match by user ID
        {"$set": survey_data},  # Update survey fields
        upsert=True,  # Insert new document if none exists
    )

    return jsonify({"message": "Survey progress saved"}), 200


@app.route("/submit_preferences", methods=["POST", "OPTIONS"])
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
            data["submissionDateTime"] = datetime.fromisoformat(
                data["submissionDateTime"]
            )
            print("Converted submissionDateTime:", data["submissionDateTime"])

        data["lastUpdated"] = datetime.now(timezone.utc)

        print("Received and Modified Data:", data)

        # Update existing document or insert a new one
        collection.update_one(
            {"user_id": data["user_id"]},  # Match user_id
            {"$set": data},  # Update document
            upsert=True,  # Insert if not exists
        )
        return jsonify({"message": "Survey data saved successfully"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/trips", methods=["GET", "POST", "OPTIONS"])
def trips():
    if request.method == "GET":
        try:
            trips = list(trip_collection.find({}))
            for trip in trips:
                trip["_id"] = str(trip["_id"])
            return jsonify(trips), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    elif request.method == "POST":
        try:
            data = request.json
            if not data:
                return jsonify({"error": "No data provided"}), 400
            print("Received timeRanges:", data.get("timeRanges"))
            print(data)
            trip_result = trip_collection.insert_one(
                {
                    "userId": data["userId"],
                    "location": data["location"],
                    "days": data["days"],
                    "startDate": data["startDate"],
                    "endDate": data["endDate"],
                    "timeRanges": data["timeRanges"],
                    "people": data["people"],
                    "images": data["images"],
                }
            )
            trip_id = trip_result.inserted_id
            # print('generating itinerary?')
            # print("Data received:", data)
            # print("UserId:", data.get("userId", "No userId in data"))
            print("Location:", data.get("location", "No location in data"))
            print(data["userId"], data["location"], trip_id)
            print("Start date:", data.get("startDate", "No start date in data"))
            print("End date:", data.get("endDate", "No end date in data"))
            # Step 1: Use LangChain to fetch only relevant real-time data
            # user_query = "What is the weather like, and what are some top tourist attractions and hotels in the city " + data["location"] + "?"
            user_query_2 = (
                """What is the weather like and what are hotels in the city """
                + data["location"]
                + """?
            Specifically, describe the temperature, feels like temperature, humidity, wind speed, and any other important weather conditions.
            Also, specifically provide the name, rating, and price of hotels in the city."""
            )
            user_query = (
                """For the city, """
                + data["location"]
                + """ describe the following information:\n
            Specifically, describe the temperature, feels like temperature, humidity, wind speed, and any other important weather conditions
            for every day from the start date """
                + data["startDate"]
                + """ to the end date """
                + data["endDate"]
                + """.
            Also, specifically provide the name, rating, and price of hotels in the city."""
            )
            agent = get_langchain_agent(OPENAI_API_KEY)
            try:
                city_data = agent.run(user_query)
            except Exception as e:
                print("Error while running agent:", str(e))
                city_data = "Error: Too much input data or agent failed."

            print("\n\nCity data for generating itinerary:", city_data)
            # Step 2: Use Gemini Flash to generate a personalized itinerary
            try:
                generate_itinerary(
                    data["userId"], data["location"], data["days"], trip_id, city_data
                )
            except Exception as e:
                print(f"Error in generate_itinerary: {e}")

            print("Calling generate_restaurant_recommendations...")  # Debugging
            generate_restaurant_recommendations(
                data["userId"], data["location"], trip_id, city_data
            )

            return jsonify({"message": "Trip data saved successfully"}), 201

        except Exception as e:
            return jsonify({"error": str(e)}), 500
    elif request.method == "OPTIONS":
        return "", 200


@app.route("/trips/<trip_id>", methods=["GET", "DELETE", "OPTIONS"])
def get_trip(trip_id):
    if request.method == "OPTIONS":
        return jsonify({"message": "CORS preflight passed"}), 200
    elif request.method == "GET":
        try:
            trip = trip_collection.find_one({"_id": ObjectId(trip_id)})
            if trip:
                trip["_id"] = str(trip["_id"])
                return jsonify(trip), 200
            else:
                return jsonify({"error": "Trip not found"}), 404
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    elif request.method == "DELETE":
        try:
            result = trip_collection.delete_one({"_id": ObjectId(trip_id)})
            print(f"Trip: {trip_id}")
            if result.deleted_count > 0:
                result = itinerary_collection.delete_one({"_id": ObjectId(trip_id)})
                print(f"Itinerary: {trip_id}")
                if result.deleted_count > 0:
                    return (
                        jsonify({"message": "Trip and Itinerary deleted successfully"}),
                        200,
                    )
                else:
                    return jsonify({"error": "Itinerary not found"}), 404
            else:
                return jsonify({"error": "Trip not found"}), 404
        except Exception as e:
            return jsonify({"error": str(e)}), 500


@app.route("/trips/user/<user_id>", methods=["GET"])
def get_trips_by_user(user_id):
    try:
        trips = trip_collection.find({"userId": user_id})
        trip_list = []
        for trip in trips:
            trip["_id"] = str(trip["_id"])
            trip_list.append(trip)
        return jsonify(trip_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/itinerary/<trip_id>", methods=["GET"])
def get_itinerary(trip_id):
    try:
        itinerary = itinerary_collection.find_one({"_id": ObjectId(trip_id)})
        if itinerary:
            # print(str(itinerary["_id"]))
            # print(itinerary)
            itinerary["_id"] = str(itinerary["_id"])
            for day in itinerary["activities"]["top_preferences"]:
                for act in day:
                    act["details"]["tripId"] = str(act["details"]["tripId"])
                    act["details"]["_id"] = str(act["details"]["_id"])
                    act["activityID"] = str(act["activityID"])

            for day in itinerary["activities"]["next_best_preferences"]:
                for act in day:
                    act["details"]["tripId"] = str(act["details"]["tripId"])
                    act["details"]["_id"] = str(act["details"]["_id"])
                    act["activityID"] = str(act["activityID"])
            return jsonify(itinerary), 200
        else:
            print("itinerary not found")
            return jsonify({"error": "Itinerary not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/restaurants/<trip_id>", methods=["GET"])
def get_restaurants(trip_id):
    try:
        restaurants = restaurant_collection.find_one({"_id": ObjectId(trip_id)})
        if restaurants:
            restaurants["_id"] = str(restaurants["_id"])
            for r in restaurants["restaurants"]:
                r["activityID"] = str(r["activityID"])
                r["details"]["_id"] = str(r["details"]["_id"])
                r["details"]["tripId"] = str(r["details"]["tripId"])
            return jsonify(restaurants), 200
        else:
            print("restaurants not found")
            return jsonify({"error": "Restaurants not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/places", methods=["GET", "OPTIONS"])
def places():
    if request.method == "GET":
        try:
            places = list(place_collection.find({}))
            for place in places:
                place["_id"] = str(place["_id"])
            return jsonify(places), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    elif request.method == "OPTIONS":
        return "", 200


@app.route("/places/<place_id>", methods=["GET", "OPTIONS"])
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


@app.route("/activities", methods=["GET", "OPTIONS"])
def activities():
    if request.method == "GET":
        try:
            activities = list(activity_collection.find({}))
            for activity in activities:
                activity["_id"] = str(activity["_id"])
                activity["tripId"] = str(activity["tripId"])
            return jsonify(activities), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    elif request.method == "OPTIONS":
        return "", 200


@app.route("/activities/<activity_id>", methods=["GET", "OPTIONS"])
def get_activity(activity_id):
    if request.method == "OPTIONS":
        return jsonify({"message": "CORS preflight passed"}), 200

    try:
        activity = activity_collection.find_one({"_id": ObjectId(activity_id)})
        if activity:
            activity["_id"] = str(activity["_id"])
            activity["tripId"] = str(activity["tripId"])
            return jsonify(activity), 200
        else:
            return jsonify({"error": "Activity not found"}), 404
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
    return (
        len(password) >= 8
        and any(c.isdigit() for c in password)
        and any(c.isupper() for c in password)
    )


def send_verification_email(email, token):
    msg = EmailMessage()
    msg.set_content(
        f"Click the link to verify your email: http://localhost:{PORT}/verify?token={token}"
    )
    msg["Subject"] = "Verify Your Email"
    msg["From"] = EMAIL_SENDER
    msg["To"] = email

    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
        server.starttls()
        server.login(EMAIL_SENDER, EMAIL_PASSWORD)
        server.send_message(msg)


@app.route("/register", methods=["POST"])
def register():
    print("In register function in app.py")
    data = request.json
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not username or not email or not password:
        return jsonify({"error": "All fields are required"}), 400

    if not is_valid_email(email):
        return jsonify({"error": "Invalid email format"}), 400

    if not is_strong_password(password):
        return (
            jsonify(
                {
                    "error": "Password must be at least 8 characters long, contain a digit and an uppercase letter"
                }
            ),
            400,
        )

    hashed_pw = hash_password(password)
    verification_token = str(uuid.uuid4())

    # conn = sqlite3.connect("main.db") does not work if the current working directory is NOT the backend folder
    DB_PATH = os.path.join(os.path.dirname(__file__), "main.db")  # working version
    print("Using database at: ", DB_PATH)
    conn = sqlite3.connect(DB_PATH)

    cursor = conn.cursor()
    cursor.execute("SELECT * FROM UserTable WHERE email = ?", (email,))
    if cursor.fetchone():
        conn.close()
        return jsonify({"error": "Email already registered"}), 400
    cursor.execute("SELECT * FROM UserTable WHERE username = ?", (username,))
    if cursor.fetchone():
        conn.close()
        return jsonify({"error": "Username is already taken"}), 400

    cursor.execute(
        "INSERT INTO UserTable (username, email, hashed_pw, verified, verification_token) VALUES (?, ?, ?, ?, ?)",
        (username, email, hashed_pw, 1, verification_token),
    )
    user_id = cursor.lastrowid
    conn.commit()
    conn.close()

    # session["user_id"] = user_id
    # session.permanent = True  # Ensure the session lasts longer

    # send_verification_email(email, verification_token)

    return (
        jsonify(
            {
                "message": "Registration successful. Try logging in.",
                "user_id": user_id,
                "username": username,
            }
        ),
        201,
    )


@app.route("/verify", methods=["GET"])
def verify():
    token = request.args.get("token")

    if not token:
        return jsonify({"error": "Invalid token"}), 400

    conn = sqlite3.connect("main.db")
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM UserTable WHERE verification_token = ?", (token,))
    user = cursor.fetchone()

    if not user:
        conn.close()
        return jsonify({"error": "Invalid or expired token"}), 400

    cursor.execute(
        "UPDATE UserTable SET verified = 1, verification_token = NULL WHERE verification_token = ?",
        (token,),
    )
    conn.commit()
    conn.close()

    # session["user"] = user[0]

    return jsonify({"message": "Email verified successfully. You can now log in."}), 200


@app.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    # conn = sqlite3.connect("main.db") does not work if the current working directory is NOT the backend folder

    DB_PATH = os.path.join(os.path.dirname(__file__), "main.db")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute(
        "SELECT user_id, username, hashed_pw, verified FROM UserTable WHERE email = ?",
        (email,),
    )
    user = cursor.fetchone()
    conn.close()

    if not user:
        return jsonify({"error": "Invalid credentials"}), 401
    elif user[2] != hash_password(password):
        return jsonify({"error": "Incorrect password"}), 401

    if user[3] == 0:
        return jsonify({"error": "Please verify your email before logging in"}), 403

    # session["user_id"] = user[0]
    # session.permanent = True  # Ensure the session lasts longer
    # print(session)
    # print(session['user_id'])
    # print('user_id' in session)

    print(user[0])

    return (
        jsonify(
            {"message": "Login successful", "user_id": user[0], "username": user[1]}
        ),
        200,
    )


# @app.route('/logout', methods=['POST'])
# def logout():
#     session.clear()
#     return jsonify({'message': 'Logged out'})

# Sample activities data (In a real application, this would be retrieved from an external API)
# top_preferences = [
#     {"id": 1, "title": "Scenic Hike", "rating": 4.9, "location": "Portland", "image": "https://www.rei.com/dam/parrish_091412_0679_main_lg.jpg"},
#     {"id": 2, "title": "City Tour", "rating": 4.8, "location": "Portland", "image": "https://upload.wikimedia.org/wikipedia/commons/9/90/City_Sightseeing_Gozo_Hop-On_Hop-Off_open_top_bus_FPY_004.jpg"},
#     {"id": 3, "title": "Wine Tasting", "rating": 4.7, "location": "Portland", "image": "https://www.wienscellars.com/wp-content/uploads/2024/06/960x0-1.jpg"},
#     {"id": 4, "title": "Boat Cruise", "rating": 4.7, "location": "Portland", "image": "https://media.architecturaldigest.com/photos/5654e91c587d37cb3479de02/16:9/w_2560%2Cc_limit/regent-seven-seas-lede.jpg"},
#     {"id": 5, "title": "Hot Air Balloon Ride", "rating": 4.9, "location": "Portland", "image": "https://nvaloft.com/wp-content/uploads/2015/04/balloon-family-web.jpg"},
#     {"id": 6, "title": "Mountain Biking", "rating": 4.6, "location": "Portland", "image": "https://images.squarespace-cdn.com/content/v1/6020d1ea9c6bdd6741edae39/1712933910425-AZOHP7LDYF41WFO0CRNU/types-of-mtb-trails.jpg?format=500w"},
#     {"id": 7, "title": "Scuba Diving", "rating": 4.8, "location": "Portland", "image": "https://upload.wikimedia.org/wikipedia/commons/2/29/Underwater_photograph_of_a_recreational_scuba_diver_in_Playa_del_Carmen_2006.jpg"},
#     {"id": 8, "title": "Cultural Show", "rating": 4.5, "location": "Portland", "image": "https://dnwp63qf32y8i.cloudfront.net/49c23488bc70e81faf2ef936a95e6c6589dbcac9"},
#     {"id": 9, "title": "Cooking Class", "rating": 4.6, "location": "Portland", "image": "https://spartanspeaks.com/wp-content/uploads/2023/03/9uw2wfTT5X9SVohUw7E7KJzZ41yyDkSv5c3UXqnc.jpg"},
#     {"id": 10, "title": "Wildlife Safari", "rating": 4.7, "location": "Portland", "image": "https://sdzsafaripark.org/sites/default/files/2024-07/6242_wildlife-safari-thumb_668x540.jpg"}
# ]

# next_best_preferences = [
#     {"id": 11, "title": "Kayaking", "rating": 4.5, "location": "Portland", "image": "https://res.cloudinary.com/gofjords-com/images/c_scale,w_448,h_299,dpr_2/f_auto,q_auto:eco/v1683890721/Experiences/XXLofoten/Kayaking/Evening%20kayaking%202020/Evening-kayaking-Svolvaer-Lofoten-XXlofoten-1/Evening-kayaking-Svolvaer-Lofoten-XXlofoten-1.jpg?_i=AA"},
#     {"id": 12, "title": "Zip Lining", "rating": 4.4, "location": "Portland", "image": "https://www.begripped.com/media/uqxptd5d/istock-1157735556.jpg?rxy=0.5369316873186236,0.4318488529014845&width=1000&height=1000&rnd=132996903195930000"},
#     {"id": 13, "title": "Rock Climbing", "rating": 4.3, "location": "Portland", "image": "https://alpineairadventures.com/wp-content/uploads/2019/03/rock-climbing-Banff.jpg"},
#     {"id": 14, "title": "Fishing Trip", "rating": 4.2, "location": "Portland", "image": "https://assets.simpleviewinc.com/simpleview/image/upload/c_fill,f_jpg,h_358,q_65,w_639/v1/clients/southshore/Big_Lake_Equals_Big_Fish_Charter_Fishing_fc285f5f-300c-4a49-8e33-e931dd7a814c.jpg"},
#     {"id": 15, "title": "Amusement Park", "rating": 4.1, "location": "Portland", "image": "https://s3-media0.fl.yelpcdn.com/bphoto/6v_1shpFJrAUOde4ZifKUw/1000s.jpg"},
#     {"id": 16, "title": "Museum Visit", "rating": 4.0, "location": "Portland", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSyYrLtBFpiv7QpzyMKf3A4YHjJxHYdm0Xu4Q&s"},
#     {"id": 17, "title": "Botanical Garden Tour", "rating": 4.2, "location": "Portland", "image": "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/10/a3/0a/4e/beautiful-botanical-garden.jpg?w=800&h=500&s=1"},
#     {"id": 18, "title": "Horseback Riding", "rating": 4.3, "location": "Portland", "image": "https://rjclassics.com/cdn/shop/articles/English-riding-dressage-rider.jpg?v=1715610957"},
#     {"id": 19, "title": "ATV Adventure", "rating": 4.4, "location": "Portland", "image": "https://aceraft.com/wp-content/uploads/2019/05/new-river-gorge-atv-tour-ace-adventure-resort-3-scaled.jpg"},
#     {"id": 20, "title": "Escape Room", "rating": 4.1, "location": "Portland", "image": "https://m.media-amazon.com/images/I/91CVLmjQVJL.jpg"}
# ]


def extract_json(text):
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1:
        return text[start : end + 1]  # Extract JSON portion
    return None


activity_id_counter = count(1)

#DO NOT DELETE. THIS IS NEEDED FOR ADDING ACTIVITY TO ITINERARY
def generate_activity_number():
    return next(activity_id_counter)



# @app.route("/generate_itinerary/<user_id>/<location>", methods=["GET"])
# add this parameter later: city_data
def generate_itinerary(user_id, location, days, trip_id, city_data):
    print("generating itinerary")
    preferences = collection.find_one({"user_id": user_id}, {"_id": 0, "user_id": 0})
    preferences_str_format = json.dumps(
        preferences, indent=4, sort_keys=True, default=str
    )
    # print(preferences_str_format)
    preferences_str_format = json.dumps(
        preferences, indent=4, sort_keys=True, default=str
    )
    # print(preferences_str_format)
    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyAwoY2T2mB3Q7hEay8j_SwEaZktjxQOT7w"

    headers = {"Content-Type": "application/json"}
    #             \"time_frame\": ...the time the user will start the activity and the time they will end it. example format: {\"start\":\"9:00 AM\",\"end\":\"1:00 PM\"}...,
    #     The time frames for the activities may not overlap, unless it is ONLY the next best preference overlapping with ONLY one top preference.
    prompt = (
        """I am building a travel itinerary recommendation app.
    Here is the real-time city data for weather and hotels in that city: """
        + city_data
        + """\n
    Use the provided structured `city_data` above — it contains weather forecasts and hotel listings for the city.
    Use this information to make smart activity choices (e.g., recommend indoor activities on rainy days, outdoor ones on sunny days).
    Also consider hotel data for location or quality-based recommendations.

    Do NOT repeat hotel data in your output — just use it behind the scenes for better suggestions.
    If you do make a decision based on some weather condition, mention that weather in the "context" attribute in top preferences and next best preferences of the JSON below. 

    Given a user's travel preferences, destination, and the real-time city data provided, generate an itinerary with, for each day of the trip, 3 activities: 2 as top preferences and 1 as a next best preference.
    Activites must include meal recommendations. The itinerary should be personalized based on the user's interests and the best available options in the destination.

    Note: Do not use the ISO format for the date. Instead, use the format "Month Day, Year" (e.g., "April 2, 2025").

    Format the itinerary as the following JSON STRICTLY, NO OTHER WORDS:
        \"top_preferences\": [
            [
                {
                \"title\": ...title...,
                \"context\": ...Because you liked (and then list something specific in the preferences JSON. Then state the weather that explains the choice. example format: "since 2025-04-02 will have light rain and heavy wind, this indoor activity is perfect.")...,
                \"day\": ...the number of the itinerary day this activity takes place (starting at 0)...
                \"weather\": ...ALL weather for this day on the trip...,
                \"details\": {
                    \"name\": ...same as title...,
                    \"description\": ...description...,
                    \"number\": ...official phone number as (xxx) xxx-xxxx...,
                    \"address\": ...FULL GOOGLE-MAPS FRIENDLY ADDRESS...,
                    \"email\": ...official email address...,
                    \"hours\": {
                        \"sunday\": ...open times on this day. example format: {\"open\":\"10:00 AM\",\"close\":\"6:00 PM\"}...,
                        \"friday\": ...same format...,
                        \"monday\": ...same format...,
                        \"saturday\": ...same format...,
                        \"thursday\": ...same format...,
                        \"tuesday\": ...same format...,
                        \"wednesday\": ...same format...
                    },
                    \"rating\": ...rating out of 5 with 1 decimal place...,
                    \"experience\": ...description of how guests spend their time here...,
                    \"city\": ...(city), (country)...,
                    \"website\": ...link to the official website...
                }
                },
                ...
                for each other activity
                ...
            ],
            ...
            for each other day
            ...
            ],
        \"next_best_preferences\": exact same format as top_preferences\n
        
        The location is: """
        + location
        + """. The trip is """
        + str(days)
        + """ days long. Here are the user preferences:"""
        + preferences_str_format
    )

    # print(prompt)
    # Here is the real-time data for weather, activities, and/or hotels in that city: {city_data}

    data = {"contents": [{"parts": [{"text": prompt}]}]}

    response = requests.post(url, headers=headers, json=data)

    print(response.json())  # Print the response as JSON

    response_json = response.json()  # Your provided JSON response
    # print(json.dumps(response_json, indent=4))
    # print(response_json.keys())

    # Extract the text content
    text_content = extract_json(
        response_json["candidates"][0]["content"]["parts"][0]["text"]
    )

    print(text_content)

    # Parse the text as JSON
    parsed_json = json.loads(text_content)
    for day in parsed_json["top_preferences"]:
        for activity in day:
            #KEEP THIS
            activity["activityNumber"] = generate_activity_number()
            activity["details"]["images"] = get_image(activity["title"])
            activity["details"]["tripId"] = trip_id
            # print(activity)
            activity["activityID"] = activity_collection.insert_one(activity["details"]).inserted_id
            # print(activity["details"])

    for day in parsed_json["next_best_preferences"]:
        for activity in day:
            #KEEP THIS
            activity["activityNumber"] = generate_activity_number()
            activity["details"]["images"] = get_image(activity["title"])
            activity["details"]["tripId"] = trip_id
            activity["activityID"] = activity_collection.insert_one(activity["details"]).inserted_id
    #     print(activity)

    # print(parsed_json)

    itinerary_data = {
        "_id": trip_id,  # Same _id as the trip document
        "activities": parsed_json,  # Ensure activities are passed in the request
    }

    itinerary_collection.insert_one(itinerary_data)

    # return jsonify({"response": {}}), 200

    # return jsonify({"response": parsed_json}), 200

#WORKS: DO NOT MODIFY
def generate_restaurant_recommendations(user_id, location, trip_id, city_data):
    try:
        print("Generating restaurant recommendations")
        preferences = collection.find_one(
            {"user_id": user_id}, {"_id": 0, "user_id": 0}
        )
        preferences_str_format = json.dumps(
            preferences, indent=4, sort_keys=True, default=str
        )

        url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyAwoY2T2mB3Q7hEay8j_SwEaZktjxQOT7w"
    
        headers = {
            "Content-Type": "application/json"
        }
    
        prompt = """I am building a travel itinerary recommendation app.
        Here is the real-time city data for weather and hotels in that city: """ + city_data + """\n
        Use the provided structured `city_data` above — it contains weather forecasts and hotel listings for the city.
        Use this information to make smart restaurant choices.

        If you do make a decision based on some weather condition, mention that weather in the "context" attribute of the JSON below.

        Given a user's travel preferences, destination, and the real-time city data provided, generate a list of 10 restaurant recommendations.
        The recommendations should be personalized based on the user's food preferences and the best available options in the destination.
        Format it as the following JSON STRICTLY, NO OTHER WORDS:
    
        \"restaurants\": [
            {
                \"title\": ...restaurant name...,
                \"context\": ...Because you liked (and then list something specific in the preferences JSON and the weather that explains the choice)...,
                \"weather\": ...weather conditions for every day on the trip...,
                \"details\": {
                    \"name\": ...same as title...,
                    \"description\": ...description of the restaurant and its cuisine...,
                    \"number\": ...official phone number as (xxx) xxx-xxxx...,
                    \"address\": ...FULL GOOGLE-MAPS FRIENDLY ADDRESS...,
                    \"email\": ...official email address (if available)...,
                    \"hours\": {
                        \"sunday\": {\"open\": \"10:00 AM\", \"close\": \"10:00 PM\"},
                        \"friday\": ...same format...,
                        \"monday\": ...same format...,
                        \"saturday\": ...same format...,
                        \"thursday\": ...same format...,
                        \"tuesday\": ...same format...,
                        \"wednesday\": ...same format...,
                    },
                    \"rating\": ...rating out of 5 with 1 decimal place...,
                    \"experience\": ...description of the dining experience (e.g., fine dining, casual, rooftop, family-friendly, etc.)...,
                    \"city\": ...(city), (country)...,
                    \"website\": ...link to the official website...,
                },
            },
            ...
            9 more
            ...
        ]
    
        The location is: """ + location + """. Here are the user preferences:""" + preferences_str_format
    
        # print(prompt)

        data = {"contents": [{"parts": [{"text": prompt}]}]}

        response = requests.post(url, headers=headers, json=data)
        response_json = response.json()
        # print("Raw AI response:", response_json)
        # print(response_json)

    
        text_content = extract_json(response_json["candidates"][0]["content"]["parts"][0]["text"])

        # print("Text context: ", text_content)

        parsed_json = json.loads(text_content)
        #parsed_json = text_content
        # print("Parsed json: ", parsed_json)

        # print(parsed_json)

        for restaurant in parsed_json["restaurants"]:
            #KEEP THIS
            restaurant["activityNumber"] = generate_activity_number()
            restaurant["details"]["images"] = get_image(restaurant["title"])
            restaurant["details"]["tripId"] = trip_id
            restaurant["activityID"] = activity_collection.insert_one(restaurant["details"]).inserted_id
    
        print(parsed_json)

        itinerary_data = {"_id": trip_id, "restaurants": parsed_json["restaurants"]}

        restaurant_collection.insert_one(itinerary_data)
    except Exception as e:
        print(f"Error in generate_restaurant_recommendations: {e}")


def send_to_gemini(user_id, username, user_message, city_data):
    preferences = collection.find_one({"user_id": user_id}, {"_id": 0, "user_id": 0})
    preferences_str_format = json.dumps(
        preferences, indent=4, sort_keys=True, default=str
    )
    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyAwoY2T2mB3Q7hEay8j_SwEaZktjxQOT7w"
    prompt = f"""
    You are a helpful AI chatbot assisting users in a chat interface. Respond to the following user message from the user {username} in a friendly and informative manner.
    Also use their preferences to come up with an answer. Here are the user's preferences: {preferences_str_format}
    Here is the real-time city data: {city_data}

    Use the provided structured `city_data` above — it contains real time data such as current weather, weather forecasts, and/or hotel listings for the city.
    If the user asks for activities to do on some day, make smart activity choices based on the weather
    (e.g., recommend indoor activities on rainy days, outdoor ones on sunny days).
    If the user asks for hotels, use the top hotels information provided in the `city_data` above.

    User: {user_message}
    
    Guidelines:
    - Keep the response under 250 words.
    - Use a conversational and engaging tone.
    - Provide useful and relevant information.
    - Avoid excessive formalities.
    - Do not greet the user with the user's name in the response.
    - Start the response with a short, friendly phrase to set a helpful tone. 
        Use variations like:
        - “Absolutely!”
        - “Sure thing, fellow traveler!”
        - “You got it!”
        - “Happy to help!”
        - “Of course!”
        - “Definitely!”

    Overall, do not just output a bunch of text, but make it readable.
    If there are multiple items listed, please format them as a multiple paragraphs.
    Format with a single Markdown bullet per paragraph, with no extra blank lines in between.

    Use this format for any response with a list of items:
    * **Item 1:** Explanation of this item goes here.
    * **Item 2:** Explanation of this item goes here.
    * **Item 3:** Explanation of this item goes here.

    Example — Weather Format:

    * **April 1st:** [Your forecast here]
    * **April 2nd:** [Your forecast here]
    * **April 3rd:** [Your forecast here]

    Example — Hotel Format:

    * **Ballard Inn:** [Hotel description here]
    * **Embassy Suites by Hilton:** [Hotel description here]
    * **Mediterranean Inn:** [Hotel description here]

    Suggest a minimum of 3 hotels. If there are more, you can suggest up to 5 hotels.
    


    When listing different types of data (ie. weather, hotels, restaurants), always group them with a heading or introductory sentence *before* each group of bullet points.
    For example:

    * Start with a sentence introducing the weather for the trip.
    * Then use bullets for each day’s forecast.
    * Then include a short sentence like: “Here are a few hotel options that might suit your preferences:”
    * Then use bullets for hotel information.

    This improves readability and avoids combining unrelated bullet points in the same list without a sentence separating them.

    If you cannot find real time hotel data in the specific data I gave that matches conditions the user provided, you can confidently provide generic hotel data alternatives you can find on your own that matches the condition instead
    Chatbot:
    """
    data = {"contents": [{"parts": [{"text": prompt}]}]}

    headers = {"Content-Type": "application/json"}

    response = requests.post(url, headers=headers, json=data)

    # Extract raw response text
    raw_text = response.json()["candidates"][0]["content"]["parts"][0]["text"]

    # print(f"Gemini chatbot response: {chatbot_response}\n\n")
    print(f"Gemini chatbot response before cleaning: {raw_text}\n\n")
    # Clean markdown formatting
    chatbot_response = clean_response_markdown(raw_text)
    print(f"Gemini chatbot response after cleaning: {chatbot_response}\n\n")

    # Return the cleaned chatbot response
    return chatbot_response


# def clean_response_markdown(text):
#     import re

#     # Normalize bullets
#     text = re.sub(r"\n\s*\*\s", r"\n* ", text)

#     # Collapse extra newlines
#     text = re.sub(r"\n{3,}", "\n\n", text)

#     # Insert newline between last bullet and next paragraph
#     text = re.sub(r"(\*\*.*?\*\:.*?\n)(?=[^\*\n])", r"\1\n", text)

#     return text.strip()


def clean_response_markdown(text):
    import re

    # Normalize bullets
    text = re.sub(r"\n\s*\*\s", r"\n* ", text)

    # Add a newline between two sentences if they're separated by only one and both are NOT bullets
    text = re.sub(r"([^\n*])\n([^\n*])", r"\1\n\n\2", text)

    # Collapse 3+ newlines to just 2
    text = re.sub(r"\n{3,}", "\n\n", text)

    # Add a newline after a bullet block before non-bullet text if needed
    text = re.sub(r"(\*\*.*?\*\:.*?\n)(?=[^\*\n])", r"\1\n", text)

    return text.strip()


@app.route("/send_message", methods=["POST", "OPTIONS"])
def send_message():
    if request.method == "OPTIONS":
        return jsonify({"message": "CORS preflight passed"}), 200

    data = request.json
    print(f"Data: {data}")
    user_id = data.get("user_id")
    trip_id = data.get("trip_id")
    username = data.get("sender")
    user_message = data.get("message")

    if not user_id or not user_message:
        return jsonify({"error": "Missing user_id or message"}), 404

    # Save user message
    user_msg_entry = {
        "user_id": user_id,
        "trip_id": trip_id,
        "sender": username,
        "receiver": "chatbot",
        "message": user_message,
        "timestamp": datetime.now(),
    }
    messages_collection.insert_one(user_msg_entry)

    # Get chatbot response
    user_query = f"""
        You are helping a traveler with a trip to {data.get("location")} from {data.get("startDate")} to {data.get("endDate")}.
        Use tools to answer the question as needed — for example:
        
        - Use the fetch_weather_for_trip_tool if they ask about weather forecasts for every day on that trip.
        Specifically, describe the temperature, feels like temperature, humidity, wind speed, and any other important weather conditions
        for every day from the start date till the end date.
        
        - Use the fetch_hotels_tool if they ask about the hotels in a city.
        Specifically describe the name, rating, and price of hotels in the city.

        - Use the fetch_current_weather_tool if they ask about the current weather.
        Specifically, describe the temperature, feels like temperature, humidity, wind speed, and any other important weather conditions for the current weather.

        - You can use mulitple tools if the user asks about multiple types of data.
        For example, if they ask about both the weather and hotels, you can use both tools.

        User query: "{data.get("message")}"
        """
    agent = get_langchain_agent(OPENAI_API_KEY)
    try:
        city_data = agent.run(user_query)
    except Exception as e:
        print("Error while running agent:", str(e))
        city_data = "Error: Too much input data or agent failed."

    print("\n\nCity data for chatbot:", city_data)

    chatbot_response = send_to_gemini(user_id, username, user_message, city_data)
    # print(f"Gemini chatbot response: {chatbot_response}\n\n")

    # Save chatbot response
    chatbot_msg_entry = {
        "user_id": user_id,
        "trip_id": trip_id,
        "sender": "chatbot",
        "receiver": username,
        "message": chatbot_response,
        "timestamp": datetime.now(),
    }
    messages_collection.insert_one(chatbot_msg_entry)
    response = jsonify({"response": chatbot_response})
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response, 200

@app.route("/get_messages/<user_id>/<trip_id>", methods=["GET", "OPTIONS"])
def get_messages(user_id, trip_id):
    if request.method == "OPTIONS":
        return jsonify({"message": "CORS preflight passed"}), 200
    #messages = list(messages_collection.find({"user_id": user_id}, {"_id": 0}))
    try:
        messages = list(messages_collection.find({"user_id": user_id, "trip_id": trip_id}, {"_id": 0}))
        if not messages:
            return jsonify({"error": "Error getting messages"}), 404
        response = jsonify(messages)
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response, 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# @app.route("/get_messages/<user_id>", methods=["GET", "OPTIONS"])
# def get_messages(user_id):
#     if request.method == "OPTIONS":
#         return jsonify({"message": "CORS preflight passed"}), 200
#     messages = list(messages_collection.find({"user_id": user_id}, {"_id": 0}))
#     if not messages:
#         return jsonify({"error": "Error getting messages"}), 404
#     response = jsonify(messages)
#     response.headers.add("Access-Control-Allow-Origin", "*")
#     return response, 200


# @app.route('/get_image/<query>')
def get_image(query):
    # Search query
    # query = "Sushi"

    # Define the API URL
    url = f"https://www.googleapis.com/customsearch/v1?q={query}&key={IMAGE_API_KEY}&cx={IMAGE_CX}&searchType=image"

    # Make the request
    response = requests.get(url)
    output = []

    # Check if request was successful
    if response.status_code == 200:
        data = response.json()

        if "items" in data and len(data["items"]) > 0:
            output = [item["link"] for item in data["items"][:6]]   # Limit to 6 images
            
            for i, link in enumerate(output):
                print(f"Image {i+1} URL:", link)
        else:
            print("No images found for the search query.")
    else:
        print(f"Ran over quota")
        print(url)
        # print(f"Error: {response.status_code}, {response.text}")

    return output

    # return jsonify({"response": first_image_url}), 200


# @app.route(
#     "/delete_itinerary_activity/<trip_id>/<activityID>",
#     methods=["GET", "DELETE", "POST", "OPTIONS"],
# )
# def delete_itinerary_activity(trip_id, activityID):
#     if request.method == "OPTIONS":
#         return jsonify({"message": "CORS preflight passed"}), 200

#     itinerary = itinerary_collection.find_one({"_id": ObjectId(trip_id)})

#     if not itinerary:
#         return jsonify({"error": "Itinerary not found"}), 404

#     # updated_top = [act for act in itinerary["activities"]["top_preferences"] if act["details"]["_id"] != activityID]
#     # updated_next_best = [act for act in itinerary["activities"]["next_best_preferences"] if act["details"]["_id"] != activityID]
#     itinerary_collection.update_one(
#         {"_id": ObjectId(trip_id)},
#         {
#             "$pull": {
#                 "activities.top_preferences": {"details._id": ObjectId(activityID)}
#                 # "activities.next_best_preferences": {"details._id": ObjectId(activityID)}
#             }
#         },
#     )
#     response = jsonify({"message": "Activity deleted successfully"})
#     response.headers.add("Access-Control-Allow-Origin", "*")
#     return response, 200


def convert_objectid(itinerary):
    if isinstance(itinerary, dict):
        return {key: convert_objectid(value) for key, value in itinerary.items()}
    elif isinstance(itinerary, list):
        return [convert_objectid(item) for item in itinerary]
    elif isinstance(itinerary, ObjectId):
        return str(itinerary)
    else:
        return itinerary

#USED TO ADD ACTIVITY. DO NOT CHANGE
@app.route(
    "/move_itinerary_activity/<trip_id>/<int:activityID>",
    methods=["GET", "POST", "OPTIONS"],
)
def move_itinerary_activity(trip_id, activityID):
    if request.method == "OPTIONS":
        return jsonify({"message": "CORS preflight passed"}), 200

    itinerary = itinerary_collection.find_one({"_id": ObjectId(trip_id)})
    if not itinerary:
        return jsonify({"error": "Itinerary not found"}), 404
    
    next_best_preferences = itinerary.get("activities", {}).get("next_best_preferences", [])
    top_preferences = itinerary.get("activities", {}).get("top_preferences", [])

    found_activity = None
    updated_next_best = []

    for day_activities in next_best_preferences:
        filtered_activities = []
        for act in day_activities:
            if act["activityNumber"] == activityID:
                found_activity = act  
            else:
                filtered_activities.append(act)
        
        if filtered_activities:
            updated_next_best.append(filtered_activities)  

    if not found_activity:
        return jsonify({"error": "Activity not found in next_best_preferences"}), 404

    day_index = found_activity["day"]
    while len(top_preferences) <= day_index:
        top_preferences.append([]) 

    top_preferences[day_index].append(found_activity)

    itinerary_collection.update_one(
        {"_id": ObjectId(trip_id)},
        {
            "$set": {
                "activities.top_preferences": top_preferences,
                "activities.next_best_preferences": updated_next_best,
            }
        },
    )

    response = jsonify(
        {
            "message": "Activity moved successfully",
            "updated_itinerary": convert_objectid(itinerary),
        }
    )
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response

    # next_best = itinerary.get("activities", {}).get("next_best_preferences", [])
    # activity = next(
    #     (act for act in next_best if act["details"]["_id"] == activityID), None
    # )
    # if not activity:
    #     return jsonify({"error": "Activity not found in next_best_preferences"}), 404

    # updated_next_best = [
    #     act for act in next_best if act["details"]["_id"] != activityID
    # ]

    # itinerary["activities"]["top_preferences"].append(activity)

    # itinerary_collection.update_one(
    #     {"_id": ObjectId(trip_id)},
    #     {
    #         "$set": {
    #             "activities.top_preferences": itinerary["activities"][
    #                 "top_preferences"
    #             ],
    #             "activities.next_best_preferences": updated_next_best,
    #         }
    #     },
    # )

    # response = jsonify(
    #     {
    #         "message": "Activity moved successfully",
    #         "updated_itinerary": convert_objectid(itinerary),
    #     }
    # )
    # response.headers.add("Access-Control-Allow-Origin", "*")
    # return response


# @app.route(
#     "/move_restaurant_activity/<trip_id>/<int:activityID>",
#     methods=["GET", "POST", "OPTIONS"],
# )
# def move_restaurant_activity(trip_id, activityID):
#     if request.method == "OPTIONS":
#         return jsonify({"message": "CORS preflight passed"}), 200

#     itinerary = itinerary_collection.find_one({"_id": ObjectId(trip_id)})
#     if not itinerary:
#         return jsonify({"error": "Itinerary not found"}), 404
#     restaurant = restaurant_collection.find_one({"_id": ObjectId(trip_id)})
#     if not restaurant:
#         return jsonify({"error": "Restaurant not found"}), 404

#     next_best = restaurant.get("restaurants", [])
#     activity = next(
#         (act for act in next_best if act.get("activityNumber") == activityID), None
#     )
#     if not activity:
#         return jsonify({"error": "Restaurant not found"}), 404

#     itinerary["activities"]["top_preferences"].append(activity)

#     itinerary_collection.update_one(
#         {"_id": ObjectId(trip_id)},
#         {
#             "$set": {
#                 "activities.top_preferences": itinerary["activities"][
#                     "top_preferences"
#                 ],
#             }
#         },
#     )

#     response = jsonify(
#         {
#             "message": "Activity moved successfully",
#             "updated_itinerary": convert_objectid(itinerary),
#         }
#     )
#     response.headers.add("Access-Control-Allow-Origin", "*")
#     return response

#USED TO ADD RESTAURANT. DO NOT CHANGE
@app.route(
    "/move_restaurant_activity/<trip_id>/<int:activityID>/<int:day>",
    methods=["GET", "POST", "OPTIONS"],
)
def move_restaurant_activity(trip_id, activityID, day):
    if request.method == "OPTIONS":
        return jsonify({"message": "CORS preflight passed"}), 200

    itinerary = itinerary_collection.find_one({"_id": ObjectId(trip_id)})
    if not itinerary:
        return jsonify({"error": "Itinerary not found"}), 404
    
    restaurant = restaurant_collection.find_one({"_id": ObjectId(trip_id)})
    if not restaurant:
        return jsonify({"error": "Restaurant not found"}), 404

    next_best = restaurant.get("restaurants", [])
    activity = next(
        (act for act in next_best if act.get("activityNumber") == activityID), None)

    if not activity:
        return jsonify({"error": "Restaurant not found"}), 404
    
    activity["day"] = day

    while len(itinerary["activities"]["top_preferences"]) <= day:
        itinerary["activities"]["top_preferences"].append([])

    itinerary["activities"]["top_preferences"][day].append(activity)

    itinerary_collection.update_one(
        {"_id": ObjectId(trip_id)},
        {"$set": {f"activities.top_preferences.{day}": itinerary["activities"]["top_preferences"][day]}}
    )

    response = jsonify(
        {
            "message": "Activity moved successfully",
            "updated_itinerary": convert_objectid(itinerary),
        }
    )
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response


@app.route("/update_activity_order/<trip_id>", methods=["GET", "POST", "OPTIONS"])
def update_activity_order(trip_id):
    if request.method == "OPTIONS":
        return jsonify({"message": "CORS preflight passed"}), 200

    data = request.get_json()
    new_order = data.get("activities", [])
    index = data.get("index")

    if not isinstance(new_order, list) or not isinstance(index, int):
        return jsonify({"error": "Invalid data format"}), 400

    itinerary = itinerary_collection.find_one({"_id": ObjectId(trip_id)})
    if not itinerary:
        return jsonify({"error": "Itinerary not found"}), 404

    top_preferences = itinerary.get("activities", {}).get("top_preferences", [])

    if index >= len(top_preferences):
        return jsonify({"error": "Invalid day index"}), 400

    top_preferences[index] = new_order

    itinerary_collection.update_one(
        {"_id": ObjectId(trip_id)},
        {"$set": {"activities.top_preferences": top_preferences}},
    )

    response = jsonify({"message": "Activity order updated successfully"})
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response


# WARNING I think this is unnecessary but not sure

# @app.route("/get_activities", methods=["POST"])
# def get_activities():
#     #data = request.get_json()
#     #trip_id = data.get("trip_id")

#     #if not trip_id:
#     #    return jsonify({"error": "Missing trip_id"}), 400

#     activities = {
#         "top_preferences": [
#             {
#                 "id": activity["id"],
#                 "title": activity["title"],
#                 "rating": activity["rating"],
#                 "image": activity["image"],
#                 "location": activity["location"]
#             }
#             for activity in top_preferences
#         ],
#         "next_best_preferences": [
#             {
#                 "id": activity["id"],
#                 "title": activity["title"],
#                 "rating": activity["rating"],
#                 "image": activity["image"],
#                 "location": activity["location"]
#             }
#             for activity in next_best_preferences
#         ]
#     }

#     trip_id = str(uuid.uuid4())

#     return jsonify({"trip_id": trip_id, "activities": activities})

if __name__ == "__main__":
    app.run(port=PORT, debug=True)
