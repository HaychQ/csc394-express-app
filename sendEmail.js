const nodemailer = require("nodemailer");
const nodecron = require('node-cron');

var send_email = "bebblanco3@gmail.com";
var games_with_news = ['test'];

var check_for_news = nodecron.schedule('*/1 * * * *', () => {
    // make sure to change to '* * */1 * *' for every day rather than every minute


    // get current user's game news subscription
    // iterate thru each game
    // check if game has news different from saved last news 
    // if game has acceptable news, add to games_with_news


    // if there are games_with_news, execute email function  
    if (games_with_news.length > 0) {

        // create transporter
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
        const info = {
            from: "SteamAPI <steamAPIproject@hotmail.com>",
            to: send_email,
            subject: "Game News Update!",
            text: "This is the email content, where we would have the list of games with news.\n\nI got a scheduled email feature working ;) \n- Brian"
        };

        // send email 
        const email = transporter.sendMail(info, function (err, info) {
            if (err) {
                console.log(err);
                return;
            }
            console.log("Sent: " + info.response);
        });

    }
    

});

module.exports = { check_for_news, send_email, games_with_news };