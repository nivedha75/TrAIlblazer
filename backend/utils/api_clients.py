import requests
from datetime import datetime
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
    print("GeoID raw response:", response.status_code, response.text)
    data = response.json()
    
    if "data" in data and len(data["data"]) > 0:
        return data["data"][0]["geoId"]
    
    return None


HEADERS = {
    "X-RapidAPI-Key": RAPIDAPI_KEY,
    "X-RapidAPI-Host": "tripadvisor16.p.rapidapi.com"
}

def get_current_weather(city):
    print("in get_weather(), value of city: ", city)
    url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={OPENWEATHER_API_KEY}&units=imperial"
    weather_json = requests.get(url).json()
    # print("weather_json: ", weather_json)
    return weather_json

def get_city_coordinates(city):
    geo_url = f"http://api.openweathermap.org/geo/1.0/direct?q={city}&limit=1&appid={OPENWEATHER_API_KEY}"
    response = requests.get(geo_url)
    data = response.json()
    if not data:
        raise ValueError(f"City '{city}' not found.")
    return data[0]["lat"], data[0]["lon"]

def get_forecast_for_trip(city, start_date_str, end_date_str):
    """Get daily forecasts for a city between start_date and end_date (inclusive)"""
    start_date = datetime.fromisoformat(start_date_str).date()
    end_date = datetime.fromisoformat(end_date_str).date()

    try:
        lat, lon = get_city_coordinates(city)
    except Exception as e:
        print(f"Error getting coordinates: {e}")
        return []

    onecall_url = f"https://api.openweathermap.org/data/3.0/onecall?lat={lat}&lon={lon}&exclude=minutely,hourly,current,alerts&units=imperial&appid={OPENWEATHER_API_KEY}"
    response = requests.get(onecall_url)

    if response.status_code != 200:
        print("Error calling One Call API:", response.status_code, response.text)
        return []

    data = response.json()
    forecast_data = []

    for day in data.get("daily", []):
        date_obj = datetime.fromtimestamp(day["dt"]).date()

        if start_date <= date_obj <= end_date:
            forecast_data.append({
                "date": date_obj.strftime("%Y-%m-%d"),
                "temp_day": day["temp"]["day"],
                "feels_like": day["feels_like"]["day"],
                "humidity": day["humidity"],
                "wind_speed": day["wind_speed"],
                "description": day["weather"][0]["description"]
            })

    return forecast_data

def get_attractions(city):
    query = f"top tourist attractions in {city}"
    location = "0,0"  # Optionally convert city to coordinates via Places API
    radius = 10000
    url = f"https://maps.googleapis.com/maps/api/place/textsearch/json?query={query}&location={location}&radius={radius}&key={GOOGLE_API_KEY}"
    return requests.get(url).json()

# TODO: later verify that all these are correct for the specific city location (correct state/country too)
# TODO: 
KNOWN_GEO_IDS = {
    "New York City": "60763",
    "Tokyo": "298184",
    "Paris": "187147",
    "Bali": "297944",
    "Beijing": "294212",
    "Seattle": "60878",
    "Honolulu": "60982"
}

def extract_city_name(location):
    if "," in location:
        return location.split(",")[0].strip()
    return location.strip()

def get_hotels(city):
    print("in get_hotels(), value of city:", city)
    #geo_id = get_geo_id(city)
    city_only = extract_city_name(city)
    geo_id = KNOWN_GEO_IDS.get(city_only)
    # print(get_geo_id("Paris"))
    # print(get_geo_id(city))
    # print(get_geo_id("New York"))
    # print(get_geo_id("new york city"))
    # print(get_geo_id("new york"))
    # print(get_geo_id("New York City"))
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
    hotels = hotels_json.get("data", {}).get("data", [])
    top_hotels = []
    for h in hotels[:3]:
        top_hotels.append({
            "name": h.get("title"),
            "location": h.get("secondaryInfo"),
            "rating": h.get("bubbleRating", {}).get("rating"),
            "price": h.get("priceForDisplay")
        })
    print(f"Top 3 hotels: {top_hotels}")
    #print("hotels_json:", hotels_json)
    return top_hotels

def get_flights(origin, destination, date):
    url = f"https://partners.api.skyscanner.net/apiservices/browseroutes/v1.0/US/USD/en-US/{origin}/{destination}/{date}?apiKey={SKYSCANNER_API_KEY}"
    return requests.get(url).json()
