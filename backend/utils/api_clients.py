import requests
import os

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")
#TRIPADVISOR_API_KEY = os.getenv("TRIPADVISOR_API_KEY")
SKYSCANNER_API_KEY = os.getenv("SKYSCANNER_API_KEY")
RAPIDAPI_KEY = os.getenv("RAPIDAPI_KEY")
#print("RAPIDAPI_KEY loaded:", RAPIDAPI_KEY)

def get_geo_id(city):
    url = "https://tripadvisor16.p.rapidapi.com/api/v1/hotels/searchLocation"
    headers = {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": "tripadvisor16.p.rapidapi.com"
    }
    params = { "query": city }

    response = requests.get(url, headers=headers, params=params)
    #print("GeoID raw response:", response.status_code, response.text)
    data = response.json()
    
    if "data" in data and len(data["data"]) > 0:
        return data["data"][0]["geoId"]
    
    return None


HEADERS = {
    "X-RapidAPI-Key": RAPIDAPI_KEY,
    "X-RapidAPI-Host": "tripadvisor16.p.rapidapi.com"
}

def get_weather(city):
    print("in get_weather(), value of city: ", city)
    url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={OPENWEATHER_API_KEY}&units=metric"
    weather_json = requests.get(url).json()
    # print("weather_json: ", weather_json)
    return weather_json

def get_attractions(city):
    query = f"top tourist attractions in {city}"
    location = "0,0"  # Optionally convert city to coordinates via Places API
    radius = 10000
    url = f"https://maps.googleapis.com/maps/api/place/textsearch/json?query={query}&location={location}&radius={radius}&key={GOOGLE_API_KEY}"
    return requests.get(url).json()

def get_hotels(city):
    print("in get_hotels(), value of city:", city)
    geo_id = get_geo_id("New York City")
    # print(get_geo_id("New York"))
    # print(get_geo_id("new york city"))
    # print(get_geo_id("new york"))
    # print(get_geo_id("Los Angeles"))
    # print(get_geo_id("San Francisco"))
    # print(get_geo_id("Chicago"))
    # print(get_geo_id("Miami"))
    # print(get_geo_id("Las Vegas"))
    if not geo_id:
        print("City not found!")
        return {}

    url = "https://tripadvisor16.p.rapidapi.com/api/v1/hotels/searchHotels"
    params = {
        "geoId": geo_id,
        "checkIn": "2025-05-01",
        "checkOut": "2025-05-05",
        "adults": "2",
        "rooms": "1",
        "currencyCode": "USD"
    }
    response = requests.get(url, headers=HEADERS, params=params)
    hotels_json = response.json()
    print("hotels_json:", hotels_json)
    return hotels_json

def get_flights(origin, destination, date):
    url = f"https://partners.api.skyscanner.net/apiservices/browseroutes/v1.0/US/USD/en-US/{origin}/{destination}/{date}?apiKey={SKYSCANNER_API_KEY}"
    return requests.get(url).json()
