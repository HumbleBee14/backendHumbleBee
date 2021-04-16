const User = require('../models/user');
const Blog = require('../models/blog');

const _ = require('lodash');
const formidable = require('formidable');
const fs = require('fs');

const { errorHandler } = require('../helpers/dbErrorHandler');





// ---------------------------------------------------------

// Contoller method to get User Public info - User Profile (to get selected user info only from req.profile (We have removed hashed passwords from the request))
exports.read = (req, res) => {
  req.profile.hashed_password = undefined; // removing password from request (by making it undefined) for sending that in the response
  return res.json(req.profile);
};


// ----------------------------------------------

// for Public Profile (Response: User Public Profile + User's Blogs)
exports.publicProfile = (req, res) => {
  let username = req.params.username; // 'username' will be passed through URL query parameters

  let user;

  let blogs;

  User.findOne({ username })
    .exec((err, userFromDB) => {

      if (err || !userFromDB) {
        return res.status(400).json({
          error: 'User not found!'
        });
      }

      user = userFromDB;

      let userId = user._id;

      // ------------ REMOVING CERTAIN FEILDS ------------
      user.photo = undefined; // we are not sending user profile Photo as this will make response heavy
      user.hashed_password = undefined; // Removing the hashed_password from the response
      user.salt = undefined; // Removing the hashed_password's SALT from the response
      // console.log("User Details --------->", user);
      // ---------------------------------------------

      // Now finding BLOGS by this User and returning the Blogs by this user along with User's Public Profile data
      Blog.find({ postedBy: userId })
        .populate('categories', '_id name slug')
        .populate('tags', '_id name slug')
        .populate('postedBy', '_id name')
        .limit(10) // We are sending/showing only limited number of blogs to show for the selected user (10 latest) in response
        .select('_id title slug excerpt categories tags postedBy createdAt updatedAt')
        .exec((err, data) => {

          if (err) {
            return res.status(400).json({
              error: errorHandler(err)
            });
          }

          res.json({
            user, blogs: data
          });
          // Response: User -> user public profile , blogs -> Blogs by this user
        });

    });
};



// --------------------------------------------------------
//  User Profile Update middleware (to handle Profile details Update requests from users)

exports.update = (req, res) => {

  let form = new formidable.IncomingForm(); // instanciating a new form object
  form.keepExtension = true;

  form.parse(req, (err, fields, files) => { // we are getting formdata from 'req' / request only (through body)
    if (err) {
      return res.status(400).json({
        error: 'Photo could not be uploaded'
      });
    }
    // else (we'll create the user if there's no error )
    let user = req.profile; // 'profile' -(of loggedin user) is available in request object through the earlier middleware that is applied - 'authmiddleware'
    user = _.extend(user, fields); // Changed 'fields' will be merged with the user using the extend Lodash method

    // ------------- Password Validator -----------------

    if (fields.password && fields.password.length < 6) {
      return res.status(400).json({
        error: 'Password should be min 6 characters long'
      });
    }
    // Note: we have not used Express validator here because that works only with json data, not Form data

    // handling files - photos ----------------------
    if (files.photo) {
      // checking file size restriction - 1 MB
      if (files.photo.size > 1048576) {
        return res.status(400).json({

          error: 'Image should be less than 1 MB'
        });
      }

      user.photo.data = fs.readFileSync(files.photo.path);
      user.photo.contentType = files.photo.type;

    }

    // now Saving to user object in DB
    user.save((err, result) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err)
        });
      }

      user.hashed_password = undefined; //   removing from response
      user.salt = undefined; //  removing from response
      user.photo = undefined; //  removing from response

      res.json(user);
    });


  });

};



// ---------------------------------------------------------

// For USER Photo
exports.photo = (req, res) => {
  // First grab the username (and then search for that user's photo)
  const username = req.params.username;

  // find the user
  User.findOne({ username }).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: 'User not found'
      });
    }

    if (user.photo.data) {
      res.set('Content-Type', user.photo.contentType);

      return res.send(user.photo.data);
    }
  });

};