const express = require("express");
const { pool } = require("./dbConfig");
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
require("dotenv").config();
const app = express();
const request = require("request");
const PORT = process.env.PORT || 3000;
const fetch = require("node-fetch");
const initializePassport = require("./passport-config");
const { json } = require("express");

initializePassport(passport);

//SUPER USER ACCOUNT DETAILS:
//Email: user@email.com
//Password: password

// Parses details from a form
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));

app.use(express.static(__dirname + "/public"));
app.use(express.static("public"));

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(
  session({
    // Key we want to keep secret which will encrypt all of our information
    secret: process.env.SESSION_SECRET,
    // Should we resave our session variables if nothing has changes which we dont
    resave: false,
    // Save empty value if there is no vaue which we do not want to do
    saveUninitialized: false,
  })
);
// Funtion inside passport which initializes passport
app.use(passport.initialize());
// Store our variables to be persisted across the whole session. Works with app.use(Session) above
app.use(passport.session());
app.use(flash());

app.get("/", checkNotAuthenticated, (req, res) => {
  res.render("index.ejs");
});

app.get("/login", checkAuthenticated, (req, res) => {
  res.render("login.ejs");
});

app.get("/register", checkAuthenticated, (req, res) => {
  res.render("register.ejs");
});

function getRandomIndex(max){
  return Math.floor(Math.random() * max);

}



/*

async function friendApiCall(urlApi) {
  console.log("I am in the friendApiCall outside");
  const body = await fetch(urlApi);
  console.log(body);
  summary = JSON.parse(body);
  return JSON.stringify(summary);
}

async function idParser(array, targetArray) {
  array.forEach(async (i) => {
    const url = `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=414B0C3BB8AC9CFE5B3746408083AAE5&steamids=${array[i]}`;
    const res = await friendApiCall(url);
    console.log(res);
    PUSH(targetArray, res);
    console.log(targetArray);
  });
}
*/
/*************************************************************/
// DESIGNING LAYOUT - WILL DELETE AFTER - shouldn't interfere with other parts of code
app.get("/friendsplaceholder", (req, res) => {
  res.render("friendsplaceholder.ejs");
});
// Added to work on design, could be commented out if not needed - ADMIN USERS
app.get("/indexPlaceholderAdmin", (req, res) => {
  res.render("indexPlaceholderAdmin.ejs");
});

// - User Dashboard - NORMAL USERS(no admin btn or admin container)
app.get("/indexPlaceholder", (req, res) => {
  res.render("indexPlaceholder.ejs");
});
/*************************************************************/

app.get("/getOwnedGames", (req, res) => {
  pool.connect((err, connection) => {
    if (err) throw err;
  });

  // console.log("this is the user id logged in:", [user.id]);

  pool.query(
    `SELECT * FROM usertable
    WHERE id = $1`,
    [req.user.id],
    (err, results) => {
      if (!err) {
        // console.log(results.rows);
      }
      console.log(results.rows);
      console.log(results.rows[0].steamid);
      console.log(results.rows[0].apikey);

      // const urlgetGames =
      // `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=`+ results.rows[0].apikey +
      // `&steamid=` + results.rows[0].steamid + `&include_appinfo=true&format=json'`;

      const urlgetGames = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${results.rows[0].apikey}&steamid=${results.rows[0].steamid}&include_appinfo=true&format=json`;

      request(urlgetGames, function (err, response, body) {
        if (!err && response.statusCode < 400) {
          // console.log(body);
          // console.log(typeof body);

          const toJSONbody = JSON.parse(body);
          // console.log(typeof toJSONbody);

          //convert the body string into a json file + Select only the first results query:
          const jsonGameData0 = toJSONbody.response.games;
          // console.log(jsonGameData0);
          // console.log(typeof jsonGameData0);

          const stringGameData = JSON.stringify(jsonGameData0);
          // console.log(typeof stringGameData);

          // console.log(stringGameData);

          res.render("getOwnedGames.ejs", { stringGameData });

          // const jsonOwnedGames = toJSONbody.response.games;
          // console.log(typeof jsonOwnedGames);
          // const jsonGameName = jsonOwnedGames[0].name
          // console.log(typeof jsonGameName);
          // console.log(jsonGameName);

          // const stringOwned = JSON.stringify(jsonOwnedGames);
          // console.log(typeof stringOwned);

          // res.json("getOwnedGames.ejs", { jsonGameName });
          // res.status(201).json( {jsonOwnedGames} );

          // res.render("getOwnedGames.ejs");
        }
      });
    }
  );
});

/*
 * OLD CODE
app.get("/getFriendsList", (req, res) => {
  // query the database to get the logged in user

  // use logged in userID to get friend list

  // const urlgetFriends = `https://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key=${results.rows[0].apikey}&steamid=${results.rows[0].steamid}&relationship=friend&format=json`;

  const urlgetFriends = `https://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key=414B0C3BB8AC9CFE5B3746408083AAE5&steamid=76561198050293487&relationship=friend&format=json`;
  // var friendList = []; // stores their steam ids
  // var friend_games = {};

  const friendsListIds = [];

  request(urlgetFriends, function (err, response, body) {
    if (!err && response.statusCode < 400) {
      // console.log(body);
      // console.log(typeof body);

      const toJSONbodyFriends = JSON.parse(body);

      //convert the body string into a json file + Select only the first results query:

      const jsonFriendData1 = toJSONbodyFriends.friendslist.friends[0].steamid;
      console.log(jsonFriendData1);

      console.log(toJSONbodyFriends.friendslist.friends.length);
      const friendsList = toJSONbodyFriends.friendslist.friends;
      console.log(friendsList[5].steamid);

      
      //const friendsListArr = [];

      // This is length of friends list
      var friendsLength = toJSONbodyFriends.friendslist.friends.length
      console.log(friendsLength)
      // replace this loop with an async.each call since it doesnt matter the order that it gets inserted in
      // and since you made an api call function you can probably just replace this loop
      
      // use this loop in order to get an array of steamids then pass it to an async.each call


      for (var i=0; i < friendsLength; i++){

        // console.log(i);
        var currSteamID = toJSONbodyFriends.friendslist.friends[i].steamid
        // console.log(toJSONbodyFriends.friendslist.friends[i].steamid);
        // console.log(currSteamID);
        // var urlgetFriendSummary = `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=414B0C3BB8AC9CFE5B3746408083AAE5&steamids=${friendsList[i].steamid}`;
        PUSH(friendsListIds, currSteamID);

        }

          // console.log(friendsListIds);
          
        
        // console.log(urlgetFriendSummary);
      }
      
      const friendsListArr = {}
      idParser(friendsListIds, friendsListArr);
      //const friendsListArr = {}
      console.log(friendsListArr)

      // if this console log is correct then you should be able to put the async.each here
      // figure out how to get the right api call since you need to pass the id to the call
      // try using another loop and the try to make an async call on the id array
      // could also use .map or something with promises

      

      // console.log(friendsListArr);

      // console.log(FriendSummaryFullData);

      // const jsonFriendData1 = toJSONbodyFriends.friendslist.friends[0].steamid;
      // console.log(jsonFriendData1);

      // currently it returns the first friends steam id in the page

      // we have to loop through every friend get their steamid and then
      // call the get playersummaris steam api function
      // in order to get their personaname and their avatar in order to display it

      

      
      //This console log displays all the Steam IDs
      // console.log(friendsListIds);

      // const stringFriendData = JSON.stringify(jsonFriendData1);
      // I am now passing the array to the web page and it will display in a table so that we can visibly see all the steam IDs being printed.
      res.render("getFriendsList.ejs", { friendsListIds });
  });
});
//});
*/

app.get("/getFriendsList", async (req, res) => {
  var friends_summaries = new Map();

  // get list of friends
  const friends = new Map(); // steamID:[games]
  const urlgetFriends = `https://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key=414B0C3BB8AC9CFE5B3746408083AAE5&steamid=76561198050293487&relationship=friend&format=json`;
  const options = {
    method: "GET",
  };
  const response = await fetch(urlgetFriends, options)
    .then((res) => res.json())
    .catch((e) => {
      console.error({
        message: "oh noes",
        error: e,
      });
    });

  const playerArr = [];

  // iterate thru friend list
  var friends_length = response.friendslist.friends.length;
  for (var i = 0; i < friends_length; i++) {
    var steamID = response.friendslist.friends[i].steamid;

    // get friend summaries
    const urlgetSummary = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=414B0C3BB8AC9CFE5B3746408083AAE5&steamids=${steamID}`;
    const response2 = await fetch(urlgetSummary, options)
      .then((res) => res.json())
      .catch((e) => {
        console.error({
          message: "oh noes",
          error: e,
        });
      });
    const player = response2.response.players[0];
    playerArr.push(player);

    // add summary info to dict
    var player_summary = {};
    player_summary["personaname"] = player.personaname;
    player_summary["profileurl"] = player.profileurl;
    player_summary["avatar"] = player.avatarmedium;
    friends_summaries.set(steamID, player_summary);
  }

  // console.log(typeof playerArr);

  // console.log(friends_summaries[0]);
  console.log("There are " + friends_length + " friends shown above ^");

  res.render("getFriendsList.ejs", { friends_summaries, playerArr });
});

app.get("/getRandomGame", (req, res) => {
  pool.connect((err, connection) => {
    if (err) throw err;
  });
  
  // console.log("this is the user id logged in:", [user.id]);
  
  pool.query(
    `SELECT * FROM usertable
    WHERE id = $1`,
    [req.user.id],
    (err, results) => {
      if (!err) {
        // console.log(results.rows);
      }
      console.log(results.rows);
      console.log(results.rows[0].steamid);
      console.log(results.rows[0].apikey);
  
      // const urlgetGames =
      // `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=`+ results.rows[0].apikey +
      // `&steamid=` + results.rows[0].steamid + `&include_appinfo=true&format=json'`;
  
      const urlgetGames = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${results.rows[0].apikey}&steamid=${results.rows[0].steamid}&include_appinfo=true&format=json`;
  
      request(urlgetGames, function (err, response, body) {
        if (!err && response.statusCode < 400) {
          // console.log(body);
          // console.log(typeof body);
  
          const toJSONbody = JSON.parse(body);
          // console.log(typeof toJSONbody);
          //convert the body string into a json file + Select only the first results query:
          const jsonGameDataGame = toJSONbody.response.games[getRandomIndex(toJSONbody.response.games.length)];
          // console.log(jsonGameData0);
          // console.log(typeof jsonGameData0);
  
          const stringGameData = JSON.stringify(jsonGameDataGame);
          
          console.log(stringGameData)

          res.render("getRandomGame.ejs");
        }
      });
    }
  );
});

app.get("/getAchievements", (req, res) => {

  res.render("getAchievements");
})

app.get("/getnews", (req, res) => {
  //  var qParams = [];
  //   for (var p in req.query) {
  //     qParams.push({ 'name':p, 'value': req.query[p]})
  //   }
  const urlgetnews = "http://api.steampowered.com/ISteamNews/GetNewsForApp/v0002/?appid=440&count=3&maxlength=300&format=json";
  request(urlgetnews, function (err, response, body) {
    if (!err && response.statusCode < 400) {
      // console.log(body);
      // console.log(typeof body);

      const toJSONbody = JSON.parse(body);
      // console.log(typeof toJSONbody);

      const jsonappnews = toJSONbody.appnews;

      // console.log(jsonappnews.newsitems[0].title);

      const jsonTitle = jsonappnews.newsitems[0].title;
      const jsonappid = jsonappnews.newsitems[0].appid;

      console.log(typeof jsonTitle);

      res.render("getnews.ejs", { jsonTitle, jsonappid });
    }
  });
});

// app.("/logout", (req, res, next) => {
//   req.logOut();
//   res.redirect("/login");
//   });

//DB HERE
app.get("/admin", (req, res) => {
  pool.connect((err, connection) => {
    if (err) throw err;
    // console.log(req.user.email)
  });

  pool.query(`SELECT * FROM usertable ORDER BY id`, (err, results) => {
    if (!err) {
      // console.log("inside if, results.rows[0]: ", results.rows);
      // res.render("admin.ejs", { data: results.rows[0] });

      //Checking to see if the user who is trying to acesss admin panel is superuser.
      if (req.user.isadmin == true) {
        res.render("admin.ejs", { data: results.rows, adminuser: req.user.email });
        // console.log(results.rows);
      }

      // res.render("admin.ejs", { data: results.rows } );
      // console.log(results.rows);

      // res.render("admin.ejs", { results });
    } else {
      console.log("You do not have access to this page.");
      console.log("error: ", err);
      // res.render("/");
    }

    // console.log("the data from the user table: \n", results.rows);
  });
});

app.get("/editUser/:id", (req, res) => {
  console.log(req.params.id);

  pool.query(
    `SELECT * FROM usertable
    WHERE id = $1`,
    [req.params.id],
    (err, results) => {
      if (err) console.log(err.stack);
      else {
        console.log(results.rows);
      }
      // console.log(results);
      res.render("editUser.ejs", { data: results.rows });
    }
  );
});

app.post("/editUser/:id", (req, res) => {
  let { steamid, apikey } = req.body;

  console.log(steamid, apikey);

  pool.query(
    `UPDATE usertable
    SET steamid = $1, apikey = $2
    WHERE id = $3`,
    [steamid, apikey, req.params.id],
    (err, results) => {
      if (err) console.log(err.stack);
      else {
        res.redirect("/admin");
        // console.log(results.rows);
      }
    }
  );
});

app.get("/delete/:id", async (req, res) => {
  // pool.connect((err, connection) => {
  //   if (err) throw err;
  // });

  pool.query(
    `DELETE FROM usertable
    WHERE id = $1`,
    [req.params.id],
    (err, results) => {
      console.log("we are here");
      if (!err) {
        res.redirect("/admin");
      } else {
        //console.log(err);
      }
    }
  );
});

app.post("/register", async (req, res) => {
  let { email, password, steamid, apikey } = req.body;

  console.log({
    email,
    password,
    steamid,
    apikey,
  });

  let errors = [];

  if (!email || !password || !steamid || !apikey) {
    errors.push({ message: "Please enter all fields" });
    console.log("checking to see if field is empty");
  }

  if (password.length < 6) {
    errors.push({ message: "Password should be at least 6 characters" });
    console.log("checking to see if password is less than 6");
  }

  if (errors.length > 0) {
    res.render("register", { errors });
  } else {
    // Form validation has passed

    let hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);

    pool.query(
      `SELECT * FROM usertable
      WHERE email = $1`,
      [email],
      (err, results) => {
        if (err) {
          throw err;
        }

        console.log(results.rows);

        if (results.rows.length > 0) {
          errors.push({ message: "email already registered" });
          res.render("register", { errors });
        } else {
          pool.query(
            `INSERT INTO usertable (email, password, steamid, apikey)
            VALUES ($1, $2, $3, $4)
            RETURNING id, password`,
            [email, hashedPassword, steamid, apikey],
            (err, results) => {
              if (err) {
                throw err;
              }
              console.log(results.rows);
              req.flash("success_msg", "You are now registered. Please log in.");
              res.redirect("/login");
            }
          );
        }
      }
    );
  }
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

app.post("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/login");
  });
});

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  next();
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

// Added function for get news
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
        console.log(response.appnews.newsitems[0].contents);
      } else {
        console.log("Error in network request: " + request.statusText);
      }
    });
    req.send(null);
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
