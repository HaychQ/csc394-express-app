const express = require("express");
const { pool } = require("./dbConfig");
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
require("dotenv").config();
const app = express();
const request = require('request');
const PORT = process.env.PORT || 3000;


const initializePassport = require("./passport-config");

initializePassport(passport);

// Middleware

// Parses details from a form
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));

app.use(express.static(__dirname + "/public"));
app.use(express.static("public"));

app.use(function(req, res, next) {
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

app.get('/getnews', (req,res) => {
//  var qParams = [];
//   for (var p in req.query) {
//     qParams.push({ 'name':p, 'value': req.query[p]})
//   }
  var url = 'http://api.steampowered.com/ISteamNews/GetNewsForApp/v0002/?appid=440&count=3&maxlength=300&format=json';
  request(url, function(err, response, body){
    if (!err && response.statusCode < 400) {
      console.log(body);
      res.render("getnews.ejs", { body });
    }
  }); 
});

// app.("/logout", (req, res, next) => {
//   req.logOut();
//   res.redirect("/login");
//   });

app.post("/logout", function(req, res, next) {
  req.logout(function(err){
    if (err) { return next (err); }
    res.redirect('/login');
  });
});

//DB HERE
app.get("/admin", (req, res) => {
  pool.connect((err, connection) => {
    if (err) throw err;
    console.log("Connected as ID ");
  });

  pool.query(`SELECT * FROM usertable`, (err, results) => {
    if (!err) {
      console.log("inside if, results.rows[0]: ", results.rows);
      // res.render("admin.ejs", { data: results.rows[0] });
      res.render("admin.ejs", { data: results.rows });
      // res.render("admin.ejs", { results });
    } else {
      console.log("error: ", err);
    }

    console.log("the data from the user table: \n", results.rows);
  });
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
    console.log("checking to see if field is empty")
  }

  if (password.length < 6) {
    errors.push({ message: "Password should be at least 6 characters" });
    console.log("checking to see if password is less than 6")
  }

  if (errors.length > 0) {
    res.render("register", { errors });
  } 
  else {
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
// function bindGetNewsButton(){
// 	document.getElementById('getNewsForApp').addEventListener('click', function(event) {
// 	var homeURL = "http://localhost:3000/getnews/?"
// 	var userInput = document.getElementById('getNewsInput').value;
// 	var newURL = homeURL+userInput;
// 	var req = new XMLHttpRequest();
// 	req.open("GET", newURL, true);
// 	req.addEventListener('load', function(){
// 		if(req.status>= 200 && req.status<400){
// 		var response = JSON.parse(req.responseText);
// 		console.log(response.appnews.newsitems[0].contents);
// 		}
// 		else {
// 			console.log("Error in network request: " + request.statusText);
// 		}
// 	});
// 	req.send(null);
// });
// }

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
