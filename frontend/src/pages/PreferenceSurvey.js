import React from "react";
import { Survey } from "survey-react";
import "survey-react/survey.css";
import { useNavigate } from "react-router-dom";

const surveyJson = {
  title: "Travel Preferences Survey",
  pages: [
    {
      name: "Dining Preferences",
      elements: [
        {
          type: "ranking",
          name: "cuisineRanking",
          title: "Rank the following cuisines:",
          choices: ["Thai", "Indian", "Chinese", "Mexican", "Italian"]
        },
        {
          type: "ranking",
          name: "cuisineRanking2",
          title: "Rank the following cuisines:",
          choices: ["Thai", "Indian", "Chinese", "Mexican", "Italian"]
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
          ]
        }
      ]
    },
    {
      name: "Hobbies and Interests",
      elements: [
        {
          type: "comment",
          name: "hobbies",
          title: "What are your interests and hobbies?"
        },
        {
          type: "text",
          name: "favoriteHobby",
          title: "What is your favorite hobby?"
        }
      ]
    }
  ]
};

const PreferenceSurvey = () => {
  const onComplete = (survey) => {
    fetch("http://localhost:5000/submit_preferences", {
      // mode: 'no-cors',
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
