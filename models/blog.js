// BLOG < Model >

const mongoose = require('mongoose');

const { ObjectId } = mongoose.Schema;
// https://docs.mongodb.com/manual/reference/method/ObjectId/



const blogSchema = new mongoose.Schema(
  {

    title: {
      type: String,
      trim: true,
      minLength: 3,
      maxLength: 160,
      // unique: true, // You don't need Unique title, but Unique Slug
      index: true,
      required: true
    },

    slug: {
      type: String,
      unique: true, // Slug should be unique, as we will query the DB using slug only, therefore index=true
      index: true
    },

    body: {
      type: {}, // Note: Empty object means you can store all kinds of data
      required: true,
      minLength: 200, // minimum 200 characters long
      maxLength: 2000000 // Note: Maximum allowed 2MB = 2000000
    },

    excerpt: {
      type: String,
      // required: true,
      maxLength: 1000
    },

    // Meta Title (useful for SEO)
    mtitle: {
      type: String
    },

    // Meta Description (useful for SEO)
    mdesc: {
      type: String
    },

    photo: {
      data: Buffer,
      contentType: String
    },


    // Categories = ARRAY of categories.

    categories: [{ type: ObjectId, ref: 'Category', required: true }],

    // Each Blog will have = ARRAY of tags
    tags: [{ type: ObjectId, ref: 'Tag', required: true }],

    postedBy: {
      type: ObjectId,
      ref: 'User'
    }

    // lastUpdatedBy: {
    //   type: ObjectId,
    //   ref: 'User'
    // }

  }, { timestamps: true }
);




module.exports = mongoose.model('Blog', blogSchema);

// mongoose.model('Blog', blogSchema) --> here 'Blog' is the Model name we are setting for the model we created - 'blogSchema'

// 'ObjectId' type, but why ?

/*
 NOTE: We had used type: 'ObjectId' in Models for category, tags, and users for a reason, so that we can access those collections from another Models -like from 'blog' Model, using 'populate() wherever we would need thise, like using join-like lookup '

 // Populate()
 Mongoose has a more powerful alternative (to MonogoDB join like lookup) called populate(), which lets you reference documents in other collections.

 ==> Population is the process of automatically replacing the specified paths in the document with document(s) from other collection(s).

 //  The 'ref' option is what tells Mongoose which model to use during population.
*/
// Refer: https://masteringjs.io/tutorials/mongoose/populate
/*
What is Population ??

Population is way of automatically replacing a path in document with actual documents from other collections.
 E.g. Replace the user id in a document with the data of that user.
  Mongoose has an awesome method populate to help us.
   We define refs in ours schema and mongoose uses those refs to look for documents in other collection.
*/

