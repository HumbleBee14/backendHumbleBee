# npm install express mongoose body-parser cookie-parser morgan nodemon dotenv cors

# npm i express-validator jsonwebtoken express-jwt formidable lodash slugify string-strip-html

// Start Application:

    "dev": "nodemon server.js",   => local -> npm dev
    "start": "node server.js"     => Production -> npm start

## Atlas - pk321...

// https://kaloraat.com/articles/how-to-use-mongodb-atlas

Mongo Atlas

```
ID: testUser
PW: testUserPassword

```

////// Adding USER Profiles ///////////

1. create a 'route' in routes for public user profile
2. Then add/create a middleware function to handle the requests on that route in the - user Controller & give the response through that middleware (this middleware will handle calls to database)

// In Frontend ////

1. Create Action for user Public profile which will Fetch the user public profile API (GET request to the 'route' created in backend)
2. Create a Page for the Public Profile (which will call the action)

// ------------------------------------------
CONTACT-US EMAIL VALIDATOR:

- GMAIL used

--> Added EMAIL PROVIDER API Key in backend .env file
--> Created a Contact Form VALIDATOR (name, email, message)
--> Created a route for form

// #####################################################################

# ERRORS

// -------------------------------------------------------
Error: self signed certificate in certificate chain (in nodemailer email)

Problem: This error occures on nodemailer when unable to send email due to some isue
Soution: Check config SMTP, or if runnin on localmachine, DISABLE TURN OFF ANTIVIRUS (prevents scripts to send email)
// -------------------------------------------------------

// -------------------------------------------------------
// -------------------------------------------------------

# Things to check while deploying app from local to Production on hosting services

-> Change CLIENT_URL in the environment file / config files .env
-> apply CORS (for your domain)
-> Change DATABASE connection details in backend code.
-> Change and Update commenting system (DISQUS) keys and all that
-> Change and update new EMAIL CLIENT Keys/config in the environment file for mail
-> GOOGLE_CLIENT_ID -> used for linking Google Login form on signin page
-> GOOGLE ANALYTICS KEY in config (on Frontend only)

-> Check ports opend and set environment = Production (backend) and set PRODUCTION: true on frontend in config files
-> Update FB_APP_ID for SEO optmization
// ---------------------------------------------------
