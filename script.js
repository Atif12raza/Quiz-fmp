
var firebaseConfig = {
  apiKey: "AIzaSyAESLTFic7rfqW7KLuYYtrHBxlTg30YTPo",
  authDomain: "quiz-app-1cc98.firebaseapp.com",
  databaseURL: "https://quiz-app-1cc98-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "quiz-app-1cc98",
  storageBucket: "quiz-app-1cc98.firebasestorage.app",
  messagingSenderId: "1065412191441",
  appId: "1:1065412191441:web:93e3450833cacef36cd1f0"
};

firebase.initializeApp(firebaseConfig);
var quizDatabaseRef = firebase.database();

var currentQuestionIndex = 0;  
var score = 0; 
var questions = [];  
var questionElement = document.getElementById("question");
var optionsElement = document.getElementById("options");
var nextBtn = document.getElementById("next-btn");
var resultElement = document.getElementById("result");

function loadQuestions() {
  quizDatabaseRef.ref("questions").once("value")
    .then(function(snapshot) {
      snapshot.forEach(function(childSnapshot) {
        const questionData = childSnapshot.val();
        
        if (questionData && questionData.question && Array.isArray(questionData.options) && questionData.options.length > 0) {
          questions.push(questionData);
        } else {
          console.warn("Invalid question format:", questionData);
        }
      });

      if (questions.length > 0) {
        displayQuestion(); 
      } else {
        console.error("No valid questions found in the database.");
        questionElement.innerHTML = "No questions available.";
      }
    })
    .catch(function(error) {
      console.error("Error loading questions:", error);
    });
}

function displayQuestion() {
  var currentQuestion = questions[currentQuestionIndex];
  
  if (!currentQuestion || !currentQuestion.question || !Array.isArray(currentQuestion.options)) {
    console.error("Question or options missing at index:", currentQuestionIndex);
    questionElement.innerHTML = "Error: Question data is incomplete.";
    return;
  }

  questionElement.innerHTML = currentQuestion.question;
  optionsElement.innerHTML = "";  
  
  nextBtn.disabled = true;  
  
  currentQuestion.options.forEach(function(option, index) {
    var button = document.createElement("button");
    button.innerHTML = option;  
    button.onclick = function() {
      checkUserAnswer(index);  
    };
    optionsElement.appendChild(button);
  });
}

function checkUserAnswer(selectedIndex) {
  var currentQuestion = questions[currentQuestionIndex];
  
  var buttons = optionsElement.getElementsByTagName("button");

  for (var i = 0; i < buttons.length; i++) {
    buttons[i].style.backgroundColor = ""; 
    buttons[i].style.color = "";  
  }

  buttons[selectedIndex].style.backgroundColor = "#801BEC";
  buttons[selectedIndex].style.color = "white";

  if (selectedIndex === currentQuestion.correctAnswer) {
    score++; 
  }

  nextBtn.disabled = false;
}

nextBtn.onclick = function() {
  currentQuestionIndex++;  
  if (currentQuestionIndex < questions.length) {
    displayQuestion();
  } else {
    showResult();
  }
};

function showResult() {
  questionElement.style.display = "none";
  optionsElement.style.display = "none";
  nextBtn.style.display = "none";
  
  resultElement.innerHTML = "Your score: " + score + "/" + questions.length;

  saveScoreToFirebase();
}

function saveScoreToFirebase() {
  quizDatabaseRef.ref("scores").push({
    score: score,
    date: new Date().toLocaleString(), 
  });
}

loadQuestions();
