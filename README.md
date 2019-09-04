# HumanLifeInWeeks-backend

I made server with authentication for HumanLifeInWeeks cite 

## Installation

Ubuntu and MacOS:

Copy and paste this command
```https://github.com/trickyartem/HumanLifeInWeeks-backend.git```

## Building project

Ubuntu: 
``` 
npm install
npm run mongo
npm start
```

## Methods 
"/auth/register" - post request that takes {email, password} as parameters and returns auth jwt token

----
"/auth/me" - post request that takes {token} as header and return {token} (if token is valid) and {token: undefined} (if token is not valid)

----
"/auth/login" - post request takes {email, password} as parameters and {token} as header and returns nothing

----
"/auth/reset-password" - post request takes {email} as parameters and {token} as header and sends message to email with new password

----
"/auth/remove-user" - post request takes {email, password} as parameters and {token} as header and deletes user form data base

----
"/add-event" - post request takes {title, timestamp, description} and {token} as header and returns id of an event

----
"/remove-event" - post request takes {id of an event} and {token} as header and removes event from data base

----
"/get-events" - post request takes {email} and {token} as header and returns all events by this user
