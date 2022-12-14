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
const { promises } = require("nyc/lib/fs-promises");
const pLimit = require("p-limit");
const nodemailer = require("nodemailer");
// const alert = require('alert');
// const popup = require('node-popup');





module.exports = app;

initializePassport(passport);

//SUPER USER ACCOUNT DETAILS:
//Email: user@email.com
//Password: password

// Parses details from a form
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));

app.use(express.static(__dirname + "/public"));
app.use(express.static("public"));
app.use(express.json());

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

function getRandomIndex(max) {
  return Math.floor(Math.random() * max);
}

function insertDecimal(num) {
  return (num / 100).toFixed(2);
}

// const loader = document.querySelector("#preloader");

// function displayPreloader() {
//   loader.classList.add("display");
//   setTimeout(() => {
//     loader.classList.remove("display");
//   }, 5000);
// }

// //hiding preloader
// function hidePreloader(){
//   loader.classList.remove("display");
// }

app.get("/loading", (req, res) => {
  res.render("loading.ejs");
});

app.get("/", checkNotAuthenticated, (req, res) => {
  res.render("index.ejs", { message: req.flash('notAdmin') });
});

app.get("/login", checkAuthenticated, (req, res) => {
  res.render("login.ejs", { message: req.flash('registered') });
});

app.get("/register", checkAuthenticated, (req, res) => {
  res.render("register.ejs");
});


/*************************************************************/
// DESIGNING LAYOUT - WILL DELETE AFTER - shouldn't interfere with other parts of code
// app.get("/friendsplaceholder", (req, res) => {
//   res.render("friendsplaceholder.ejs");
// });

// app.get("/friendslistplaceholder", (req, res) => {
//   res.render("friendslistplaceholder.ejs");
// });

// Added to work on design, could be commented out if not needed - ADMIN USERS
app.get("/indexPlaceholderAdmin", (req, res) => {
  res.render("indexPlaceholderAdmin.ejs");
});

// - User Dashboard - NORMAL USERS(no admin btn or admin container)
app.get("/userIndex", (req, res) => {
  res.render("userIndex.ejs");
});

app.get("/errorPage", checkNotAuthenticated, (req, res) => {
  res.render("errorPage.ejs");
});

app.get("/getFriendsList/inviteFriend/:friendid", checkNotAuthenticated, (req, res) => {
  friend_id = req.params.friendid;
  res.render("inviteFriend.ejs", { friend_id });
});

// Brian's Email Implementation Goes here:
app.post("/sendEmail/:friendid", async (req, res) => {
  pool.query(
    `SELECT * FROM usertable
    WHERE id = $1`,
    [req.user.id],
    async (err, results) => {
      if (!err) {
        // console.log(results.rows);
      }      
      const options = {
        method: "GET",
      };      


      // given data 
      //console.log("Checkpoint #1");
      const given_steamid = req.params.friendid;
      console.log(given_steamid);

      // gather user's summary  
      //console.log("Checkpoint #2");
      const urlgetSummary1 = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=414B0C3BB8AC9CFE5B3746408083AAE5&steamids=${results.rows[0].steamid}`;
      const response1 = await fetch(urlgetSummary1, options)
        .then((res) => res.json())
        .catch((e) => {
          console.error({
            message: "oh noes",
            error: e,
          });
        });
      const user = response1.response.players[0];  

      // gather friend's summary 
      //console.log("Checkpoint #3");
      const urlgetSummary2 = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=414B0C3BB8AC9CFE5B3746408083AAE5&steamids=${given_steamid}`;
      const response2 = await fetch(urlgetSummary2, options)
        .then((res) => res.json())
        .catch((e) => {
          console.error({
            message: "oh noes",
            error: e,
          });
        });
      const friend = response2.response.players[0];
      // console.log(friend);  

      var to = req.body.to;
      var message = req.body.message;

      // create transporter
      //console.log("Checkpoint #4");
      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: process.env.MAIL_USERNAME,
          pass: process.env.MAIL_PASSWORD,
          clientId: process.env.OAUTH_CLIENTID,
          clientSecret: process.env.OAUTH_CLIENT_SECRET,
          refreshToken: process.env.OAUTH_REFRESH_TOKEN
        }
      });

      // set email information
      //console.log("Checkpoint #5");
      const mailOptions = {
          from: "Steamy <steamywebapp@gmail.com>",
          to: to,
          subject: "You have been invited to join Steamy!",
          message: message,
          html: `<div style='font-size:25px;'> \
          <div style='width:100%; height:25%;'> \
            <img style='width:100px; height:100px; float:left;' src='` + friend.avatarfull + `'> \
            <img style='width:100px; height:100px; float:left;' src='` + user.avatarfull + `'> \
          </div><br> \
          Hello <span style='font-size:24px; font-weight:bold; font-family:'Impact';>` + friend.personaname + `</span>, <br><br> \
          Your Steam friend <span style='font-size:24px; font-weight:bold;'>` + user.personaname + `</span> has invited you to join Steamy! <br><br> \
          An app that ties together the functionality of every Steam API. <br><br> \
          Here is the message they said to you: <br><br> \
          <div style='width:30em; height:15em; border:2px solid #489BDD; background-color: #1B2838; color:white; font-size:22px;'> \
              <br><br><br>` + message + `<br><br><br> \
              </div><br> \
          Click <a href='http://54.75.88.164/register'>here</a> to register and start using Steamy!</div>`
      };

      // send email 
      //console.log("Checkpoint #6");
      transporter.sendMail(mailOptions, function (err, info) {
          if (err) {
              console.log(err);
              return;
          }
          console.log("Email Sent: " + info.response);
      });
       
      res.redirect("back");
  
      //console.log("Checkpoint #7");

    });
});

/*************************************************************/

app.get("/getOwnedGames", checkNotAuthenticated, (req, res) => {
  // console.log("this is the user id logged in:", [user.id]);

  pool.query(
    `SELECT * FROM usertable
    WHERE id = $1`,
    [req.user.id],
    (err, results) => {
      if (!err) {
        // console.log(results.rows);
      }
      else{
        console.log("Can't render that page!");
      }
      console.log(results.rows);
      console.log(results.rows[0].steamid);
      console.log(results.rows[0].apikey);

      const urlgetGames = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${results.rows[0].apikey}&steamid=${results.rows[0].steamid}&include_appinfo=true&format=json`;

      request(urlgetGames, function (err, response, body) {
        if (!err && response.statusCode < 400) {
          // console.log(body);
          // console.log(typeof body);

          const toJSONbody = JSON.parse(body);
          // console.log(typeof toJSONbody);

          //convert the body string into a json file + Select only the first results query:
          const jsonGameData0 = toJSONbody.response.games;

          const stringGameData = JSON.stringify(jsonGameData0);

          res.render("getOwnedGames.ejs", { stringGameData });
        }
        else{
          console.log("Can't render that page!!!");
          var message = "Invalid Steam API or ID Key";
          res.render("errorPage.ejs", { message });
        }
      });
    }
  );
});

app.get("/getAchievements/:appid", checkNotAuthenticated, async (req, res) => {
  pool.query(
    `SELECT * FROM usertable
    WHERE id = $1`,
    [req.user.id],
    async (err, results) => {
      if (!err) {
        // console.log(results.rows);
      }
      console.log(results.rows);
      console.log(results.rows[0].steamid);
      console.log(results.rows[0].apikey);

      const appid = req.params.appid;
      const game_achievements = {};

      // get achievements
      const urlgetAchievements = `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid=${appid}&key=${results.rows[0].apikey}&steamid=${results.rows[0].steamid}`;
      const options = {
        method: "GET",
      };
      const achieve_response = await fetch(urlgetAchievements, options)
        .then((res) => res.json())
        .catch((e) => {
          console.error({
            message: "oh noes",
            error: e,
          });
        });

      // iterate thru achievements and store them
      var game_name = achieve_response.playerstats.gameName;
      var achievement_list = achieve_response.playerstats.achievements;

      // if(achieve_response.playerstats.achievements == undefined){
      //   console.log("there are no achievements");
      // }

      // else {

      // }

      achievement_list.forEach(function (a) {
        game_achievements[a.name] = a.achieved;
      });

      res.render("getAchievements.ejs", { game_name, achievement_list });
    }
  );
});

app.get("/getFriendsList", checkNotAuthenticated, async (req, res) => {
  var invalidCredentials = false;
  pool.query(
    `SELECT * FROM usertable
    WHERE id = $1`,
    [req.user.id],
    async (err, results) => {
      if (!err) {
        // console.log(results.rows);
      }
      console.log(results.rows);
      console.log(results.rows[0].steamid);
      console.log(results.rows[0].apikey);

      var friends_summaries = new Map();

      // get list of friends
      // displayPreloader();
      const friends = new Map(); // steamID:[games]
      const urlgetFriends = `https://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key=${results.rows[0].apikey}&steamid=${results.rows[0].steamid}&relationship=friend&format=json`;
      const options = {
        method: "GET",
      };
      const response = await fetch(urlgetFriends, options)
        .then((res) => res.json())
        .catch((e) => {
          console.error({
            message: "Steam credentials are invalid.",
            error: e,
          });
          invalidCredentials = true;
        });

      const playerArr = [];

      if (!invalidCredentials == true){
              // iterate thru friend list
      var friends_length = response.friendslist.friends.length;
      for (var i = 0; i < friends_length; i++) {
        var steamID = response.friendslist.friends[i].steamid;

        // get friend summaries
        const urlgetSummary = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${results.rows[0].apikey}&steamids=${steamID}`;
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

      // console.log(playerArr);
      // console.log(typeof playerArr);

      // console.log(friends_summaries[0]);
      // hidePreloader();
      console.log("There are " + friends_length + " friends shown above ^");

      res.render("getFriendsList.ejs", { friends_summaries, playerArr });
      }
      else{
        console.log("Can't render that page!!!");
        var message = "Invalid Steam API or ID Key";
        res.render("errorPage.ejs", { message });
      }
    }
  );
});

app.get("/getRandomGame", checkNotAuthenticated, (req, res) => {
  var invalidCredentials = false;
  pool.query(
    `SELECT * FROM usertable
    WHERE id = $1`,
    [req.user.id],
    async (err, results) => {
      if (!err) {
        // console.log(results.rows);
      }
      console.log(results.rows);
      console.log(results.rows[0].steamid);
      console.log(results.rows[0].apikey);

      const urlgetGames = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${results.rows[0].apikey}&steamid=${results.rows[0].steamid}&include_appinfo=true&format=json`;

      const options = {
        method: "GET",
      };
      const Randomresponse = await fetch(urlgetGames, options)
        .then((res) => res.json())
        .catch((e) => {
          console.error({
            message: "Invalid Steam Credentials",
            error: e,
          });
          invalidCredentials = true;
        });

        if (!invalidCredentials == true) {
          const randomGameReturn = Randomresponse.response.games[getRandomIndex(Randomresponse.response.games.length)];

          urlgetRandomGameData = `https://store.steampowered.com/api/appdetails?appids=${randomGameReturn.appid}`;
    
          const StoreRandomresponse = await fetch(urlgetRandomGameData, options)
            .then((res) => res.json())
            .catch((e) => {
              console.error({
                message: "oh noes",
                error: e,
              });
            });
    
          var responseString = randomGameReturn.appid;
    
          // const SteamStoreGameData = StoreRandomresponse[responseString].data;
    
          // console.log(StoreRandomresponse[responseString]);
          // console.log(StoreRandomresponse[responseString].data.name);
          // console.log(StoreRandomresponse[responseString].data.header_image);
          // console.log(StoreRandomresponse[responseString].data.genres);
          // console.log(StoreRandomresponse[responseString].data.genres[0].description);
    
          const SteamStoreGameData = StoreRandomresponse[responseString].data;
    
          res.render("getRandomGame.ejs", { SteamStoreGameData, randomGameReturn });
        }
        else {
          console.log("Can't render that page!!!");
          var message = "Invalid Steam API or ID Key";
          res.render("errorPage.ejs", { message });
        }
    }
  );
});

app.get("/compareGames/:friendid", checkNotAuthenticated, async (req, res) => {
  pool.query(
    `SELECT * FROM usertable
    WHERE id = $1`,
    [req.user.id],
    async (err, results) => {
      if (!err) {
        // console.log(results.rows);
      }
      const options = {
        method: "GET",
      };

      // define maps and arrays to be used
      const myGameArr = [];
      const friendsGameArr = [];
      const sharedGamesArr = [];
      const myGameMap = new Map();
      const friendsGameMap = new Map();
      const sharedGamesMap = new Map();

      // fetch logged in user's games, store them
      const urlGetMyGames = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${results.rows[0].apikey}&steamid=${results.rows[0].steamid}&include_appinfo=true&format=json`;
      const responseMyGames = await fetch(urlGetMyGames, options)
        .then((res) => res.json())
        .catch((e) => {
          console.error({
            message: "Whoops",
            error: e,
          });
        });
      for (var i = 0; i < responseMyGames.response.games.length; i++) {
        var game = responseMyGames.response.games[i];
        myGameMap.set(game.appid, game);
        myGameArr.push(game.appid);
      }

      // fetch friend's games, seperate shared games, store them
      const urlGetFriendsGames = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${results.rows[0].apikey}&steamid=${req.params.friendid}&include_appinfo=true&format=json`;
      const responseFriendsGames = await fetch(urlGetFriendsGames, options)
        .then((res) => res.json())
        .catch((e) => {
          console.error({
            message: "Whoops",
            error: e,
          });
        });
      if (isEmpty(responseFriendsGames.response)){
        // popup.alert("This is a private user");
        // popup.alert({
        //   content: 'Hey! This user set their display games to Private!'
        // });
        req.flash('success', 'This Friend has their game display as Private!');
        const messagePopup = "This user has their Game Display as Private!";
        console.log("This is a private user")
      } 
      else {
        for (var i = 0; i < responseFriendsGames.response.games.length; i++) {
          var game = responseFriendsGames.response.games[i];
          friendsGameMap.set(game.appid, game);
          friendsGameArr.push(game.appid);

          // if game is owned by both
          if (myGameMap.has(game.appid)) {
            sharedGamesMap.set(game.appid, game);
            sharedGamesArr.push(game.appid);
          }
        }
      }

      // sort the appid arrays
      myGameArr.sort();
      friendsGameArr.sort();
      sharedGamesArr.sort();

      /*
  *
  * This is the code for returning 2 lists instead of the 3 currently returning 
  *
      // build sorted lists of games with shared games first 
      const userGames = [];
      const friendGames = [];
      for (var i = 0; i < sharedGamesArr.length; i++) {
          var appid = sharedGamesArr[i];
          userGames.push(sharedGamesMap.get(appid));
          friendGames.push(sharedGamesMap.get(appid));
      }
      for (var i = 0; i < myGameArr.length; i++) {
        var appid = myGameArr[i];
        if (!sharedGamesMap.has(appid)) userGames.push(myGameMap.get(appid));
      }
      for (var i = 0; i < friendsGameArr.length; i++) {
        var appid = friendsGameArr[i];
        if (!sharedGamesMap.has(appid)) friendGames.push(friendsGameMap.get(appid));
      }
*/

      // build sorted lists of games with shared games first
      const sharedGames1 = [];
      const sharedGames2 = [];
      for (var i = 0; i < sharedGamesArr.length; i++) {
        var appid = sharedGamesArr[i];
        sharedGames1.push(myGameMap.get(appid));
        sharedGames2.push(friendsGameMap.get(appid));
      }
      const userGames = [];
      for (var i = 0; i < myGameArr.length; i++) {
        var appid = myGameArr[i];
        if (!sharedGamesMap.has(appid)) userGames.push(myGameMap.get(appid));
      }
      const friendGames = [];
      for (var i = 0; i < friendsGameArr.length; i++) {
        var appid = friendsGameArr[i];
        if (!sharedGamesMap.has(appid)) friendGames.push(friendsGameMap.get(appid));
      }

      res.render("compareGames.ejs", { sharedGames1, sharedGames2, userGames, friendGames, message: req.flash('success') });
    }
  );
});

app.get("/getFeaturedGames", checkNotAuthenticated, async (req, res) => {
  const urlgetFeaturedGames = `https://store.steampowered.com/api/featured/`;
  featuredGamesArray = [];
  featuredGamesArrayPrice = []

  const options = {
    method: "GET",
  };

  const responseFeaturedGames = await fetch(urlgetFeaturedGames, options)
    .then((res) => res.json())
    .catch((e) => {
      console.error({
        message: "Whoops",
        error: e,
      });
    });

  for (var i = 0; i < responseFeaturedGames.featured_win.length; i++) {
    featuredGamesArray.push(responseFeaturedGames.featured_win[i]);
    featuredGamesArrayPrice.push(insertDecimal(responseFeaturedGames.featured_win[i].final_price));
  }

  res.render("getFeaturedGames.ejs", { featuredGamesArray, featuredGamesArrayPrice });
});

app.get("/getnews", (req, res) => {
  const urlgetnews = "http://api.steampowered.com/ISteamNews/GetNewsForApp/v0002/?appid=440&count=3&maxlength=300&format=json";
  request(urlgetnews, function (err, response, body) {
    if (!err && response.statusCode < 400) {
      const toJSONbody = JSON.parse(body);

      const jsonappnews = toJSONbody.appnews;

      const jsonTitle = jsonappnews.newsitems[0].title;
      const jsonappid = jsonappnews.newsitems[0].appid;

      console.log(typeof jsonTitle);

      res.render("getnews.ejs", { jsonTitle, jsonappid });
    }
  });
});

//DB HERE
app.get("/admin", checkNotAuthenticated, (req, res) => {
  pool.query(`SELECT * FROM usertable ORDER BY id`, (err, results) => {
    if (!err) {
      //Checking to see if the user who is trying to acesss admin panel is superuser.
      if (req.user.isadmin == true) {
        res.render("admin.ejs", { data: results.rows, adminuser: req.user.email, message1: req.flash('delete'), message2: req.flash('edit') });
      }
      else {
        req.flash('notAdmin', "Sorry, you don't have access to that page!");
        res.redirect('/');
        console.log("You do not have access to this page.");
        console.log("error: ", err);
      }
    } 
  });
});

app.get("/editUser/:id", checkNotAuthenticated, (req, res) => {
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
        req.flash('edit', 'User info has been edited');
        res.redirect("/admin");
        // console.log(results.rows);
      }
    }
  );
});

app.get("/delete/:id", checkNotAuthenticated, async (req, res) => {
  pool.query(
    `DELETE FROM usertable
    WHERE id = $1`,
    [req.params.id],
    (err, results) => {
      console.log("we are here");
      if (!err) {
        req.flash('delete', 'User has been deleted');
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

  if (isNaN(steamid)) {
    errors.push({ message: "SteamID input should only consist of integers."})
    console.log("Checking to see if Steam ID is only numbers")
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
              req.flash('registered', 'You are now registered, please log in.')
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

function isEmpty(obj) {
  return !obj || Object.keys(obj).length === 0;
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
