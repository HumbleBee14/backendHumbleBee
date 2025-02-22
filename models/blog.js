// BLOG < Model >
import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const blogSchema = new Schema(
  {
    title: {
      type: String,
      trim: true,
      minLength: 3,
      maxLength: 160,
      index: true,
      required: true
    },
    slug: {
      type: String,
      unique: true,
      index: true
    },
    body: {
      type: {}, // Allows storing any type of body content
      required: true,
      minLength: 200,
      maxLength: 2000000
    },
    excerpt: {
      type: String,
      maxLength: 1000
    },
    mtitle: { type: String }, // Meta Title (SEO)
    mdesc: { type: String }, // Meta Description (SEO)
    photo: {
      data: Buffer,
      contentType: String
    },
    categories: [{
      type: Schema.Types.ObjectId,  // Array of ObjectId
      ref: 'Category',
      required: true
    }],
    tags: [{
      type: Schema.Types.ObjectId,  // Array of ObjectId
      ref: 'Tag',
      required: true
    }],
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

export default model('Blog', blogSchema);


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

