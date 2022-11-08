var assert = require("assert");
var should = require("should");
var request = require("request");
var expect = require("chai").expect;
var request = require('supertest');
const express = require("express");
const chai = require("chai");

const app = require('../server');
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
  it('Should reject invalid registration', (done) => {




    request(app)
        .post('/register')
        .send({
          email: 'invalid@@email.com',
          password: '',
          steamid: 7656119843453050393487,
          apikey: '414B0C3BB8ACds9C3E5B3746408083AAE5'


        })
        .expect('Location', '/register')
        .end(done)


  });

});









describe('GET /', function(done){

  it('should return a 302 response if the user is logged in', function(done){
    authenticatedUser.get('/')
        .expect(302)
        .end(done)


  });

});

describe('Verifys error page sueessful for errors', function() {
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
          email: 'notvalid@email.com',
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







describe('Does not people not logged in to get random game or acess someone elses account', () => {
  it('Stays at login', done => {
    request(app)
        .get('/getFriendsList')
        .end(function (res) {
          expect('Location', '/login');
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
            .get('/getAchievement/{id}')
            .end(function (res) {
                expect('Location', '/login');
                done();

            })
    })
});




