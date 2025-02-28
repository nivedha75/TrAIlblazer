from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from bson import ObjectId
import json
#uri = "mongodb+srv://praveer35:syN8wC4RYFWjBtlM@cluster0.h5zkw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
# Create a new client and connect to the server
#client = MongoClient(uri, server_api=ServerApi('1'))
# Send a ping to confirm a successful connection

client = MongoClient("mongodb+srv://kumar502:gcstrail1@cluster0.h5zkw.mongodb.net/")

try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)

db = client["TrAIlblazer"]
itinerary_collection = db["itineraries"]
itinerary = itinerary_collection.find_one({"_id": ObjectId("67b91624fd3d64304dca1d93")})
print(json.dumps(itinerary, default=str, indent="  "))