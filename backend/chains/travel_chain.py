from langchain.agents import initialize_agent, Tool
from langchain.agents.agent_types import AgentType
# from langchain.chat_models import ChatOpenAI
from langchain_openai import ChatOpenAI
from langchain.tools import tool
from utils.api_clients import get_weather, get_attractions, get_hotels, get_flights
from utils.cache import get_cached, set_cache

@tool
def fetch_weather_tool(city: str):
    """Fetch current weather for a given city."""
    print(f"Fetching weather for city: {city}\n")
    key = f"weather_{city}"
    # if (cached := get_cached(key)):
    #     print("Cached data: ", cached)
    #     return cached
    # print("No cached data found\n")
    print("Fetching weather data\n")
    data = get_weather(city)
    print(f"Weather data: {data}\n\n\n")
    #set_cache(key, data)
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
    #set_cache(key, data)
    return data

@tool
def fetch_hotels_tool(city: str):
    """Fetch hotels in a city."""
    print(f"Fetching hotels for city: {city}\n")
    key = f"hotels_{city}"
    # if (cached := get_cached(key)):
    #     return cached
    data = get_hotels(city)
    print(f"Hotels data: {data}\n\n\n")
    #set_cache(key, data)
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
    #set_cache(key, data)
    return data

def get_langchain_agent(openAI_api_key):
    tools = [
        fetch_weather_tool,
        fetch_hotels_tool,
        fetch_flights_tool,
    ]
    #fetch_attractions_tool,
    print("Established tools\n")
    llm = ChatOpenAI(temperature=0, model="gpt-4", openai_api_key=openAI_api_key)
    return initialize_agent(tools, llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION)
