const json = {
 "title": "Geography Quiz",
 "completedHtml": "<h4>You got <b>{correctAnswers}</b> out of <b>{questionCount}</b> correct answers.</h4>",
 "completedHtmlOnCondition": [
  {
   "expression": "{correctAnswers} == 0",
   "html": "<h4>Unfortunately, none of your answers is correct. Please try again.</h4>"
  },
  {
   "expression": "{correctAnswers} == {questionCount}",
   "html": "<h4>Congratulations! You answered all the questions correctly!</h4>"
  }
 ],
 "pages": [
  {
   "name": "intro",
   "elements": [
    {
     "type": "html",
     "name": "intro-text",
     "html": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>Welcome to the Geography Test!</title>\n    <style>\n        ul {\n            list-style-type: disc;\n            padding-left: 10px;\n        }\n    </style>\n</head>\n<body> \n<p style=\"margin-top: 1em; text-align: justify;\">\n  <strong>Welcome to the Geography Quiz!</strong>\n</p>\n<p style=\"margin-top: 1em; text-align: justify;\">This quiz is designed to challenge your knowledge of various geographical facts and locations around the world. You will be presented with a series of multiple-choice questions, each with four possible answers. Carefully read each question and select the answer you believe is correct.\n<br>\n<br>\nBefore you begin, please enter your name in the field below. This will help us keep track of your results. Then, click <b>Start Quiz</b>.\n<br>\n<br>\nGood luck, and enjoy testing your geography knowledge!</p>"
    },
    {
     "type": "text",
     "name": "username",
     "titleLocation": "hidden",
     "isRequired": true,
     "maxLength": 25,
     "placeholder": "Emily Johnson"
    }
   ]
  },
  {
   "name": "first-page",
   "elements": [
    {
     "type": "radiogroup",
     "name": "capital-australia",
     "title": "What is the capital city of Australia?",
     "correctAnswer": "c) Canberra",
     "choices": [
      "a) Sydney",
      "b) Melbourne",
      "c) Canberra",
      "d) Brisbane"
     ],
     "choicesOrder": "random",
     "colCount": 2
    }
   ]
  },
  {
   "name": "second-page",
   "elements": [
    {
     "type": "radiogroup",
     "name": "longest-river",
     "title": "Which river is the longest in the world?",
     "correctAnswer": "b) Nile River",
     "choices": [
      {
       "value": "a) Amazon River",
       "text": "a) the Amazon River"
      },
      {
       "value": "b) Nile River",
       "text": "b) the Nile River"
      },
      {
       "value": "c) Yangtze River",
       "text": "c) the Yangtze River"
      },
      {
       "value": "d) Mississippi River",
       "text": "d) the Mississippi River"
      }
     ],
     "choicesOrder": "random",
     "colCount": 2
    }
   ]
  },
  {
   "name": "third-page",
   "elements": [
    {
     "type": "radiogroup",
     "name": "mountain-everest",
     "title": "Mount Everest is located in which two countries?",
     "correctAnswer": "d) Nepal and China",
     "choices": [
      "a) India and China",
      "b) Nepal and India",
      "c) China and Bhutan",
      "d) Nepal and China"
     ],
     "choicesOrder": "random",
     "colCount": 2
    },
    {
     "type": "radiogroup",
     "name": "largest-desert",
     "title": "What is the largest desert in the world?",
     "correctAnswer": "d) the Antarctic Desert",
     "choices": [
      "a) the Sahara Desert",
      "b) the Arabian Desert",
      "c) the Gobi Desert",
      "d) the Antarctic Desert"
     ],
     "choicesOrder": "random",
     "colCount": 2
    },
    {
     "type": "radiogroup",
     "name": "largest-population",
     "title": "Which country has the largest population in the world?",
     "correctAnswer": "d) China",
     "choices": [
      "a) India",
      {
       "value": "b) United States",
       "text": "b) the United States"
      },
      "c) Indonesia",
      "d) China"
     ],
     "choicesOrder": "random",
     "colCount": 2
    },
    {
     "type": "radiogroup",
     "name": "great-barrier-reef",
     "title": "The Great Barrier Reef is off the coast of which country?",
     "correctAnswer": "b) Australia",
     "choices": [
      "a) Brazil",
      "b) Australia",
      "c) Indonesia",
      "d) South Africa"
     ],
     "choicesOrder": "random",
     "colCount": 2
    },
    {
     "type": "radiogroup",
     "name": "continent-sahara",
     "title": "Which continent is the Sahara Desert located in?",
     "correctAnswer": "b) Africa",
     "choices": [
      "a) Asia",
      "b) Africa",
      "c) South America",
      "d) Australia"
     ],
     "choicesOrder": "random",
     "colCount": 2
    },
    {
     "type": "radiogroup",
     "name": "smallest-country",
     "title": "What is the smallest country in the world by area?",
     "correctAnswer": "c) Vatican City",
     "choices": [
      "a) Monaco",
      "b) San Marino",
      "c) Vatican City",
      "d) Liechtenstein"
     ],
     "choicesOrder": "random",
     "colCount": 2
    },
    {
     "type": "radiogroup",
     "name": "sunshine-state",
     "title": "Which U.S. state is known as the \"Sunshine State\"?",
     "correctAnswer": "c) Florida",
     "choices": [
      "a) California",
      "b) Texas",
      "c) Florida",
      "d) Arizona"
     ],
     "choicesOrder": "random",
     "colCount": 2
    },
    {
     "type": "radiogroup",
     "name": "land-rising-sun",
     "title": "Which country is known as the Land of the Rising Sun?",
     "correctAnswer": "b) Japan",
     "choices": [
      "a) China",
      "b) Japan",
      "c) South Korea",
      "d) Thailand"
     ],
     "choicesOrder": "random",
     "colCount": 2
    },
    {
     "type": "radiogroup",
     "name": "danube-river",
     "title": "The Danube River flows through how many countries?",
     "correctAnswer": "c) 10",
     "choices": [
      "a) 4",
      "b) 6",
      "c) 10",
      "d) 12"
     ],
     "choicesOrder": "random",
     "colCount": 2
    },
    {
     "type": "radiogroup",
     "name": "largest-ocean",
     "title": "Which is the largest ocean in the world?",
     "correctAnswer": "d) Pacific Ocean",
     "choices": [
      "a) Atlantic Ocean",
      "b) Indian Ocean",
      "c) Arctic Ocean",
      "d) Pacific Ocean"
     ],
     "choicesOrder": "random",
     "colCount": 2
    }
   ]
  }
 ],
 "cookieName": "geography-quiz",
 "showProgressBar": "belowheader",
 "progressBarType": "questions",
 "allowCompleteSurveyAutomatic": false,
 "startSurveyText": "Start Quiz",
 "firstPageIsStarted": true,
 "questionsOnPageMode": "questionPerPage",
 "timeLimit": 120,
 "showTimer": true,
 "headerView": "advanced"
};const themeJson = {
    "themeName": "flat",
    "colorPalette": "light",
    "isPanelless": false,
    "backgroundImage": "",
    "backgroundOpacity": 1,
    "backgroundImageAttachment": "scroll",
    "backgroundImageFit": "cover",
    "cssVariables": {
        "--sjs-corner-radius": "4px",
        "--sjs-base-unit": "8px",
        "--sjs-shadow-small": "0px 0px 0px 1px rgba(0, 0, 0, 0.15)",
        "--sjs-shadow-inner": "0px 0px 0px 1px rgba(0, 0, 0, 0.12)",
        "--sjs-border-default": "rgba(0, 0, 0, 0.12)",
        "--sjs-border-light": "rgba(0, 0, 0, 0.12)",
        "--sjs-general-backcolor": "rgba(246, 246, 246, 1)",
        "--sjs-general-backcolor-dark": "rgba(235, 235, 235, 1)",
        "--sjs-general-backcolor-dim-light": "rgba(255, 255, 255, 1)",
        "--sjs-general-backcolor-dim-dark": "rgba(235, 235, 235, 1)",
        "--sjs-general-forecolor": "rgba(0, 0, 0, 0.91)",
        "--sjs-general-forecolor-light": "rgba(0, 0, 0, 0.45)",
        "--sjs-general-dim-forecolor": "rgba(0, 0, 0, 0.91)",
        "--sjs-general-dim-forecolor-light": "rgba(0, 0, 0, 0.45)",
        "--sjs-secondary-backcolor": "rgba(255, 152, 20, 1)",
        "--sjs-secondary-backcolor-light": "rgba(255, 152, 20, 0.1)",
        "--sjs-secondary-backcolor-semi-light": "rgba(255, 152, 20, 0.25)",
        "--sjs-secondary-forecolor": "rgba(255, 255, 255, 1)",
        "--sjs-secondary-forecolor-light": "rgba(255, 255, 255, 0.25)",
        "--sjs-shadow-small-reset": "0px 0px 0px 0px rgba(0, 0, 0, 0.15)",
        "--sjs-shadow-medium": "0px 0px 0px 1px rgba(0, 0, 0, 0.1),0px 2px 6px 0px rgba(0, 0, 0, 0.1)",
        "--sjs-shadow-large": "0px 8px 16px 0px rgba(0, 0, 0, 0.1)",
        "--sjs-shadow-inner-reset": "0px 0px 0px 0px rgba(0, 0, 0, 0.12)",
        "--sjs-border-inside": "rgba(0, 0, 0, 0.16)",
        "--sjs-special-red-forecolor": "rgba(255, 255, 255, 1)",
        "--sjs-special-green": "rgba(25, 179, 148, 1)",
        "--sjs-special-green-light": "rgba(25, 179, 148, 0.1)",
        "--sjs-special-green-forecolor": "rgba(255, 255, 255, 1)",
        "--sjs-special-blue": "rgba(67, 127, 217, 1)",
        "--sjs-special-blue-light": "rgba(67, 127, 217, 0.1)",
        "--sjs-special-blue-forecolor": "rgba(255, 255, 255, 1)",
        "--sjs-special-yellow": "rgba(255, 152, 20, 1)",
        "--sjs-special-yellow-light": "rgba(255, 152, 20, 0.1)",
        "--sjs-special-yellow-forecolor": "rgba(255, 255, 255, 1)",
        "--sjs-article-font-xx-large-textDecoration": "none",
        "--sjs-article-font-xx-large-fontWeight": "700",
        "--sjs-article-font-xx-large-fontStyle": "normal",
        "--sjs-article-font-xx-large-fontStretch": "normal",
        "--sjs-article-font-xx-large-letterSpacing": "0",
        "--sjs-article-font-xx-large-lineHeight": "64px",
        "--sjs-article-font-xx-large-paragraphIndent": "0px",
        "--sjs-article-font-xx-large-textCase": "none",
        "--sjs-article-font-x-large-textDecoration": "none",
        "--sjs-article-font-x-large-fontWeight": "700",
        "--sjs-article-font-x-large-fontStyle": "normal",
        "--sjs-article-font-x-large-fontStretch": "normal",
        "--sjs-article-font-x-large-letterSpacing": "0",
        "--sjs-article-font-x-large-lineHeight": "56px",
        "--sjs-article-font-x-large-paragraphIndent": "0px",
        "--sjs-article-font-x-large-textCase": "none",
        "--sjs-article-font-large-textDecoration": "none",
        "--sjs-article-font-large-fontWeight": "700",
        "--sjs-article-font-large-fontStyle": "normal",
        "--sjs-article-font-large-fontStretch": "normal",
        "--sjs-article-font-large-letterSpacing": "0",
        "--sjs-article-font-large-lineHeight": "40px",
        "--sjs-article-font-large-paragraphIndent": "0px",
        "--sjs-article-font-large-textCase": "none",
        "--sjs-article-font-medium-textDecoration": "none",
        "--sjs-article-font-medium-fontWeight": "700",
        "--sjs-article-font-medium-fontStyle": "normal",
        "--sjs-article-font-medium-fontStretch": "normal",
        "--sjs-article-font-medium-letterSpacing": "0",
        "--sjs-article-font-medium-lineHeight": "32px",
        "--sjs-article-font-medium-paragraphIndent": "0px",
        "--sjs-article-font-medium-textCase": "none",
        "--sjs-article-font-default-textDecoration": "none",
        "--sjs-article-font-default-fontWeight": "400",
        "--sjs-article-font-default-fontStyle": "normal",
        "--sjs-article-font-default-fontStretch": "normal",
        "--sjs-article-font-default-letterSpacing": "0",
        "--sjs-article-font-default-lineHeight": "28px",
        "--sjs-article-font-default-paragraphIndent": "0px",
        "--sjs-article-font-default-textCase": "none",
        "--sjs-general-backcolor-dim": "rgba(255, 255, 255, 1)",
        "--sjs-primary-backcolor": "#bf4c61",
        "--sjs-primary-backcolor-dark": "rgba(169, 67, 86, 1)",
        "--sjs-primary-backcolor-light": "rgba(191, 76, 97, 0.1)",
        "--sjs-primary-forecolor": "rgba(255, 255, 255, 1)",
        "--sjs-primary-forecolor-light": "rgba(255, 255, 255, 0.25)",
        "--sjs-special-red": "rgba(229, 10, 62, 1)",
        "--sjs-special-red-light": "rgba(229, 10, 62, 0.1)"
    },
    "header": {
        "height": 180,
        "textAreaWidth": 270,
        "titlePositionX": "center",
        "titlePositionY": "top"
    },
    "headerView": "basic"
};
function SurveyComponent() {
    const survey = new Survey.Model(json);
    survey.applyTheme(themeJson);
    survey.onComplete.add((sender, options) => {
        console.log(JSON.stringify(sender.data, null, 3));
    });
    return (<SurveyReact.Survey model={survey} />);
}
const root = ReactDOM.createRoot(document.getElementById("surveyElement"));
root.render(<SurveyComponent />);

export default json;
