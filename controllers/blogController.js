// exports.time = (req, res) => {
//   res.json({ time: Date().toString() });
// }; // Used for testing purpose

import { stripHtml } from 'string-strip-html';
import formidable from 'formidable';  // To handle parsing form data, especially file uploads.
import { readFileSync } from 'fs';
import _ from 'lodash';
import slugify from 'slugify';

import Category from '../models/category.js';
import Tag from '../models/tag.js';
import User from '../models/user.js';
import Blog from '../models/blog.js';

// Error Handler
import { errorHandler } from '../helpers/dbErrorHandler.js'; // To send any DB mongoose errors to our client
import { smartTrim, htmlToTextTrimWithEllipses } from '../helpers/blogHelper.js';


// ----------------------------------------------
// ---------Catching uncaught exceptions---------
//If an uncaught exception gets thrown during the execution of your program, your program will crash.
//To solve this, you listen for the 'uncaughtException' event on the 'process' object:
process.on('uncaughtException', err => {
  console.error('There was an uncaught error========>>>>>  ', err);
  process.exit(1); //mandatory (as per the Node.js docs)
});
// Refer: https://nodejs.dev/learn/error-handling-in-nodejs
//------------------------------------------



// -----------------------------------------------------------------
// Create New Blog 

export async function create(req, res) {
  try {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;

    // Parse the form data
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(400).json({ error: 'Image could not be uploaded' });
      }

      // Extracting required fields
      const { title, body, categories, tags } = fields;

      // Manual validation checks
      if (!title || !title.length) return res.status(400).json({ error: 'Title is required' });
      if (!body || body.length < 200) return res.status(400).json({ error: 'Content is too short for a blog.' });
      if (!categories || categories.length === 0) return res.status(400).json({ error: 'At least one category is required.' });
      if (!tags || tags.length === 0) return res.status(400).json({ error: 'At least one tag is required.' });

      // Creating a new blog instance
      let blog = new Blog({
        title,
        body,
        // excerpt = smartTrim(body, 320, ' ', ' ...'), // Author's trim method
        excerpt: htmlToTextTrimWithEllipses(body, 320), // Generating an excerpt - My own trim method (ignores href)
        // slug: slugify(title, { lower: true, strict: true }),

        slug: slugify(title)
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove non-word characters except spaces and hyphens
        .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, or multiple hyphens with a single hyphen
        .replace(/^-+|-+$/g, ''), // Remove leading or trailing hyphens
        // .replace(/['"]+/g, ''),

        mtitle: `${title} | ${process.env.APP_NAME}`, // Meta title
        mdesc: stripHtml(body.substring(0, 160)).result, // Meta description - we are extracting metadescription from blog's first 160 characters
        postedBy: req.user._id, // Logged-in user ID
      });

      // Convert category and tag strings to arrays
      let arrayOfCategories = categories.split(',');
      let arrayOfTags = tags.split(',');

      // Handling image uploads
      if (files.photo) {
        if (files.photo.size > 1048576) {
          return res.status(400).json({ error: 'Image should be less than 1 MB in size.' });
        }
        blog.photo.data = readFileSync(files.photo.path);
        blog.photo.contentType = files.photo.type;
      }

      // Save blog to the database
      const savedBlog = await blog.save();

      // Push categories and tags after saving
      await Blog.findByIdAndUpdate(savedBlog._id, { $push: { categories: arrayOfCategories } }, { new: true });
      const updatedBlog = await Blog.findByIdAndUpdate(savedBlog._id, { $push: { tags: arrayOfTags } }, { new: true });

      res.json(updatedBlog);
    });
  } catch (err) {
    console.error('CREATE BLOG ERROR:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}


// NOTE: We had used type: 'ObjectId' in Models for category, tags, and users for a reason, to so that we can access those collections from another Models -like here from blog Model, using 'populate()'

/*
// Populate()
 Mongoose has a more powerful alternative (to MonogoDB join like lookup) called populate(), which lets you reference documents in other collections.

 ==> Population is the process of automatically replacing the specified paths in the document with document(s) from other collection(s).
-> https://mongoosejs.com/docs/api.html#query_Query-populate

 //  The 'ref' option is what tells Mongoose which model to use during population.
*/

//  list, listAllBlogsCategoriesTags, read, remove, update
//--------------------------------------------------------------------------------------------------------------------------------
export async function list(req, res) {
  // get all the blogs

  // populate(<path> , <select>, <model>,...)
  // path : path «Object|String» either the path to populate or an object specifying all parameters
  // [select] «Object|String» Field (columns) selection for the population query

  // Below, first we are 'populating' the ObjectID properties with the fields from their respective 'ref' referenced models and then we are running 'select' query on the overall query result that we are getting after populating everything.
  try {
    const blogs = await Blog.find({})
      .populate('categories', '_id name slug')
      .populate('tags', '_id name slug')
      .populate('postedBy', '_id name username')
      .sort({ updatedAt: -1 }) // Sorting the Blogs list (latest comes first)
      .select('_id title slug excerpt categories tags postedBy createdAt updatedAt'); // Note that we aren't taking 'photos' field here because that'd be very big (binary coded here in DB) and that'll make it very slow

    res.json(blogs);
  } catch (err) {
    res.json({ error: errorHandler(err) });
  }
}

//--------------------------------------------------------------------------------------------------------------------------------

// ---------------------------------------------------------------

// List / send All the Blogs created by this specific user based on username

export async function listBlogsByUser(req, res) {
  try {
    const user = await User.findOne({ username: req.params.username });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const blogs = await Blog.find({ postedBy: user._id })
      .populate('categories', '_id name slug')
      .populate('tags', '_id name slug')
      .populate('postedBy', '_id name username')
      .sort({ updatedAt: -1 }) // Sorting the Blogs list (latest comes first)
      .select('_id title slug postedBy createdAt updatedAt');

    res.json(blogs);
  } catch (err) {
    res.status(400).json({ error: errorHandler(err) });
  }
}


//--------------------------------------------------------------------------------------------------------------------------------

// List all Blogs (with Category & Tags) on the /blogs page

export async function listAllBlogsCategoriesTags(req, res) {
  try {
    // Set pagination values (default: limit = 10, skip = 0)
    const limit = req.body.limit ? parseInt(req.body.limit) : 10;
    const skip = req.body.skip ? parseInt(req.body.skip) : 0;

    // Fetch blogs with necessary relationships
    const blogs = await Blog.find({})
      .populate('categories', '_id name slug')
      .populate('tags', '_id name slug')
      .populate('postedBy', '_id name username profile')
      .sort({ createdAt: -1 }) // Fetch latest blogs first
      .skip(skip)
      .limit(limit)
      .select('_id title slug excerpt categories tags postedBy createdAt updatedAt');

    // Fetch all categories and tags
    const categories = await Category.find({});
    const tags = await Tag.find({});

    // Return blogs, categories, tags, and the count of blogs for pagination
    res.json({ blogs, categories, tags, size: blogs.length });

  } catch (err) {
    console.error("LIST BLOGS-CATEGORIES-TAGS ERROR:", err);
    return res.status(500).json({ error: errorHandler(err) });
  }
}


//--------------------------------------------------------------------------------------------------------------------------------

// Get Single blog from backend database - Read blog
export async function read(req, res) {
  // get a single blog (very Important from SEO perspective because whenever Search engines look for this Blog page, they will get only that content that you'll return here)

  try {
    const slug = req.params.slug.toLowerCase();

    const blog = await Blog.findOne({ slug })
    .populate('categories', '_id name slug')
    .populate('tags', '_id name slug')
    .populate('postedBy', '_id name username')
    .select('_id title body slug mtitle mdesc categories tags postedBy createdAt updatedAt');
    // .select("-photo")  // If you don't want to send 'photo' 

    if (!blog) {
      return res.status(404).json({ error: "No Blog exists with this slug. Please check" });
    }

    res.json(blog);
  } catch (err) {
    console.error("ERROR OCCURRED =====> ", err);
    res.status(400).json({ error: errorHandler(err) });
  }
}


//-------------------------------------------------------

// Delete a Blog
export async function remove(req, res) {
  try {
    const slug = req.params.slug.toLowerCase();

    // Find and delete the blog by slug
    const deletedBlog = await Blog.findOneAndRemove({ slug });

    if (!deletedBlog) {
      return res.status(404).json({ error: "No Blog exists. Please check" });
    }

    res.json({ message: "Blog deleted successfully" });
  } catch (err) {
    console.error("DELETE BLOG ERROR:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}




//-----------------------------------------------------
// Update Blog is similar to 'Create' function

export async function update(req, res) {
  try {
    const slug = req.params.slug.toLowerCase();

    // Find the blog by slug
    let oldBlog = await Blog.findOne({ slug });

    if (!oldBlog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    let form = new formidable.IncomingForm();
    form.keepExtensions = true;

    // Parse the form data
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(400).json({ error: 'Image could not upload' });
      }

      let slugBeforeMerge = oldBlog.slug; // Preserve slug to avoid SEO issues
      oldBlog = _.merge(oldBlog, fields); // Merge new fields with existing blog
      oldBlog.slug = slugBeforeMerge; // Ensure slug remains unchanged

      const { title, body, categories, tags } = fields;

      // If body is updated, update excerpt and meta description
      if (body) {
        oldBlog.excerpt = htmlToTextTrimWithEllipses(body, 320);
        oldBlog.mdesc = stripHtml(body.substring(0, 160)).result;
      }

      // If categories/tags are updated, convert them into an array
      if (categories) oldBlog.categories = categories.split(',');
      if (tags) oldBlog.tags = tags.split(',');

      // If title is updated, validate and update meta title
      if (title) {
        if (!title.trim().length) {
          return res.status(400).json({ error: "Title cannot be blank!" });
        }
        oldBlog.title = title;
        oldBlog.mtitle = `${title} | ${process.env.APP_NAME}`;
      }

      // Handle file uploads (Images)
      if (files.photo) {
        if (files.photo.size > 1048576) {
          return res.status(400).json({ error: 'Image should be less than 1 MB in size.' });
        }
        oldBlog.photo.data = readFileSync(files.photo.path);
        oldBlog.photo.contentType = files.photo.type;
      }

      // Save the updated blog
      const result = await oldBlog.save();
      res.json(result);
    });

  } catch (err) {
    console.error('UPDATE BLOG ERROR:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}


// -----------------------------------------------------

// Photos middleware to get the Photos

export async function photo(req, res) {
  try {
    const slug = req.params.slug.toLowerCase();

    // Find the blog by slug and select only the photo field
    const photoBlog = await Blog.findOne({ slug }).select('photo');

    if (!photoBlog) {
      return res.status(404).json({ error: "Wrong Slug / Blog doesn't exist" });
    }

    // If the blog exists but has no photo, return a placeholder response
    if (!photoBlog.photo || Object.keys(photoBlog.photo).length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Set content type and send the image data
    res.set('Content-Type', photoBlog.photo.contentType);
    return res.send(photoBlog.photo.data);
  } catch (err) {
    console.error("PHOTO ENDPOINT ERROR =>", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}



// export async function photo(req, res) {
//   try {
//     const slug = req.params.slug.toLowerCase();
//     console.log("SLUG TO GET PHOTO =>", slug);

//     // Fetch blog by slug and select only the photo field
//     const blog = await Blog.findOne({ slug }).select("photo");

//     if (!blog || !blog.photo || !blog.photo.data) {
//       return res.status(404).json({ error: "Photo not found" });
//     }

//     // Set content type and send image data
//     res.set("Content-Type", blog.photo.contentType);
//     return res.send(blog.photo.data);

//   } catch (err) {
//     console.error("PHOTO ENDPOINT ERROR =>", err);
//     return res.status(500).json({ error: "Internal Server Error" });
//   }
// }


// -----------------------------------------------------
// get Related Blogs
export async function listRelatedBlogs(req, res) {
  try {
    const limit = req.body.limit ? parseInt(req.body.limit) : 3; // Default limit is 3

    const { _id, categories } = req.body.blog; // Extract blog ID and categories to find related blogs

    // Find related blogs excluding the current one and matching categories
    const blogs = await Blog.find({ _id: { $ne: _id }, categories: { $in: categories } })
      .limit(limit)
      .populate('postedBy', '_id name username profile')
      .select('title slug excerpt postedBy createdAt updatedAt');

    res.json(blogs);
  } catch (err) {
    res.status(400).json({ error: 'Blogs not found' });
  }
}


// ----------------------------------------------------

// Blog Search API middleware controller (Search Blogs)
export async function listSearch(req, res) {
  try {
    // console.log("Query received at the backend : ", req.query); // Look at the query string  passed from frontend to backend (here)
    
    // grabbing the 'search' property/parameter from the request query object
    // NOTE: req.query is converting the search URL like (?search=World%20Bekar%20Hai&pagination=10) into an object like ({search: "World Bekar Hai", pagination=10}) and we are grabbing the specific parameter out of that using { field }

    // Extracting the search term from the request query
    const { search } = req.query;

    // '$or' OR function in mongoose helps us by looking/searching either in title OR in Body (passing all fields to search through in the array). 
    // "$regex" REGEX function in mongoose has $options , 'i' means IGNORE CASE SENSTIVE 

    // If search term is missing or empty, return an empty array
    if (!search || search.trim().length === 0) {
      return res.json([]); // Return an empty array instead of an error
    }

    // Perform case-insensitive search in the title OR body
    const blogs = await Blog.find({
      $or: [
        { title: { $regex: search, $options: "i" } },
        { body: { $regex: search, $options: "i" } }
      ]
    }).select("-photo -body"); // Exclude heavy fields (Deselecting Photos & Body from the blog object , because they are heavy!)

    return res.json(blogs); // Return found blogs

  } catch (err) {
    console.error("SEARCH ERROR:", err.message);
    return res.status(500).json({ error: "Server Error. Please try again later." });
  }
}


// -------------------------------------------------------------------------------------------------------------------


// ############## NOTES ###################
/*
//----------------------------------------------------
==> How do we now if there's No Record/document present inside the mongodb , what error does mongoose return if not able to find any record for a query?

>>>> It depends on the query.
   * If it is a find(), then results == [].         (using find in your query, you are trying to find ALL matching RECORDS and expecting an array of users from the mongodb. If none found, it'll return empty array, else if found, araay of records)
   * If it is a findOne(), then results == null.
   * No errors if everything else is ok.

From mongoose docs, either:
    err = null, results = []                  // In case of no record found (for find)
    err = null, results = null                // In case of no record found (for findOne)
    err = error document, results = null.     // In Case of Error

Example for .find()
models.<your collection name>.find({ _id: `your input` }).then(data => {
    if (data.length == 0) return // throw your error
});


I suggest using findOne over find, as it will return a single document if it exists, otherwise null.
//----------------------------------------------------



*/