const mongoose = require('mongoose');

// Note: This is schema/model for a single Category (not for list of categories - that is present in blogs modal, which takes categories list having each category type as this model's object (ObjectId) referred to this model)

const categorySchema = new mongoose.Schema({

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


module.exports = mongoose.model('Category', categorySchema);