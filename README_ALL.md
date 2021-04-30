# BloggingPlatformMERN

FullStack MERN SEO React Blogging Web App

// To Start Project:

Frontend: npm run dev
Backend: npm start

//

/\*
--------- BACKEND -----------

tag create list read delete (remove)

> model
>
> > validator (for model)
> >
> > > routes
> > >
> > > > Apply routes as middleware in "server.js"
> > > >
> > > > > controllers

--------- FRONTEND ----------

# Tag crud

_Step 1:_ Create a Link/reference to this Tag page in the admin/index page (Where it'll be showed)

- pages/admin/index >>> add LINK to 'admin/crud/category-tag' Page

Also, add the <Tag/> component in category-tag.js page

_Step 2:_ Create Action functions (that'll be called from frontend code to send request to Backend from different tag components)

- actions/tag >>> create/getTags/singleTag/removeTag

_Step 3:_ // Creating Components

- components/crud/TagComponent >>> newTagForm/showTags/deleteTag/messages (or alerts)

\*/

============================

## Blogs Section

-------------- Blogs Backend --------------

- blog Model / Blog Schema
- blog route
- add blog route to server.js
- blog controller

// -------------------------------------------------------
// Monolithic Server Deisgn

[Request] ----------> {**_ [Auth-MiddleWare] -> [Router] -> (A/B/C/D/.. Features/Codes/Pages <Business Logic> ) ==> => [Database1/2/3..] _**}

// Distributed Server Design (using Microservices)

> Now Try using Postman

-------------- Blogs FrontEnd --------------

npm i react-quill (rich text editor for blog)
OR -> npm install quill@1.3.6

// search query parser (for frontend) - Parse and stringify URL query strings
npm i query-string
.
Google Authentication ----
-> create a endpoint on backend to make request to
-> create a controller method to handle that
npm i google-auth-library (google login authentication) - install it on backend

On Frontend: (to send request to backend endpoint)

install react-goole-login (on frontend)
npm i react-google-login (on client side)
-> create a component for Google Login interface
-> create a action (to make request to backend)
.
./// ===========================================================

# Forgot Password Flow

=========================
-> User request to Reset Password
-> We generate a Token with UserID that expires in 10 minutes
-> Email that token
-> Also store that token in database as user's 'resetPasswordLink'
-> Inform uset that the the link has been emailed
.
.
// -----------------------------------

# Reset Password

=======================
-> Once user clicks on that Forgot Password Link that we emailed (with token)
-> User lands on our frontned password reset Page
-> There we still store the Token (grab token that came with that email Link (from router parameter)) and save that token in state
-> User will Enter New Password in input
-> Once user submit the token and new password will be send to backend
-> In backend we will check if the toke expired (more than 10 min elapsed)
-> If not, then we check if we can find the user with that token in the database
-> If we find then its a valid reset password reuests
-> So we update the old pasword with its new password
-> Then empty the { resetPasswordLink } field
-> Then send mesage to user saying the password is reset successfully
-> User can now login with new password :)
.
.

// ------------------------------------------------------------

### Forgot Password Backend

[ Backend ]

1. -> Create API ROUTE (and Model if required)
2. -> Create a Controller method (that will be called on that API route)
3. -> If needed before running final controller method logic on that api, you want to parse, validate something before, you can also Write some Middlewares (inside the controller methods only)

// ---------------------------------------------------------------

# ACCOUNT ACTIVATION via Email is required on Signup

- Before signup, you run 'preSignup'
- so basically whatever data you need on signup, you need to get that from user during 'preSignup'
- put that data in JWT
- then send that to user's email (as part of email confirmation to prevent Fake accounts)
- If user clicks that email's account confirmation email and opens the page
- grab the jwt token from the router/url using react
- then send that back to backend server for validation
- extract the USER Info from jwt (used earlier in preSignup to sign the token)
- and use that info to Create / Save new user in Database DB

---

// 1) Create a Route in backend for preSignup 2) create a controller method for preSignup

// --------------------------------------------------------------
.
.
// FACEBOOK APP ID

All you have to do it go to https://developers.facebook.com/

then create a new app... you get the app id

use that in this project

put the app id in next.config.js

then store in a variable in config.js so that its easy to use

then use anywhere in your app from config.js
.
.
.
.
.// ########################################################################################################################################################################################################################################################################

# APPENDIX

//------------------------------------------
=> e.preventDefault() - Why we use this?

    -> The preventDefault() method cancels the event if it is cancelable, meaning that the default action that belongs to the event will not occur.

    For example, this can be useful when:

    - Clicking on a "Submit" button, prevent it from submitting a form
    - Clicking on a link, prevent the link from following the URL

//------------------------------------------

## Why to use formData and withRouter in forms? in Lecture: 74

_formData_ is what you use when you are dealing with form data such as sending files/images to backend. Other times you use 'json' data as usual.

_withRouter_ makes router object available as props in your components. so that you can access _router.params_ etc

Example:

`const MyComponent = ({router}) => { ... }`
//------------------------------------------
Note:

HTML Status Response:

204 => Empty Content in response
//------------------------------------------

//------------------------------------------

# To Allow All the Authenticated Users to create a blog

-> Create separate endpoints for user to create update delete blogs
-> use the same components in frontend (like for admin)
-> use the same controller method in backend (like for admin)
-> only change the submit endpoint based on user role

-> if user is admin this is what route looks like:
router. post('/blog', require Signin, adminMiddleware, create)

> if user is reular user this is what route looks like:

        router.post('/user/blog', require Signin, authMiddleware, create)

//------------------------------------------

# To render certain parts only on the CLient side , not serverd side:

## Nextjs renders page serverside meaning when the page was rendered it had some content.

But when page was fully rendered (let's say your refreshed the page) clientside, some content changed.. for example you may show logged in user name in nav based on the data you had in localstorage.

So that means text did not match between the server renderd and client rendered.

This is nothing to worry but if you want you can render certain content only on the client side by confirming you are in the client mode:

```
// Run only on client side/ browser

Refer: https://blog.hao.dev/render-client-side-only-component-in-next-js

if (process.browser) {
    // on browser
}

=== :
`{process.browser && <>Now you are in client side. Fetch user info from local storage and show here</>}`
```

# typeof window !== 'undefined' ? useLayoutEffect : useEffect;

```
You can fetch client-side only data using the useEffect Hook.

import {useEffect} from 'react'
useEffect(()=>{
return =>{
 // clean-up functions
 }
},[])

The first argument Is a function and you can make your API calls inside this.

The second argument to the useEffect will determine when the useEffect should be triggered. If you pass an empty array [ ], then the useEffect will only be fired when the component Mounts. If you want the useEffect to fire if any props change then pass such props as a dependency to the array.

    useEffect(()=>{
     Make API call and setState
     return =>{
       // clean-up functions
       }
    },[props])

If you want GET_CURRENT_USER_QUERY from the query string you can pass the argument from the getInitailProps and read this as props in the useEffect array dependency.

 If you want the data to be defined on server side, use `getInitailProps` on the page which the form is in. That way you can retrieve the data from props and pass it to your form component.
```

//------------------------------------------
Install ANT DESIGN ICONS LIBRARY

-> Step 1: `npm install antd` or `yarn add antd`
-> Step 2: npm install @ant-design/icons
//------------------------------------------

//-------------------------------------------------------------

# To show Loading Icon on page load / or page redirect

Use loading state and set it's value to true by default.

So by default loading is true so it can render loading icon or blank page.

Then in useEffect, you can check for user. if user then set loading to false.

This way Only when loading is false, you will render content.

Example code:
// ------------------------------------
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { SyncOutlined } from "@ant-design/icons";
import UserNav from "../nav/UserNav";

const UserRoute = ({ children }) => {
// state
const [ok, setOk] = useState(false);
// router
const router = useRouter();

useEffect(() => {
fetchUser();
}, []);

const fetchUser = async () => {
try {
const { data } = await axios.get("/api/current-user");
// console.log(data);
if (data.ok) setOk(true);
} catch (err) {
console.log(err);
setOk(false);
router.push("/login");
}
};

return (
<>
{!ok ? (
<SyncOutlined
          spin
          className="d-flex justify-content-center display-1 text-primary p-5"
        />
) : (

<div className="container-fluid">
<div className="row">
<div className="col-md-2">
<UserNav />
</div>
<div className="col-md-10">{children}</div>
</div>
</div>
)}
</>
);
};

export default UserRoute;

// --------------------------------------------------------------
// -----------------------------------------------------------

- ( process.browser ) = true if the code is running on BROWSER (client side) and = false if running on server side (nodejs) backend.

//--------------------------------------------------------------------------------

WYSWYG Rich Text Editor CKEDITOR / QUILL

Refer: https://teachsomebody.com/blog/view/9oLqSUeN7yWEesUhG8YMd/how-to-use-ckeditor5-in-a-react-or-nextjs-application

npm i @ckeditor/ckeditor5-react

npm i @ckeditor/ckeditor5-editor-inline
npm i @ckeditor/ckeditor5-build-classic

//------------------------------------------------------------------------------------------------
// Difference between LOCAL STORAGE & COOKIES

Q => What is the difference between local storage vs cookies?

Ans => On client and server, the following storages are available: local storage, session storage, and cookies.

The Local Storage is designed for storage that spans multiple windows and lasts beyond the current session.
In particular, Web applications may wish to store megabytes of user data, such as entire user-authored documents
or a user's mailbox, on the client side for performance reasons.
` Cookies do not handle this case well because they are transmitted with every request.`

Local Storage is available for every page and remains even when the web browser is closed,
but you cannot read it on the server, only available/saved on client side browser.

The stored data has no expiration date in local storage. With cookies, you can set the expiration duration.

If you want to clear local storage, then do it by clearing the browser cache.
You can also use JavaScript for this. Local Storage is for client side,
whereas cookies are for the client as well as server side.

---

-> Cookies are primarily for reading server-side,
-> `local storage can only be read by the client-side.`
So the question is, in your app, who needs this data — the client or the server?

As per the technical difference:

- ` Apart from being an old way of saving data, Cookies give you a limit of 4096 bytes (4KB) — it's per cookie. Local Storage is as big as 5MB per domain`

- `'localStorage' is an implementation of the Storage Interface. It stores data with no expiration date, and gets cleared only through JavaScript, or clearing the Browser Cache / Locally Stored Data — unlike cookie expiry.`

Cookies:

- Introduced prior to HTML5.
- Has expiration date.
- Cleared by JS or by Clear Browsing Data of browser or after expiration date.
- Will sent to the server per each request.
- The capacity is 4KB.
- Only strings are able to store in cookies.
- There are two types of cookies: persistent and session.

  Local Storage:

- Introduced with HTML5.
- Does not have expiration date.
- Cleared by JS or by Clear Browsing Data of the browser.
- You can select when the data must be sent to the server.
- The capacity is 5MB.
- Data is stored indefinitely, and must be a string.
- Only have one type.

//------------------------------------------------------------------------------------------------

npm install html-to-text (convert html to text)

====================================================================

# Add Google Analytics

1. Initialize Google Analytics
2. Add event handlers (to send data to GA )
3. Send Custom event (to GA when user performs any action like ading product in card for example)

==================================================================

# Setup Unix server

sudo apt install htop

// -----------------------------------------------------
// Create a New user with ADMIN Rights

Logi as root user, then

`sudo adduser newRootUser`
Enter Password
usermod -aG sudo newRootUser (run as root user)

Now remove login rights for ROOT user

Now Check by signin with new user: sudo su newRootUser

`sudo su newRootUser`

Exit and relogin as new root user and then remove access to root user login

// ------------------------------------------------------

Check Open ports listening to:
`sudo netstat -ntlp | grep LISTEN`

To find the process PID running on a specific PORT:

`sudo lsof -t -i:8000`

To Kill process running on port :
`sudo kill -9 $(sudo lsof -t -i:3000)`

OR
Kill Processes by patter / name
`pkill -f my_pattern`

Install nginx - https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-18-04-quickstart

1. Create a sudo user (& disable root - security reason)
2. Install `nodejs`, `npm` & `nginx`
   -sudo install install nginx

- sudo vi /etc/nginx/nginx.conf (Set worker_processes value to auto)
- sudo /etc/init.d/nginx start

// Install Nodejs:
--> curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
--> . ~/.nvm/nvm.sh
--> nvm install node

Server Logs
/var/log/nginx/access.log: Every request to your web server is recorded in this log file unless Nginx is configured to do otherwise.
/var/log/nginx/error.log: Any Nginx errors will be recorded in this log.

3. Setup / Configure `nginx` server to host frontend & backend to two different ports

cd /etc/nginx/sites-available

edit 'default' file inside this directory

// Refer: https://www.digitalocean.com/community/questions/configure-nginx-for-nodejs-backend-and-react-frontend-app

Paste this code:

```

# - - - DISABLING TO ADD OUR APPLICATION NGNIX CONFIG FOR BACKEND and FRONTNED - - - -
#       location / {
                # First attempt to serve request as file, then
                # as directory, then fall back to displaying a 404.
#               try_files $uri $uri/ =404;
#       }
# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -



# - - - - - - - - For Backend (Nodejs) - - - - - - - -

        location /api {
    proxy_pass http://localhost:8000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
        }

# - - - - - - - - For Frontend (React-Nextjs) - - - - - -

        location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
        }

#    proxy_redirect off;
#    proxy_ssl_session_reuse off;
#    proxy_set_header X-NginX-Proxy true;


```

#---------------------------------------------------------------------------

// NOTE: Make sure to open both 8000 & 3000 (As per your app) for both backend and frontend ports

# FOR enabling HTTPS on Nginx:

--> Inside /etc/nginx/sites-available/default

```
server {
       listen 80;
       server_name example.com www.example.com;
       return 301 https://example.com$request_uri;
}
server {
       listen 443 ssl;
      server_name example.com web.example.com;

       # Certificate
       ssl_certificate /etc/nginx/ssl/certs/nginx-selfsigned.crt;

       # Private Key
       ssl_certificate_key /etc/nginx/ssl/private/nginx-selfsigned.key;

       location /api {
               proxy_pass http://localhost:8000;
               proxy_set_header Host $host;
               proxy_set_header X-Real-IP $remote_addr;
               proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
               proxy_set_header X-Forwarded-Proto $scheme;
        }

        location / {
               proxy_pass http://localhost:3000;
               proxy_set_header Host $host;
               proxy_set_header X-Real-IP $remote_addr;
               proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
               proxy_set_header X-Forwarded-Proto $scheme;
        }
}

```

Remove location / { .... } from 'default' file and paste the above two for frontend and backend.

-> For SLL Refer: https://www.digitalocean.com/community/tutorials/openssl-essentials-working-with-ssl-certificates-private-keys-and-csrs

Make nginx to accept HTTPS
https://medium.datadriveninvestor.com/nginx-server-ssl-setup-on-aws-ec2-linux-b6bb454e2ef2

Generate SSL self signed certificate:
Refer: https://www.digitalocean.com/community/tutorials/how-to-create-a-self-signed-ssl-certificate-for-nginx-in-ubuntu-18-04

sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/nginx/ssl/private/nginx-selfsigned.key -out /etc/nginx/ssl/certs/nginx-selfsigned.crt

Refer this for setting up HTTPS on NGINX with SSL
`https://sunscrapers.com/blog/setting-up-https-on-nginx-with-certbot-and-letsencrypt/`

generate dhparam file
=> openssl dhparam -out dhparam.pem 1024
OR
=> sudo openssl dhparam -out /etc/ssl/certs/dhparam.pem 2048

As always make sure to backup your config before making the changes and also run a Nginx config test before restarting Nginx:

Test Nginx Configuration:-
$ `sudo service nginx configtest`
$ `sudo nginx -t`

Basic Nginx commands:-
Start Nginx:-
$ sudo service nginx start
$ sudo systemctl start nginx
Stop Nginx:-
$ sudo service nginx stop
$ sudo systemctl stop nginx
Restart Nginx:-
$ `sudo service nginx restart`
$ `sudo systemctl restart nginx`
Reload Nginx:-
$ service nginx reload
$ sudo systemctl reload nginx
Status Nginx:-
$ service nginx status
$ systemctl status nginx
Test Nginx Configuration:-
$ service nginx configtest
$ sudo nginx -t

> > nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
> > nginx: configuration file /etc/nginx/nginx.conf test is successful

If you get Syntax OK then you should be OK to restart Nginx:

`sudo systemctl restart nginx`

sudo systemctl restart nginx

// Now you can download (git clone ....) your code onto server

and make change in configuration files like .env (production mode) and .next.config.js

####

After setting up everything, You need install all the dependencies (node modules) for both backend and frontend.

run - `npm install` inside both directories
to install all the node_modules for code build purpose, which will fetch all the dependencies from the package.json file. and after downlaoding everything , you can BUILD your code

---

===========

Now install and setup database - mongodb

OR go with cloud database (mongodb atlas)

cd - (go to home directory)

sudo apt update
sudo apt install -y mongodb

Refer: https://www.digitalocean.com/community/tutorials/how-to-install-mongodb-on-ubuntu-18-04

Check status: sudo systemctl status mongodb

.
.
.
.
.

// After all this, Build your frontend project

`npm run build` (inside frontend directory)
.
then start server - `npm start` (but this will stop if you close terminal).
So run this as daemon process using `pm2`
Monitor all processes: `pm2 monit`
Refer below
.//-------------------------------------------------------------------------
===========================================

# Setup FIREWALL on Ubuntu (ufw) / Open ports

$ sudo apt-get update
$ sudo apt-get install ufw

$ sudo ufw status

// inactive ? Good,Before enabling it, first change Default policy to ALLOW so that you can acceess after enabling it, else you will not able to connect using ssh or anything after enabling it because by default its set to DENY

// Command ufw default allow will set default policy to allow, this will allow everything connection from any port to your server after your firewall is enabled.

$ sudo ufw default allow

$ sudo ufw enable

// Command ufw allow 22/tcp will allow all incoming TCP (not UDP) connections to port 22 used for SSH.

$ sudo ufw allow 22/tcp

// Command ufw default deny will change the default policy, so all incoming connections will be denied / rejected unless defined in firewall otherwise.

$ sudo ufw default deny

Now you can safely ENABLE selected ports after connecting to your server via ssh (make sure to restart server once)

$ sudo ufw status verbose

The syntax is as follows to open tcp port 22 and 443:
$ sudo ufw allow 80/tcp
$ sudo ufw allow 443/tcp

Open port 25 (smtpd/email server):
$ sudo ufw allow 25

You can allow port ranges too say, tcp and udp 3000 to 5000:
$ sudo ufw allow 3000:5000/tcp
$ sudo ufw allow 3000:5000/udp

Make sure you allow connections from an IP address called 1.2.3.4, enter:
$ sudo ufw allow from 1.2.3.4

Make sure you allow connections from an IP address called 1.2.3.4 to our port 22, enter:
$ sudo ufw allow from 1.2.3.4 to any port 22 proto tcp

$ sudo ufw app list

// If you need to stop the firewall and disable on system startup, enter:
$ sudo ufw disable

$ sudo ufw allow 'Nginx Full'

// To remove /delete a port

$ sudo ufw status numbered

$ sudo ufw delete 3

======================================
// Isntall SSL certificate using LetsEncrypt

// sudo apt install certbot

// sudo ufw allow 80

Stop Nginx before generating certificate

// sudo systemctl stop nginx

// sudo certbot certonly --standalone --rsa-key-size 4096 --agree-tos --preferred-challenges http -d <domain-name>

//--------------------------------------------------------------------
// Basic Linux commnads:

Check API : curl http://<.Domain OR IP Address.>/api
Ex: curl http://190.123.56.12/api

PM2 - Application daemon manager:

PM2 is a Production Process Manager for Node.js applications
with a built-in Load Balancer.

Monitor all processes launched: `pm2 monit`

                Start and Daemonize any application:
                $ pm2 start app.js

                Load Balance 4 instances of api.js:
                $ pm2 start api.js -i 4

                Monitor in production:
                $ pm2 monitor

                Make pm2 auto-boot at server restart:
                 For automatically running PM2 when the server restarts, issue the following command:

                $ sudo pm2 startup

                & run the given command

                To go further checkout:
                http://pm2.io/

---

// Start pm2:
`pm2 start`

`pm2 start npm -- start` // to start npm daemon process (frontend)

`pm2 start server.js` // start nodejs backend

.
// RESTART SERVER (Restart nodejs backend using pm2): `pm2 restart server.js`
.
.
// Stop pm2 :

TO stop a proces: `pm2 stop <process-name>`

To Stop all processes: `pm2 stop all` **\_**OR**\_** `pm2 delete all`

check status: `pm2 status`

You can view all processes which are registered with pm2 using

`pm2 list`

Assume the process you want to stop is named as processA using the below command will stop the processA:

`pm2 stop processA`

In case you want to delete the process than use the below command:

`pm2 delete processA`

In case you don't want to kill a particular process but pm2 itself using the command below:

`pm2 kill`

// To save pm2 services and restart on server reboot:
step1: Save it `pm2 save`
step2: Bring back old saved services - `pm2 resurrect`
step3: Restart `pm2 start all`

// =========================================================================
// ------------- STOP MONGODB SERVER --------------

- Shutdown MongoDB server from services
  : `sudo service mongodb stop`

- Shutdown from Mongo Shell on Linux: We must issue the shutdown command against the admin database
  : -> `mongo` ->` use admin` -> `db.shutdownServer()`

* Else you can directly kill the process using PID

// ------------- START MONGODB SERVER ----------------

- Start MongoDB server from services : `sudo service mongodb start`

{start|stop|force-stop|restart|force-reload|status}

// ------------ START MONGODB CLIENT ----------------------
// to start mongodb client shell : `mongo start` or `mongo`
// Connect to user: `use admin`
// connect to DB: `use myDatabase`
// check databases : `show dbs`
// exit from mongodb cleint shell: `exit`
// clear screen: `cls` or Ctrl + L

// Check mongodb server STATUS : `service mongodb status` OR `systemctl status mongodb.service`

// Useful resources:
https://www.mongodb.r2schools.com/how-to-rename-a-database-in-mongodb/#more-164
//---------------------------------------------------------

                # DATABASE DUMP Vs BACKUP

"Database dump is a logical backup. Database Backup is a physical backup."

# DATABASE DUMP

```
A database dump (also: SQL dump) contains a record of the table structure and/or the data from a database and is usually in the form of a list of SQL statements. A database dump is most often used for backing up a database so that its contents can be restored in the event of data loss.

// -------------
Database dump is usually done using a database export facility, that can for instance dump the metadata and/or data of an entire database or schema in a format that can be used by an import utility, for instance to set up a clone of a particular database. Sometimes you only want the meta-data (the definitions of tables, etc.) and not the data (for example: to set up a test database, where you only want the object definitions of a production database, but not the full content of the data, or just a small sample of the data). The export utility guarantees that the data is internally consistent (you won’t see uncommited data or data from transactions that have rolled back).

```

# DATABASE BACKUP

```
Database backup is used to be able to restore the database to a prior instance in time, and is done by a backup facility. Backups can be either full or incremental, and in most cases both offline (database server not running, no transactions in progress) and online backups (while database is running, transactions possible) are possible. Backups don’t always guarantee that they are consistent, so sometimes after placing back a backup, the database need recovery (which is possible because the logfiles needed are backupped too). Most database vendors have their own tools for creating a backup file, but one can always make an offline backup using just operating systems utilities (simple copy of all the files that make up a particular database instance, including datafiles, initialisa tion/control files, log files, configuration files, etc.). Note that making a backup using operating systems facilities (copying files) while the database is running, is prone to error, because database transactions in progress constantly write to the database, while the operating system reads the same files, and this will normally result in invalid, inconsistent or even a corrupted backup file set, which may not be recoverable. Online backups are possible only with the specific tools that accompany the database system in question, and which can guarantee that the backup set is valid (not corrupted), and is either consistent, or can be made consistent using recovery from redo log files that are part of the backup set. Online backups take longer however then offline backups.
```

==========
So in summary, dumps and backups are not the same, although in some instances, they can be used for the same purpose (for example: setting up a database with the exact contents of how it was a week ago, using either a full database dump or full copy of all the operating system files the database consists of, or a full export of the database).

In dump only the queries required to reconstruct the table and other insert queries to get the data restored are formed, on restore the same queries are run on remote server to restore the database

# In physical backup the actual data is copied in a file and is restored on remote server when required.

// -------------------------------------------------------------------------------------------------------------------------------------------------------
// Frontedn Next.js BUILD Code

admin@ubuntu:~/frontendCode$ `npm run build`

> frontend@1.0.0 build /home/admin/frontendCode
> next build

info - Using webpack 4. Reason: future.webpack5 option not enabled https://nextjs.org/docs/messages/webpack5
info - Checking validity of types
info - Creating an optimized production build
info - Compiled successfully
info - Collecting page data
info - Generating static pages (19/19)
info - Finalizing page optimization

Page Size First Load JS
┌ ○ / 807 B 160 kB
├ /\_app 0 B 71.3 kB
├ ○ /404 3.03 kB 74.4 kB
├ ○ /admin 652 B 160 kB
├ ○ /admin/crud/[slug] 502 B 165 kB
├ ○ /admin/crud/blog 514 B 165 kB
├ ○ /admin/crud/blogs 992 B 243 kB
├ ○ /admin/crud/category-tag 1.86 kB 161 kB
├ ○ /auth/account/activate/[id] 177 kB 336 kB
├ ○ /auth/password/forgot 989 B 160 kB
├ ○ /auth/password/reset/[id] 949 B 160 kB
├ λ /blogs 3.95 kB 246 kB
├ λ /blogs/[slug] 106 kB 348 kB
├ λ /categories/[slug] 3.58 kB 246 kB
├ ○ /contact 1.38 kB 161 kB
├ λ /profile/[username] 4.4 kB 247 kB
├ ○ /signin 5.36 kB 165 kB
├ ○ /signup 1.28 kB 161 kB
├ λ /tags/[slug] 3.58 kB 246 kB
├ ○ /user 509 B 167 kB
├ ○ /user/crud/[slug] 382 B 172 kB
├ ○ /user/crud/blog 391 B 172 kB
├ ○ /user/crud/blogs 942 B 250 kB
└ ○ /user/update 1.86 kB 168 kB

- First Load JS shared by all 71.3 kB
  ├ chunks/commons.88b698.js 13.4 kB
  ├ chunks/framework.b8f98a.js 46.9 kB
  ├ chunks/main.87237a.js 7.12 kB
  ├ chunks/pages/\_app.563746.js 2.7 kB
  └ chunks/webpack.2f7329.js 1.25 kB

λ (Server) server-side renders at runtime (uses getInitialProps or getServerSideProps)
○ (Static) automatically rendered as static HTML (uses no initial props)
● (SSG) automatically generated as static HTML + JSON (uses getStaticProps)
(ISR) incremental static regeneration (uses revalidate in getStaticProps)

// -----------------------------------------------------------------------------------------------------
