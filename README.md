# Steamy - group 4 capstone project

# Account creation requirements:
  - you must have a valid steam id
  - you must have a steamapi key
  - password should be above 6 characters
  - email should have an @ in it
  


# Test User Credentials
  User: user@email.com
  password: password
  
  
  
# Steamy's key features

  1. return a random game from your steam library(you can refresh it to get a new game)
  2. return your steam library
  3. return your friendslist(the load time is long, so give it some time)
  4. allows you to view and compare libraries with your friends(as long as their libraries are public)
  5. allows viewing of the featured games on Steam at the moment
  6. allows you to view your achievments for every game and when you achieved said achievment
  7. Ability to email someone an invite link to our site as long as you know their email

#Notes about Steamy
  - Uses the steam api to fetch all of its information
  - We ran out of time during class, but to fix the long load time of the friendslist, pagination could be implemented
  - Has a functioning admin page, along with postgreSQL for storing user accounts
