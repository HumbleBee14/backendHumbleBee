const User = require('../models/user');
const Blog = require('../models/blog');

const shortId = require('shortid');
const { errorHandler } = require('../helpers/dbErrorHandler');
const _ = require('lodash');
const jwt = require('jsonwebtoken');  // To Generate and validate the JWT Token
// Note: Before we generate jwt token , we need to create a secret key (see .env file)

const { sendEmailWithNodemailer } = require("../helpers/email"); // for sending GMAIL Email - Email helper function

// google login auth library
const { OAuth2Client } = require('google-auth-library');



// ==========================================================


// Pre Signup Function    ------------------------------------

exports.preSignup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Checking if user already exists with this email in the database
    const user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      return res.status(400).json({ error: "Email is taken!" });
    }

    // Generate a JWT Json Web Token and Send it to Client 
    const token = jwt.sign(
      { name, email, password },
      process.env.JWT_ACCOUNT_ACTIVATION_SECRET,
      { expiresIn: "10m" } // expires in 10 minutes
    );

    // Creating Email Data to send
    const emailData = {
      from: process.env.EMAIL_FROM, // noreply@YourDomain.com
      to: email,
      subject: "Account activation link",
      text: "Hello world!",
      html: `
        <h4>Thanks for your interest in creating an account on our super amazing website. We are excited to make you part of our grepGuru community 🤩</h4>
        <hr/>
        <p>Please use the following link to activate your account:</p>
        <h5 class="text-muted">(Email valid only for 10 minutes)</h5>
        <br/>
        <p>${process.env.CLIENT_URL}/auth/account/activate/${token}</p>
        <br/>
        <hr/>
        <p>This email may contain sensitive information. Please don't share it with anyone.</p>
        <p>https://grepguru.com 🐝</p>
      `
    };

    // Send email with account activation link
    let customMsg = `Email has been sent to ${email}. Follow the instructions to activate your account. Link is valid for 10 minutes`;
    sendEmailWithNodemailer(req, res, emailData, customMsg);

  } catch (error) {
    console.error("PreSignup Error:", error);
    res.status(500).json({ error: "Internal Server Error. Please try again." });
  }
};

// Note: Once the pre-signup is done, then that 'signup' api will be called once the user clicks on the URL sent to his/her email, which will create the user account in database.


// -----------------------------------------------------------


// SignUp function   [NEW METHOD (using preSignup for account activation/verification)] -----------------------------------------------------

exports.signup = async (req, res) => {
  const token = req.body.token; // User's info is in `token` {token: {name, email, password}}

  if (!token) {
    return res.status(400).json({
      error: "Invalid request. Token missing.",
    });
  }

  try {
    // Verify token (Now using `await` with `jwt.verify` wrapped inside a Promise)
    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION_SECRET, { algorithms: ["HS256"] }, (err, decoded) => {
        if (err) reject(err);
        else resolve(decoded);
      });
    });

    // Extract user details from the decoded token
    const { name, email, password } = decoded;

    // Generate a unique username
    const username = shortId.generate();
    const profile = `${process.env.CLIENT_URL}/profile/${username}`;

    // Create new user
    const user = new User({ name, email, password, profile, username });

    // Save new user in the database
    await user.save();

    return res.json({
      message: "Signup success! Please signin :)",
    });

  } catch (err) {
    return res.status(400).json({
      error: "Expired or invalid token. Please signup again.",
    });
  }
};





/*

// Signup function  [ OLD METHOD (Direct Signup Account, without preSignup)]  -------------------------------------------------

exports.signup = async (req, res) => {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email: req.body.email }).exec();

    if (existingUser) {
      return res.status(400).json({ error: "Email is taken!" });
    }

    // Extract user details from request body
    const { name, email, password } = req.body;

    // Generate unique username and profile URL
    const username = shortId.generate();
    const profile = `${process.env.CLIENT_URL}/profile/${username}`;

    // Create new user instance
    const newUser = new User({ name, email, password, profile, username });

    // Save new user to database
    await newUser.save();

    return res.json({ message: "Signup success! Please Signin" });

  } catch (err) {
    return res.status(400).json({ error: err.message || "Something went wrong. Please try again." });
  }
};


*/

// -------------------------------------------------------------



// Signin Function  ---------------------------------------------

exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).exec();

    if (!user) {
      return res.status(400).json({ error: "User with that email does not exist. Please signup." });
    }

    // Authenticate user (check password)
    if (!user.authenticate(password)) {
      return res.status(400).json({ error: "Email and Password do not match." });
    }

    //////////////////////////////////////////////////////////////////
    //         GENERATE TOKEN
    //////////////////////////////////////////////////////////////////

    // Generate a JWT Token
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    // Set token in HTTP-only cookie
    res.cookie("token", token, { httpOnly: true, expiresIn: "1d" });

    // Destructure user details for response
    const { _id, username, name, role } = user;

    return res.json({ token, user: { _id, username, name, email, role } });

  } catch (err) {
    return res.status(500).json({ error: err.message || "Something went wrong. Please try again." });
  }
};


// Signout   ----------------------------------------------------------------

exports.signout = async (req, res) => {
  try {
    res.clearCookie("token", { httpOnly: true });

    return res.json({
      success: true,
      message: "Signout successful",
    });
  } catch (err) {
    return res.status(500).json({
      error: "Something went wrong while signing out. Please try again.",
    });
  }
};


// Forgot Password ---------------------------------------------------------

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body; // User email requesting password reset

    // Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        error: "User with that email does not exist. Please check",
      });
    }

    // Generate reset token (expires in 10 minutes)
    const token = jwt.sign(
      { _id: user._id },
      process.env.JWT_RESET_PASSWORD,
      { expiresIn: "10m" }
    );

    // Creating Email Data
    const emailData = {
      from: process.env.EMAIL_FROM, // noreply@YourDomain.com
      to: email,
      subject: `Password reset link`,
      html: `
            <h4>You have requested a password reset. Please follow the instructions below.</h4>
            <h3>(Link valid only for 10 minutes)</h3>
            <hr/>
            <p>Please use the following link to reset your password:</p>
            <p><a href="${process.env.CLIENT_URL}/auth/password/reset/${token}">${process.env.CLIENT_URL}/auth/password/reset/${token}</a></p>
            <hr/>
            <p>This email may contain sensitive information.</p>
            <p>https://grepguru.com 🐝</p>
          `,
    };

    // Save the token in the user's resetPasswordLink field
    user.resetPasswordLink = token;
    await user.save(); // Save changes to the user document

    // Send the reset email
    await sendEmailWithNodemailer(req, res, emailData);

    return res.json({
      success: true,
      message: `Password reset email has been sent to ${email}. Please follow the instructions.`,
    });

  } catch (err) {
    return res.status(500).json({
      error: "Something went wrong. Please try again.",
    });
  }
};




//  Reset Password -------------------------------------------------------------------------------------------

exports.resetPassword = async (req, res) => {
  try {
    const { resetPasswordLink, newPassword } = req.body;

    if (!resetPasswordLink) {
      return res.status(400).json({ error: "Invalid request. Missing reset link." });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(resetPasswordLink, process.env.JWT_RESET_PASSWORD, { algorithms: ["HS256"] });
    } catch (err) {
      return res.status(401).json({ error: "Expired or invalid reset link. Try again." });
    }

    // Find user with the reset password link
    const user = await User.findOne({ resetPasswordLink });

    if (!user) {
      return res.status(401).json({ error: "Password already updated or invalid link." });
    }

    // Update user password and remove reset link
    user.password = newPassword;
    user.resetPasswordLink = "";

    await user.save();

    return res.json({
      message: "Great! Now you can login with your new password.",
    });

  } catch (err) {
    return res.status(500).json({
      error: "Something went wrong. Please try again later.",
    });
  }
};


// -----------------------------------------------------------------------

// GOOGLE Login functionality

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleLogin = async (req, res) => {
  try {
    const idToken = req.body.tokenId;

    if (!idToken) {
      return res.status(400).json({ error: "No ID token received. Bad Request" });
    }

    // Verify Google ID token
    const response = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email_verified, name, email, jti } = response.payload;

    if (!email_verified) {
      return res.status(400).json({ error: "Google login failed! Try again." });
    }
    
    // find the user if this email (after User's google email is verified from google servers) is present in the database or not.
    // If User found, generate a token (as authentication) and give it back to client side as response.
    // If User does not exist (New User), then Generate a new User (create a new account basically) and save it in database and then generate a token and send it to client side as response.

    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      // If user exists, generate JWT token
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
      res.cookie("token", token, { expiresIn: "1d" });

      const { _id, username, role } = user;
      return res.json({ token, user: { _id, email, name, role, username } });
    }

    // If user does NOT exist, create new user
    const username = shortId.generate();
    const profile = `${process.env.CLIENT_URL}/profile/${username}`;
    const password = jti + process.env.JWT_SECRET; // Generate a dummy password

    user = new User({ name, email, profile, username, password });

    // Save new user in DB
    await user.save();

    // Generate token for new user
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.cookie("token", token, { expiresIn: "1d" });

    return res.json({ token, user: { _id: user._id, email, name, role: user.role, username } });

  } catch (err) {
    console.error("Error in Google Login:", err);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
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

    🔹 Google Login Flow (Super Short & Clear)
Google's OAuth-based login uses ID tokens to verify users. Here’s the step-by-step flow:

1️⃣ User clicks "Sign in with Google" on your frontend.
2️⃣ Google OAuth prompts the user to choose their Google account.
3️⃣ Google generates an idToken and sends it to your frontend (browser).
4️⃣ Frontend sends idToken to your backend via an API request (/google-login).
5️⃣ Backend verifies idToken using Google's verifyIdToken() method.
6️⃣ If idToken is valid, backend:

✅ Checks if the user exists in DB
✅ Creates new user if not found
✅ Generates JWT token & sends it back
7️⃣ Frontend receives JWT token, stores it, and considers the user "logged in."
*/


// =======================================================
//                  MIDDLEWARES
// =======================================================

// Middleware (for protected routes - routes only for Logged in users only)

// Check the incoming token's secret & compare it with ours .env secret & if token hasn't expired, this middleware function will return TRUE. (so it basically checks the token expiry) & will make 'userProperty'- 'user' available in Request object

// OLD CODE (prevous version) TODO: REMOVE Deprecated
// exports.requireSignin = expressJwt({
//   secret: process.env.JWT_SECRET,
//   algorithms: ["HS256"],
//   // userProperty: "auth",
//   userProperty: "user",   // making 'user' property available in the request request of this middleware (as long as toke is valid)
// });

// NEW
exports.requireSignin = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Get token from Authorization header

  if (!token) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] }, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }
    req.user = decoded; // Manually setting the user req.user
    next();
  });
};



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



// ==============================================================





// NOTE: Only 'Middlewares' have (req,res,next) - not methods/functions