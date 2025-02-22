// Tag < Model >
import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const tagSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxLength: 32
  },
  slug: {
    type: String,
    unique: true,
    index: true
  }
}, { timestamps: true });

export default model('Tag', tagSchema);


/*
tag create list read delete (remove)

> model
>> validator  (for model)
>>> routes
>>>> apply routes as middleware in "server.js"
>>>>> controllers

*/