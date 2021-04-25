const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const cors = require('cors');

require('dotenv').config(); // Environment Variables from .env file

// ------------


// ------------


// -------------------------------------------------------

// bring routes
const blogRoutes = require('./routes/blog');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const categoryRoutes = require('./routes/category');
const tagRoutes = require('./routes/tag');
const formRoutes = require('./routes/form');

const imageHandler = require('./routes/image'); // Under Development



const https = require('https'); // for HTTPS secured server
const fs = require('fs'); // To Read Files from File System




//-------------------------------------------------------------------------

// app
const app = express();



// Database Connection

// Cloud Database  (Cloud DB)
mongoose.connect(process.env.DATABASE_CLOUD, { useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false, useUnifiedTopology: true }).then(() => console.log('DB Connected'));
// Note: 


// Local Database  (Local DB)
// mongoose.connect(process.env.DATABASE_LOCAL, { useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false, useUnifiedTopology: true }).then(() => console.log('DB Connected'));

// middlewares

/*
app.use(function (req, res, next) {
  // res.setHeader("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
*/


app.use(morgan('dev')); // dev =  in development mode

// app.use(bodyParser.json());   // Node.js body parsing middleware. Parse incoming request bodies in a middleware before your handlers, available under the req.body property.

// app.use(bodyParser.json({ limit: "10mb" })); // To increase the request size limit - DEPRECATED

app.use(express.json({ limit: "10mb" })); //Used to parse JSON bodies (New)

// app.use(express.urlencoded({limit: '50mb', extended: true, parameterLimit:50000}));

app.use(cookieParser()); // // allows cookies to be accessed using req.cookies



// CORS
if (process.env.NODE_ENV === 'development') {
  app.use(cors({ origin: `${process.env.CLIENT_URL}` })); // http://localhost:3000
}

// CORS     (Refer: https://www.npmjs.com/package/cors#configuring-cors-w-dynamic-origin)

if (process.env.NODE_ENV === 'production') {
  // app.use(cors({ origin: `http://humblebee.live` }));
  // app.use(cors({ origin: `https://humblebee.live` }));
  // app.use(cors({ origin: `https://15.206.70.165` }));
  // app.use(cors({ origin: '*' }));
}
// app.use(cors());


// routes middleware
app.use('/api', authRoutes);

app.use('/api', blogRoutes);
app.use('/api', userRoutes);
app.use('/api', categoryRoutes);
app.use('/api', tagRoutes);
app.use('/api', formRoutes);

app.use('/api', imageHandler); // to handle image compresssion API

// routes
// Moved to separate routes directory


// port
const port = process.env.PORT || 8000;


// On Production Servers (HTTPS with SSL Certificates)

if (process.env.NODE_ENV === 'production') {
  // SSL Key Certificates (generated using LetsEncrypt)
  var key = fs.readFileSync('/etc/letsencrypt/live/humblebee.live/privkey.pem');
  var cert = fs.readFileSync('/etc/letsencrypt/live/humblebee.live/fullchain.pem');
  var options = {
    key: key,
    cert: cert
  };

  // -----------------------------------
  // Creating HTTPS Server
  var server = https.createServer(options, app);

  server.listen(port, '127.0.0.1', (err) => {
    if (err) throw err;
    console.log(`HTTPS Server is Running on ${port}`);
  });
}

// On Local Dev Server
if (process.env.NODE_ENV === 'development') {

  app.listen(port, '127.0.0.1', (err) => {
    // app.listen(port, (err) => {
    if (err) throw err;
    console.log(`Local Server is Running on ${port}`);
  });
}