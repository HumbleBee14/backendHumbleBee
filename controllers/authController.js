const User = require('../models/user');
const Blog = require('../models/blog');

const shortId = require('shortid');
const { errorHandler } = require('../helpers/dbErrorHandler');
const _ = require('lodash');


const jwt = require('jsonwebtoken');  // To Generate the JWT Token
const expressJwt = require('express-jwt');  // To check if the token generated is Expired or valid
// Note: Before we generate jwt token , we need to create a secret key (see .env file)


const { sendEmailWithNodemailer } = require("../helpers/email"); // for sending GMAIL Email - Email helper function

// google login auth library
const { OAuth2Client } = require('google-auth-library');



// ==========================================================


// Pre Signup Function    ------------------------------------

exports.preSignup = (req, res) => {
  // console.log("__________ TESTING _______________");

  const { name, email, password } = req.body;

  // Checking is user already exists with this email or not in the database
  User.findOne({ email: email.toLowerCase() }, (err, user) => {
    // if 'user' found with that email, Email is taken
    if (user) {
      return res.status(400).json({
        error: 'Email is taken!'
      });
    }

    // if User does not exist with that email,
    // then create a new TOKEN (jwt token with that info as payload) to email to User' email for confirmation (valid account)
    // Generate a JWT Json Web Token and Send it to Client 

    const token = jwt.sign({ name, email, password }, process.env.JWT_ACCOUNT_ACTIVATION_SECRET, { expiresIn: '10m' }); // signing the token with user details as payload (data), expires in 10 minutes
    // ---------------------------
    // Email the user with the above Token 

    // Creating Email Data that will be send
    const emailData = {

      from: process.env.EMAIL_FROM, // noreply@YourDomain.com
      to: email,
      subject: 'Account activation link',
      html: `
            <h4>Thanks for your interest in creating an account on our super amazing website. We are excited to make you part of our HumbleBee family 🤩<h4>
            <hr/>
            <p>Please use the following link to actiavte your account:</p>
            <h5 class="text-muted">(Email valid only for 10 minutes)</h5>
            <br/>
            <p>${process.env.CLIENT_URL}/auth/account/activate/${token}</p>
            <br/>
            <hr/>
            <p>This email may contain sensitive information. Please don't share it with anyone.</p>
            <p>https://humblebee.live 🐝</p>
          `
    };

    // Custom message that the user will receive on page after submitting the Account creation pre-signup form if the email is succesfully sent from backend
    let customMsg = `Email has been sent to ${email}. Follow the instructions to activate your accounnt. Link valid for 10 minutes`;

    // send email with account activation link
    sendEmailWithNodemailer(req, res, emailData, customMsg);

  });
};
// Note: Once the pre-signup is done, then that 'signup' api will be called once the user clicks on the URL sent to his/her email, which will create the user account in database.


// -----------------------------------------------------------


// SignUp function   [NEW METHOD (using preSignup for account activation/verification)] -----------------------------------------------------

exports.signup = (req, res) => {

  const token = req.body.token; // user's info is available in 'token'. {token: {name, email, password}}

  // Verify if the Token is valid (not expired)

  if (token) {
    jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION_SECRET, function (err, decoded) {
      // Callback to get the decoded token data

      if (err) {
        return res.status(401).json({
          error: 'Expired link. Signup again'
        });
      }
      // else if token is still valid, create user account in DB

      // grabbing user details from the validated token
      const { name, email, password } = jwt.decode(token);

      // generate a new random username for user
      let username = shortId.generate();  // Random username ID generator

      let profile = `${process.env.CLIENT_URL}/profile/${username}`; // Absoulte Path


      // Now create a new user
      const user = new User({ name, email, password, profile, username });
      // NOte: Although we are sending the password in DB, but actually we are not directly saving password, instead we are encrypting it using hashing method in the mongoose model and saving its hashed value and salt in the Database

      // Save new User details in Database
      user.save((err, user) => {
        if (err) {
          return res.status(400).json({
            error: errorHandler(err)
          });
        }

        return res.json({
          message: 'Signup success! Please signin :)'
        });
      });
    });

  } else {

    return res.json({
      message: 'Something went wrong! :( Try again :)'
    });
  }


};





/*

// Signup function  [ OLD METHOD (Direct Signup Account, without preSignup)]  -------------------------------------------------

exports.signup = (req, res) => {
  // Checking is user already exists or not
  User.findOne({ email: req.body.email }).exec((err, user) => {
    if (user) {
      return res.status(400).json({
        error: 'Email is taken!'
      });
    }

    const { name, email, password } = req.body;

    let username = shortId.generate();  // Random username ID generator
    let profile = `${process.env.CLIENT_URL}/profile/${username}`;

    // Now create a new user
    let newUser = new User({ name, email, password, profile, username });

    // Save new User details in Database
    newUser.save((err, success) => {
      if (err) {
        return res.status(400).json({
          error: err
        });
      }

      // res.json({
      //   user: success
      // });

      res.json({
        message: 'Signup success! Please Signin'
      });
    });

  });

};

*/

// -------------------------------------------------------------



// Signin Function  ---------------------------------------------

exports.signin = (req, res) => {
  const { email, password } = req.body;

  // check if User exists
  User.findOne({ email: email }).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: 'User wth that email does not exist. Please signup.'
      });
    }

    // Authenticate User (email, password matching)
    if (!user.authenticate(password)) {
      return res.status(400).json({
        error: "Email and Password do not match."
      });
    }

    //////////////////////////////////////////////////////////////////
    //         GENERATE TOKEN
    //////////////////////////////////////////////////////////////////

    // Generate a JWT Json Web Token and Send it to Client 

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' }); // signing the token with user._id as payload (data)

    // Token expiry set 1 day = 1d, 1 minute = 1m, 10 seconds = 10

    // sending token to Client through token 
    res.cookie('token', token, { expiresIn: '1d' });

    const { _id, username, name, email, role } = user;
    return res.json({
      token: token,
      user: { _id, username, name, email, role }
    });

  });

};


// Signout   ----------------------------------------------------------------

exports.signout = (req, res) => {
  res.clearCookie("token");
  res.json({
    message: "Signout Success"
  });
};

// =======================================================

// Middleware (for protected routes - routes only for Logged in users only)

// Check the incoming token's secret & compare it with ours .env secret & if token hasn't expired, this middleware function will return TRUE. (so it basically checks the token expiry) & will make 'userProperty'- 'user' available in Request object

exports.requireSignin = expressJwt({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
  // userProperty: "auth",
  userProperty: "user",   // making 'user' property available in the request request of this middleware (as long as toke is valid)
});



// Auth middleware  ---------------------------------------------------------------------
exports.authMiddleware = (req, res, next) => {
  const authUserId = req.user._id;
  User.findById({ _id: authUserId }).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: 'User not found'
      });
    }
    req.profile = user; // passing User's data in the request to next function
    next();
  });
};

// Admin Middleware   -------------------------------------------------------------------
exports.adminMiddleware = (req, res, next) => {
  const adminUserId = req.user._id;
  User.findById({ _id: adminUserId }).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: 'User not found'
      });
    }
    // if user not admin
    if (user.role !== 1) {
      return res.status(400).json({
        error: 'Admin resource. Access denied'
      });
    }

    req.profile = user;
    next();
  });
};


// ----------------------------------------------------------------------------------------------

// Check If Currently Logged in User is authorized to update / Delete a Blog

// Middleware to determine if the Specifc Blog can be Updated or Deleted by this User (or if this User has permision to delete / update a blog)

exports.canUpdateDeleteBlog = (req, res, next) => {

  // to find the particular blog based on the slug
  const slug = req.params.slug.toLowerCase();

  //Now find the blog based on the slug
  Blog.findOne({ slug }).exec((err, data) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err)
      });
    }

    //data = blog  

    // Checking if the selected Blog's PostedBy _Id (of the Blog Owner) matches with the Current logged in User ('requireSignin-authorized user), then only that user will be allowed/authorized to do update/delete operations
    let authorizedUser = data.postedBy._id.toString() === req.profile._id.toString(); // Note that we have the User in the req.profile because we have auth Middleware - 'requireSignin' applied.

    if (!authorizedUser) {
      return res.status(400).json({
        error: "You are not authorized"
      });
    }
    // else if User is the actual owner of the blog (authorized to updated/delete, procced further)

    next(); // if user is authorized, next callback (next step) will be allowed to proceed, else it'll fail here only if user is not authorized to delete or update this blog
  });

};


// -----------------------------------------------------------------------------------------------------

// Forgot Password -------------------------

exports.forgotPassword = (req, res) => {
  const { email } = req.body; // User email requesting password reset

  User.findOne({ email }, (err, user) => {
    // If Error returned or No user found
    if (err || !user) {
      return res.status(401).json({
        error: 'User with that email does not exist. Please Check'
      });
    }
    // If user found with that email, generate a signed Token with expiry date/time (10 minutes = 10m)


    const token = jwt.sign({ _id: user._id }, process.env.JWT_RESET_PASSWORD, { expiresIn: '10m' }); // Note: We have to passed some random Secret key along with the user _id ( user._id as payload) to sign the jwt token. Read more (https://jwt.io/   https://jwt.io/introduction).
    //Note: { _id: user._id } is a payload "data" send in encrypted form with the jwt token. It servers two purpose - signing the token and sending the sensitive data in encrypted form. We can grab the data from this token by decrypting the jwt token

    // ---------------------------
    // Email the user with the above Token 

    // Creating Email Data that will be send
    const emailData = {

      from: process.env.EMAIL_FROM, // noreply@YourDomain.com
      to: email,
      subject: `Password reset link`,
      html: `
            <h4>You have requested password reset. Please follow the below instructions to update your password.<h4>
            <h3>(Email valid only for 10 minutes)</h3>
            <hr/>
            <br/>
            <p>Please use the following link to reset your password:</p>
            <p>${process.env.CLIENT_URL}/auth/password/reset/${token}</p>
            <br/>
            <hr/>
            <p>This email may contain sensitive information</p>
            <p>https://humblebee.live 🐝</p>
          `
    };

    // Update the database
    // -------------------------
    // Populate the DB > user > resetPasswordLink  (this will be used to reset Password)

    // Note that we have already found the 'user' from above DB query , we are updating to that user object only (saving token for password reset)
    return user.updateOne({ resetPasswordLink: token }, (err, success) => {
      if (err) {
        return res.json({ error: errorHandler(err) });
      }
      // if token successfully saved / updated in DB, send password reset email
      else {
        // send Email -----------
        sendEmailWithNodemailer(req, res, emailData);
      }
    });

  });
};




//  Reset Password -------------------------------------------------------------------------------------------

exports.resetPassword = (req, res) => {

  const { resetPasswordLink, newPassword } = req.body;


  if (resetPasswordLink) {
    jwt.verify(resetPasswordLink, process.env.JWT_RESET_PASSWORD, function (err, decoded)  // function - is callback passed by jwt.verify-> which will give us either Error or Decoded info. 
    {
      if (err) {
        // 401 - Unauthorized (because Token expired)
        return res.status(401).json({
          error: 'Expired link. Try again'
        });
      }
      // If token is valid, find the User with that resetPasswordLink and return that 'user' object
      User.findOne({ resetPasswordLink }, (err, user) => {
        if (err || !user) {
          // console.log(" Reset Password Error: ", { err }, user);
          let errMsg = "Something went wrong. Try later'";

          if (!user) {
            // user = null (cleared from DB => user already updated password using this link)
            errMsg = "Password already updated. Link Expired!";
          }

          // console.log(err);

          return res.status(401).json({
            error: `${errMsg}`
          });
        };
        // else - update new Password and remove/clear the resetPasswordLink from DB.
        const updatedFields = {
          password: newPassword,
          resetPasswordLink: ''
        };

        // update any fields that have changed & leave everything as it is - using lodash _.extend() method
        user = _.extend(user, updatedFields); // merging updated fields in the user object

        // Now set the updated 'user'
        user.save((err, result) => { // saving new password
          if (err) {
            return res.status(400).json({
              error: errorHandler(err)
            });
          }
          // on successful password update in Database
          res.json({
            message: `Great! Now you can login with your new password`
          });

          // Now redirect the User to signin page after successful password update (on Frontend)

          // You can send confirmation email  on successfull password update from here
        });
      });
    });
  }
};



// ====== ----------------------------------------------------====

// GOOGLE Login functionality

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleLogin = (req, res) => {

  // send the ID token from the client side to backend

  const idToken = req.body.tokenId;

  console.log("tokenID from client side", idToken);

  if (idToken) {

    // verify using the client
    client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID }).then(response => {

      // console.log("Response from goole login:", response);

      const { email_verified, name, email, jti } = response.payload; // jti = unique ID to create user password (useless anyway since we are going to use google as authenticator, but still using it just to keep it in sync with our backend structure where we require a password :P )

      if (email_verified) {
        // find the user if this email (after User's google email is verified from google servers) is present in the database or not.
        // If User found, generate a token (as authentication) and give it back to client side as response.
        // If User does not exist (New User), then Generate a new User (create a new account basically) and save it in database and then generate a token and send it to client side as response.

        // Find User
        User.findOne({ email }).exec((err, user) => {

          // If User exists
          if (user) {
            // console.log(user);
            // If user found, generate a Token for the user to continue login session
            const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' }); // similar to Login function
            // Note: Even though Google is authenticating , but we are stil doing our same process like we do in signin() which is on finding user, generate a token, send it to client side
            // Google Authetication is used Just to make sure user is a Valid Email account holder

            res.cookie('token', token, { expiresIn: '1d' }); // saving the 'token' in cookie to send through response

            const { _id, email, name, role, username } = user;

            // -------------------------- send the response
            return res.json({
              token,
              user: { _id, email, name, role, username }
            });
          }
          // If User does NOT exist (Create User and send same token after generating)
          else {
            //  Create New Account for this new User 

            // generate a new random username for user
            let username = shortId.generate();  // Random username ID generator
            let profile = `${process.env.CLIENT_URL}/profile/${username}`;


            // Note: Although google login does not require password, but behind the scene we are creating it to keep our backend system intact. We are using the unique Code generated by Google - 'jti' as our password here

            // let password = jti;
            let password = jti + process.env.JWT_SECRET; // for more security

            // Create a new user
            user = new User({ name, email, profile, username, password }); // name, email from google and we generated rest of the things 

            // save new user in DB (account create)
            user.save((err, data) => {

              if (err) {
                return res.status(400).json({
                  error: errorHandler(err)
                });
              }
              // if there's no error, GENERATE a TOKEN for new User and send it as response (like a regular authenticated user)

              const token = jwt.sign({ _id: data._id }, process.env.JWT_SECRET, { expiresIn: '1d' }); // generate token
              res.cookie('token', token, { expiresIn: '1d' }); // saving the 'token' in cookie to send through response
              const { _id, email, name, role, username } = data;
              // ------------ send the response with token to new user to login
              return res.json({ token, user: { _id, email, name, role, username } });

            });

          }
        });

      } // Else - if Email is not verified !
      else {

        return res.status(400).json({
          error: 'Google login failed! Try again.'
        });
      }

    })
      .catch(err => {
        console.log("Error in tokenID or Google Login Validation process --> ", err);
        // throw new Error(err);
      });

  }
  else {
    console.log("No idToken recieved. Bad Request");
  }



};

// Summary of Google Login 
/*
 => npm i google-auth-library
- Google Login is used to verify Email !
- If Email is verified by Google then -> Check if User Exists on our Database (already a user) or Not (new user)
- * If Email Found, Find the User and generate a token and send as response (normal Login process)
- * If Email Not Found, then first Create a New User Account with those credentials and generate username, profile and password and Create a new user in Database.
    --- Once new Account created, then as like normal users, Generate a Token and send it as response (login process)
*/

// ==============================================================





// NOTE: Only 'Middlewares' have (req,res,next) - not methods/functions