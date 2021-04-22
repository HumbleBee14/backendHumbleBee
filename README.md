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

////////////// Adding USER Profiles ///////////////////

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

=======================================================

# Configure Nginx on AWS to redirect Frontnend & Backend server requests to Correct Ports

## Install Nginx -> sudo apt install nginx

## Nginx Server ERROR Logs: /var/log/nginx -----> error.log

# Edit this file: default -> /etc/nginx/sites-available/default

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

Then restart nginx server:
`sudo service nginx restart`

// -----------------------------------------------------------

// On code change, Pull the code on server using git:

on Local Dev Machine:
`git status`
`git add .`
`git commit -m "message"`
`git push`

on AWS :
`git pull` (run this where the code is changed- backend or frontend)

=====================================================================================

# Nginx server settings:

---

Refer: https://scaron.info/blog/improve-your-nginx-ssl-configuration.html
// -----------------------------------------------------------------------

# Default server configuration

#

server {
listen 80 default_server;
listen [::]:80 default_server;

# server_name humblebee.live www.humblebee.live;

# Redirect http to https (Disable it if you are using Cloudflare HTTPS redirect)

# return 301 https://$server_name$request_uri;

# return 301 https://$host$request_uri;

        # SSL configuration
        #
         listen 443 ssl http2 default_server;
         listen [::]:443 ssl http2 default_server;
        #

        ssl_certificate /etc/nginx/ssl/certs/humblebee.pem;
        ssl_certificate_key /etc/nginx/ssl/private/humblebeeKEY.pem;

        # Note: You should disable gzip for SSL traffic.

        root /var/www/html;

        # Add index.php to the list if you are using PHP
        index index.html index.htm index.nginx-debian.html;

        server_name _;

location /api {
proxy_pass http://localhost:8000;
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection 'upgrade';
proxy_set_header Host $host;
proxy_cache_bypass $http_upgrade;
}

location / {
proxy_pass http://localhost:3000;
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection 'upgrade';
proxy_set_header Host $host;
proxy_cache_bypass $http_upgrade;
}

}

# //--------------------------------------------------------------
