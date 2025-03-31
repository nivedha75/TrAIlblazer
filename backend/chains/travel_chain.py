from langchain.agents import initialize_agent, Tool
from langchain.agents.agent_types import AgentType

# from langchain.chat_models import ChatOpenAI
from langchain_openai import ChatOpenAI
from langchain.tools import tool
from utils.api_clients import (
    get_city_coordinates,
    get_forecast_for_trip,
    get_current_weather,
    get_attractions,
    get_hotels,
    get_flights,
)
from utils.cache import get_cached, set_cache


@tool
def fetch_current_weather_tool(city: str):
    """Fetch current weather for a given city (only today's weather)."""
    print(f"Fetching weather for city: {city}\n")
    key = f"weather_{city}"
    # if (cached := get_cached(key)):
    #     print("Cached data: ", cached)
    #     return cached
    # print("No cached data found\n")
    print("Fetching weather data\n")
    data = get_current_weather(city)
    print(f"Weather data: {data}\n\n\n")
    # set_cache(key, data)
    return data


@tool
def fetch_weather_for_trip_tool(query: str):
    """Fetch weather for a given city for each day from a start date till the end date.
    Input format: City Name,YYYY-MM-DD,YYYY-MM-DD (e.g. Tokyo,2025-04-01,2025-04-05)"""

    # if (cached := get_cached(key)):
    #     print("Cached data: ", cached)
    #     return cached
    # print("No cached data found\n")
    print(f"Fetching weather for trip: {query}")
    try:
        # city, start_date, end_date = map(str.strip, query.split(","))
        city, start_date, end_date = map(
            lambda x: x.strip().strip("'\""), query.split(",")
        )  # added strip to remove quotes
        print(f"Fetching weather for city between a start and end date: {city}\n")
    except ValueError:
        return "Invalid input format. Use: City,YYYY-MM-DD,YYYY-MM-DD"

    key = f"weather_{city}"
    print("Fetching weather data\n")
    data = get_forecast_for_trip(city, start_date, end_date)
    print(f"Weather data for whole trip: {data}\n\n\n")
    # set_cache(key, data)
    return data


@tool
def fetch_attractions_tool(city: str):
    """Fetch top tourist attractions in a city."""
    print(f"Fetching attractions for city: {city}\n")
    key = f"attractions_{city}"
    # if (cached := get_cached(key)):
    #     return cached
    data = get_attractions(city)
    print(f"Attractions data: {data}\n\n\n")
    # set_cache(key, data)
    return data


@tool
def fetch_hotels_tool(city: str):
    """Fetch a couple hotels in a city."""
    print(f"Fetching hotels for city: {city}\n")
    key = f"hotels_{city}"
    # if (cached := get_cached(key)):
    #     return cached
    data = get_hotels(city)
    print(f"Hotels data: {data}\n\n\n")
    # set_cache(key, data)
    return data


@tool
def fetch_flights_tool(query: str):
    """
    Fetch flight options. Query must be 'origin,destination,date' e.g. 'SFO,NYC,2025-04-01'
    """
    print("Fetching flights for query\n")
    origin, destination, date = query.split(",")
    key = f"flights_{origin}_{destination}_{date}"
    # if (cached := get_cached(key)):
    #     return cached
    data = get_flights(origin, destination, date)
    print(f"Flights data: {data}\n\n\n")
    # set_cache(key, data)
    return data


def get_langchain_agent(openAI_api_key):
    tools = [
        fetch_current_weather_tool,
        fetch_weather_for_trip_tool,
        fetch_hotels_tool,
        fetch_flights_tool,
    ]
    # fetch_attractions_tool,
    print("Established tools\n")
    llm = ChatOpenAI(temperature=0, model="gpt-4", openai_api_key=openAI_api_key)
    return initialize_agent(tools, llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION)
