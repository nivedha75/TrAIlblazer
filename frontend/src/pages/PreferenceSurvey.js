import React from "react";
import { Survey } from "survey-react";
import "survey-core/defaultV2.min.css";
import { Model } from "survey-core"; // If you want to manipulate the model directly.
import { useNavigate } from "react-router-dom";
// import { ContrastDark } from "survey-core/themes";
import { StylesManager } from "survey-core";

// This variable controls if all questions are required or not
const REQUIRE_QUESTIONS = false; // Toggle this to true/false as needed

const surveyJson = {
  completeText: "Submit",
  showProgressBar: "top",
  title: "Travel Preferences Survey",
  pages: [
    // -------------------- LIFESTYLE PAGE 1 --------------------
    {
      name: "lifestylePreferencesPage1",
      elements: [
        {
          type: "rating",
          name: "travelPace",
          title: "On a scale from 1 to 5, how fast-paced do you like your travel?",
          rateMin: 1,
          rateMax: 5,
          minRateDescription: "Very Relaxed",
          maxRateDescription: "Very Fast-Paced",
          isRequired: true
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
          isRequired: true
        },
        {
          type: "boolean",
          name: "groupTours",
          title: "Are you open to participating in group tours or shared experiences?",
          labelTrue: "Yes",
          labelFalse: "No",
          isRequired: true
        }
      ]
    },
    // -------------------- LIFESTYLE PAGE 2 --------------------
    {
      name: "lifestylePreferencesPage2",
      elements: [
        {
          type: "checkbox",
          name: "accommodationPreferences",
          title: "Which types of accommodation do you prefer? (Select all that apply)",
          choices: [
            "Hostels/Budget Stays",
            "Mid-Range Hotels",
            "Luxury Resorts",
            "Boutique/Unique Stays"
          ],
          isRequired: true
        },
        {
          type: "rating",
          name: "publicTransportationComfort",
          title: "How comfortable are you with using public transportation in a new destination?",
          rateMin: 1,
          rateMax: 5,
          minRateDescription: "Not Comfortable",
          maxRateDescription: "Very Comfortable",
          isRequired: true
        },
        {
          type: "comment",
          name: "generalLifestylePrefs",
          title:
            "Please describe any general lifestyle preferences or considerations (e.g., scheduling constraints, energy level).",
          // NOT required
          isRequired: false
        }
      ]
    },
    // -------------------- INTERESTS/HOBBIES PAGE 1 --------------------
    {
      name: "interestsHobbiesPage1",
      elements: [
        {
          type: "checkbox",
          name: "activityPreferences",
          title: "Which of these activities appeal to you? (Select all that apply)",
          choices: [
            "Photography",
            "Hiking/Outdoor Adventures",
            "Scuba Diving/Snorkeling",
            "Shopping",
            "Art (Galleries, Street Art, Museums)"
          ],
          hasOther: true,
          otherText: "Other (please specify)",
          isRequired: true
        },
        {
          type: "rating",
          name: "natureVsUrban",
          title: "On a scale from 1 to 10, how strongly do you prefer nature over urban cityscapes?",
          rateMin: 1,
          rateMax: 10,
          minRateDescription: "Prefer Cityscapes",
          maxRateDescription: "Prefer Nature",
          isRequired: true
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
          isRequired: true
        }
      ]
    },
    // -------------------- INTERESTS/HOBBIES PAGE 2 --------------------
    {
      name: "interestsHobbiesPage2",
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
            { value: "historicalSites", text: "Historical Sites/Museums" },
            { value: "localFestivals", text: "Local Festivals/Celebrations" },
            { value: "livePerformances", text: "Live Performances" },
            { value: "nightlife", text: "Nightlife (bars, clubs)" }
          ],
          // Force an answer for each row
          isAllRowRequired: true
        },
        {
          type: "comment",
          name: "additionalInterests",
          title: "Please share any other hobbies or unique passions that might influence your trip.",
          isRequired: false
        },
        {
          type: "dropdown",
          name: "localHistoryLearning",
          title: "How do you prefer learning about local history?",
          choices: [
            "Guided Tours",
            "Self-Guided Audio Tours",
            "Reading Museum Exhibits/Brochures",
            "Not Particularly Interested"
          ],
          isRequired: true
        }
      ]
    },
    // -------------------- DINING/CUISINES PAGE 1 --------------------
    {
      name: "diningCuisinesPage1",
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
          isRequired: true
        },
        {
          type: "rating",
          name: "localStreetFoodImportance",
          title: "How important is it for you to try local street food and markets?",
          rateMin: 1,
          rateMax: 5,
          minRateDescription: "Not Important",
          maxRateDescription: "Extremely Important",
          isRequired: true
        },
        {
          type: "comment",
          name: "favoriteOrAvoidedFlavors",
          title: "Any specific ingredients/flavors you love or want to avoid?",
          isRequired: false
        }
      ]
    },
    // -------------------- DINING/CUISINES PAGE 2 --------------------
    {
      name: "diningCuisinesPage2",
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
          isRequired: true
        },
        {
          type: "rating",
          name: "formalMealsPerDay",
          title: "How many formal sit-down meals per day would you like?",
          rateMin: 0,
          rateMax: 3,
          minRateDescription: "0 (None)",
          maxRateDescription: "3 (Breakfast, Lunch & Dinner)",
          isRequired: true
        },
        {
          type: "rating",
          name: "barsWineriesInterest",
          title: "How interested are you in visiting local bars, wineries, or breweries?",
          rateMin: 1,
          rateMax: 5,
          minRateDescription: "Not Interested",
          maxRateDescription: "Extremely Interested",
          isRequired: true
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
    }
  ]
};

// 2. Function to update all questions with the REQUIRE_QUESTIONS setting
const applyRequirementFlag = (surveyConfig, requireAll) => {
  if (surveyConfig.pages) {
    surveyConfig.pages.forEach(page => {
      if (page.elements) {
        page.elements.forEach(element => {
          // If a question has isRequired property, set it to the given flag
          if (typeof element.isRequired !== "undefined") {
            element.isRequired = requireAll;
          }
          // If it's a matrix and has isAllRowRequired property, update it too
          if (element.type === "matrix" && typeof element.isAllRowRequired !== "undefined") {
            element.isAllRowRequired = requireAll;
          }
        });
      }
    });
  }
};

const PreferenceSurvey = () => {

  // Apply the requirement flag before creating the model
  applyRequirementFlag(surveyJson, REQUIRE_QUESTIONS);

  // Create the survey model AFTER we set isRequired
  const survey = new Model(surveyJson);

  const onComplete = (survey) => {
    // Set the date time of the submission in the metadata page just before submitting
    //survey.data.submissionDateTime = new Date().toISOString();
    //survey.data.user_id = "kumar502"; // Replace with actual user ID
    survey.setValue("submissionDateTime", new Date().toISOString());
    survey.setValue("user_id", "65d4f9b3c7e8a9d2f1a3b4c5"); // Replace with actual user ID

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

  return <Survey model={survey} onComplete={onComplete} />;
};

export default PreferenceSurvey;
