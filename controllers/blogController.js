// exports.time = (req, res) => {
//   res.json({ time: Date().toString() });
// }; // Used for testing purpose

import { stripHtml } from 'string-strip-html';
import { IncomingForm } from 'formidable';  // To handle parsing form data, especially file uploads.
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
export function create(req, res) {

  // Step 1: get the data from FORM
  let form = new IncomingForm(); // This was to get all the FORM data
  // console.log(form);
  form.keepExtensions = true; // keep original file extensions
  // Parse the Form Data so that we get all data as valid js object
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: 'Image could not upload'
      });
    }

    //----------------------------------------------

    // if there's no error, then grabbing the Blog details through "fields" 
    const { title, body, categories, tags } = fields;

    //===============================================
    // Manual Validators for Form data

    if (!title || !title.length) {
      return res.status(400).json({
        error: 'title is required'
      });
    };

    if (!body || body.length < 200) {
      return res.status(400).json({
        error: 'Content is too short for a Blog.'
      });
    };

    if (!categories || categories.length === 0) {
      return res.status(400).json({
        error: 'At least one Category is required.'
      });
    };

    if (!tags || tags.length === 0) {
      return res.status(400).json({
        error: 'At least one Tag is required.'
      });
    };

    //=======================================

    let blog = new Blog(); // Instantiating the new Blog Model
    //-----------------------------
    // blog.title = fields.title;
    blog.title = title;
    blog.body = body;
    // blog.excerpt = smartTrim(body, 320, ' ', ' ...'); // Author's trim method
    blog.excerpt = htmlToTextTrimWithEllipses(body, 320); // My own trim method (ignores href)

    blog.slug = slugify(title)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    // .replace(/['"]+/g, '');

    blog.mtitle = `${title} | ${process.env.APP_NAME}`; // blog meta-title = > title | APP NAME e.g. HOW TO FILL ITR | SEO BLOG

    blog.mdesc = stripHtml(body.substring(0, 160)).result;  // Meta-Description - we are extracting metadescription from blog's first 160 characters

    blog.postedBy = req.user._id;  // Currently logged in user. NOTE: we are getting req.user bcoz we have applied middle - requireSignIn - so we'll have 'user' available in user object.
    /*
    >> requireSignin middleware adds the user to the req object 
    Its done by express-jwt.
    The JWT authentication middleware authenticates callers using a JWT. If the token is valid, req.user will be set with the JSON object decoded to be used by later middleware for authorization and access control.
    */

    //-----------------------------

    // categories and tags
    let arrayOfCategories = categories && categories.split(',');
    let arrayOfTags = tags && tags.split(',');

    //-----------------------------
    // Handling Files (like Images/docs)
    if (files.photo) {
      // Validating 1 MB file restriction
      if (files.photo.size > 1048576) {
        return res.status(400).json({
          error: 'Image should be less than 1 MB in size.'
        });
      };
      // If image size is les than 1 MB, then we can create a blog now.
      // Check blog's photo model, it has "data" & "contentType" property
      blog.photo.data = readFileSync(files.photo.path);
      blog.photo.contentType = files.photo.type;

    };



    // Save blog in DB Database 
    blog.save((err, result) => {
      if (err) {
        console.log('BLOG SAVE ERROR =====>>>>>>>', err);
        return res.status(400).json({
          error: errorHandler(err)
        });
      }

      // res.json(result);
      // on sucessful submission (save blog in database), returning response


      // Pushing Categories in the Blog now
      Blog.findByIdAndUpdate(result._id, { $push: { categories: arrayOfCategories } }, { new: true }).exec((err, result) => {
        if (err) {
          return res.status(400).json({
            error: errorHandler(err)
          });
        }

        else {

          // Pushing TAGS into the Blog now
          Blog.findByIdAndUpdate(result._id, { $push: { tags: arrayOfTags } }, { new: true }).exec((err, result) => {
            if (err) {
              return res.status(400).json({
                error: errorHandler(err)
              });
            } else {

              res.json(result);

            }
          });
        }
      });


    });
  });

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
export function list(req, res) {
  // get all the blogs

  // populate(<path> , <select>, <model>,...)
  // path : path «Object|String» either the path to populate or an object specifying all parameters
  // [select] «Object|String» Field (columns) selection for the population query

  // Below, first we are 'populating' the ObjectID properties with the fields from their respective 'ref' referenced models and then we are running 'select' query on the overall query result that we are getting after populating everything.
  Blog.find({})
    .populate('categories', '_id name slug')
    .populate('tags', '_id name slug')
    .populate('postedBy', '_id name username')
    .sort({ updatedAt: -1 }) // Sorting the Blogs list (latest comes first)
    .select('_id title slug excerpt categories tags postedBy createdAt updatedAt') // Note that we aren't taking 'photos' field here because that'd be very big (binary coded here in DB) and that'll make it very slow
    .exec((err, data) => {
      if (err) {
        return res.json({
          error: errorHandler(err)
        });
      }
      res.json(data);
    });

}

//--------------------------------------------------------------------------------------------------------------------------------

// ---------------------------------------------------------------

// List / send All the Blogs created by this specific user based on username

export function listBlogsByUser(req, res) {
  User.findOne({ username: req.params.username }) // Finding the User with this username first
    .exec((err, user) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err)
        });
      }
      // We found the user
      let userId = user._id; // grabbing the User ID of the User to find the blogs by his user ID (in postedBy)

      // .select('_id title slug excerpt categories tags postedBy createdAt updatedAt');

      Blog.find({ postedBy: userId })
        .populate('categories', '_id name slug')
        .populate('tags', '_id name slug')
        .populate('postedBy', '_id name username')
        .sort({ updatedAt: -1 }) // Sorting the Blogs list (latest comes first)
        .select('_id title slug postedBy createdAt updatedAt')
        .exec((err, data) => {
          if (err) {
            return res.status(400).json({
              error: errorHandler(err)
            });
          }

          res.json(data); // returning all the Blogs of this User details based on username 
        });
    });
}


//--------------------------------------------------------------------------------------------------------------------------------

// List all Blogs (with Category & Tags) on the /blogs page

export function listAllBlogsCategoriesTags(req, res) {
  // get and Send all the blogs along with all the Categories & tags also (useful for SEO optimization)

  // Kind of PAGINATION

  // limit = how many number of blog posts we want to send in each request (we will get this from frontend)
  // we have set Default value = 10
  let limit = req.body.limit ? parseInt(req.body.limit) : 10;

  // skip blogs
  let skip = req.body.skip ? parseInt(req.body.skip) : 0;

  let blogs;
  let categories;
  let tags;


  Blog.find({})
    .populate('categories', '_id name slug')
    .populate('tags', '_id name slug')
    .populate('postedBy', '_id name username profile')
    .sort({ createdAt: -1 }) // Sorting the Blogs list (latest comes first)
    .skip(skip)
    .limit(limit)
    .select('_id title slug excerpt categories tags postedBy createdAt updatedAt')
    .exec((err, data) => {
      if (err) {
        return res.json({
          error: errorHandler(err)
        });
      }

      blogs = data; // blogs

      // -----------------------------------------------
      // get all categories
      Category.find({}).exec((err, c) => {
        if (err) {
          return res.json({
            error: errorHandler(err)
          });
        }
        categories = c; // categories

        //-----------------------------------------------
        //get all tags
        Tag.find({}).exec((err, t) => {
          if (err) {
            return res.json({
              error: errorHandler(err)
            });
          }
          tags = t; // tags

          //-----------------------------------------------
          //return all blogs, categories and Tags
          res.json({ blogs, categories, tags, size: blogs.length }); // We will use current size of blogs returned to frontend, for LOAD MORE button on frontend

        });
      });
    });

}

//--------------------------------------------------------------------------------------------------------------------------------

// Get Single blog from backend database - Read blog
export function read(req, res) {
  // get a single blog (very Important from SEO perspective because whenever Search engines look for this Blog page, they will get only that content that you'll return here)
  const slug = req.params.slug.toLowerCase();

  Blog.findOne({ slug })
    // .select("-photo")  // If you don't want to send 'photo' 
    .populate('categories', '_id name slug')
    .populate('tags', '_id name slug')
    .populate('postedBy', '_id name username')
    .select('_id title body slug mtitle mdesc categories tags postedBy createdAt updatedAt') // Note that we have returned (selected) body, meta-title and meta-description here => importatnt for SEO - search engine crawlers
    .exec((err, data) => {
      // console.log("err object--> ", err);
      // console.log("data object-->", data);

      if (err) {
        console.log("ERROR OCCURED =====>  ", err);
        return res.json({
          error: errorHandler(err)
        });
      }

      else if (data === null) {
        return res.status(404).json({
          error: "No Blog exists with this slug. Please Check"
        });
      }

      res.json(data);

    });
}

//-------------------------------------------------------

// Delete a Blog
export function remove(req, res) {
  // remove a single blog
  const slug = req.params.slug.toLowerCase();

  Blog.findOneAndRemove({ slug }).exec((err, data) => {
    if (err) {
      return res.json({
        error: errorHandler(err)
      });
    }

    else if (data === null) {
      return res.status(404).json({
        error: "No Blog exists. Please Check"
      });
    }

    res.json({
      message: 'Blog deleted successfully'
    });
  });

}



//-----------------------------------------------------
// Update Blog is similar to 'Create' function
export function update(req, res) {
  //  Update blog
  const slug = req.params.slug.toLowerCase();

  Blog.findOne({ slug }).exec((err, oldBlog) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err)
      });
    }

    let form = new IncomingForm(); // form data variable
    form.keepExtensions = true; // keep original file extensions

    // Parse the Form Data so that we get all data as valid js object
    form.parse(req, (err, fields, files) => {
      if (err) {
        return res.status(400).json({
          error: 'Image could not upload'
        });
      }

      //-------------------------------------

      //_____________ Note: Since while updating we might not update everything !! so we are using LODASH library which will provide 'MERGE' function to update only what is needed.
      // MERGE() --> The _.merge() method is used to merge two or more objects starting with the left-most to the right-most to create a parent mapping object. When two keys are the same, the generated object will have value for the rightmost key.

      /* Even if user updates title or anything, SLUG should never change ,
       WHy? because Once you publish blog, its URL gets indexes by search engines and if you change it,
        then search engines will not find it on the same url, that will result in Poor ranking - Bad for SEO.
        */
      let slugBeforeMerge = oldBlog.slug;

      // oldBlogs --> old Blog Data
      // fields  ---> updated new fields/data from client side
      //Note: (Right to Left Merge happens)
      oldBlog = _.merge(oldBlog, fields); // If anything changes, then only it'll be updated (New updated Column/fields will be Merged with oldBlogs columns), else it'll be merged without any change. 

      // console.log("After Merger", oldBlog);
      oldBlog.slug = slugBeforeMerge; // Taking Precaution to keep it Old, in case someone manually passses slug parameter (to prevent this update)


      // if there's no error, then grabbing the Blog details through "fields" 
      const { title, body, categories, tags } = fields;
      // console.log(title.length, typeof title, 'title hai ? ------======> ', title);
      //===============================================
      // Change Excerpt Only if Body has changed ! 

      // Checking if "body" is present in newly updated blog (if defined in fields or not [undefined])
      if (body) {
        // oldBlog.excerpt = smartTrim(body, 320, ' ', ' ...'); // Author's trim method
        oldBlog.excerpt = htmlToTextTrimWithEllipses(body, 320); // My own trim method (ignores href)

        oldBlog.mdesc = stripHtml(body.substring(0, 160)).result; // New updated meta-description based on new Body content
      };

      // Change categories Only if categories has changed ! 
      if (categories) {
        oldBlog.categories = categories.split(','); // split will generate a array of categories
      };

      // Change tags Only if tags (is present in fields) has changed ! 
      if (tags) {
        oldBlog.tags = tags.split(',');
      };

      if (title) {

        if (!title.length) {  // Note: If you want to put title Length constraint, you can put that here itself
          return res.status(400).json({
            error: "Title can not be blank !"
          });
        }
        else {
          oldBlog.title = title;
          oldBlog.mtitle = `${title} | ${process.env.APP_NAME}`; // blog new meta-title
        }
      };


      // console.log("Final Updated Blog =====>>", oldBlog);

      //===============================================
      // Handling Files (like Images/docs)
      if (files.photo) {
        // Validating 1 MB file restriction
        if (files.photo.size > 1048576) {
          return res.status(400).json({
            error: 'Image should be less than 1 MB in size.'
          });
        };
        // If image size is les than 1 MB, then we can create a blog now.
        // Check blog's photo model, it has "data" & "contentType" property
        oldBlog.photo.data = readFileSync(files.photo.path);
        oldBlog.photo.contentType = files.photo.type;

      };

      // Save New updated (oldBlog) in DB Database 
      oldBlog.save((err, result) => {
        if (err) {
          console.log('BLOG SAVE ERROR =====>>>>>>>', err);
          return res.status(400).json({
            error: errorHandler(err)
          });
        };

        // This is just to prevent sending the Photo (heavy response) in the response back
        // result.photo = undefined; 

        res.json(result); // response with updated Blog

      });
    });

  });

}

// -----------------------------------------------------

// Photos middleware to get the Photos
export function photo(req, res) {
  const slug = req.params.slug.toLowerCase();

  // db.blogs.findOne({slug: "blog-slug-here"}, {photo:1})
  try {
    Blog.findOne({ slug })  // where slug field ="blog-slug"
      .select('photo')  // select this column 'photo' where the above findOne record is matched
      // .lean() // It basically converts Mongoose documents into plain old JavaScript objects.
      .exec((err, photoBlog) => {

        // Debugging Error

        // console.log("err Object ---> " + err);
        // console.log("blog object ---> " + photoBlog);
        // console.log("blog object ID Check ---> " + photoBlog._doc._id); // MongooseObject._doc.<property>
        // Note: Mongoose mongodb returned response Object is of different kind from plane JS object. You have to convert it to plane js Object. Check for ways to handle that issue [using .toObject() and using .lean() in db query but these will not help in case of media object, in that use you can access the properties using object._doc.<property>]


        // if (err || !photoBlog) {
        if (err) {
          console.log("Error occured while fetching Photo from backend");
          return res.status(400).json({
            error: errorHandler(err)
          });
        }

        // If There's No Blog Found with that slug in the DB
        else if (!photoBlog) {
          // else if (photoBlog === null) {
          return res.status(404).json({
            error: "Wrong Slug / Blog doesn't exist"
          });
        }

        // If Blog(without Photo) is found but it does not have any featured image. (here we'll only have '_id' property with ID data, but 'photo' property will be EMPTY)
        // Send a PLACEHOLDER image if there's no default image present
        else if (photoBlog._doc.hasOwnProperty('_id') && Object.keys(photoBlog._doc.photo).length === 0) {
          /*
          // console.log((Object.getOwnPropertyNames(photoBlog)));
          // let result = photoBlog._doc.hasOwnProperty('_id');
          // console.log(result);

          // console.log(Object.keys(photoBlog._doc.photo).length === 0); // Check length (Empty Object) of object
          */

          // -------------------------------------
          // console.log(`WARNING: No Featured Image present in this Blog. Please upload a photo in blog with id: ${photoBlog._doc._id} `);
          // -------------------------------------

          // throw new Error('something bad happened');

          return res.status(404).send({ error: 'Image not found' });
        }


        // If Blog (with Photo) is found, sending the Photo
        else {
          // console.log("___ Inside else ___");

          res.set('Content-Type', photoBlog.photo.contentType); // type of Data Content-type we will be sending back in response

          return res.send(photoBlog.photo.data);
        }
      });

  }

  catch (errr) {
    console.log("PHOTO ENDPOINT ERR => ", errr);
    return res.send("No photo found");
  }
}

// exports.photo = async (req, res) => {
//   try {
//     const slug = req.params.slug.toLowerCase();
//     console.log("SLUG TO GET PHOTO => ", slug);

//     const blog = Blog.findOne({ slug }).select("photo").exec();
//     res.set('Content-Type', blog.photo.contentType);
//     return res.send(blog.photo.data);
//   } catch (err) {
//     console.log("PHOTO ENDPOINT ERR => ", err);
//     return res.send("No photo found");
//   }
// };



// -----------------------------------------------------
// get Related Blogs
export function listRelatedBlogs(req, res) {
  let limit = req.body.limit ? parseInt(req.body.limit) : 3; // setting default number of related blogs to 3

  const { _id, categories } = req.body.blog; // grabbing list of categories of the current blog from the request to find other blogs with similar category. blog '_id' is extracted to make sure we Exclude this blog from related blogs :P 

  //  find({ _id: { $ne: _id }, categories: { $in: categories } }) ==> find blogs whose ID is not = '_id' (Excluding $ne the curent blog '_id'), Based on categories which are in the current blog's category list ( $in: categories )
  // select .. . .  from Blogs where CATEGORIES in (currentblog categories...) where '_id' != _id;

  Blog.find({ _id: { $ne: _id }, categories: { $in: categories } })
    .limit(limit)
    .populate('postedBy', '_id name username profile')
    .select('title slug excerpt postedBy createdAt updatedAt') // with Blog body (to get more content that excerpt in the related blogs card)
    .exec((err, blogs) => {
      if (err) {
        return res.status(400).json({
          error: 'Blogs not found'
        });
      }
      res.json(blogs);
    });
};


// ----------------------------------------------------

// Blog Search API middleware controller (Search Blogs)
export function listSearch(req, res) {

  try {

    // console.log("Query received at the backend : ", req.query); // Look at the query string  passed from frontend to backend (here)

    // grabbing the 'search' property/parameter from the request query object
    // NOTE: req.query is converting the search URL like (?search=World%20Bekar%20Hai&pagination=10) into an object like ({search: "World Bekar Hai", pagination=10}) and we are grabbing the specific parameter out of that using { field }
    const { search } = req.query; // request query will have search object coming from frontend


    // '$or' OR function in mongoose helps us by looking/searching either in title OR in Body (passing all fields to search through in the array). 
    // "$regex" REGEX function in mongoose has $options , 'i' means IGNORE CASE SENSTIVE 
    if (search) {
      Blog.find({
        $or: [{ title: { $regex: search, $options: 'i' } }, { body: { $regex: search, $options: 'i' } }]
      }, (err, blogs) => {
        if (err) {
          return res.status(400).json({
            error: errorHandler(err)
          });
        }

        res.json(blogs);

      }).select('-photo -body'); // Deselecting Photos & Body from the blog object , because they are heavy!
    }
  }
  catch (err) {
    console.error(error.message);
    res.status(500).send("Sever Error");
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