const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
require('dotenv').config(); // Environment Variables from .env file

const cors = require('cors');



// -------------------------------------------------------

// bring routes
const blogRoutes = require('./routes/blog');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const categoryRoutes = require('./routes/category');
const tagRoutes = require('./routes/tag');
const formRoutes = require('./routes/form');


// app
const app = express();



// Database Connection

// Cloud Database  (Cloud DB)
mongoose.connect(process.env.DATABASE_CLOUD, { useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false, useUnifiedTopology: true }).then(() => console.log('DB Connected'));
// Note: 


// Local Database  (Local DB)
// mongoose.connect(process.env.DATABASE_LOCAL, { useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false, useUnifiedTopology: true }).then(() => console.log('DB Connected'));

// middlewares

app.use(morgan('dev')); // dev =  in development mode
app.use(bodyParser.json());   // Node.js body parsing middleware. Parse incoming request bodies in a middleware before your handlers, available under the req.body property.
// app.use(bodyParser.json({ limit: "10mb" })); // To increase the request size limit
app.use(cookieParser());

// CORS
if (process.env.NODE_ENV === 'development') {
  app.use(cors({ origin: `${process.env.CLIENT_URL}` })); // http://localhost:3000
}

// cors
if (process.env.NODE_ENV === 'production') {
  app.use(cors({ origin: `http://humblebee.live` }));
  // app.use(cors({ origin: `https://humblebee.live` }));
}
app.use(cors());


// routes middleware
app.use('/api', authRoutes);

app.use('/api', blogRoutes);
app.use('/api', userRoutes);
app.use('/api', categoryRoutes);
app.use('/api', tagRoutes);
app.use('/api', formRoutes);

// routes
// Moved to separate routes directory

// port
const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`Server is Running on ${port}`);
});
