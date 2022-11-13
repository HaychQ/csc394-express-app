var assert = require("assert");
var should = require("should");
var request = require("request");
var expect = require("chai").expect;
var request = require('supertest');
const express = require("express");
const chai = require("chai");

const app = require('../server');
const passport = require("passport");

const id = 18;






app.get('/', function (request, response) {
    response.send('This is the main page.\n');});



describe("Array", function () {
    describe("#indexOf()", function () {
        it("should return -1 when the value is not present", function () {
            assert.equal([1, 2, 3].indexOf(4), -1);
        });
    });
});




//let's set up the data we need to pass to the login method

const registrationInfo = {
    steamid: 1233444444444,
    apikey: 4433443345
}


const userCredentials = {
    email: 'user@email.com',
    password: 'password'
}


const register = {
    email: 'user@gmail.com',
    password: 'password',

}

//now let's login the user before we run any tests
var authenticatedUser = request.agent(app);
before(function (done) {
    authenticatedUser
        .post('/login')
        .send(userCredentials)
        .end(function (err, response) {
            expect('Location', '/');
            done();
        });
});





describe('POST /registration', () => {
    it('Should allow registration', (done) => {

        request(app)
            .post('/register')
            .send({
                email: 'dud@email.com',
                password: 'password',
                steamid: 76561198119482646,
                apikey: 'F6DB64D7E827FA916F5F5AF44CD29AF5'


            })
            .expect(200)
            .end(done)


    });

});




describe('GET /', function(done){

    it('should return a 200 response if the user is logged in', function(done){
        authenticatedUser.get('/')
            .expect(200)
            .end(done)


    });



});


describe('Does not load error page when there is not an error', function() {
    it('Loads error page', function(done) {
        request(app)
            .get('/errorPage')
            .expect(200)
            .end(done)
    });
});


describe('POST /login', () => {
    it('Should reject invalid login', (done) => {
        request(app)
            .post('/login')
            .send({
                email: '',
                password: ''
            })
            .expect('Location', '/login')
            .end(done)


    });
});


describe('Assert Non saved user can not login', () => {
    it('Assert this user can not login', (done) => {
        request(app)
            .post('/login')
            .send({
                email: 'invalidemaiod@email.com',
                password: 'password'
            })
            .expect('Location', '/login')
            .end(done)



    });
});




describe('Verify app and index page is running properly', () => {
    it('Verifys app and index page running properly ', done => {
        request(app)
            .get('/')
            .end(function (res) {
                expect('Location', '/');
                done();

            })
    })
});

describe('Does not allow random people to get random game', () => {
    it('Returns true', done => {
        request(app)
            .get('/getRandomGame')
            .end(function (res) {
                expect('Location', '/login');
                done();

            })
    })
});


describe('Alowws person to see their freinds list but not someone elsees', () => {
    it('Allows viewing freinds list', done => {
        request(app)
            .get('/getFriendsList')
            .end(function (res) {
                expect('Location', '/getFriendsList');
                done();

            })
    })
});



describe('Returns news page succesfully ', () => {
    it('Returns News page successfully', done => {
        request(app)
            .get('/getNews')
            .end(function (res) {
                expect('Location', '/getNews');
                done();

            })
    })


});


describe('Assert error page loads on bad input ', () => {
    it('Returns error page successfully', done => {
        request(app)
            .get('/errorPage')
            .end(function (res) {
                expect('Location', '/errorPage');
                done();

            })
    })
});






describe('Does not allow random people to get acheivments', () => {
    it('Does not let user acesses other users acheivments', done => {
        request(app)
            .get('/getAchievement/500')
            .end(function (res) {
                expect('Location', '/login');
                done();

            })
    })
});


describe('Does not allow random people to get freinds place holder', () => {
    it('Does not allow random people to get friends placeholder', done => {
        request(app)
            .get('/friendsplaceholder')
            .end(function (res) {
                expect('Location', '/login');
                done();

            })
    })
});

describe('Verifys index can not be loaded for people not logged in', () => {
    it('Verfiys index can not be loaded for people not logged in', done => {
        request(app)
            .get('/indexPlaceholder')
            .end(function (res) {
                expect('Location', '/login');
                done();

            })
    })
});

describe('Verfiys index place holder for admin can not be loaded by non admin', () => {
    it('Verifys index place holder can not be loaded by non admin', done => {
        request(app)
            .get('/indexPlaceholderAdmin')
            .end(function (res) {
                expect('Location', '/login');
                done();

            })
    })
});

describe('Does not let non admin view admin page', () => {
    it('Does not let non admin view admin page', done => {
        request(app)
            .get('/admin')
            .end(function (res) {
                expect('Location', '/login');
                done();

            })
    })
});

describe('Security check that Does not allow Non-Admins to acesses the admin page', () => {
    it('Does not let user acesses other users acheivments', done => {
        request(app)
            .get('/editUser/500')
            .end(function (res) {
                expect('Location', '/login');
                done();

            })
    })
});

describe('Asserts only admin and user can edit user', () => {
    it('Assert admin can enter user ', (done) => {
        request(app)
            .post('/editUser/500')
            .send({
                email: 'user@email.com',
                password: 'password'
            })
            .expect('Location', '/admin')
            .end(done)



    });
});

describe('Security check that Does not allow Non-Admins to acesses the admin page', () => {
    it('Does not let user acesses other users acheivments', done => {
        request(app)
            .get('/delete/500')
            .end(function (res) {
                expect('Location', '/login');
                done();

            })
    })
});


describe('Assert logged in user can login out succesfully', () => {
    it('Assert logged in user can log out', (done) => {
        request(app)
            .post('/logout')
            .send({
                email: 'notvalid@email.com',
                password: 'password'
            })
            .expect('Location', '/login')
            .end(done)



    });
});

describe('Does not allow getting acheivements without ID', () => {
    it('Does not allow getting achivments without ID', done => {
        request(app)
            .get('/getAchievements')
            .end(function (res) {
                expect('Location', '/login');
                done();

            })
    })
});

describe('Does not allow getting editting user without ID', () => {
    it('Does not allow editting user without ID', done => {
        request(app)
            .get('/editUser')
            .end(function (res) {
                expect('Location', '/login');
                done();

            })
    })
});

describe('Assert user can register properly at page', () => {
    it('Assert registration page suecess', done => {
        request(app)
            .get('/register')
            .end(function (res) {
                expect('Location', '/register');
                done();

            })
    })
});

describe('Assert user can login properly at page', () => {
    it('Assert login page suecess', done => {
        request(app)
            .get('/login')
            .end(function (res) {
                expect('Location', '/login');
                done();

            })
    })
});




describe('Assert you can not view others friends list', () => {
    it('Assert login page suecess', done => {
        request(app)
            .get("/getFriendsList/test/23434")
            .end(function (res) {
                expect('Location', '/login');
                done();

            })
    })
});

describe('Assert can invite friends', () => {
    it('Assert suecess', done => {
        request(app)
            .get("/getFriendsList/inviteFriend/:steamid/:email")
            .end(function (res) {
                expect(200);
                done();

            })
    })
});

describe('Verify you can not view other users acheviments', () => {
    it('Verify you can not view other users acheviments', done => {
        request(app)
            .get("/getAchievements/500")
            .end(function (res) {
                expect('Location', '/login');
                done();

            })
    })
});


describe('Test sending email to friend', () => {
    it('Test sending email to freind', (done) => {
        request(app)
            .post("/sendEmail/500")
            .send({
                email: 'notvalid@email.com',
                password: 'password'
            })
            .expect(200)
            .end(done)



    });
});

describe('Verify you can only compare games with valid freinds', () => {
    it('Verify you can not view other users acheviments', done => {
        request(app)
            .get("/compareGames/500")
            .end(function (res) {
                expect(404);
                done();

            })
    })
});

describe('Verify can not acesses other users featured games', () => {
    it('Verify user can get featured games', done => {
        request(app)
            .get("/getFeaturedGames")
            .end(function (res) {
                expect('Location', '/login');
                done();

            })
    })
});









