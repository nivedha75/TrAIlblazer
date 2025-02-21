import React from "react";
import { Survey } from "survey-react";
//import "survey-react/survey.css";
import { useNavigate } from "react-router-dom";
import 'survey-core/defaultV2.min.css';
//import { ContrastDark } from "survey-core/themes";
import { StylesManager } from "survey-core";

const surveyJson = {
  completeText: "Submit",
  showProgressBar: "top",
  title: "Travel Preferences Survey",
  pages: [
    {
      name: "Dining Preferences",
      elements: [
        {
          type: "ranking",
          name: "cuisineRanking",
          title: "Rank the following cuisines:",
          choices: ["Thai", "Indian", "Chinese", "Mexican", "Italian"],
          isRequired: true
        },
        {
          type: "ranking",
          name: "cuisineRanking2",
          title: "Rank the following cuisines:",
          choices: ["Thai", "Indian", "Chinese", "Mexican", "Italian"],
          isRequired: true
        }
      ],
    },
    {
      name: "Lifestyle Habits",
      elements: [
        {
          type: "checkbox",
          name: "lifestyleHabits",
          title: "Select your lifestyle habits:",
          choices: [
            "Early Riser",
            "Night Owl",
            "Fitness Enthusiast",
            "Relaxation Seeker",
            "Tech-Savvy",
            "Eco-Friendly"
          ],
          isRequired: true
        }
      ]
    },
    {
      name: "Hobbies and Interests",
      elements: [
        {
          type: "comment",
          name: "hobbies",
          title: "What are your interests and hobbies?",
          isRequired: true
        },
        {
          type: "text",
          name: "favoriteHobby",
          title: "What is your favorite hobby?",
          isRequired: true
        }
      ]
    },
    /////////  Travel Style
    {
      name: "Travel Style",
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
          isRequired: true
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
            "Other",
            "None"
          ],
          isRequired: true
        },
        {
          type: "text",
          name: "shoppingInterestsOther",
          title: "Please specify your shopping interests:",
          visibleIf: "{shoppingInterests} contains 'Other'",
          isRequired: true
        },
        {
          type: "radiogroup",
          name: "prefTour",
          title: "Do you prefer to take Guided Tours or to Independent Explore:",
          choices: [
            "Guided Tours",
            "Independent Exploration",
            "A Mix of Both"
          ],
          isRequired: true
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
          isRequired: true
        }
      ]
    },
    /////////
///////// Accommodation Preference
    {
  name: "Accommodation Preference",
  elements: [
    {
      type: "checkbox",
      name: "accommodationType",
      title: "Select the types of accommodation you would consider using:",
      choices: [
        "Bed and Breakfast",
        "Hostel",
        "Hotel",
        "Motel",
        "Resort",
        "Vacation Rental",
        "Other"
      ],
      isRequired: true
    },
    {
      type: "text",
      name: "accommodationTypeOther",
      title: "Please specify your desired accommodation:",
      visibleIf: "{accommodationType} contains 'Other'",
      isRequired: true
    },
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
        { value: "wc_access", text: "Wheelchair Access" },
        { value: "wifi", text: "WiFi" }
      ],
      isRequired: true,
    },
    /*{
      type: "radiogroup",
      name: "prefTour",
      title: "Do you prefer to take Guided Tours or to Independent Explore:",
      choices: [
        "Guided Tours",
        "Independent Exploration",
        "A Mix of Both"
      ],
      isRequired: true
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
      isRequired: true
      survey.data = {
    "amenities": {
      "breakfast": "Do Not Care About",
      "fitness": "Do Not Care About",
      "market": "Do Not Care About",
      "pool": "Do Not Care About",
      "restaurant": "Do Not Care About",
      "room_service": "Do Not Care About",
      "wc_access": "Do Not Care About",
      "wifi": "Do Not Care About",
    }
  }
    }*/
  ]
}
/////////
  ]
};

const PreferenceSurvey = () => {
  //StylesManager.applyTheme("contrast");
  const onComplete = (survey) => {
    fetch("http://localhost:55000/submit_preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "http://localhost:3000", // Required for CORS support to work
        "Access-Control-Allow-Methods": 'POST, OPTIONS',
        "Access-Control-Allow-Headers": 'Content-Type'
      },
      body: JSON.stringify(survey.data)
    })
      .then((response) => response.json())
      .then((data) => console.log("Success:", data))
      .catch((error) => console.error("Error:", error));
  };

  return <Survey json={surveyJson} onComplete={onComplete} />;
};

export default PreferenceSurvey;
