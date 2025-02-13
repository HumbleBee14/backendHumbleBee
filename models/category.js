import mongoose, { model } from 'mongoose';
const { Schema } = mongoose;

// Note: This is schema/model for a single Category (not for list of categories - that is present in blogs modal, which takes categories list having each category type as this model's object (ObjectId) referred to this model)

const categorySchema = new Schema({

  name: {
    type: String,
    trim: true,
    required: true,
    maxLength: 32,
  },

  slug: {
    type: String,
    unique: true,
    index: true,
  }

}, { timestamp: true });


export default model('Category', categorySchema);