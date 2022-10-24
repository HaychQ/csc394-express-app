//querySelector returns FIRST match
//getElementById returns element with matching id(only ONE ID allowed in html)
/*TODO
CREATE LOGIN SECTION
-Add Eventlistener onclick, store Username & Password into userInfo Object

// Fixes tip of branch issue
git push -f origin main

// TO RUN PROJECT FROM VS CODE
NPM START
OPEN WITH LOCALHOST
http://localhost:3000/

//TO RUN PROJECT FROM EC2/TERMINAL
Connect to EC2 
CD into directory
npm start
View Using Chrome Browser: http://localhost:3000/

//Other static page
http://18.188.223.108/groupproj/
*/

/* 
name="" inside HTML Forms - For Database
User Steam Id => steamid
UserAPI Key   => apikey
Username      => username
Password      => password
*/

// User Information Object - IDEA: PUSH TO DATABASE?
const userInfo = {
  steamId: "",
  apiKey: "",
  username: "",
  password: "",
};

// For example purposes. Will need to replace these with OUR FETCHED GAME IMAGES
const imageList = ["https://i.postimg.cc/GmBrBqkV/steam-card-17.jpg", "https://i.postimg.cc/SsbybCY5/steam-card-5.jpg"];

// HTML ID SELECTORS

// User Input Textboxes
const user_SteamId = document.getElementById("userSteamId");
const user_ApiKey = document.getElementById("userApiKey");

// Create Account Textboxes
const create_SteamId = document.getElementById("createSteamId");
const create_ApiKey = document.getElementById("createApiKey");
const create_Username = document.getElementById("createUsername");
const create_Password = document.getElementById("createPassword");

// User Submit Button - used for EventListener
const btn_UserInput = document.getElementById("btn_UserInput");

// Form - Contains API Key(string) given by User
const user_InputForm = document.getElementById("userInputForm");

// Create Account Form - Contains Username/Password given by User
const create_AccountForm = document.getElementById("createAccountForm");

// Create Account Submit Button - used for EventListener
const btn_CreateAccount = document.getElementById("btn_CreateAccount");

// Individual Game Selectors
// const game1 = document.getElementById("game-1");

/* 
btn_CreateAccount.addEventListener("click", function (event) {
  // PREVENTS FORM SUBMISSION
  // event.preventDefault();

  // If TRUE, then store all data into userInfo Object
  if (isCreateAccountValid()) {
    userInfo.username = create_AccountForm.createUsername.value;
    userInfo.password = create_AccountForm.createPassword.value;
    userInfo.steamId = create_AccountForm.createSteamId.value;
    userInfo.apiKey = create_AccountForm.createApiKey.value;

    console.log("Create - Username: ", userInfo.username);
    console.log("Create - Password: ", userInfo.password);
    console.log("Create - SteamId: ", userInfo.steamId);
    console.log("Create - ApiKey: ", userInfo.apiKey);
    console.log("Create - userInfo: ", userInfo);

    //Call function to display games
    // displayGames();
  } else {
    alert("Please fill out all input fields");
  }
});
*/

/* 
const handleReq = document.getElementById("submittest");
handleReq.addEventListener("click", function (event) {
  var req = new XMLHttpRequest();
  req.open("GET", URL, true);
  req.addEventListener("load", function () {
    if (req.status >= 200 && req.status < 400) {
      var response = JSON.parse(req.responseText);
      console.log(JSON.parse(req.responseText));
    } else {
      console.log("Error in network request: " + request.statusText);
    }
  });
  req.send(null);

  ///////////////////////////////////////
  //For this part of the guide, we will be making a client side AJAX request to our server we are running. This will take a format similar to first experiment on Page 2:
  // Checks that User provided Username, Password, SteamId, & Api Key
  function isCreateAccountValid() {
    const username = create_AccountForm.createUsername.value;
    const password = create_AccountForm.createPassword.value;
    const id = create_AccountForm.createSteamId.value;
    const key = create_AccountForm.createApiKey.value;

    if (username.length !== 0 && password.length !== 0 && id.length !== 0 && key.length !== 0) return true;
    else return false;
  }

  //
  function bindGetNewsButton() {
    document.getElementById("getNewsForApp").addEventListener("click", function (event) {
      var homeURL = "http://localhost:3000/getnews/?";
      var userInput = document.getElementById("getNewsInput").value;
      var newURL = homeURL + userInput;
      var req = new XMLHttpRequest();
      req.open("GET", newURL, true);
      req.addEventListener("load", function () {
        if (req.status >= 200 && req.status < 400) {
          var response = JSON.parse(req.responseText);
          console.log(JSON.parse(req.responseText));
        } else {
          console.log("Error in network request: " + request.statusText);
        }
      });
      req.send(null);
    });
  }

  function bindUserStatsButton() {
    document.getElementById("getUserStatsForGame").addEventListener("click", function (event) {
      var homeURL = "http://localhost:3000/getuserstats/?";
      var userAppID = document.getElementById("getUserStatsAppID").value;
      var userPlayerID = document.getElementById("getUserStatsPlayerID").value;
      var newURL = homeURL + userAppID + "=" + userPlayerID;
      var req = new XMLHttpRequest();
      req.open("GET", newURL, true);
      req.addEventListener("load", function () {
        if (req.status >= 200 && req.status < 400) {
          var response = JSON.parse(req.responseText);
          console.log(JSON.parse(req.responseText));
        } else {
          console.log("Error in network request: " + request.statusText);
        }
      });
      req.send(null);
      console.log("Egg");
      event.preventDefault();
    });
  }
});
*/

/* 
btn_UserInput.addEventListener("click", function (event) {
  // PREVENTS FORM SUBMISSION
  event.preventDefault();

  if (isUserInputValid()) {
    // Storing User Steam ID & User API Key into userInfo object
    userInfo.steamId = user_InputForm.userSteamId.value;
    userInfo.apiKey = user_InputForm.userApiKey.value;

    console.log("User Steam ID: ", userInfo.steamId);
    console.log("User API KEY: ", userInfo.apiKey);
    console.log("userInfo: ", userInfo);

    //Call function to display games
    displayGames();
  } else {
    alert("Please enter Steam ID and Steam API Key");
  }
});
*/

// Checks that User has provided SteamId & Api Key
function isUserInputValid() {
  const id = user_InputForm.userSteamId.value;
  const key = user_InputForm.userApiKey.value;

  if (id.length !== 0 && key.length !== 0) return true;
  else return false;
}

/* 
  Updates Game slot - Example/Placeholder - Game image will be displayed here
  Updates each game using String literals
*/
function displayGames() {
  for (let i = 1; i < 11; i++) {
    // document.getElementById(`game-${i}`).innerHTML = `Display${i}`;
    if (i < 6) {
      document.getElementById(`game-${i}`).innerHTML = `<img src=${imageList[0]}/>`;
    } else document.getElementById(`game-${i}`).innerHTML = `<img src=${imageList[1]}/>`;
  }
}
/*
document.getElementById("game-1").innerHTML = "Display1";
document.getElementById("game-2").innerHTML = "Display2";
document.getElementById("game-3").innerHTML = "Display3";
document.getElementById("game-4").innerHTML = "Display4";
document.getElementById("game-5").innerHTML = "Display5";
document.getElementById("game-6").innerHTML = "Display6";
document.getElementById("game-7").innerHTML = "Display7";
document.getElementById("game-8").innerHTML = "Display8";
document.getElementById("game-9").innerHTML = "Display9";
document.getElementById("game-10").innerHTML = "Display10";
*/

//ADMIN PANEL
console.log("TESTING IN SCRIPT");

const addUserIntoTable = () => {
  for (let i = 1; i < 11; i++) {
    // document.getElementById(`game-${i}`).innerHTML = `Display${i}`;
    // console.log("inside for loop");

    // let elements = document.getElementsByClassName("user-row");
    // document.getElementsByClassName("user-row").adjacentHTML = `<div>test</div>`;
    // document.getElementById(`game-${i}`).innerHTML = `<img src=${imageList[0]}/>`;

    // if (i < 6) {
    //   document.getElementById(`game-${i}`).innerHTML = `<img src=${imageList[0]}/>`;
    // } else document.getElementById(`game-${i}`).innerHTML = `<img src=${imageList[1]}/>`;

    var table = document.getElementById("myTable");

    // Inserts new user row
    var row = table.insertRow(0);

    // Inserts into userNum cell
    var usernum = row.insertCell(0);

    // Inserts into username cell
    var username = row.insertCell(1);

    // Inserts into password cell
    var password = row.insertCell(2);

    // Inserts into id cell
    var id = row.insertCell(3);

    // Inserts into apikey cell
    var apikey = row.insertCell(4);

    // Inserts into action cell
    var action = row.insertCell(5);

    usernum.innerHTML = "#";
    username.innerHTML = "username";
    password.innerHTML = "password";
    id.innerHTML = "steamuserId";
    apikey.innerHTML = "steamapikey";
    action.innerHTML = "action";
  }
};

// Renders 10 cells
// addUserIntoTable();
