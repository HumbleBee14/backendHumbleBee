import _ from 'lodash';
import { IncomingForm } from 'formidable';
import { readFileSync } from 'fs';
import slugify from 'slugify';

import Blog from '../models/blog.js';
import User from '../models/user.js';
import { errorHandler } from '../helpers/dbErrorHandler.js';





// ---------------------------------------------------------

// Contoller method to get User Public info - User Profile (to get selected user info only from req.profile (We have removed hashed passwords from the request))
export function read(req, res) {
  req.profile.hashed_password = undefined; // removing password from request (by making it undefined) for sending that in the response
  return res.json(req.profile);
}


// ----------------------------------------------------------------

// for Public Profile (Response: User Public Profile + User's Blogs)
export async function publicProfile(req, res) {
  try {
    const username = req.params.username; // Extract username from URL parameters

    console.log(`Fetching public profile for user: ${username}`);

    // Find the user by username
    const user = await User.findOne({ username });

    if (!user) {
      console.log(`User '${username}' not found.`);
      return res.status(400).json({ error: 'User not found!' });
    }

    // Store user ID for querying their blogs
    const userId = user._id;

    // ---------------- REMOVING SENSITIVE FIELDS ----------------
    user.photo = undefined; // Exclude profile photo to keep response lightweight
    user.hashed_password = undefined; // Exclude hashed password for security
    user.salt = undefined; // Exclude password salt to prevent security risks
    user.resetPasswordLink = undefined; // Exclude password reset link for security
    user.email = undefined; // Exclude email to protect user privacy
    // ----------------------------------------------------------

    console.log(`User '${username}' found. Fetching their blogs...`);

    // Fetch blogs posted by this user
    const blogs = await Blog.find({ postedBy: userId })
      .populate('categories', '_id name slug') // Populate category details
      .populate('tags', '_id name slug') // Populate tag details
      .populate('postedBy', '_id name') // Populate author details
      .limit(10) // Limit results to the latest 10 blogs
      .select('_id title slug excerpt categories tags postedBy createdAt updatedAt');

    console.log(`Fetched ${blogs.length} blogs for user '${username}'.`);

    // Return user's public profile along with their blogs
    res.json({ user, blogs });

  } catch (err) {
    console.error(`PUBLIC PROFILE ERROR:`, err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}



// --------------------------------------------------------
//  User Profile Update middleware (to handle Profile details Update requests from users)

export async function update(req, res) {
  try {
    let form = new IncomingForm();
    form.keepExtensions = true;

    // Parse form data asynchronously
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(400).json({ error: "Photo could not be uploaded" });
      }

      // Retrieve the user profile from the request (provided by authMiddleware)
      let user = req.profile;

      // Preserve existing role and email
      const existingRole = user.role;
      const existingEmail = user.email;

      // Validate username length
      if (fields.username && fields.username.length > 12) {
        return res.status(400).json({ error: "Username should be less than 12 characters long" });
      }

      // Ensure username is a string and slugify it
      if (fields.username) {
        if (Array.isArray(fields.username)) {
          fields.username = fields.username[0]; // Convert array to string if needed
        }
        fields.username = slugify(fields.username).toLowerCase();
      }

      // Validate password length
      if (fields.password && fields.password.length < 6) {
        return res.status(400).json({ error: "Password should be at least 6 characters long" });
      }

      // Ensure profile is a string
      if (fields.profile) {
        if (Array.isArray(fields.profile)) {
          fields.profile = fields.profile[0]; // Convert array to string if needed
        }
      }

      // Merge new fields into the user object
      user = _.extend(user, fields);


      // Preserve existing role and email
      user.role = existingRole;
      user.email = existingEmail;

      // Handle profile picture upload
      if (files.photo) {
        if (files.photo.size > 1048576) {
          return res.status(400).json({ error: "Image should be less than 1 MB" });
        }

        user.photo.data = readFileSync(files.photo.path);
        user.photo.contentType = files.photo.type;
      }

      // Save updated user to the database
      const updatedUser = await user.save();

      // Remove sensitive fields before sending response
      updatedUser.hashed_password = undefined;
      updatedUser.salt = undefined;
      updatedUser.photo = undefined;

      res.json(updatedUser);
    });

  } catch (err) {
    console.error("PROFILE UPDATE ERROR:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}



// ---------------------------------------------------------

// For USER Photo
export async function photo(req, res) {
  try {
    const username = req.params.username;

    // Find the user by username
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Check if the user has a photo
    if (user.photo && user.photo.data) {
      res.set('Content-Type', user.photo.contentType);
      return res.send(user.photo.data);
    }

    return res.status(404).json({ error: 'Photo not found' });

  } catch (err) {
    console.error("USER PHOTO ERROR:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
