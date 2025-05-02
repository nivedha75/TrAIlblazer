from flask import Flask, request, jsonify, session, make_response, send_from_directory
from werkzeug.utils import secure_filename
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime, timezone, timedelta
from itertools import count
from bson import ObjectId  # Import ObjectId for MongoDB ID conversion for user_id
import os
from urllib.parse import urlparse
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


load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
IMAGE_API_KEY = os.getenv("IMAGE_API_KEY")
IMAGE_CX = os.getenv("IMAGE_CX")
basedir = os.path.abspath(os.path.dirname(__file__))
UPLOAD_FOLDER = os.path.join(basedir, "static/uploads")
# UPLOAD_FOLDER = "static/uploads"
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}

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
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
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
forum_collection = db["forum_posts"]
profiles = db["profiles"]
suggestions_collection = db["suggestions"]


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

    # interests = []
    # if "activityPreferences" in survey_data:
    #     interests.extend(survey_data["activityPreferences"])
    # if "socialEnterAct" in survey_data:
    #     interests.extend(survey_data["socialEnterAct"])

    # if interests:
    #     profiles.update_one(
    #         {"userId": user_id},
    #         {"$set": {"interests": ", ".join(interests)}},
    #         upsert=True,
    #     )
    new_interests = []
    if "activityPreferences" in survey_data:
        new_interests.extend(survey_data["activityPreferences"])
    if "socialEnterAct" in survey_data:
        new_interests.extend(survey_data["socialEnterAct"])

    if new_interests:
        profile = profiles.find_one({"userId": user_id})
        current_interests = []

        if profile and "interests" in profile and profile["interests"]:
            current_interests = [i.strip() for i in profile["interests"].split(",")]

        merged = current_interests + [
            i for i in new_interests if i not in current_interests
        ]
        merged_str = ", ".join(merged)

        profiles.update_one(
            {"userId": user_id},
            {"$set": {"interests": merged_str}},
            upsert=True,
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

        # interests = []
        # if "activityPreferences" in data:
        #     interests.extend(data["activityPreferences"])
        # if "socialEnterAct" in data:
        #     interests.extend(data["socialEnterAct"])

        # if interests:
        #     profiles.update_one(
        #         {"userId": data["user_id"]},
        #         {"$set": {"interests": ", ".join(interests)}},
        #         upsert=True,
        #     )

        new_interests = []
        if "activityPreferences" in data:
            new_interests.extend(data["activityPreferences"])
        if "socialEnterAct" in data:
            new_interests.extend(data["socialEnterAct"])

        if new_interests:
            profile = profiles.find_one({"userId": data["user_id"]})
            current_interests = []

            if profile and "interests" in profile and profile["interests"]:
                current_interests = [i.strip() for i in profile["interests"].split(",")]

            merged = current_interests + [
                i for i in new_interests if i not in current_interests
            ]
            merged_str = ", ".join(merged)

            profiles.update_one(
                {"userId": data["user_id"]},
                {"$set": {"interests": merged_str}},
                upsert=True,
            )

        return jsonify({"message": "Survey data saved successfully"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

def build_city_itinerary(starting_city, starting_days, additional_destinations):
    itinerary = []
    day_counter = 1
    itinerary.append({
        "city": starting_city,
        "startDay": day_counter,
        "endDay": day_counter + starting_days - 1
    })
    day_counter += starting_days

    for dest in additional_destinations:
        city = dest.get("city")
        days = dest.get("days")
        if city and days:
            itinerary.append({
                "city": city,
                "startDay": day_counter,
                "endDay": day_counter + days - 1
            })
            day_counter += days
    return itinerary

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
            itinerary = build_city_itinerary(
                data["startingCity"],
                data["startingCityDays"],
                data.get("additionalDestinations", [])
            )

            cities_string = "; ".join([
                f"Day {entry['startDay']}–{entry['endDay']}: {entry['city']}"
                for entry in itinerary
            ])

            trip_result = trip_collection.insert_one(
                {
                    "userId": data["userId"],
                    "collaborators": data["collaborators"],
                    "collaboratorsNames": data["collaboratorsNames"],
                    "name": data["name"],
                    "location": data["startingCity"],
                    "additionalDestinations": data["additionalDestinations"],
                    "transportation": data["transportation"],
                    "days": data["days"],
                    "startDate": data["startDate"],
                    "endDate": data["endDate"],
                    "timeRanges": data["timeRanges"],
                    "people": data["people"],
                    "images": data["images"],
                    "itinerary": itinerary
                }
            )
            data["location"] = data["startingCity"]
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
                    data["userId"],
                    cities_string,
                    data["days"],
                    trip_id,
                    city_data,
                    itinerary,
                    data["timeRanges"]
                )
            except Exception as e:
                print(f"Error in generate_itinerary: {e}")

            print("Calling generate_restaurant_recommendations...")  # Debugging
            generate_restaurant_recommendations(
                data["userId"],
                cities_string,
                trip_id,
                city_data,
                itinerary
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


@app.route("/trips/share/user/<user_id>", methods=["GET"])
def get_shared_trips_by_user(user_id):
    try:
        trips = trip_collection.find({"collaborators": int(user_id)})
        trip_list = []
        for trip in trips:
            trip["_id"] = str(trip["_id"])
            trip_list.append(trip)
        return jsonify(trip_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/trips/add-collaborator/<trip_id>", methods=["POST"])
def add_user_as_collaborator(trip_id):
    data = request.get_json()
    name = data.get("name")
    email = data.get("email")

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
        return jsonify({"error": "User doesn't exist"}), 401

    user_id = user[0]
    print(user_id)

    try:
        if str(user_id) == str(
            trip_collection.find_one({"_id": ObjectId(trip_id)}).get("userId")
        ):
            return jsonify({"message": "User already the owner"}), 200

        if user_id in trip_collection.find_one({"_id": ObjectId(trip_id)}).get(
            "collaborators", []
        ):
            return jsonify({"message": "User already a collaborator"}), 200

        trip_collection.update_one(
            {"_id": ObjectId(trip_id)},
            {"$addToSet": {"collaborators": user_id, "collaboratorsNames": name}},
        )
        return jsonify({"message": "Collaborator added successfully"}), 200
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
            # for day in itinerary["activities"]["top_preferences"]:
            #     for act in day:
            #         if act["details"]["tripId"]:
            #             act["details"]["tripId"] = str(act["details"]["tripId"])
            #         if act["details"]["_id"]:
            #             act["details"]["_id"] = str(act["details"]["_id"])
            #         if act["activityID"]:
            #             act["activityID"] = str(act["activityID"])
            for day in itinerary["activities"]["top_preferences"]:
                for act in day:
                    if "details" in act:
                        if "tripId" in act["details"]:
                            act["details"]["tripId"] = str(act["details"]["tripId"])
                        if "_id" in act["details"]:
                            act["details"]["_id"] = str(act["details"]["_id"])
                    if "activityID" in act:
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
        import traceback

        traceback.print_exc()
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


# DO NOT DELETE. THIS IS NEEDED FOR ADDING ACTIVITY TO ITINERARY
def generate_activity_number():
    return next(activity_id_counter)

def build_city_day_mapping(itinerary):
    return "\n".join([
        f"Day {entry['startDay']} to {entry['endDay']}: {entry['city']}"
        for entry in itinerary
    ])


# Helper function to normalize time strings like "7 PM" -> "7:00 PM"
def normalize_time_str(time_str):
    if ':' not in time_str:
        time_str = time_str.replace(' AM', ':00 AM').replace(' PM', ':00 PM')
    return time_str

# Convert "7:00 PM" to datetime object
def parse_time(time_str):
    return datetime.strptime(normalize_time_str(time_str), "%I:%M %p")

# Convert datetime object back to "h:mm AM/PM" string
def format_time(dt):
    return dt.strftime("%-I:%M %p")


# @app.route("/generate_itinerary/<user_id>/<location>", methods=["GET"])
# add this parameter later: city_data
def generate_itinerary(user_id, location, days, trip_id, city_data, itinerary, time_ranges):
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

    # url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyAwoY2T2mB3Q7hEay8j_SwEaZktjxQOT7w"
    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-04-17:generateContent?key=AIzaSyAwoY2T2mB3Q7hEay8j_SwEaZktjxQOT7w"

    headers = {"Content-Type": "application/json"}
    #             \"time_frame\": ...the time the user will start the activity and the time they will end it. example format: {\"start\":\"9:00 AM\",\"end\":\"1:00 PM\"}...,
    #     The time frames for the activities may not overlap, unless it is ONLY the next best preference overlapping with ONLY one top preference.
    city_mapping_str = build_city_day_mapping(itinerary)
    days = itinerary[-1]["endDay"]

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
    
    Additionally, schedule the activities (even though I don't need the actual times) such that they fall within the active time range for their day, can have a half hour between them, and do not overlap with other activities on the same day. Here is the list of time ranges (containing an object for each day and inside these objects a start time followed by an end time): """
        + str(time_ranges)
        + """\n
        
    ** Important Note: Do not use the ISO format for the date in your response. Instead, use the format "Month Day, Year" (e.g., "April 2, 2025").

    The itinerary spans multiple cities. Please refer to the following city-day mapping:
    """
        + city_mapping_str
        + """

    Distribute activities across the cities as shown above. Prefer not to split a single day across cities. If a city spans 3 days, all 3 days should ideally be in that city unless absolutely necessary.

    Format the itinerary as the following JSON STRICTLY, NO OTHER WORDS:
        \"top_preferences\": [
            [
                {
                \"title\": ...title...,
                \"context\": ...Because you liked (and then list something specific in the preferences JSON. Then state the weather that explains the choice. example format: "since April 2, 2025 will have light rain and heavy wind, this indoor activity is perfect.")...,
                \"day\": ...the number of the itinerary day this activity takes place (starting at 0)...
                \"length\": ...the number of half hours that this activity should take. (i.e. if an activity takes 1.5 hours, this value is 3)...,                
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
        
        The trip is """
            + str(days)
            + """ days long. Here are the user preferences:"""
            + preferences_str_format
    )

    print(prompt)
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
    day_index = 0
    for day in parsed_json["top_preferences"]:
        day_index = day_index + 1
        day_key = f"Day {day_index}"
        day_time_range = time_ranges.get(day_key)
        day_curr = parse_time(day_time_range["start"])
        # TODO: Going to trust the end time isn't exceeded too much
        # day_end = parse_time(day_time_range["end"])
        for activity in day:
            # KEEP THIS
            activity["activityNumber"] = generate_activity_number()
            activity["likes"] = 0
            activity["likedBy"] = []
            activity["dislikes"] = 0
            activity["dislikedBy"] = []
            activity["details"]["images"] = get_image(activity["title"])
            activity["details"]["tripId"] = trip_id
            activity["activityID"] = activity_collection.insert_one(
                activity["details"]
            ).inserted_id
            
            duration_minutes = activity["length"] * 30
            activity_end = day_curr + timedelta(minutes=duration_minutes)
            # TODO: Going to trust the end time isn't exceeded too much
            # if activity_end > day_end:
            #     print(f"Skipping activity {activity['title']} on {day_key} due to time overflow.")
            #     continue  # or break if you want to stop the day's schedule
            activity["range"] = {
                "start": format_time(day_curr),
                "end": format_time(activity_end)
            }
            day_curr = activity_end + timedelta(minutes=30)

    for day in parsed_json["next_best_preferences"]:
        for activity in day:
            # KEEP THIS
            activity["activityNumber"] = generate_activity_number()
            activity["likes"] = 0
            activity["likedBy"] = []
            activity["dislikes"] = 0
            activity["dislikedBy"] = []
            activity["details"]["images"] = get_image(activity["title"])
            activity["details"]["tripId"] = trip_id
            activity["activityID"] = activity_collection.insert_one(
                activity["details"]
            ).inserted_id

    # print(parsed_json)

    itinerary_data = {
        "_id": trip_id,  # Same _id as the trip document
        "activities": parsed_json,  # Ensure activities are passed in the request
    }

    itinerary_collection.insert_one(itinerary_data)

    # return jsonify({"response": {}}), 200

    # return jsonify({"response": parsed_json}), 200


# WORKS: DO NOT MODIFY
def generate_restaurant_recommendations(user_id, location, trip_id, city_data, itinerary):
    try:
        print("Generating restaurant recommendations")
        preferences = collection.find_one(
            {"user_id": user_id}, {"_id": 0, "user_id": 0}
        )
        preferences_str_format = json.dumps(
            preferences, indent=4, sort_keys=True, default=str
        )

        # url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyAwoY2T2mB3Q7hEay8j_SwEaZktjxQOT7w"
        url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-04-17:generateContent?key=AIzaSyAwoY2T2mB3Q7hEay8j_SwEaZktjxQOT7w"

        headers = {"Content-Type": "application/json"}

        city_mapping_str = build_city_day_mapping(itinerary)
        days = itinerary[-1]["endDay"]

        prompt = (
            """I am building a travel itinerary recommendation app.
        Here is the real-time city data for weather and hotels in that city: """
            + city_data
            + """\n
        Use the provided structured `city_data` above — it contains weather forecasts and hotel listings for the city.
        Use this information to make smart restaurant choices.

        If you do make a decision based on some weather condition, mention that weather in the "context" attribute of the JSON below.

        Given a user's travel preferences, destination, and the real-time city data provided, generate a list of 10 restaurant recommendations.
        The recommendations should be personalized based on the user's food preferences and the best available options in the destination.

            The itinerary spans multiple cities. Please refer to the following city-day mapping:
        """
            + city_mapping_str
            + """

        Format it as the following JSON STRICTLY, NO OTHER WORDS:
    
        \"restaurants\": [
            {
                \"title\": ...restaurant name...,
                \"context\": ...Because you liked (and then list something specific in the preferences JSON and the weather that explains the choice)...,
                \"length\": ...the number of half hours that this activity should take. (i.e. if an activity takes 1.5 hours, this value is 3)...,
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
    
        The trip is """
            + str(days)
            + """ days long. Here are the user preferences:"""
            + preferences_str_format
        )

        # print(prompt)

        data = {"contents": [{"parts": [{"text": prompt}]}]}

        response = requests.post(url, headers=headers, json=data)
        print(response)
        response_json = response.json()
        # print("Raw AI response:", response_json)
        # print(response_json)

        text_content = extract_json(
            response_json["candidates"][0]["content"]["parts"][0]["text"]
        )

        # print("Text context: ", text_content)

        parsed_json = json.loads(text_content)
        # parsed_json = text_content
        # print("Parsed json: ", parsed_json)

        # print(parsed_json)

        for restaurant in parsed_json["restaurants"]:
            # KEEP THIS
            restaurant["activityNumber"] = generate_activity_number()
            restaurant["likes"] = 0
            restaurant["likedBy"] = []
            restaurant["dislikes"] = 0
            restaurant["dislikedBy"] = []
            restaurant["details"]["images"] = get_image(restaurant["title"])
            restaurant["details"]["tripId"] = trip_id
            restaurant["activityID"] = activity_collection.insert_one(
                restaurant["details"]
            ).inserted_id

        print(parsed_json)

        itinerary_data = {"_id": trip_id, "restaurants": parsed_json["restaurants"]}

        restaurant_collection.insert_one(itinerary_data)
    except Exception as e:
        print(f"Error in generate_restaurant_recommendations: {e}")


@app.route("/api/generate_suggestions", methods=["GET", "POST", "OPTIONS"])
def generate_suggestions():
    if request.method == "OPTIONS":
        return jsonify({"message": "CORS preflight passed"}), 200

    try:
        data = request.get_json()
        print(data)
        user_id = data["user_id"]
        place = data["place"]
        place_id = data["place_id"]

        preferences = collection.find_one(
            {"user_id": user_id}, {"_id": 0, "user_id": 0}
        )
        preferences_str = json.dumps(preferences, indent=4, sort_keys=True, default=str)

        prompt = f"""
            I am building a travel app. Recommend 2 unique and engaging activities for the location: {place}
            personalized for the user based on the following preferences:\n{preferences_str}
            
            Respond ONLY in the following JSON format:

            {{
                "activities": [
                    {{
                        "title": "...",
                        "rating": ...,
                        "description": "...",
                        "context": "Because you liked ... and given the current weather ...",
                        "place_id": "{place_id}",
                        "user_id": "{user_id}"
                    }},
                    ...
                ]
            }}
            """

        # url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyAwoY2T2mB3Q7hEay8j_SwEaZktjxQOT7w"
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-04-17:generateContent?key=AIzaSyAwoY2T2mB3Q7hEay8j_SwEaZktjxQOT7w"
        headers = {"Content-Type": "application/json"}
        data = {"contents": [{"parts": [{"text": prompt}]}]}
        response = requests.post(url, headers=headers, json=data)
        # data = {"contents": [{"parts": [{"text": prompt}]}]}

        #     response = requests.post(url, headers=headers, json=data)
        #     response_json = response.json()
        #     # print("Raw AI response:", response_json)
        #     # print(response_json)

        #     text_content = extract_json(
        #         response_json["candidates"][0]["content"]["parts"][0]["text"]
        #     )

        #     # print("Text context: ", text_content)

        #     parsed_json = json.loads(text_content)

        raw = response.json()
        print(f"raw: {raw}")
        content = raw["candidates"][0]["content"]["parts"][0]["text"]
        text_context = extract_json(content)  # make sure this returns valid JSON string
        print(f"text context: {text_context}")
        generated = json.loads(text_context)
        print(f"Generated: {generated}")
        saved_activities = []
        for activity in generated["activities"]:
            activity["place_id"] = place_id
            activity["user_id"] = user_id
            suggestions_collection.insert_one(activity)
            activity_copy = activity.copy()
            activity_copy.pop("_id", None)
            saved_activities.append(activity_copy)
        return jsonify({"success": True, "activities": saved_activities}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/activities/<place_id>/<user_id>", methods=["GET", "OPTIONS"])
def get_user_place_activities(place_id, user_id):
    if request.method == "OPTIONS":
        return jsonify({"message": "CORS preflight passed"}), 200

    try:
        activities = list(
            suggestions_collection.find(
                {"place_id": place_id, "user_id": user_id},
                {"_id": 0},  # exclude MongoDB ObjectId
            )
        )
        return jsonify({"activities": activities}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def send_to_gemini(user_id, username, user_message, city_data):
    preferences = collection.find_one({"user_id": user_id}, {"_id": 0, "user_id": 0})
    preferences_str_format = json.dumps(
        preferences, indent=4, sort_keys=True, default=str
    )
    print("Inside send_to_gemini function")
    # url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyAwoY2T2mB3Q7hEay8j_SwEaZktjxQOT7w"
    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-04-17:generateContent?key=AIzaSyAwoY2T2mB3Q7hEay8j_SwEaZktjxQOT7w"
    prompt = f"""
    You are a helpful AI chatbot assisting users in a chat interface. Respond to the following user message from the user {username} in a friendly and informative manner.
    Also use their preferences to come up with an answer. Here are the user's preferences: {preferences_str_format}
    Here is the real-time city data: {city_data}

    Use the provided structured `city_data` above — it contains real time data such as current weather, weather forecasts, and/or hotel listings for the city.
    It also may contain activities and/or attractions in the city. If it gives some list of activities/attractions, give all activities/attractions in the chatbot response.
    Ie. if the city_data contains 5 activities/attractions, give all activities/attractions in the chatbot response - can be longer response over 500 words if needed.
    If the user asks for activities to do on some day, make smart activity choices based on the weather
    (e.g., recommend indoor activities on rainy days, outdoor ones on sunny days).

    If the user asks for hotels, use the top hotels information provided in the `city_data` above.

    User: {user_message}
    
    Guidelines:
    - Keep the response under 250 words if they don't ask about activities or attractions
    - Keep the response under 700 words if they ask about activities or attractions
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

    Example — Actvities and/or Attractions Format:

    * **Space Needle:** [Description here]
    * **Museum Of Pop Culture:** [Description here]
    * **Pike Place Market:** [Description here]
    * **Chihuly Garden and Glass:** [[Description here]
    * **The Museum Of Flight:** [Description here]

    Important Note: List all activities/attractions in the city_data in the response (even if they are not related to the user preferences).
    
    Also, for each activity/attraction, do NOT make the key for each bullet point based on day number, since the user will chose the day they do each activity later.
    That's why the default day field is "day 0" in the city_data.
    Instead, make the key value based on the activity/attraction name.
    Important: If the user is asking about activities/attractions, do NOT mention words day 0, day 1, day 2, etc. in the entire chatbot response.
    Also, do NOT include any weather information for each activity/attraction in the response if the user is asking about activities/attractions.

    Important: Use the exact title field given in city_data for each activity/attraction's bullet point.
    Ie. if the title field in city_data is "Visit the Space Needle", use that exact title in the bullet point.
    (Example: Visit the Space Needle: An observation tower in Seattle, Washington, a landmark of the Pacific Northwest, and an icon of Seattle. Guests can enjoy 360-degree views of the city, mountains, and waters from the observation deck...)
    Do NOT paraphrase to ie. "Space Needle: ..." or "The Space Needle: ..." or "The Seattle Space Needle: ...".

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

    try:
        response = requests.post(url, headers=headers, json=data)
        print(f"Gemini chatbot response: {response.json()}\n\n")

        # Extract raw response text
        raw_text = response.json()["candidates"][0]["content"]["parts"][0]["text"]
    except Exception as e:
        print("Gemini is unavailable right now. Please try again later.")
        return "Gemini is unavailable right now. Please try again later."

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

    user_message_lower = user_message.lower()

    is_about_activities = any(
        keyword in user_message_lower
        for keyword in [
            "activities",
            "attractions",
            "things to do",
            "places to visit",
            "attraction",
            "activity",
        ]
    )

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

    user_query = (
        f"""
    You are helping a traveler with a trip to {data.get("location")} from {data.get("startDate")} to {data.get("endDate")}.
    Here is the user query: {user_message}
    
    If the user wants attractions and/or activities to do in a city,
    your response must ONLY return a JSON object (nothing else, no explanations, NO EXTRA TEXT).
    Recommend 3 attractions or activities to do in the city, personalized for the user based on the following preferences: {data.get("preferences")}
    """
        + """
    The JSON object should have the following structure:

    "activities": [
        {
            "title": "...title of the activity...",
            "context": "...explanation linking user preference + weather condition...",
            "day": 0 (should be 0 for all activities since users will decide which day to do them later),
            "length": "...the number of half hours that this activity should take, starting at 1...",
            "weather": "...weather forecast for that day...",
            "details": {
                "name": "...same as title...",
                "description": "...short description of the activity...",
                "number": "...official phone number formatted as (xxx) xxx-xxxx...",
                "address": "...full Google Maps-friendly address...",
                "email": "...official email address or leave blank if unavailable...",
                "hours": {
                    "sunday": {"open": "...", "close": "..."},
                    "monday": {"open": "...", "close": "..."},
                    "tuesday": {"open": "...", "close": "..."},
                    "wednesday": {"open": "...", "close": "..."},
                    "thursday": {"open": "...", "close": "..."},
                    "friday": {"open": "...", "close": "..."},
                    "saturday": {"open": "...", "close": "..."}
                },
                "rating": "...rating out of 5 with 1 decimal place...",
                "experience": "...what guests experience at this location...",
                "city": "...City, Country...",
                "website": "...link to the official website..."
            }
        },
        ... for each other activity (2 more activities) ...
    ]

    Here is an example of the JSON object you should return:

    "activities": [
        {
            "title": "Shinjuku Gyoen National Garden Visit",
            "context": "Because you enjoy nature photography and outdoor activities, this outdoor activity is perfect.",
            "day": 0,
            "length": 3,
            "weather": "Clear skies, 22°C, light breeze.",
            "details": {
                "name": "Shinjuku Gyoen National Garden",
                "description": "A historic garden combining traditional Japanese, English, and French designs, famous for its cherry blossoms.",
                "number": "(03) 3350-0151",
                "address": "11 Naitomachi, Shinjuku City, Tokyo 160-0014, Japan",
                "email": "info@shinjukugyoen.jp",
                "hours": {
                    "sunday": {"open": "9:00 AM", "close": "4:00 PM"},
                    "monday": {"open": "9:00 AM", "close": "4:00 PM"},
                    "tuesday": {"open": "9:00 AM", "close": "4:00 PM"},
                    "wednesday": {"open": "9:00 AM", "close": "4:00 PM"},
                    "thursday": {"open": "9:00 AM", "close": "4:00 PM"},
                    "friday": {"open": "9:00 AM", "close": "4:00 PM"},
                    "saturday": {"open": "9:00 AM", "close": "4:00 PM"}
                },
                "rating": 4.7,
                "experience": "Guests stroll through beautiful seasonal gardens, traditional tea houses, and wide lawns perfect for picnics.",
                "city": "Tokyo, Japan",
                "website": "https://www.env.go.jp/garden/shinjukugyoen/english/index.html"
            }
        },
        ...
        same format other activities (2 more activities)
        ...
    ]

    Remember: If the user wants activities/attractions, output ONLY the JSON object exactly as shown. No extra text.
    Also remember: The day field should be 0 for all activities since users will decide which day to do each activity later.

    However, if the user instead asks for hotels, weather, or any other information other than activities/attractions, use following tools below to answer the question as needed
    Provide a standard text response (not a JSON object).

    Important: do NOT include weather data in the context field of the JSON.

    - Use the fetch_weather_for_trip_tool if they ask about weather forecasts for every day on that trip.
      Specifically, describe the temperature, feels like temperature, humidity, wind speed, and any other important weather conditions for every day from the start date till the end date.
    
    - Use the fetch_hotels_tool if they ask about the hotels in a city.
      Specifically describe the name, rating, and price of hotels in the city.

    - Use the fetch_current_weather_tool if they ask about the current weather.
      Specifically, describe the temperature, feels like temperature, humidity, wind speed, and any other important weather conditions for the current weather.

    - You can use multiple tools if the user asks about multiple types of data.
      For example, if they ask about both the weather and hotels, you can use both tools. However, if they ask about activities or attractions, do not combine results with something else — just give the attractions JSON and nothing else.
    
    """
    )

    agent = get_langchain_agent(OPENAI_API_KEY)
    try:
        city_data = agent.run(user_query)
    except Exception as e:
        print("Error while running agent:", str(e))
        city_data = "Error: Too much input data or agent failed."

    print("\n\nCity data for chatbot:", city_data)

    chatbot_response = send_to_gemini(user_id, username, user_message, city_data)
    print(f"Gemini chatbot response in send_message: {chatbot_response}\n\n")

    # Save chatbot response
    chatbot_msg_entry = {
        "user_id": user_id,
        "trip_id": trip_id,
        "sender": "chatbot",
        "receiver": username,
        "message": chatbot_response,
        "timestamp": datetime.now(),
        "is_about_activities": is_about_activities,  # new field
    }

    messages_collection.insert_one(chatbot_msg_entry)
    # Previous code:
    # response = jsonify(
    #     {"response": chatbot_response, "is_about_activities": is_about_activities}
    # )
    response_payload = {
        "response": chatbot_response,
        "is_about_activities": is_about_activities,
    }

    # Before using city_data, parse it if needed
    if isinstance(city_data, str):
        try:
            city_data = json.loads(city_data)
            # print("Parsed city_data as dict")
        except json.JSONDecodeError:
            print("Failed to parse city_data as JSON")
            city_data = {}

    # If city_data contains activities, include them
    # print(f"City data: {city_data}")
    # print(f"Type of city_data: {type(city_data)}")
    # print(f"City data is dict: {isinstance(city_data, dict)}")
    # print(f"City data has activities: {'activities' in city_data}")
    if city_data and "activities" in city_data:
        response_payload["activities"] = city_data["activities"]

    # print(f"Response payload: {response_payload}")
    response = jsonify(response_payload)

    response.headers.add("Access-Control-Allow-Origin", "*")
    return response, 200


@app.route("/get_messages/<user_id>/<trip_id>", methods=["GET", "OPTIONS"])
def get_messages(user_id, trip_id):
    if request.method == "OPTIONS":
        return jsonify({"message": "CORS preflight passed"}), 200
    # messages = list(messages_collection.find({"user_id": user_id}, {"_id": 0}))
    try:
        messages = list(
            messages_collection.find(
                {"user_id": user_id, "trip_id": trip_id}, {"_id": 0}
            )
        )
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
    return ""
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
            output = [item["link"] for item in data["items"][:6]]  # Limit to 6 images

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


# USED TO ADD ACTIVITY. DO NOT CHANGE
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

    next_best_preferences = itinerary.get("activities", {}).get(
        "next_best_preferences", []
    )
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

    # Add times
    last_act = top_preferences[day_index]
    start = parse_time(last_act[len(last_act) - 1]["range"]["end"]) + timedelta(minutes=30)
    duration_minutes = found_activity["length"] * 30
    end = start + timedelta(minutes=duration_minutes)
    found_activity["range"] = {
        "start": format_time(start),
        "end": format_time(end)
    }

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
            "updated_top": convert_objectid(top_preferences),
            "updated_next": convert_objectid(updated_next_best)
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


# USED TO ADD RESTAURANT. DO NOT CHANGE
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
        (act for act in next_best if act.get("activityNumber") == activityID), None
    )

    if not activity:
        return jsonify({"error": "Restaurant not found"}), 404

    activity["day"] = day
    activity["activityNumber"] = generate_activity_number()
    activity["likes"] = 0
    activity["likedBy"] = []
    activity["dislikes"] = 0
    activity["dislikedBy"] = []
    # activity["details"]["images"] = get_image(activity["title"])
    # activity["details"]["tripId"] = trip_id
    activity["activityID"] = activity_collection.insert_one(
        activity["details"]
    ).inserted_id

    while len(itinerary["activities"]["top_preferences"]) <= day:
        itinerary["activities"]["top_preferences"].append([])

    # Add times
    last_act = itinerary["activities"]["top_preferences"][day]
    start = parse_time(last_act[len(last_act) - 1]["range"]["end"]) + timedelta(minutes=30)
    duration_minutes = activity["length"] * 30
    end = start + timedelta(minutes=duration_minutes)
    activity["range"] = {
        "start": format_time(start),
        "end": format_time(end)
    }

    itinerary["activities"]["top_preferences"][day].append(activity)

    itinerary_collection.update_one(
        {"_id": ObjectId(trip_id)},
        {
            "$set": {
                f"activities.top_preferences.{day}": itinerary["activities"][
                    "top_preferences"
                ][day]
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
    
    trip = trip_collection.find_one({"_id": ObjectId(trip_id)})
    if not trip:
        return jsonify({"error": "Trip not found"}), 404
    time_ranges = trip.get("timeRanges", {})
    day_key = f"Day {index + 1}"
    day_time_range = time_ranges.get(day_key)
    day_curr = parse_time(day_time_range["start"])
    # TODO: Going to trust the end time isn't exceeded too much
    # day_end = parse_time(day_time_range["end"])

    updated_order = []
    for activity in new_order:
        duration_minutes = activity.get("length", 4) * 30
        activity_end = day_curr + timedelta(minutes=duration_minutes)

        # TODO: Going to trust the end time isn't exceeded too much
        # if activity_end > day_end:
            # print(f"Skipping activity '{activity.get('title')}' due to time overflow.")
            # continue

        # Update time range
        activity["range"] = {
            "start": format_time(day_curr),
            "end": format_time(activity_end)
        }

        updated_order.append(activity)
        day_curr = activity_end + timedelta(minutes=30)


    top_preferences[index] = updated_order

    itinerary_collection.update_one(
        {"_id": ObjectId(trip_id)},
        {"$set": {"activities.top_preferences": top_preferences}},
    )

    response = jsonify({"message": "Activity order updated successfully", "updatedOrder": updated_order})
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response


@app.route("/update_top_order/<trip_id>", methods=["GET", "POST", "OPTIONS"])
def update_top_order(trip_id):
    if request.method == "OPTIONS":
        return jsonify({"message": "CORS preflight passed"}), 200

    data = request.get_json()
    new_order = data.get("top", [])

    if not isinstance(new_order, list):
        return jsonify({"error": "Invalid data format"}), 400
    
    itinerary = itinerary_collection.find_one({"_id": ObjectId(trip_id)})
    if not itinerary:
        return jsonify({"error": "Itinerary not found"}), 404
    
    top_preferences = itinerary.get("activities", {}).get("top_preferences", [])

    trip = trip_collection.find_one({"_id": ObjectId(trip_id)})
    if not trip:
        return jsonify({"error": "Trip not found"}), 404
    time_ranges = trip.get("timeRanges", {})

    # TODO: Going to trust the end time isn't exceeded too much
    # day_end = parse_time(day_time_range["end"])
    index = 0
    for day in new_order:
        day_key = f"Day {index + 1}"
        day_time_range = time_ranges.get(day_key)
        day_curr = parse_time(day_time_range["start"])
        updated_order = []
        for activity in day:
            duration_minutes = activity.get("length", 4) * 30
            activity_end = day_curr + timedelta(minutes=duration_minutes)

            # TODO: Going to trust the end time isn't exceeded too much
            # if activity_end > day_end:
                # print(f"Skipping activity '{activity.get('title')}' due to time overflow.")
                # continue

            # Update time range
            activity["range"] = {
                "start": format_time(day_curr),
                "end": format_time(activity_end)
            }

            updated_order.append(activity)
            day_curr = activity_end + timedelta(minutes=30)

        top_preferences[index] = updated_order
        index = index + 1

    itinerary_collection.update_one(
        {"_id": ObjectId(trip_id)},
        {"$set": {"activities.top_preferences": top_preferences}},
    )

    response = jsonify({"message": "Top preferences order updated successfully", "new_top": top_preferences})
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


@app.route("/forum", methods=["GET", "POST"])
def forum():
    if request.method == "GET":
        try:
            posts = list(forum_collection.find().sort("created_at", -1))
            print(posts)

            for post in posts:
                post["_id"] = str(post["_id"])
                # post["created_at"] = post["created_at"].isoformat()
                # print(post["created_at"].isoformat())

            return jsonify(posts)
        except Exception as e:
            print("some error")
            return jsonify({"error": str(e)}), 500
    elif request.method == "POST":
        try:
            data = request.json
            print(data)
            username = data.get("username")
            print(username)

            if not username:
                return jsonify({"error": "User not authenticated"}), 401

            new_post = {
                "username": username,
                "name": data.get("name"),
                "location": data.get("location"),
                "description": data.get("description"),
                "bestTime": data.get("bestTime"),
                "created_at": datetime.now(timezone.utc),
            }

            result = forum_collection.insert_one(new_post)
            return jsonify(
                {
                    "message": "Post submitted successfully",
                    "post_id": str(result.inserted_id),
                }
            )

        except Exception as e:
            return jsonify({"error": str(e)}), 500


@app.route("/profile/save", methods=["GET", "POST", "OPTIONS"])
def save_profile():
    if request.method == "OPTIONS":
        return jsonify({"message": "CORS preflight passed"}), 200

    data = request.get_json()

    username = data.get("username")
    if not username:
        return jsonify({"message": "Username is required"}), 400

    result = profiles.update_one({"username": username}, {"$set": data}, upsert=True)

    return jsonify({"message": "Profile saved successfully"}), 200


@app.route("/profile/<userId>", methods=["GET"])
def get_profile(userId):
    profile = profiles.find_one({"userId": userId}, {"_id": 0})
    if profile:
        return jsonify(profile), 200
    else:
        return jsonify({"message": "Profile not found"}), 404


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route("/api/upload-profile-pic/<username>", methods=["POST", "GET", "OPTIONS"])
def upload_profile_pic(username):
    if request.method == "OPTIONS":
        return jsonify({"message": "CORS preflight passed"}), 200

    print("FILES:", request.files)
    print("FORM:", request.form)
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400
    if file and allowed_file(file.filename):
        print("Filename:", file.filename)
        filename = secure_filename(f"{username}_{file.filename}")
        filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(filepath)

        profiles.update_one(
            {"username": username},
            {"$set": {"profile_pic": f"/static/uploads/{filename}"}},
            upsert=True,
        )
        return (
            jsonify(
                {
                    "message": "File uploaded successfully",
                    "filepath": f"/static/uploads/{filename}",
                }
            ),
            200,
        )
    return jsonify({"error": "File type not allowed"}), 400


@app.route("/static/uploads/<filename>")
def serve_image(filename):
    return send_from_directory("static/uploads", filename)


if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


def extract_email_from_website(url):
    try:
        response = requests.get(url, timeout=5)
        domain = urlparse(url).netloc
        possible_emails = re.findall(
            r"[a-zA-Z0-9._%+-]+@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}", response.text
        )
        print(f"URL: {url}")
        print(f"Possible emails found: {possible_emails}")
        filtered_emails = [
            email
            for email in possible_emails
            if not email.lower().endswith((".png", ".jpg", ".jpeg", ".gif", ".svg"))
        ]
        print(f"Filtered emails: {filtered_emails}")
        return filtered_emails[0] if filtered_emails else "Not available"
    except Exception as e:
        print(f"Email extraction failed from {url}: {e}")
        return "Not available"


def convert_to_ampm(time_str):
    try:
        if "AM" in time_str.upper() or "PM" in time_str.upper():
            return time_str.strip()
        time_obj = datetime.strptime(time_str.strip(), "%H:%M")
        return time_obj.strftime("%I:%M %p").lstrip("0")
    except Exception as e:
        print(f"Error parsing time: {time_str} - {e}")
        return time_str


@app.route("/api/remove-profile-pic/<username>", methods=["GET", "POST", "OPTIONS"])
def remove_profile_pic(username):
    if request.method == "OPTIONS":
        return jsonify({"message": "CORS preflight passed"}), 200

    user = profiles.find_one({"username": username})
    if not user or "profile_pic" not in user:
        return jsonify({"error": "Profile picture not found"}), 404

    pic_path = os.path.join(app.root_path, user["profile_pic"].lstrip("/"))

    if os.path.exists(pic_path):
        os.remove(pic_path)

    profiles.update_one({"username": username}, {"$unset": {"profile_pic": ""}})

    return jsonify({"message": "Profile picture removed"}), 200


@app.route("/api/activities/<city>", methods=["GET", "OPTIONS"])
def fetch_activities(city):
    if request.method == "OPTIONS":
        return jsonify({"message": "CORS preflight passed"}), 200
    trip_id = request.args.get("tripId")
    try:
        user_interest = "Photography"
        target_date = "April 25, 2025"
        weather_stub = {
            "temperature": "66.88°F",
            "feels_like": "65.43°F",
            "humidity": "46%",
            "wind_speed": "17.56 mph",
            "condition": "scattered clouds",
        }
        time_length = 2
        hours_stub = {
            "sunday": {"open": "9:00 AM", "close": "11:00 PM"},
            "monday": {"open": "9:00 AM", "close": "11:00 PM"},
            "tuesday": {"open": "9:00 AM", "close": "11:00 PM"},
            "wednesday": {"open": "9:00 AM", "close": "11:00 PM"},
            "thursday": {"open": "9:00 AM", "close": "11:00 PM"},
            "friday": {"open": "9:00 AM", "close": "11:00 PM"},
            "saturday": {"open": "9:00 AM", "close": "11:00 PM"},
        }
        query = f"top tourist attractions and activities to do in {city}"
        url = f"https://maps.googleapis.com/maps/api/place/textsearch/json?query={query}&key={GOOGLE_API_KEY}"
        response = requests.get(url)
        data = response.json()

        results = []
        for place in data.get("results", [])[:10]:  # Limit to 10 results
            title = place.get("name")
            address = place.get("formatted_address", "No address available")
            rating = place.get("rating", "N/A")
            place_id = place.get("place_id")
            details_url = f"https://maps.googleapis.com/maps/api/place/details/json?place_id={place_id}&fields=name,formatted_phone_number,opening_hours,website,rating,photos,formatted_address,editorial_summary&key={GOOGLE_API_KEY}"
            details_response = requests.get(details_url)
            details_data = details_response.json().get("result", {})
            photo_url = (
                f"https://maps.googleapis.com/maps/api/place/photo"
                f"?maxwidth=400&photoreference={place['photos'][0]['photo_reference']}&key={GOOGLE_API_KEY}"
                if "photos" in place
                else "https://via.placeholder.com/400"
            )
            place_types = place.get("types", [])
            editorial = details_data.get("editorial_summary", {}).get("overview")
            description = (
                editorial
                if editorial
                else f"This is a popular {place_types[0].replace('_', ' ')} in {city}."
            )
            website = details_data.get("website", None)
            email = extract_email_from_website(website) if website else "Not available"
            weekday_text = details_data.get("opening_hours", {}).get("weekday_text", [])
            formatted_hours = {}

            for day_entry in weekday_text:
                try:
                    day_name, time_range = day_entry.split(": ", 1)
                    open_time, close_time = time_range.split("–")
                    formatted_hours[day_name.lower()] = {
                        "open": convert_to_ampm(open_time.strip()),
                        "close": convert_to_ampm(close_time.strip()),
                    }
                except Exception:
                    continue

            if not formatted_hours:
                formatted_hours = hours_stub
            details = {
                "name": title,
                "description": description,
                "number": details_data.get("formatted_phone_number", "Not available"),
                "address": address,
                "email": email,
                "hours": formatted_hours,
                "rating": rating,
                "experience": f"Visitors rate this place a {rating}/5.",
                "city": city,
                "website": details_data.get("website", "Not available"),
                "images": [photo_url],
                # "images": get_image(title)
            }
            if trip_id:
                try:
                    details["tripId"] = str(ObjectId(trip_id))
                    print("trip id: ", details["tripId"])
                except Exception:
                    print("Invalid tripId provided:", trip_id)
                    details["tripId"] = None
            inserted_id = activity_collection.insert_one(details).inserted_id
            result = {
                "title": title,
                "context": f"This activity was manually added.",
                "length": time_length,
                # "weather": weather_stub,
                "details": {**details, "_id": str(inserted_id)},
                "activityID": str(inserted_id),
                "activityNumber": generate_activity_number(),
                "likes": 0,
                "likedBy": [],
                "dislikes": 0,
                "dislikedBy": [],
                # "id": place.get("place_id"),
                # "title": place.get("name"),
                # "image": f"https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference={place['photos'][0]['photo_reference']}&key={GOOGLE_API_KEY}" if "photos" in place else "https://via.placeholder.com/400",
                # "rating": place.get("rating", "N/A"),
                # "description": place.get("formatted_address", "No address available"),
                # "activityNumber": generate_activity_number(),
                # "likes": 0,
                # "likedBy": [],
                # "dislikes":  0,
                # "dislikedBy": [],
            }
            results.append(result)

        return jsonify(results), 200

    except Exception as e:
        print("Error fetching activities:", e)
        return jsonify({"error": "Failed to fetch activities"}), 500


@app.route("/api/restaurants/<city>", methods=["GET", "OPTIONS"])
def fetch_restaurants(city):
    if request.method == "OPTIONS":
        return jsonify({"message": "CORS preflight passed"}), 200

    trip_id = request.args.get("tripId")
    try:
        time_length = 2
        hours_stub = {
            "sunday": {"open": "9:00 AM", "close": "11:00 PM"},
            "monday": {"open": "9:00 AM", "close": "11:00 PM"},
            "tuesday": {"open": "9:00 AM", "close": "11:00 PM"},
            "wednesday": {"open": "9:00 AM", "close": "11:00 PM"},
            "thursday": {"open": "9:00 AM", "close": "11:00 PM"},
            "friday": {"open": "9:00 AM", "close": "11:00 PM"},
            "saturday": {"open": "9:00 AM", "close": "11:00 PM"},
        }
        query = f"top restaurants to eat at in {city}"
        url = f"https://maps.googleapis.com/maps/api/place/textsearch/json?query={query}&key={GOOGLE_API_KEY}"
        response = requests.get(url)
        data = response.json()

        results = []
        for place in data.get("results", [])[:10]:  # Limit to 10 results
            title = place.get("name")
            address = place.get("formatted_address", "No address available")
            rating = place.get("rating", "N/A")
            place_id = place.get("place_id")
            details_url = f"https://maps.googleapis.com/maps/api/place/details/json?place_id={place_id}&fields=name,formatted_phone_number,opening_hours,website,rating,photos,formatted_address,editorial_summary&key={GOOGLE_API_KEY}"
            details_response = requests.get(details_url)
            details_data = details_response.json().get("result", {})
            photo_url = (
                f"https://maps.googleapis.com/maps/api/place/photo"
                f"?maxwidth=400&photoreference={place['photos'][0]['photo_reference']}&key={GOOGLE_API_KEY}"
                if "photos" in place
                else "https://via.placeholder.com/400"
            )
            place_types = place.get("types", [])
            editorial = details_data.get("editorial_summary", {}).get("overview")
            description = (
                editorial
                if editorial
                else f"This is a popular {place_types[0].replace('_', ' ')} in {city}."
            )
            website = details_data.get("website", None)
            email = extract_email_from_website(website) if website else "Not available"
            weekday_text = details_data.get("opening_hours", {}).get("weekday_text", [])
            formatted_hours = {}

            for day_entry in weekday_text:
                try:
                    day_name, time_range = day_entry.split(": ", 1)
                    open_time, close_time = time_range.split("–")
                    formatted_hours[day_name.lower()] = {
                        "open": convert_to_ampm(open_time.strip()),
                        "close": convert_to_ampm(close_time.strip()),
                    }
                except Exception:
                    continue

            if not formatted_hours:
                formatted_hours = hours_stub
            details = {
                "name": title,
                "description": description,
                "number": details_data.get("formatted_phone_number", "Not available"),
                "address": address,
                "email": email,
                "hours": formatted_hours,
                "rating": rating,
                "experience": f"Visitors rate this place a {rating}/5.",
                "city": city,
                "website": details_data.get("website", "Not available"),
                "images": [photo_url],
                # "images": get_image(title)
            }
            if trip_id:
                try:
                    details["tripId"] = str(ObjectId(trip_id))
                    print("trip id: ", details["tripId"])
                except Exception:
                    print("Invalid tripId provided:", trip_id)
                    details["tripId"] = None
            inserted_id = activity_collection.insert_one(details).inserted_id
            result = {
                "title": title,
                "context": f"This restaurant was manually added.",
                "length": time_length,
                # "weather": weather_stub,
                "details": {**details, "_id": str(inserted_id)},
                "activityID": str(inserted_id),
                "activityNumber": generate_activity_number(),
                "likes": 0,
                "likedBy": [],
                "dislikes": 0,
                "dislikedBy": [],
                # "id": place.get("place_id"),
                # "title": place.get("name"),
                # "image": f"https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference={place['photos'][0]['photo_reference']}&key={GOOGLE_API_KEY}" if "photos" in place else "https://via.placeholder.com/400",
                # "rating": place.get("rating", "N/A"),
                # "description": place.get("formatted_address", "No address available"),
                # "activityNumber": generate_activity_number(),
                # "likes": 0,
                # "likedBy": [],
                # "dislikes":  0,
                # "dislikedBy": [],
            }
            results.append(result)

        return jsonify(results), 200

    except Exception as e:
        print("Error fetching activities:", e)
        return jsonify({"error": "Failed to fetch activities"}), 500


@app.route(
    "/add_activity_to_itinerary/<trip_id>/<int:day>",
    methods=["POST", "OPTIONS"],
)
def add_activity_to_itinerary(trip_id, day):
    print("itinerary_id in database: " + trip_id + "\n")
    if request.method == "OPTIONS":
        return jsonify({"message": "CORS preflight passed"}), 200

    itinerary = itinerary_collection.find_one({"_id": ObjectId(trip_id)})
    if not itinerary:
        return jsonify({"error": "Itinerary not found"}), 404

    activity = request.get_json()
    if not activity:
        return jsonify({"error": "No activity provided"}), 400

    activity["day"] = day
    activity["activityNumber"] = generate_activity_number()
    activity["likes"] = 0
    activity["likedBy"] = []
    activity["dislikes"] = 0
    activity["dislikedBy"] = []
    # activity["details"]["images"] = get_image(activity["title"])
    # activity["details"]["tripId"] = trip_id
    activity["activityID"] = activity_collection.insert_one(
        activity["details"]
    ).inserted_id

    if "details" in activity:
        activity["details"]["tripId"] = ObjectId(trip_id)
        if "activityID" not in activity and "_id" in activity["details"]:
            activity["activityID"] = ObjectId(activity["details"]["_id"])
        elif "activityID" in activity:
            activity["activityID"] = ObjectId(activity["activityID"])
            activity["details"]["_id"] = activity["activityID"]

    while len(itinerary["activities"]["top_preferences"]) <= day:
        itinerary["activities"]["top_preferences"].append([])

    # Add times
    last_act = itinerary["activities"]["top_preferences"][day]
    start = parse_time(last_act[len(last_act) - 1]["range"]["end"]) + timedelta(minutes=30)
    duration_minutes = activity["length"] * 30
    end = start + timedelta(minutes=duration_minutes)
    activity["range"] = {
        "start": format_time(start),
        "end": format_time(end)
    }

    itinerary["activities"]["top_preferences"][day].append(activity)

    itinerary_collection.update_one(
        {"_id": ObjectId(trip_id)},
        {
            "$set": {
                f"activities.top_preferences.{day}": itinerary["activities"][
                    "top_preferences"
                ][day]
            }
        },
    )

    response = jsonify(
        {
            "message": "Activity added to itinerary successfully",
            "updated_itinerary": convert_objectid(itinerary),
            "added_activity": convert_objectid(activity),
        }
    )

    response.headers.add("Access-Control-Allow-Origin", "*")
    return response


@app.route(
    "/add_restaurant_to_itinerary/<trip_id>/<int:day>",
    methods=["POST", "OPTIONS"],
)
def add_restaurant_to_itinerary(trip_id, day):
    if request.method == "OPTIONS":
        return jsonify({"message": "CORS preflight passed"}), 200

    itinerary = itinerary_collection.find_one({"_id": ObjectId(trip_id)})
    if not itinerary:
        return jsonify({"error": "Itinerary not found"}), 404

    activity = request.get_json()
    if not activity:
        return jsonify({"error": "No activity provided"}), 400

    activity["day"] = day
    activity["activityNumber"] = generate_activity_number()
    activity["likes"] = 0
    activity["likedBy"] = []
    activity["dislikes"] = 0
    activity["dislikedBy"] = []
    # activity["details"]["images"] = get_image(activity["title"])
    # activity["details"]["tripId"] = trip_id
    activity["activityID"] = activity_collection.insert_one(
        activity["details"]
    ).inserted_id

    if "details" in activity:
        activity["details"]["tripId"] = ObjectId(trip_id)
        if "activityID" not in activity and "_id" in activity["details"]:
            activity["activityID"] = ObjectId(activity["details"]["_id"])
        elif "activityID" in activity:
            activity["activityID"] = ObjectId(activity["activityID"])
            activity["details"]["_id"] = activity["activityID"]

    while len(itinerary["activities"]["top_preferences"]) <= day:
        itinerary["activities"]["top_preferences"].append([])

    # Add times
    last_act = itinerary["activities"]["top_preferences"][day]
    start = parse_time(last_act[len(last_act) - 1]["range"]["end"]) + timedelta(minutes=30)
    duration_minutes = activity["length"] * 30
    end = start + timedelta(minutes=duration_minutes)
    activity["range"] = {
        "start": format_time(start),
        "end": format_time(end)
    }

    itinerary["activities"]["top_preferences"][day].append(activity)

    itinerary_collection.update_one(
        {"_id": ObjectId(trip_id)},
        {
            "$set": {
                f"activities.top_preferences.{day}": itinerary["activities"][
                    "top_preferences"
                ][day]
            }
        },
    )

    response = jsonify(
        {
            "message": "Activity added to itinerary successfully",
            "updated_itinerary": convert_objectid(itinerary),
        }
    )
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response


@app.route("/api/flights", methods=["GET"])
def get_flights():
    SERPAPI_KEY = "06dd461b05ebdf6841b9638375820275e29ea4e41c041b71a0939bfd7a00bc33"
    from_code = request.args.get("from")
    to_code = request.args.get("to")
    date = request.args.get("date")

    if not all([from_code, to_code, date]):
        return jsonify({"error": "Missing required parameters"}), 400

    try:
        serpapi_url = "https://serpapi.com/search"
        params = {
            "engine": "google_flights",
            "departure_id": from_code,
            "arrival_id": to_code,
            "outbound_date": date,
            "currency": "USD",
            "hl": "en",
            "type": 2,
            "api_key": SERPAPI_KEY
        }

        response = requests.get(serpapi_url, params=params)
        print(response)
        data = response.json()
        data["booking_link"] = data.get("search_metadata", {}).get("google_flights_url", "")
        print(data)
        return jsonify(data)
    except Exception as e:
        print("Error fetching from SerpAPI:", e)
        return jsonify({"error": "Failed to fetch flights."}), 500

if __name__ == "__main__":
    app.run(port=PORT, debug=True)
