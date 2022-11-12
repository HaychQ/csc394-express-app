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
const pLimit = require('p-limit');
const http = require("http");
const nodemailer = require("nodemailer");




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

app.get("/", checkNotAuthenticated, (req, res) => {
  res.render("index.ejs");
});

app.get("/login", checkAuthenticated, (req, res) => {
  res.render("login.ejs");
});

app.get("/register", checkAuthenticated, (req, res) => {
  res.render("register.ejs");
});

function getRandomIndex(max) {
  return Math.floor(Math.random() * max);
}

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
app.get("/indexPlaceholder", (req, res) => {
  res.render("indexPlaceholder.ejs");
});

app.get("/errorPage", (req, res) => {
  res.render("errorPage.ejs");
});

app.get("/getFriendsList/emailFriend/:friendid", (req, res) => {
  friend_id = req.params.friendid;
  res.render("emailFriend.ejs", {friend_id});
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
      const transporter = nodemailer.createTransport({
          service: "hotmail",
          port: 587,
          secure: false, // true for 465, false for other ports
          auth: {
          user: "steamAPIproject@hotmail.com",
          pass: "Steam123"
          },
      });

      // set email information
      //console.log("Checkpoint #5");
      const mailOptions = {
          from: "Steamy <steamAPIproject@hotmail.com>",
          to: to,
          subject: "You have been invited to join Steamy!",
          message: message,
          html: "<div style='font-size:25px;'><div style='width:100%; height:25%;'><img style='width:100px; height:100px; float:left;' src='" + friend.avatarfull + "'><img style='width:100px; height:100px; float:left;' src='" + user.avatarfull + "'></div><br>Hello <span style='font-size:24px; font-weight:bold; font-family:'Impact';>"+ friend.personaname + "</span>, <br><br>Your Steam friend <span style='font-size:24px; font-weight:bold;'>" + user.personaname + "</span> has invited you to join Steamy! <br><br>An app that ties together the functionality of every Steam API.</div>"
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
       
      res.redirect("/");
  
      //console.log("Checkpoint #7");

    });
});



/*************************************************************/

app.get("/getOwnedGames", (req, res) => {
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
      });
    }
  );
});

app.get("/getAchievements/:appid", async (req, res) => {
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

app.get("/getFriendsList", async (req, res) => {
  pool.query(
    `SELECT * FROM usertable
    WHERE id = $1`,
    [req.user.id],
    async (err, results) => {
      if (!err) {
      }
      console.log(results.rows);
      console.log(results.rows[0].steamid);
      console.log(results.rows[0].apikey);

      var friends_summaries = new Map();

      // get list of friends
      const friends = new Map(); // steamID:[games]
      const urlgetFriends = `https://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key=${results.rows[0].apikey}&steamid=${results.rows[0].steamid}&relationship=friend&format=json`;
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
      var count = 1;
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
        
        console.log(count + "/" + friends_length);
        count++;
      }

      res.render("getFriendsList.ejs", { friends_summaries, playerArr });
    }
  );
});


app.get("/getRandomGame", (req, res) => {
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
            message: "oh noes",
            error: e,
          });
        });

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
  );
});

app.get("/compareGames/:friendid", async (req, res) => {
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
      if (isEmpty(responseFriendsGames.response)) console.log("This is a private user");
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

      res.render("compareGames.ejs", { sharedGames1, sharedGames2, userGames, friendGames });
    }
  );
});

app.get("/getFeaturedGames", async (req, res) => {
  const urlgetFeaturedGames = `https://store.steampowered.com/api/featured/`
  featuredGamesArray = [];

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

  for (var i = 0; i < responseFeaturedGames.featured_win.length; i++){
    featuredGamesArray.push(responseFeaturedGames.featured_win[i]);
  }



res.render("getFeaturedGames.ejs", {featuredGamesArray} );
  
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
app.get("/admin", (req, res) => {
  pool.query(`SELECT * FROM usertable ORDER BY id`, (err, results) => {
    if (!err) {
      //Checking to see if the user who is trying to acesss admin panel is superuser.
      if (req.user.isadmin == true) {
        res.render("admin.ejs", { data: results.rows, adminuser: req.user.email });
      }
    } else {
      console.log("You do not have access to this page.");
      console.log("error: ", err);
    }
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

function isEmpty(obj) {
  return !obj || Object.keys(obj).length === 0;
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
