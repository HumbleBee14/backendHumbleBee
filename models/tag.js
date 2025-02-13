// Tag < Model >

/*
tag create list read delete (remove)

> model
>> validator  (for model)
>>> routes
>>>> apply routes as middleware in "server.js"
>>>>> controllers

*/

// import { Schema, model } from 'mongoose';

const mongoose = require('mongoose');
const { Schema } = mongoose;

const tagSchema = new Schema({

  name: {
    type: String,
    require: true,
    trim: true,
    maxLength: 32
  },

  slug: {
    type: String,
    unique: true,
    index: true
  }

}, { timestamp: true });

module.exports = mongoose.model('Tag', tagSchema);
