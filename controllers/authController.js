import User from '../models/user.js';
import Blog from '../models/blog.js';


import shortId from "shortid";
import { errorHandler } from '../helpers/dbErrorHandler.js';
import _ from 'lodash';

// Note: Before we generate jwt token , we need to create a secret key (see .env file)
import jwt from "jsonwebtoken"; // Correct way for ESM
const { sign, verify } = jwt;

import { sendEmailWithNodemailer } from "../helpers/email.js"; // for sending GMAIL Email - Email helper function

// google login auth library
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


// ==========================================================


// Pre Signup Function    ------------------------------------

export async function preSignup(req, res) {
  try {
    const { name, email, password } = req.body;

    // Checking if user already exists with this email in the database
    const user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      return res.status(400).json({ error: "Email is taken!" });
    }

    // Generate a JWT Json Web Token and Send it to Client 
    const token = sign(
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
}

// Note: Once the pre-signup is done, then that 'signup' api will be called once the user clicks on the URL sent to his/her email, which will create the user account in database.


// -----------------------------------------------------------


// SignUp function   [NEW METHOD (using preSignup for account activation/verification)] -----------------------------------------------------

export async function signup(req, res) {
  const token = req.body.token; // User's info is in `token` {token: {name, email, password}}

  if (!token) {
    return res.status(400).json({
      error: "Invalid request. Token missing.",
    });
  }

  try {
    // Verify token (Now using `await` with `jwt.verify` wrapped inside a Promise)
    const decoded = await new Promise((resolve, reject) => {
      verify(token, process.env.JWT_ACCOUNT_ACTIVATION_SECRET, { algorithms: ["HS256"] }, (err, decoded) => {
        if (err) reject(err);
        else resolve(decoded);
      });
    });

    // Extract user details from the decoded token
    const { name, email, password } = decoded;

    // Generate a unique username
    const username = generate();
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
}





/*

// Signup function  [ OLD METHOD (Direct Signup Account, without preSignup)]  -------------------------------------------------


export async function signup(req, res) {
  try {
    // Extract user details from request body
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields (name, email, password) are required!" });
    }

    // Check if the email is already registered
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: "Email is already taken!" });
    }

    // Generate a unique username and profile URL
    const username = shortId.generate();
    const profile = `${process.env.CLIENT_URL}/profile/${username}`;

    // Create a new user instance
    const newUser = new User({ name, email, password, profile, username });

    // Save new user to the database
    await newUser.save();

    return res.json({ message: "Signup successful! Please sign in." });

  } catch (err) {
    console.error("SIGNUP ERROR:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}


*/

// -------------------------------------------------------------



// Signin Function  ---------------------------------------------

export async function signin(req, res) {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: "Both email and password are required!" });
    }

    // Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "User with that email does not exist. Please signup." });
    }

    // Authenticate user (check password)
    if (!user.authenticate(password)) {
      return res.status(400).json({ error: "Email and password do not match." });
    }

    //////////////////////////////////////////////////////////////////
    //         GENERATE TOKEN & SET COOKIE
    //////////////////////////////////////////////////////////////////

    // Generate a JWT Token
    const token = sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    // Set token in HTTP-only cookie for security
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Secure in production
      sameSite: "Strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day expiration in milliseconds
    });

    // Destructure user details for response
    const { _id, username, name, role } = user;

    return res.json({ token, user: { _id, username, name, email, role } });

  } catch (err) {
    console.error("SIGNIN ERROR:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}



// Signout   ----------------------------------------------------------------

export async function signout(req, res) {
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
}


// Forgot Password ---------------------------------------------------------

export async function forgotPassword(req, res) {
  try {
    const { email } = req.body; // Extract email from request body

    if (!email) {
      return res.status(400).json({ error: "Email is required!" });
    }

    // Check if user exists in the database
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        error: "User with that email does not exist. Please check",
      });
    }

    // Generate a password reset token (expires in 10 minutes)
    const token = sign({ _id: user._id }, process.env.JWT_RESET_PASSWORD, { expiresIn: "10m" });

    // Construct the password reset email data
    const emailData = {
      from: process.env.EMAIL_FROM, // noreply@YourDomain.com
      to: email,
      subject: "Password Reset Link",
      html: `
        <h4>Password Reset Request</h4>
        <p>You have requested to reset your password. Please use the link below within 10 minutes:</p>
        <p><a href="${process.env.CLIENT_URL}/auth/password/reset/${token}">${process.env.CLIENT_URL}/auth/password/reset/${token}</a></p>
        <hr/>
        <p>If you did not request this, please ignore this email.</p>
        <p>https://grepguru.com 🐝</p>
      `,
    };

    // Save the reset token in the user's resetPasswordLink field
    user.resetPasswordLink = token;
    await user.save(); // Update user document in the database

    // Send the reset email using Nodemailer
    await sendEmailWithNodemailer(req, res, emailData);

    return res.json({
      success: true,
      message: `A password reset link has been sent to ${email}. Please follow the instructions.`,
    });

  } catch (err) {
    console.error("FORGOT PASSWORD ERROR:", err);
    return res.status(500).json({ error: "Internal Server Error. Please try again later." });
  }
}


//  Reset Password -------------------------------------------------------------------------------------------

export async function resetPassword(req, res) {
  try {
    const { resetPasswordLink, newPassword } = req.body;

    // Validate required fields
    if (!resetPasswordLink || !newPassword) {
      return res.status(400).json({ error: "Reset link and new password are required." });
    }

    // Verify the token
    let decoded;
    try {
      decoded = verify(resetPasswordLink, process.env.JWT_RESET_PASSWORD);
    } catch (err) {
      return res.status(401).json({ error: "Expired or invalid reset link. Please try again." });
    }

    // Find user associated with the reset password link
    const user = await User.findOne({ resetPasswordLink });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired reset link. Please request a new one." });
    }

    // Update user password and clear reset link
    user.password = newPassword;
    user.resetPasswordLink = "";

    await user.save();

    return res.json({ message: "Success! You can now log in with your new password." });

  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);
    return res.status(500).json({ error: "Internal Server Error. Please try again later." });
  }
}



// -----------------------------------------------------------------------

// GOOGLE Login functionality

export async function googleLogin(req, res) {
  try {
    const { tokenId } = req.body;

    if (!tokenId) {
      return res.status(400).json({ error: "No ID token received. Bad Request" });
    }

    // Verify Google ID token
    const response = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email_verified, name, email, jti } = response.getPayload();

    if (!email_verified) {
      return res.status(400).json({ error: "Google login failed! Try again." });
    }

    // Check if the user already exists in the database
    let user = await User.findOne({ email });

    if (user) {
      // If user exists, generate JWT token
      const token = sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });

      const { _id, username, role } = user;
      return res.json({ token, user: { _id, email, name, role, username } });
    }

    // If user does NOT exist, create a new user
    const username = shortId.generate();
    const profile = `${process.env.CLIENT_URL}/profile/${username}`;
    const password = jti + process.env.JWT_SECRET; // Generate a dummy password

    user = new User({ name, email, profile, username, password });

    // Save new user in DB
    await user.save();

    // Generate token for new user
    const token = sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    return res.json({ token, user: { _id: user._id, email, name, role: user.role, username } });

  } catch (err) {
    console.error("GOOGLE LOGIN ERROR:", err);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}



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
export function requireSignin(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1]; // Get token from Authorization header

  if (!token) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] }, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }
    req.user = decoded; // Manually setting the user req.user
    next();
  });
}



// Auth middleware  ---------------------------------------------------------------------
export async function authMiddleware(req, res, next) {
  try {
    const authUserId = req.user._id;

    // Find user by ID
    const user = await User.findById(authUserId);

    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    req.profile = user; // Attach user profile to request
    next(); // Proceed to the next middleware
  } catch (err) {
    console.error("AUTH MIDDLEWARE ERROR:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}


// Admin Middleware   -------------------------------------------------------------------
export async function adminMiddleware(req, res, next) {
  try {
    const adminUserId = req.user._id;

    // Find the user by ID
    const user = await User.findById(adminUserId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if the user has admin privileges
    if (user.role !== 1) {
      return res.status(403).json({ error: 'Admin resource. Access denied' });
    }

    req.profile = user; // Attach user profile to request for further access
    next(); // Proceed to the next middleware

  } catch (err) {
    console.error("ADMIN MIDDLEWARE ERROR:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}


// ----------------------------------------------------------------------------------------------

// Check If Currently Logged in User is authorized to update / Delete a Blog

// Middleware to determine if the Specifc Blog can be Updated or Deleted by this User (or if this User has permision to delete / update a blog)

export async function canUpdateDeleteBlog(req, res, next) {
  try {
    const slug = req.params.slug.toLowerCase();

    // Find the blog by slug
    const blog = await Blog.findOne({ slug });

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    // Check if the logged-in user is the owner of the blog
    const authorizedUser = blog.postedBy._id.toString() === req.profile._id.toString();

    if (!authorizedUser) {
      return res.status(403).json({ error: "You are not authorized to update or delete this blog" });
    }

    // User is authorized, proceed to the next middleware
    next();
  } catch (err) {
    console.error("BLOG AUTHORIZATION ERROR:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}




// ==============================================================





// NOTE: Only 'Middlewares' have (req,res,next) - not methods/functions