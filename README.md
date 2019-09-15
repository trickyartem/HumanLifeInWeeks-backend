# HumanLifeInWeeks-backend

This is the REST API for HumanLifeInWeeks

## Installation

Ubuntu and MacOS:

Copy and paste this command
```https://github.com/trickyartem/HumanLifeInWeeks-backend.git```

## Building project

Ubuntu: 
``` 
    npm install
```
to run production version run
```
    npm run build
```
to run live version run
```
    npm start
```


## Methods 
"/auth/register" - post request that takes 
``` json
params: {
    "email": "email",
    "password": "password"
}
``` 
as parameters and returns
```JSMIN
{
    "status": <message> // message which tells you what happend
    "result": <boolean> // true if all is good, false if something goes wrong
    "token": "token"
    "user_id": "user_id" // you can find the user by this id in database
}
```

----
"/auth/me" - get request that takes
authorization header: ```"authorization": "Bearer <token>"```
and returns 
 ```json
 {
     "token": "token"
 }
 ```
if it's valid and 
  ```json
  {
      "token": null
  }
  ```
if token is not valid

----
"/auth/login" - get request takes 
``` json
{
    "email": "email",
    "password": "password"
}
``` 
as parameters and returns 
  ```JSMIN
 {
     "result": <boolean>,
     "email": "email",
     status: <message>,
     "token": "token",
     "user_id": "user_id"
 }
  ```


----
"/auth/reset-password" - put request takes
authorization header: ```"authorization": "Bearer <token>"```
 ``` json
 {
     "email": "email",
 }
 ``` 
and sends message to email with new password

----
"/auth/remove-user" - delete request takes
authorization header: ```"authorization": "Bearer <token>"```
 ``` json
 {
     "email": "email",
     "password": "password"
 }
 ``` 
 and deletes user form data base

----
"/add-event" - post request takes
authorization header: ```"authorization": "Bearer <token>"```
 ```json
{
      "title": "title",
      "timestamp": "timestamp",
      "description": "description"
}
```
and returns
```JSMIN
{
    "result": <boolean>,
    "status": <message>,
    "id": "id" // of an event
}
``` 

----
"/remove-event" - delete request takes
authorization header: ```"authorization": "Bearer <token>"```
 ```JSMin
{
    "id": "id" // id of event
}
```
 and returns 
 ```JSMIN
{
    "result": <boolean>,
    "status": <message>
}
```
 removes event from data base

----
"/get-events" - get request takes 
authorization header: ```"authorization": "Bearer <token>"```
```json
{
    "email": "email"
}
```
and returns 
```JSMIN
{
    "events": [
        {event}
    ]
}
```
