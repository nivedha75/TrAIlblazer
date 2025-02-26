import React from "react";
import { Survey } from "survey-react";
import "survey-core/defaultV2.min.css";
import { Model } from "survey-core"; // If you want to manipulate the model directly.
import { useNavigate } from "react-router-dom";
// import { ContrastDark } from "survey-core/themes";
import { StylesManager } from "survey-core";
import { useEffect, useState } from "react";
import { Button, Box } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../theme"
import Cookies from "js-cookie";

// This variable controls if all questions are required or not
const REQUIRE_QUESTIONS = false; // Toggle this to true/false as needed

const surveyJson = {
  completeText: "Submit",
  showProgressBar: "top",
  title: "Travel Preferences Survey",
  startSurveyText: "Start Survey",
  pages: [
    // -------------------- WELCOME PAGE --------------------
    {
      "name": "welcomePage",
      "title": "🏝️ Welcome to the Travel Preferences Survey! 🏕️",
      "elements": [
      {
      "type": "html",
      "html": "<div style='text-align:center; font-size:18px;'>✨ Help us understand your travel style so we can provide personalized recommendations.<br><br>This survey covers the following topics:<br><br> 💰 💎 <b>Lifestyle Preferences</b> – Travel pace and budget.<br> 🏄 ⛷️ <b>Interests & Hobbies</b> – Activities you enjoy while traveling.<br> 🍽️ 🍷 <b>Dining & Cuisine</b> – Food preferences and dietary needs.<br>👨‍👩‍👧‍👦 🛍️ <b>Travel Style & Goals</b> – Purpose of travel and planning habits.<br> 🏨 🛏️ <b>Accommodation & Comfort</b> – Lodging choices and accessibility.<br> 🎶 💃 <b>Social & Entertainment</b> – Nightlife, live events, and relaxation preferences.<br> 🗺️ 🔍 <b> General Preferences</b> – Additional personal travel requests. <br><br>Click 'Next' to begin! 🧳 ✈️ </div>",
      }]
    },
    // -------------------- LIFESTYLE PAGE 1 --------------------
    {
      name: "lifestylePreferencesPage1",
      title: "Lifestyle Preferences Part 1",
      elements: [
        {
          type: "rating",
          name: "travelPace",
          title: "On a scale from 1 to 5, how fast-paced do you like your travel?",
          rateMin: 1,
          rateMax: 5,
          minRateDescription: "Very Relaxed",
          maxRateDescription: "Very Fast-Paced",
          isRequired: false
        },
        {
          type: "dropdown",
          name: "dailyBudgetRange",
          title: "What is your approximate daily budget (per person)?",
          choices: [
            "Under $100",
            "$100–$250",
            "$250–$500",
            "Over $500"
          ],
          isRequired: false
        },
      ]
    },
    // -------------------- LIFESTYLE PAGE 2 --------------------
    {
      name: "lifestylePreferencesPage2",
      title: "Lifestyle Preferences Part 2",
      elements: [
        {
          type: "boolean",
          name: "groupTours",
          title: "Are you open to participating in group tours or shared experiences?",
          labelTrue: "Yes",
          labelFalse: "No",
          isRequired: false
        },
        {
          type: "rating",
          name: "publicTransportationComfort",
          title: "How comfortable are you with using public transportation in a new destination?",
          rateMin: 1,
          rateMax: 5,
          minRateDescription: "Not Comfortable",
          maxRateDescription: "Very Comfortable",
          isRequired: false
        },
        {
          type: "comment",
          name: "generalLifestylePrefs",
          title:
            "Please describe any other lifestyle preferences or considerations you may have.",
          "description": `
          Examples:\n

          - Do you prefer a structured itinerary or flexibility?\n 
          - Are you an early bird or night owl?\n 
          - High-energy or relaxed traveler?\n 
          - Do you need downtime during your trip?\n 
          - Do you prefer solo trips or group travel (and with whom)?\n
          - Do you like meeting new people or prefer personal space?\n
          - Do you use public transportation or prefer private cars?\n

          Please let us know anything that would make your travel experience better for you!\n
          `,
          // NOT required
          //health considerations, mobility issues, etc.?
          isRequired: false
        }
      ]
    },
    // TRANSITION PAGE: Moving from Lifestyle to Interests & Hobbies
    {
      "name": "transitionToHobbies",
      "title": "🎉 Next Up: Your Interests & Hobbies!",
      "elements": [
        {
          "type": "html",
          "html": "<div font-size:18px;'>You're done with lifestyle preferences! Now, let's explore what activities and hobbies excite you while traveling.</div>"
        }
      ]
    },

    // -------------------- INTERESTS/HOBBIES PAGE 1 --------------------
    {
      name: "interestsHobbiesPage1",
      title: "Interests & Hobbies Part 1",
      elements: [
        {
          type: "checkbox",
          name: "activityPreferences",
          title: "Which of these activities appeal to you? (Select all that apply)",
          choices: [
            "Photography",
            "Hiking/Outdoor Adventures",
            "Scuba Diving/Snorkeling",
            "Water Sports (Kayaking, Surfing, etc.)",
            "Extreme Sports & Adventure (Skydiving, Rock Climbing, etc.)",
            "Shopping"
          ],
          hasOther: true,
          otherText: "Other (please specify)",
          isRequired: false
        },
        {
          type: "checkbox",
          name: "experiencePreferences",
          title: "Which of these experiences appeal to you? (Select all that apply)",
          choices: [
            "Visiting Zoos/Aquariums",
            "Scenic Drives",
            "Spa & Wellness Experiences",
            "Cooking Classes/Food Tours"
          ],
          hasOther: true,
          otherText: "Other (please specify)",
          isRequired: false
        }
      ]
    },
      // -------------------- INTERESTS/HOBBIES PAGE 2 --------------------
    {
      name: "interestsHobbiesPage2",
      title: "Interests & Hobbies Part 2",
      elements: [
        {
          type: "rating",
          name: "natureInterest",
          title: "How interested are you in exploring nature?",
          rateMin: 1,
          rateMax: 5,
          minRateDescription: "Not Interested",
          maxRateDescription: "Extremely Interested",
          isRequired: false
        },
        {
          type: "rating",
          name: "urbanInterest",
          title: "How interested are you in visiting urban cityscapes?",
          rateMin: 1,
          rateMax: 5,
          minRateDescription: "Not Interested",
          maxRateDescription: "Extremely Interested",
          isRequired: false
        },
        {
          type: "radiogroup",
          name: "adventureLevel",
          title: "How adventurous do you consider yourself?",
          choices: [
            "Low (Gentle sightseeing, minimal physical activity)",
            "Medium (Moderate hikes, some water sports)",
            "High (Extreme sports, challenging hikes, thrill-seeking)"
          ],
          isRequired: false
        }
      ]
    },
    // -------------------- INTERESTS/HOBBIES PAGE 3 --------------------
    {
      name: "interestsHobbiesPage3",
      title: "Interests & Hobbies Part 3",
      elements: [
        {
          type: "matrix",
          name: "culturalExperiences",
          title: "How likely are you to participate in each of these cultural experiences?",
          columns: [
            { value: "veryLikely", text: "Very Likely" },
            { value: "likely", text: "Likely" },
            { value: "neutral", text: "Neutral" },
            { value: "unlikely", text: "Unlikely" },
            { value: "veryUnlikely", text: "Very Unlikely" }
          ],
          rows: [
            { value: "artGalleriesMuseums", text: "Art Galleries/Museums" },
            { value: "historicalSites", text: "Historical Sites/Museums" },
            { value: "localFestivals", text: "Local Festivals/Celebrations" },
            { value: "livePerformances", text: "Live Performances" },
            { value: "nightlife", text: "Nightlife (bars, clubs)" }
          ],
          // Force an answer for each row
          isAllRowRequired: false
        },
        {
          type: "comment",
          name: "additionalInterests",
          title: "Please share any other hobbies or unique passions that might influence your trip.",
          isRequired: false
        }
      ]
    },
    // 🔹 TRANSITION PAGE: Moving from Interests & Hobbies to Dining & Cuisines
    {
      "name": "transitionToDining",
      "title": "🍽️ Next Up: Food & Dining!",
      "elements": [
        {
          "type": "html",
          "html": "<div font-size:18px;'>Now that we know your interests, let's talk about food!</div>"
        }
      ]
    },
    // -------------------- DINING/CUISINES PAGE 1 --------------------
    {
      name: "diningCuisinesPage1",
      title: "Dining/Cuisine Preferences Part 1",
      elements: [
        {
          type: "checkbox",
          name: "dietaryRestrictions",
          title: "Do you have any dietary restrictions or allergies?",
          choices: [
            "None",
            "Vegetarian",
            "Vegan",
            "Gluten-Free",
            "Nut Allergy"
          ],
          hasOther: true,
          otherText: "Other (please specify)",
          isRequired: false
        },
        {
          "type": "ranking",
          "name": "preferredCuisines",
          "title": "Rank the following cuisines in order of your preference (1 = most preferred).",
          "choices": [
            "Italian",
            "Mexican",
            "Japanese",
            "Indian",
            "Thai",
            "Mediterranean",
            "Chinese",
            "American"
          ],
          "isRequired": false
        }
      ]
    },
    // -------------------- DINING/CUISINES PAGE 2 --------------------
    {
      name: "diningCuisinesPage2",
      title: "Dining/Cuisine Preferences Part 2",
      elements: [
        {
          type: "comment",
          name: "favoriteFoods",
          title: "What are your favorite foods?",
          isRequired: false
        },
        {
          type: "comment",
          name: "dislikedFoods",
          title: "What are your foods you dislike?",
          isRequired: false
        }
      ]
    },
    // -------------------- DINING/CUISINES PAGE 3 --------------------
    {
      name: "diningCuisinesPage3",
      title: "Dining/Cuisine Preferences Part 3",
      elements: [
        {
          type: "ranking",
          name: "diningAtmospheres",
          title: "Please rank the following dining atmospheres in order of your preference.",
          choices: [
            "Casual Dining",
            "Fine Dining",
            "Trendy/Modern Restaurants",
            "Quirky/Local Eateries"
          ],
          isRequired: false
        },
        {
          type: "rating",
          name: "localStreetFoodImportance",
          title: "How important is it for you to try local street food and markets?",
          rateMin: 1,
          rateMax: 5,
          minRateDescription: "Not Important",
          maxRateDescription: "Extremely Important",
          isRequired: false
        },
        {
          type: "rating",
          name: "barsWineriesInterest",
          title: "How interested are you in visiting local bars, wineries, or breweries?",
          rateMin: 1,
          rateMax: 5,
          minRateDescription: "Not Interested",
          maxRateDescription: "Extremely Interested",
          isRequired: false
        }
      ]
    },
    {
      name: "hiddenMetadataPage",
      navigationButtonsVisibility: "hide",
      elements: [
        {
          type: "text",
          name: "submissionDateTime",
          visible: false
        },
        {
          type: "text",
          name: "user_id",
          visible: false
        }
      ]
    },
    // TRANSITION PAGE: Moving from Dining & Cuisines to Travel Style & Goals
    {
      "name": "transitionToTravel",
      "title": "🎉 Next Up: Your Travel Style & Goals!",
      "elements": [
        {
          "type": "html",
          "html": "<div font-size:18px;'>Now that we got you hungry, let's talk about what a vacation means to you.</div>"
        }
      ]
    },
    // --------------------TRAVEL STYLE PAGE 1 --------------------
    {
      name: "Travel Style 1",
      title: "Travel Style Preferences Part 1",
      elements: [
        {
          type: "ranking",
          name: "mainPurpose",
          title: "Rank your most important vacation objectives:",
          choices: [
            "Adventure / Thrill",
            "Cultural Exchange",
            "Exploration / Sightseeing",
            "Family Bonding",
            "Relaxation"
          ],
          isRequired: false
        },
        {
          type: "checkbox",
          name: "shoppingInterests",
          title: "Select any goods you are interested in shopping for over your vacation:",
          choices: [
            "Clothing",
            "Cosmetics",
            "Decor",
            "Electronics",
            "Home Goods",
            "Jewelry",
            "Local Handicraft",
            "Souvenirs",
            "None"
          ],
          hasOther: true,
          otherText: "Other (please specify)",
          isRequired: false
        }
      ]
    },
    // --------------------TRAVEL STYLE PAGE 2 --------------------
    {
      name: "Travel Style 2",
      title: "Travel Style Preferences Part 2",
      elements: [
        {
          type: "radiogroup",
          name: "prefTour",
          title: "Do you prefer to take Guided Tours or to Independent Explore:",
          choices: [
            "Guided Tours",
            "Independent Exploration",
            "A Mix of Both"
          ],
          isRequired: false
        },
        {
          type: "radiogroup",
          name: "flexTour",
          title: "Do you prefer to follow a Detailed Itinerary or to have Flexibility for Spontaneity:",
          choices: [
            "Detailed Itinerary",
            "Flexibility for Spontaneity",
            "A Mix of Both"
          ],
          isRequired: false
        },
        {
          type: "comment",
          name: "additionalTravel",
          title: "Please share the style of vacations you usually enjoy and your goals of going on vacation.",
          isRequired: false
        }
      ]
    },
    // TRANSITION PAGE: Moving from Travel Style & Goals to Accommodation
    {
      "name": "transitionToTravel",
      "title": "🎉 Next Up: Your Accommodation Preferences!",
      "elements": [
        {
          "type": "html",
          "html": "<div font-size:18px;'>Now that we understand why you are traveling, let's help you find the right place to stay.</div>"
        }
      ]
    },
    // -------------------- ACCOMMODATION PAGE 1 --------------------
    {
      name: "Accommodation Preferences 1",
      title: "Accommodation Preferences Part 1",
      elements: [
        {
          type: "checkbox",
          name: "accommodationType",
          title: "Select the types of accommodation you would consider using:",
          choices: [
            "Bed and Breakfast",
            "Hostel",
            "Motel",
            "Mid-Range Hotels",
            "Luxury Resorts",
            "Vacation Rental",
            "Budget Stays",
            "Boutique/Unique Stays"
          ],
          hasOther: true,
          otherText: "Other (please specify)",
          isRequired: false
        },
        {
          type: "radioGroup",
          name: "access",
          title: "Indicate whether or not you have any accessibility needs or preferences to stay at an accommodation:",
          choices: [
            "No"
          ],
          hasOther: true,
          otherText: "Yes (please specify)",
          isRequired: false
        }
      ]
    },
    // -------------------- ACCOMMODATION PAGE 2 --------------------
    {
      name: "Accommodation Preferences 2",
      title: "Accommodation Preferences Part 2",
      elements: [
        {
          type: "matrix",
          name: "amenities",
          title: "Indicate which amenities you Must Have, Would Like, or Do Not Care About:",
          columns: [ "Must Have", "Would Like", "Do Not Care About" ],
          rows: [
            { value: "breakfast", text: "Complimentary Breakfast" },
            { value: "fitness", text: "Fitness Center" },
            { value: "market", text: "Market" },
            { value: "pool", text: "Pool" },
            { value: "restaurant", text: "Restaurant & Bar" },
            { value: "room_service", text: "Room Service" },
            { value: "wifi", text: "WiFi" }
          ],
          isAllRowRequired: false
        },
        {
          type: "comment",
          name: "additionalAcc",
          title: "Please share the types of accommodation you usually stay at on vacations.",
          isRequired: false
        }
      ]
    },
    // TRANSITION PAGE: Moving from Accommodation to Social & Entertainment
    {
      "name": "transitionToSocEnt",
      "title": "🎉 Next Up: Your Social and Entertainment Preferences!",
      "elements": [
        {
          "type": "html",
          "html": "<div font-size:18px;'>Now that we can find you a place to rest, let's talk about how you have fun.</div>"
        }
      ]
    },
    // --------------------SOCIAL AND ENTERTAINMENT PAGE 1 --------------------
    {
      name: "Social and Entertainment 1",
      title: "Social and Entertainment Preferences Part 1",
      elements: [
        {
          type: "checkbox",
          name: "socialEnterAct",
          title: "Select the types of social outings and entertainment you enjoy over a vacation:",
          choices: [
            "Adventure Sports",
            "Arcades",
            "Art Galleries",
            "Bars",
            "Beer / Wine Tastings",
            "Casinos",
            "Comedy Shows",
            "Concerts",
            "Cooking Classes",
            "Interactive Group Activities",
            "Karaoke",
            "Movies",
            "Museums",
            "Nature Hikes",
            "Nightclubs",
            "Shopping",
            "Spa / Wellness Retreat",
            "Sporting Events",
            "Theater",
            "Theme Parks",
            "Traditional Performances",
            "None"
          ],
          hasOther: true,
          otherText: "Yes (please specify)",
          isRequired: false
        }
      ]
    },
    // --------------------SOCIAL AND ENTERTAINMENT PAGE 2 --------------------
    {
      name: "Social and Entertainment 2",
      title: "Social and Entertainment Preferences Part 2",
      elements: [
        {
          type: "rating",
          name: "prefTour",
          title: "On a scale from 1 to 5, how much do you value a vibrant nightlife?",
          minRateDescription: "Not at all",
          maxRateDescription: "Very much so",
          rateValues: [1, 2, 3, 4, 5],
          isRequired: false
        },
        {
          type: "radiogroup",
          name: "strangers",
          title: "Indicate if you are interested in meeting and socializing with other travelers over your vacation:",
          choices: [
            "Yes",
            "No"
          ],
          isRequired: false
        },
        {
          type: "comment",
          name: "additionalSocEnt",
          title: "Please share the social outings and entertainment do you usually enjoy on vacations.",
          isRequired: false
        }
      ]
    },
    // TRANSITION PAGE: Moving from Social & Entertainment to General Preferences
    {
      "name": "transitionToGen",
      "title": "🎉 Next Up: Your General Preferences!",
      "elements": [
        {
          "type": "html",
          "html": "<div font-size:18px;'>You're almost done! Help us round out our understanding of you by answering a few more questions.</div>"
        }
      ]
    },
    // --------------------GENERAL PAGE 1 --------------------
    {
      name: "General 1",
      title: "General Preferences Part 1",
      elements: [
        {
          type: "checkbox",
          name: "companion",
          title: "Who do you usually travel with?",
          choices: [
            "Family",
            "Friends",
            "Partner / Spouse",
            "Alone",
          ],
          isRequired: false
        },
        {
          type: "rating",
          name: "spontaneous",
          title: "On a scale from 1 to 5, how spontaneous you are with your travel plans?",
          minRateDescription: "Not at all",
          maxRateDescription: "Very much so",
          rateValues: [1, 2, 3, 4, 5],
          isRequired: false
        }
      ]
    },
    // --------------------GENERAL PAGE 2 --------------------
    {
      name: "General 2",
      title: "General Preferences Part 2",
      elements: [
        {
          type: "comment",
          name: "goodPast",
          title: "Please tell us about some activites that you really enjoyed on past vacations to help us recommend you similar activities you may also enjoy:",
          "description": `
          You can also share activities that you are fairly certain you would like.\n
          If there are none you would like to share, just type \"N/A\".\n
          `,
          isRequired: false
        },
        {
          type: "comment",
          name: "badPast",
          title: "Please tell us about some activites from your past vacations that you do not want to experience again to help us recommend you different activities you may enjoy instead:",
          "description": `
          You can also share activities that you are fairly certain you would not like.\n
          If there are none you would like to share, just type \"N/A\".\n
          `,
          isRequired: false
        },
        {
          type: "comment",
          name: "additionalGen",
          title: "Please share anything else that is important to you when on vacations that we missed:",
          isRequired: false
        }
      ]
    }
  ]
};


// // Function to update all questions with the REQUIRE_QUESTIONS setting
// const applyRequirementFlag = (surveyConfig, requireAll) => {
//   if (surveyConfig.pages) {
//     surveyConfig.pages.forEach(page => {
//       if (page.elements) {
//         page.elements.forEach(element => {
//           // If a question has isRequired property, set it to the given flag
//           if (typeof element.isRequired !== "undefined") {
//             element.isRequired = requireAll;
//           }
//           // If it's a matrix and has isAllRowRequired property, update it too
//           if (element.type === "matrix" && typeof element.isAllRowRequired !== "undefined") {
//             element.isAllRowRequired = requireAll;
//           }
//         });
//       }
//     });
//   }
// };


const applyRequirementFlag = (surveyConfig, requireAll) => {
  if (surveyConfig.pages) {
    surveyConfig.pages.forEach(page => {
      if (page.elements) {
        page.elements.forEach(element => {
          // Exclude only text input fields from being required
          // if (element.type !== "text" && typeof element.isRequired !== "undefined") {
          //   element.isRequired = requireAll;
          // }
          element.isRequired = requireAll;

          // If it's a matrix, update isAllRowRequired too
          if (element.type === "matrix" && typeof element.isAllRowRequired !== "undefined") {
            element.isAllRowRequired = requireAll;
          }
        });
      }
    });
  }
};



const PreferenceSurvey = () => {

  const [surveyData, setSurveyData] = useState(null);
  const navigate = useNavigate();
  //const userId = "65d4f9b3c7e8a9d2f1a3b4c5"; // Replace with actual user ID
  //const userId = "65d4f9b3c7e8a9d2f1a3b4c3"; //new one
  const userId = Cookies.get('user_id');

  // Persist survey instance between renders
  const [survey] = useState(() => new Model(surveyJson));

  // Fetch saved progress
  const fetchSavedProgress = async () => {
    try {
      const response = await fetch(`http://localhost:55000/load_progress/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "http://localhost:3000",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch survey data: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("user_id that app is fetching data for: ", userId);
      console.log("data fetched: ", data);
      if (data.exists && data.surveyData) {
        console.log("Survey progress loaded:", data.surveyData);
        setSurveyData(data.surveyData);
      } else {
        console.warn("No saved survey data found.");
      }
    } catch (error) {
      console.error("Error loading saved survey data:", error);
    }
  };

  // Load saved survey data when component mounts
  useEffect(() => {
    fetchSavedProgress();
    //applyRequirementFlag(surveyJson, REQUIRE_QUESTIONS);
  }, []);

  // Update survey model when `surveyData` changes
  useEffect(() => {
    if (surveyData) {
      survey.data = surveyData; // Properly apply fetched survey data
    }
    //applyRequirementFlag(surveyJson, REQUIRE_QUESTIONS);
  }, [surveyData]);


  const onComplete = (survey) => {
    //Set the date time of the submission in the metadata page just before submitting
    //survey.data.submissionDateTime = new Date().toISOString();
    //survey.data.user_id = "kumar502"; // Replace with actual user ID
    survey.setValue("submissionDateTime", new Date().toISOString());
    survey.setValue("user_id", userId); // Replace with actual user ID
    //survey.setValue("user_id", userId); // Replace with actual user ID

    // Submit results to your server if needed
    fetch("http://localhost:55000/submit_preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "http://localhost:3000",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: JSON.stringify(survey.data)
    })
      .then((response) => response.json())
      .then((data) => console.log("Success:", data))
      .catch((error) => console.error("Error:", error));
  };
  

  // Handle "Save & Exit" functionality (No survey parameter needed)
  const saveAndExit = async () => {
    try {
      if (!survey.data || Object.keys(survey.data).length === 0) {
        console.warn("No survey data to save.");
        return;
      }
      // This may be extra:
      survey.setValue("user_id", userId);
      //survey.setValue("user_id", userId); // Ensure user ID is set before saving

      const response = await fetch("http://localhost:55000/save_progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, surveyData: survey.data }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save survey progress: ${response.statusText}`);
      }

      console.log("Survey progress saved.");
      navigate("/"); // Redirect to homepage
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  };

  

  return (
    <Box>
      <Box sx={{ position: "absolute", top: 20, right: 20, zIndex: 1000 }}>
        <Button
            variant="contained"
            sx={{
              backgroundColor: theme.palette.purple.main,
              color: "white",
              "&:hover": { backgroundColor: "#4BAF36" }, // Slightly darker on hover
            }}
            onClick={() => saveAndExit()}
          >
            Save & Exit
          </Button>
      </Box>
      <Survey model={survey} onComplete={onComplete} />
      {/* <Button>
        <a href="http://localhost:3000/">Go back to home</>
      </Button> */}
    </Box>
  );
  
  
};

export default PreferenceSurvey;
